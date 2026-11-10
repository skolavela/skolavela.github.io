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
async function decoratePlace(sb: SupabaseClient, id: string, includeHidden: boolean) {
  const q = sb.from("places").select("*, timeline_entries(*)").eq("id", id);
  const { data } = await q.maybeSingle();
  if (!data) return null;
  const entries = ((data.timeline_entries || []) as Record<string, unknown>[])
    .filter((e) => includeHidden || !e.hidden_at);
  const out: Record<string, unknown> = { ...data };
  out.photo_url = await sign(sb, data.photo_path as string);
  out.audio_url = await sign(sb, data.audio_path as string);
  delete out.photo_path;
  delete out.audio_path;
  out.timeline_entries = await Promise.all(entries.map(async (e) => {
    const ev = { ...e };
    ev.photo_url = await sign(sb, e.photo_path as string);
    ev.audio_url = await sign(sb, e.audio_path as string);
    delete ev.photo_path;
    delete ev.audio_path;
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
      if (!teacher) return json(req, { error: "Tohle může jen učitel." }, 403);
      const id = asText(placeIn.id || body.id, 64);
      if (!id) return json(req, { error: "Chybí místo." }, 400);
      const hidden_at = action === "hide_place" ? new Date().toISOString() : null;
      const { data, error } = await sb.from("places").update({ hidden_at }).eq("id", id).select("id").maybeSingle();
      if (error || !data) return json(req, { error: "Místo se nepodařilo změnit." }, 500);
      return json(req, { ok: true, role, place: await decoratePlace(sb, id, true) });
    }
    if (action === "hide_entry" || action === "restore_entry") {
      if (!teacher) return json(req, { error: "Tohle může jen učitel." }, 403);
      const id = asText(entryIn.id || body.id, 64);
      if (!id) return json(req, { error: "Chybí zastavení." }, 400);
      const hidden_at = action === "hide_entry" ? new Date().toISOString() : null;
      const { data, error } = await sb.from("timeline_entries").update({ hidden_at }).eq("id", id).select("place_id").maybeSingle();
      if (error || !data) return json(req, { error: "Zastavení se nepodařilo změnit." }, 500);
      return json(req, { ok: true, role, place: await decoratePlace(sb, data.place_id as string, true) });
    }

    if (action === "create_place" || action === "update_place") {
      const category = asText(placeIn.category, 20);
      const title = asText(placeIn.title, 120);
      const author = asText(placeIn.author, 80);
      const description = asText(placeIn.description, 4000);
      const lat = asCoord(placeIn.lat, -90, 90);
      const lng = asCoord(placeIn.lng, -180, 180);
      if (!CATEGORIES.has(category) || !title || lat == null || lng == null) {
        return json(req, { error: "Vyplňte kategorii, název a klepněte do mapy." }, 400);
      }
      const photo = decodeMedia((body.photo as MediaIn) || null, "photo");
      if (photo && "error" in photo) return json(req, { error: photo.error }, 400);
      const audio = decodeMedia((body.audio as MediaIn) || null, "audio");
      if (audio && "error" in audio) return json(req, { error: audio.error }, 400);
      const clearPhoto = body.clear_photo === true;
      const clearAudio = body.clear_audio === true;

      let id: string;
      let prev: { photo_path: string | null; audio_path: string | null; hidden_at: string | null } | null = null;
      if (action === "create_place") {
        const { data, error } = await sb.from("places").insert({ category, title, author, description, lat, lng })
          .select("id, photo_path, audio_path, hidden_at").single();
        if (error || !data) return json(req, { error: "Místo se nepodařilo uložit." }, 500);
        id = data.id;
      } else {
        id = asText(placeIn.id, 64);
        if (!id) return json(req, { error: "Chybí místo." }, 400);
        const { data: existing } = await sb.from("places").select("id, photo_path, audio_path, hidden_at").eq("id", id).maybeSingle();
        if (!existing) return json(req, { error: "Místo neexistuje." }, 404);
        if (existing.hidden_at && !teacher) return json(req, { error: "Tohle může jen učitel." }, 403);
        prev = existing;
        const { error } = await sb.from("places").update({ category, title, author, description, lat, lng }).eq("id", id);
        if (error) return json(req, { error: "Místo se nepodařilo uložit." }, 500);
      }
      const patch: Record<string, string | null> = {};
      const stale: string[] = [];
      if (photo && "bytes" in photo) {
        const up = await upload(sb, `places/${id}/photo.${photo.ext}`, photo.bytes, photo.mime);
        if ("error" in up) return json(req, { error: up.error }, 500);
        if (prev?.photo_path && prev.photo_path !== up.path) stale.push(prev.photo_path);
        patch.photo_path = up.path;
      } else if (clearPhoto) {
        if (prev?.photo_path) stale.push(prev.photo_path);
        patch.photo_path = null;
      }
      if (audio && "bytes" in audio) {
        const up = await upload(sb, `places/${id}/audio.${audio.ext}`, audio.bytes, audio.mime);
        if ("error" in up) return json(req, { error: up.error }, 500);
        if (prev?.audio_path && prev.audio_path !== up.path) stale.push(prev.audio_path);
        patch.audio_path = up.path;
      } else if (clearAudio) {
        if (prev?.audio_path) stale.push(prev.audio_path);
        patch.audio_path = null;
      }
      if (Object.keys(patch).length) await sb.from("places").update(patch).eq("id", id);
      if (stale.length) await removeFiles(sb, stale);
      return json(req, { ok: true, role, place: await decoratePlace(sb, id, teacher) });
    }

    if (action === "add_entry" || action === "update_entry") {
      const placeId = asText(entryIn.place_id, 64);
      const title = asText(entryIn.title, 120);
      const author = asText(entryIn.author, 80);
      const source = asText(entryIn.source, 200);
      const text = asText(entryIn.text, 4000);
      const year = asYear(entryIn.year);
      const sort = Number.isFinite(Number(entryIn.sort)) ? Math.round(Number(entryIn.sort)) : 0;
      if (!placeId || !title || year == null) return json(req, { error: "Vyplňte rok a název zastavení." }, 400);
      const { data: place } = await sb.from("places").select("id, hidden_at").eq("id", placeId).maybeSingle();
      if (!place) return json(req, { error: "Místo neexistuje." }, 404);
      if (place.hidden_at && !teacher) return json(req, { error: "Tohle může jen učitel." }, 403);
      const photo = decodeMedia((body.photo as MediaIn) || null, "photo");
      if (photo && "error" in photo) return json(req, { error: photo.error }, 400);
      const audio = decodeMedia((body.audio as MediaIn) || null, "audio");
      if (audio && "error" in audio) return json(req, { error: audio.error }, 400);
      const clearPhoto = body.clear_photo === true;
      const clearAudio = body.clear_audio === true;
      let id: string;
      let prev: { photo_path: string | null; audio_path: string | null; hidden_at: string | null } | null = null;
      if (action === "add_entry") {
        const { data, error } = await sb.from("timeline_entries")
          .insert({ place_id: placeId, year, title, author, source, text, sort })
          .select("id, photo_path, audio_path, hidden_at").single();
        if (error || !data) return json(req, { error: "Zastavení se nepodařilo uložit." }, 500);
        id = data.id;
      } else {
        id = asText(entryIn.id, 64);
        if (!id) return json(req, { error: "Chybí zastavení." }, 400);
        const { data: existing } = await sb.from("timeline_entries").select("id, photo_path, audio_path, hidden_at").eq("id", id).maybeSingle();
        if (!existing) return json(req, { error: "Zastavení neexistuje." }, 404);
        if (existing.hidden_at && !teacher) return json(req, { error: "Tohle může jen učitel." }, 403);
        prev = existing;
        const { error } = await sb.from("timeline_entries").update({ year, title, author, source, text, sort }).eq("id", id);
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
      if (audio && "bytes" in audio) {
        const up = await upload(sb, `places/${placeId}/timeline/${id}-audio.${audio.ext}`, audio.bytes, audio.mime);
        if ("error" in up) return json(req, { error: up.error }, 500);
        if (prev?.audio_path && prev.audio_path !== up.path) stale.push(prev.audio_path);
        patch.audio_path = up.path;
      } else if (clearAudio) {
        if (prev?.audio_path) stale.push(prev.audio_path);
        patch.audio_path = null;
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
