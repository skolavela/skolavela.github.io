import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";

const BUCKET = "zvukova-mapa";
const PHOTO_MAX = 2 * 1024 * 1024;
const AUDIO_MAX = 5 * 1024 * 1024;
const CATEGORIES = new Set(["mech", "priroda", "lide", "jine"]);
const PHOTO_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const AUDIO_MIME = new Set([
  "audio/mpeg", "audio/mp4", "audio/webm", "audio/wav", "audio/ogg", "audio/aac",
  "audio/x-m4a", "audio/x-wav", "audio/mp3", "video/webm", "video/mp4",
]);
const EXT: Record<string, string> = {
  "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif",
  "audio/mpeg": "mp3", "audio/mp3": "mp3", "audio/mp4": "m4a", "audio/aac": "aac",
  "audio/x-m4a": "m4a", "audio/webm": "webm", "audio/ogg": "ogg", "audio/wav": "wav",
  "audio/x-wav": "wav", "video/webm": "webm", "video/mp4": "m4a",
};

type Role = "class" | "teacher";

function originAllowed(origin: string | null): string | null {
  if (!origin) return null;
  try {
    const u = new URL(origin);
    const host = u.hostname;
    if (u.protocol === "https:" && (host === "velappky.cz" || host === "www.velappky.cz")) return origin;
    if ((u.protocol === "http:" || u.protocol === "https:") && (host === "localhost" || host === "127.0.0.1")) return origin;
  } catch { return null; }
  return null;
}
function cors(req: Request): Record<string, string> {
  const allow = originAllowed(req.headers.get("origin")) || "https://velappky.cz";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-retry-count, traceparent, tracestate, baggage",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}
function json(req: Request, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors(req), "Content-Type": "application/json" },
  });
}
function adminClient(): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  let key = "";
  try {
    const keys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}") as Record<string, string>;
    key = keys.default || Object.values(keys)[0] || "";
  } catch { key = ""; }
  if (!key) key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!url || !key) throw new Error("Chybí klíče služby.");
  return createClient(url, key);
}
function timingEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const aa = enc.encode(a);
  const bb = enc.encode(b);
  const len = Math.max(aa.length, bb.length);
  let diff = aa.length ^ bb.length;
  for (let i = 0; i < len; i++) diff |= (aa[i] ?? 0) ^ (bb[i] ?? 0);
  return diff === 0;
}
async function sha256hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function roleFromPassword(sb: SupabaseClient, password: unknown): Promise<Role | null> {
  if (typeof password !== "string" || !password) return null;
  const envTeacher = Deno.env.get("TEACHER_PASSWORD") ?? "";
  const envClass = Deno.env.get("CLASS_PASSWORD") ?? "";
  if (envTeacher && timingEqual(password, envTeacher)) return "teacher";
  if (envClass && timingEqual(password, envClass)) return "class";
  const digest = await sha256hex(password);
  const { data } = await sb.from("app_settings").select("key, value").in("key", [
    "teacher_password_sha256",
    "class_password_sha256",
  ]);
  const map = new Map((data || []).map((r) => [r.key, r.value]));
  const teacherHash = map.get("teacher_password_sha256") || "";
  const classHash = map.get("class_password_sha256") || "";
  if (teacherHash && timingEqual(digest, teacherHash)) return "teacher";
  if (classHash && timingEqual(digest, classHash)) return "class";
  return null;
}
function asText(v: unknown, max = 2000): string {
  if (v == null) return "";
  return String(v).trim().slice(0, max);
}
function asUuid(v: unknown): string {
  const s = asText(v, 64).toLowerCase();
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(s) ? s : "";
}
function safeStoragePath(v: unknown): string {
  const s = asText(v, 400);
  if (!s || s.includes("..") || !/^places\/[A-Za-z0-9._/-]+$/.test(s)) return "";
  return s;
}
function asYear(v: unknown): number | null {
  const n = typeof v === "number" ? v : parseInt(String(v ?? ""), 10);
  if (!Number.isFinite(n) || n < 1 || n > 3000) return null;
  return Math.round(n);
}
function asCoord(v: unknown, min: number, max: number): number | null {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? ""));
  if (!Number.isFinite(n) || n < min || n > max) return null;
  return n;
}
type MediaIn = { mime?: string; data?: string; name?: string } | null;
function decodeMedia(media: MediaIn, kind: "photo" | "audio"): { bytes: Uint8Array; mime: string; ext: string } | { error: string } | null {
  if (!media || !media.data) return null;
  let mime = (media.mime || "").toLowerCase().split(";")[0].trim();
  let b64 = media.data;
  const m = /^data:([^;]+);base64,(.*)$/s.exec(b64);
  if (m) { mime = m[1].toLowerCase().split(";")[0].trim(); b64 = m[2]; }
  const allowed = kind === "photo" ? PHOTO_MIME : AUDIO_MIME;
  if (!allowed.has(mime)) return { error: "Nepodporovaný typ souboru." };
  let raw: Uint8Array;
  try {
    const bin = atob(b64.replace(/\s/g, ""));
    raw = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) raw[i] = bin.charCodeAt(i);
  } catch { return { error: "Soubor se nepodařilo načíst." }; }
  const max = kind === "photo" ? PHOTO_MAX : AUDIO_MAX;
  if (raw.byteLength > max) return { error: kind === "photo" ? "Fotografie je větší než 2 MB." : "Nahrávka je větší než 5 MB." };
  if (raw.byteLength < 16) return { error: "Soubor je prázdný." };
  return { bytes: raw, mime, ext: EXT[mime] || (kind === "photo" ? "jpg" : "webm") };
}
async function upload(sb: SupabaseClient, path: string, bytes: Uint8Array, mime: string) {
  const { error } = await sb.storage.from(BUCKET).upload(path, bytes, { contentType: mime, upsert: true, cacheControl: "3600" });
  if (error) return { error: "Soubor se nepodařilo uložit." };
  return { path };
}
async function removeFiles(sb: SupabaseClient, paths: (string | null | undefined)[]) {
  const list = paths.filter((p): p is string => !!p);
  if (!list.length) return;
  await sb.storage.from(BUCKET).remove(list);
}
async function sign(sb: SupabaseClient, path: string | null | undefined): Promise<string | null> {
  if (!path) return null;
  const { data } = await sb.storage.from(BUCKET).createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}
function photoList(paths: unknown, fallback: unknown): string[] {
  if (Array.isArray(paths)) return paths.filter((p): p is string => typeof p === "string" && !!p);
  if (typeof fallback === "string" && fallback) return [fallback];
  return [];
}
function sameTs(a: unknown, b: unknown): boolean {
  if (a == null || b == null || a === "" || b === "") return false;
  const ta = new Date(String(a)).getTime();
  const tb = new Date(String(b)).getTime();
  if (!Number.isFinite(ta) || !Number.isFinite(tb)) return String(a) === String(b);
  return Math.abs(ta - tb) < 5;
}
function asDate(v: unknown): string | null {
  if (v == null || v === "") return null;
  const s = String(v).trim().slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
}
const CONFLICT = "Mezitím to upravil někdo jiný. Načetla jsem novou verzi, zkus úpravu znovu.";
async function decoratePlace(sb: SupabaseClient, id: string, includeHidden: boolean) {
  const q = sb.from("places").select("*, timeline_entries(*)").eq("id", id);
  const { data } = await q.maybeSingle();
  if (!data) return null;
  const entries = ((data.timeline_entries || []) as Record<string, unknown>[])
    .filter((e) => includeHidden || !e.hidden_at);
  const out: Record<string, unknown> = { ...data };
  const paths = photoList(data.photo_paths, data.photo_path);
  out.photos = await Promise.all(paths.map(async (path) => ({ path, url: await sign(sb, path) })));
  out.photo_url = (out.photos as { url: string | null }[])[0]?.url ?? null;
  out.audio_url = await sign(sb, data.audio_path as string);
  out.timeline_entries = await Promise.all(entries.map(async (e) => {
    const ev = { ...e };
    ev.photo_url = await sign(sb, e.photo_path as string);
    ev.audio_url = await sign(sb, e.audio_path as string);
    ev.when_exact = e.when_exact || "";
    ev.hidden = !!e.hidden_at;
    return ev;
  }));
  out.hidden = !!data.hidden_at;
  return out;
}
async function readJsonOrMultipart(req: Request): Promise<Record<string, unknown>> {
  const ct = req.headers.get("content-type") || "";
  if (ct.includes("multipart/form-data")) {
    const form = await req.formData();
    const out: Record<string, unknown> = {};
    const payload = form.get("payload") || form.get("json");
    if (typeof payload === "string") Object.assign(out, JSON.parse(payload));
    for (const [k, v] of form.entries()) {
      if (k === "payload" || k === "json") continue;
      if (v instanceof File) {
        const buf = new Uint8Array(await v.arrayBuffer());
        let bin = "";
        for (let i = 0; i < buf.length; i++) bin += String.fromCharCode(buf[i]);
        out[k] = { mime: v.type, name: v.name, data: btoa(bin) };
      } else if (!(k in out)) out[k] = v;
    }
    return out;
  }
  return await req.json();
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(req) });
  if (req.method !== "POST") return json(req, { error: "Použijte metodu POST." }, 405);
  try {
    const sb = adminClient();
    const body = await readJsonOrMultipart(req);
    const role = await roleFromPassword(sb, body.password);
    if (!role) return json(req, { error: "Heslo nesedí." }, 401);
    const teacher = role === "teacher";
    const action = String(body.action || "");
    const placeIn = (body.place || {}) as Record<string, unknown>;
    const entryIn = (body.entry || {}) as Record<string, unknown>;

    if (action === "hide_place" || action === "restore_place") {
      if (!teacher) return json(req, { error: "Tohle může jen dospělák." }, 403);
      const id = asText(placeIn.id || body.id, 64);
      if (!id) return json(req, { error: "Chybí místo." }, 400);
      const hidden_at = action === "hide_place" ? new Date().toISOString() : null;
      const { data, error } = await sb.from("places").update({ hidden_at }).eq("id", id).select("id").maybeSingle();
      if (error || !data) return json(req, { error: "Místo se nepodařilo změnit." }, 500);
      return json(req, { ok: true, role, place: await decoratePlace(sb, id, true) });
    }
    if (action === "hide_entry" || action === "restore_entry") {
      if (!teacher) return json(req, { error: "Tohle může jen dospělák." }, 403);
      const id = asText(entryIn.id || body.id, 64);
      if (!id) return json(req, { error: "Chybí zastavení." }, 400);
      const hidden_at = action === "hide_entry" ? new Date().toISOString() : null;
      const { data, error } = await sb.from("timeline_entries").update({ hidden_at }).eq("id", id).select("place_id").maybeSingle();
      if (error || !data) return json(req, { error: "Zastavení se nepodařilo změnit." }, 500);
      return json(req, { ok: true, role, place: await decoratePlace(sb, data.place_id as string, true) });
    }

    if (action === "cleanup_orphans") {
      if (!teacher) return json(req, { error: "Tohle může jen dospělák." }, 403);
      const { data: places } = await sb.from("places").select("id, photo_path, photo_paths, audio_path");
      const { data: entries } = await sb.from("timeline_entries").select("photo_path, audio_path");
      const used = new Set<string>();
      for (const p of places || []) {
        if (p.photo_path) used.add(p.photo_path as string);
        if (p.audio_path) used.add(p.audio_path as string);
        for (const x of (Array.isArray(p.photo_paths) ? p.photo_paths : []) as string[]) {
          if (x) used.add(x);
        }
      }
      for (const e of entries || []) {
        if (e.photo_path) used.add(e.photo_path as string);
        if (e.audio_path) used.add(e.audio_path as string);
      }
      const orphans: string[] = [];
      async function walk(prefix: string) {
        const { data } = await sb.storage.from(BUCKET).list(prefix || undefined, { limit: 1000, offset: 0 });
        for (const item of data || []) {
          const path = prefix ? prefix + "/" + item.name : item.name;
          const isFile = item.id != null && item.metadata != null;
          if (!isFile) await walk(path);
          else if (!used.has(path)) orphans.push(path);
        }
      }
      await walk("");
      if (orphans.length) await removeFiles(sb, orphans);
      return json(req, { ok: true, removed: orphans });
    }

    if (action === "get_media") {
      if (!teacher) return json(req, { error: "Tohle může jen dospělák." }, 403);
      const path = safeStoragePath(body.path);
      if (!path) return json(req, { error: "Chybí soubor." }, 400);
      const { data, error } = await sb.storage.from(BUCKET).download(path);
      if (error || !data) return json(req, { error: "Soubor se nepodařilo stáhnout." }, 404);
      const bytes = new Uint8Array(await data.arrayBuffer());
      const mime = (data as File).type || "application/octet-stream";
      return new Response(bytes, {
        status: 200,
        headers: {
          ...cors(req),
          "Content-Type": mime,
          "Cache-Control": "no-store",
        },
      });
    }

    if (action === "import_place") {
      if (!teacher) return json(req, { error: "Tohle může jen dospělák." }, 403);
      const id = asUuid(placeIn.id);
      if (!id) return json(req, { error: "Chybí místo." }, 400);
      const category = asText(placeIn.category, 20);
      const title = asText(placeIn.title, 120);
      const author = asText(placeIn.author, 80);
      const description = asText(placeIn.description, 4000);
      const lat = asCoord(placeIn.lat, -90, 90);
      const lng = asCoord(placeIn.lng, -180, 180);
      const recorded_at = asDate(placeIn.recorded_at);
      if (!CATEGORIES.has(category) || !title || lat == null || lng == null) {
        return json(req, { error: "Vyplňte kategorii, název a klepněte do mapy." }, 400);
      }
      const incomingPhotos = Array.isArray(body.photos) ? body.photos as MediaIn[] : [];
      if (!incomingPhotos.length && body.photo) incomingPhotos.push(body.photo as MediaIn);
      const decodedPhotos: { bytes: Uint8Array; mime: string; ext: string }[] = [];
      for (const item of incomingPhotos) {
        const photo = decodeMedia(item || null, "photo");
        if (photo && "error" in photo) return json(req, { error: photo.error }, 400);
        if (photo && "bytes" in photo) decodedPhotos.push(photo);
      }
      if (decodedPhotos.length > 6) return json(req, { error: "K místu lze přidat nejvýš 6 fotek." }, 400);
      const audio = decodeMedia((body.audio as MediaIn) || null, "audio");
      if (audio && "error" in audio) return json(req, { error: audio.error }, 400);

      const { data: existing } = await sb.from("places").select("id").eq("id", id).maybeSingle();
      let skippedPlace = !!existing;
      if (!existing) {
        const hidden_at = placeIn.hidden === true ? new Date().toISOString() : null;
        const { error: insErr } = await sb.from("places").insert({
          id, category, title, author, description, lat, lng, recorded_at, hidden_at,
        });
        if (insErr) return json(req, { error: "Místo se nepodařilo obnovit." }, 500);
        const newPaths: string[] = [];
        for (let i = 0; i < decodedPhotos.length; i++) {
          const photo = decodedPhotos[i];
          const name = `places/${id}/photo-${Date.now()}-${i}.${photo.ext}`;
          const up = await upload(sb, name, photo.bytes, photo.mime);
          if ("error" in up) return json(req, { error: up.error }, 500);
          newPaths.push(up.path);
        }
        const patch: Record<string, unknown> = {
          photo_paths: newPaths,
          photo_path: newPaths[0] || null,
        };
        if (audio && "bytes" in audio) {
          const up = await upload(sb, `places/${id}/audio.${audio.ext}`, audio.bytes, audio.mime);
          if ("error" in up) return json(req, { error: up.error }, 500);
          patch.audio_path = up.path;
        }
        if (newPaths.length || patch.audio_path) {
          const { error: patchErr } = await sb.from("places").update(patch).eq("id", id);
          if (patchErr) return json(req, { error: "Místo se nepodařilo obnovit." }, 500);
        }
      }

      const incomingEntries = Array.isArray(body.entries) ? body.entries as Record<string, unknown>[] : [];
      let addedEntries = 0, skippedEntries = 0;
      for (let i = 0; i < incomingEntries.length; i++) {
        const e = incomingEntries[i];
        const eid = asUuid(e.id);
        const eTitle = asText(e.title, 120);
        const eYear = asYear(e.year);
        if (!eTitle || eYear == null) continue;
        if (eid) {
          const { data: exEnt } = await sb.from("timeline_entries").select("id").eq("id", eid).maybeSingle();
          if (exEnt) { skippedEntries++; continue; }
        }
        const row: Record<string, unknown> = {
          place_id: id,
          year: eYear,
          title: eTitle,
          author: asText(e.author, 80),
          source: asText(e.source, 200),
          text: asText(e.text, 4000),
          sort: Number.isFinite(Number(e.sort)) ? Math.round(Number(e.sort)) : i,
          when_exact: asText(e.when_exact, 80),
          hidden_at: e.hidden === true ? new Date().toISOString() : null,
        };
        if (eid) row.id = eid;
        const { data: saved, error: eIns } = await sb.from("timeline_entries").insert(row).select("id").single();
        if (eIns || !saved) return json(req, { error: "Zastavení se nepodařilo obnovit." }, 500);
        const newId = saved.id as string;
        const ePhoto = decodeMedia((e.photo as MediaIn) || null, "photo");
        if (ePhoto && "error" in ePhoto) return json(req, { error: ePhoto.error }, 400);
        if (ePhoto && "bytes" in ePhoto) {
          const up = await upload(sb, `places/${id}/timeline/${newId}-photo.${ePhoto.ext}`, ePhoto.bytes, ePhoto.mime);
          if ("error" in up) return json(req, { error: up.error }, 500);
          await sb.from("timeline_entries").update({ photo_path: up.path }).eq("id", newId);
        }
        addedEntries++;
      }

      return json(req, {
        ok: true,
        role,
        skipped: skippedPlace,
        added_entries: addedEntries,
        skipped_entries: skippedEntries,
        place: await decoratePlace(sb, id, true),
      });
    }

    if (action === "create_place" || action === "update_place") {
      const category = asText(placeIn.category, 20);
      const title = asText(placeIn.title, 120);
      const author = asText(placeIn.author, 80);
      const description = asText(placeIn.description, 4000);
      const lat = asCoord(placeIn.lat, -90, 90);
      const lng = asCoord(placeIn.lng, -180, 180);
      const recorded_at = asDate(placeIn.recorded_at);
      if (!CATEGORIES.has(category) || !title || lat == null || lng == null) {
        return json(req, { error: "Vyplňte kategorii, název a klepněte do mapy." }, 400);
      }
      const incomingPhotos = Array.isArray(body.photos) ? body.photos as MediaIn[] : [];
      if (!incomingPhotos.length && body.photo) incomingPhotos.push(body.photo as MediaIn);
      const decodedPhotos: { bytes: Uint8Array; mime: string; ext: string }[] = [];
      for (const item of incomingPhotos) {
        const photo = decodeMedia(item || null, "photo");
        if (photo && "error" in photo) return json(req, { error: photo.error }, 400);
        if (photo && "bytes" in photo) decodedPhotos.push(photo);
      }
      const audio = decodeMedia((body.audio as MediaIn) || null, "audio");
      if (audio && "error" in audio) return json(req, { error: audio.error }, 400);
      const clearAudio = body.clear_audio === true;

      let id: string;
      let prev: { photo_path: string | null; photo_paths: string[] | null; audio_path: string | null; hidden_at: string | null; updated_at: string } | null = null;
      const row = { category, title, author, description, lat, lng, recorded_at };
      if (action === "create_place") {
        const { data, error } = await sb.from("places").insert(row)
          .select("id, photo_path, photo_paths, audio_path, hidden_at, updated_at").single();
        if (error || !data) return json(req, { error: "Místo se nepodařilo uložit." }, 500);
        id = data.id;
      } else {
        id = asText(placeIn.id, 64);
        if (!id) return json(req, { error: "Chybí místo." }, 400);
        const { data: existing } = await sb.from("places")
          .select("id, photo_path, photo_paths, audio_path, hidden_at, updated_at").eq("id", id).maybeSingle();
        if (!existing) return json(req, { error: "Místo neexistuje." }, 404);
        if (existing.hidden_at && !teacher) return json(req, { error: "Tohle může jen dospělák." }, 403);
        if (!sameTs(existing.updated_at, placeIn.updated_at)) {
          return json(req, { error: CONFLICT, code: "conflict", place: await decoratePlace(sb, id, teacher) }, 409);
        }
        const stamps = Array.isArray(body.entry_stamps) ? body.entry_stamps as { id?: string; updated_at?: string }[] : [];
        if (stamps.length) {
          const { data: ents } = await sb.from("timeline_entries").select("id, updated_at").eq("place_id", id);
          const map = new Map((ents || []).map((e) => [e.id as string, e.updated_at]));
          for (const s of stamps) {
            if (!s.id) continue;
            const cur = map.get(s.id);
            if (cur && !sameTs(cur, s.updated_at)) {
              return json(req, { error: CONFLICT, code: "conflict", place: await decoratePlace(sb, id, teacher) }, 409);
            }
          }
        }
        prev = existing as typeof prev;
        const { error } = await sb.from("places").update(row).eq("id", id);
        if (error) return json(req, { error: "Místo se nepodařilo uložit." }, 500);
      }

      const prevPaths = photoList(prev?.photo_paths, prev?.photo_path);
      let keep: string[];
      if (Array.isArray(body.keep_photos)) {
        const allowed = new Set(prevPaths);
        keep = (body.keep_photos as unknown[]).filter((p): p is string => typeof p === "string" && allowed.has(p));
      } else {
        keep = prevPaths.slice();
      }
      if (keep.length + decodedPhotos.length > 6) {
        return json(req, { error: "K místu lze přidat nejvýš 6 fotek." }, 400);
      }
      const newPaths: string[] = [];
      for (let i = 0; i < decodedPhotos.length; i++) {
        const photo = decodedPhotos[i];
        const name = `places/${id}/photo-${Date.now()}-${i}.${photo.ext}`;
        const up = await upload(sb, name, photo.bytes, photo.mime);
        if ("error" in up) return json(req, { error: up.error }, 500);
        newPaths.push(up.path);
      }
      const finalPaths = keep.concat(newPaths);
      const stale = prevPaths.filter((p) => !finalPaths.includes(p));
      const patch: Record<string, unknown> = {
        photo_paths: finalPaths,
        photo_path: finalPaths[0] || null,
      };
      if (audio && "bytes" in audio) {
        const up = await upload(sb, `places/${id}/audio.${audio.ext}`, audio.bytes, audio.mime);
        if ("error" in up) return json(req, { error: up.error }, 500);
        if (prev?.audio_path && prev.audio_path !== up.path) stale.push(prev.audio_path);
        patch.audio_path = up.path;
      } else if (clearAudio) {
        if (prev?.audio_path) stale.push(prev.audio_path);
        patch.audio_path = null;
      }
      const { error: patchErr } = await sb.from("places").update(patch).eq("id", id);
      if (patchErr) return json(req, { error: "Místo se nepodařilo uložit." }, 500);
      if (stale.length) await removeFiles(sb, stale);
      return json(req, { ok: true, role, place: await decoratePlace(sb, id, teacher) });
    }

    if (action === "add_entry" || action === "update_entry") {
      const placeId = asText(entryIn.place_id, 64);
      const title = asText(entryIn.title, 120);
      const author = asText(entryIn.author, 80);
      const source = asText(entryIn.source, 200);
      const text = asText(entryIn.text, 4000);
      const when_exact = asText(entryIn.when_exact, 80);
      const year = asYear(entryIn.year);
      const sort = Number.isFinite(Number(entryIn.sort)) ? Math.round(Number(entryIn.sort)) : 0;
      if (!placeId || !title || year == null) return json(req, { error: "Vyplňte rok a název zastavení." }, 400);
      const { data: place } = await sb.from("places").select("id, hidden_at").eq("id", placeId).maybeSingle();
      if (!place) return json(req, { error: "Místo neexistuje." }, 404);
      if (place.hidden_at && !teacher) return json(req, { error: "Tohle může jen dospělák." }, 403);
      const photo = decodeMedia((body.photo as MediaIn) || null, "photo");
      if (photo && "error" in photo) return json(req, { error: photo.error }, 400);
      const clearPhoto = body.clear_photo === true;
      let id: string;
      let prev: { photo_path: string | null; audio_path: string | null; hidden_at: string | null } | null = null;
      if (action === "add_entry") {
        const { data, error } = await sb.from("timeline_entries")
          .insert({ place_id: placeId, year, title, author, source, text, sort, when_exact })
          .select("id, photo_path, audio_path, hidden_at").single();
        if (error || !data) return json(req, { error: "Zastavení se nepodařilo uložit." }, 500);
        id = data.id;
      } else {
        id = asText(entryIn.id, 64);
        if (!id) return json(req, { error: "Chybí zastavení." }, 400);
        const { data: existing } = await sb.from("timeline_entries").select("id, photo_path, audio_path, hidden_at, updated_at").eq("id", id).maybeSingle();
        if (!existing) return json(req, { error: "Zastavení neexistuje." }, 404);
        if (existing.hidden_at && !teacher) return json(req, { error: "Tohle může jen dospělák." }, 403);
        if (!sameTs(existing.updated_at, entryIn.updated_at)) {
          return json(req, { error: CONFLICT, code: "conflict", place: await decoratePlace(sb, placeId, teacher) }, 409);
        }
        prev = existing;
        const { error } = await sb.from("timeline_entries").update({ year, title, author, source, text, sort, when_exact }).eq("id", id);
        if (error) return json(req, { error: "Zastavení se nepodařilo uložit." }, 500);
      }
      const patch: Record<string, string | null> = {};
      const stale: string[] = [];
      if (photo && "bytes" in photo) {
        const up = await upload(sb, `places/${placeId}/timeline/${id}-photo.${photo.ext}`, photo.bytes, photo.mime);
        if ("error" in up) return json(req, { error: up.error }, 500);
        if (prev?.photo_path && prev.photo_path !== up.path) stale.push(prev.photo_path);
        patch.photo_path = up.path;
      } else if (clearPhoto) {
        if (prev?.photo_path) stale.push(prev.photo_path);
        patch.photo_path = null;
      }
      if (Object.keys(patch).length) await sb.from("timeline_entries").update(patch).eq("id", id);
      if (stale.length) await removeFiles(sb, stale);
      return json(req, { ok: true, role, place: await decoratePlace(sb, placeId, teacher) });
    }

    return json(req, { error: "Neznámá akce." }, 400);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Chyba serveru.";
    return json(req, { error: message }, 500);
  }
});
