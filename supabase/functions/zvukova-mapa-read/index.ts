import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";

const BUCKET = "zvukova-mapa";
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
async function decorate(sb: SupabaseClient, place: Record<string, unknown>, includeHidden: boolean) {
  const entries = ((place.timeline_entries || []) as Record<string, unknown>[])
    .filter((e) => includeHidden || !e.hidden_at)
    .sort((a, b) => Number(a.sort) - Number(b.sort) || Number(a.year) - Number(b.year));
  const out: Record<string, unknown> = { ...place };
  const paths = photoList(place.photo_paths, place.photo_path);
  out.photos = await Promise.all(paths.map(async (path) => ({ path, url: await sign(sb, path) })));
  out.photo_url = (out.photos as { url: string | null }[])[0]?.url ?? null;
  out.audio_url = await sign(sb, place.audio_path as string);
  delete out.photo_path;
  delete out.photo_paths;
  delete out.audio_path;
  out.hidden = !!place.hidden_at;
  out.timeline_entries = await Promise.all(entries.map(async (e) => {
    const ev = { ...e };
    ev.photo_url = await sign(sb, e.photo_path as string);
    ev.audio_url = await sign(sb, e.audio_path as string);
    ev.when_exact = e.when_exact || "";
    delete ev.photo_path;
    delete ev.audio_path;
    ev.hidden = !!e.hidden_at;
    return ev;
  }));
  return out;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(req) });
  if (req.method !== "POST") return json(req, { error: "Použijte metodu POST." }, 405);
  try {
    const sb = adminClient();
    const body = await req.json().catch(() => ({}));
    const role = await roleFromPassword(sb, (body as Record<string, unknown>).password);
    if (!role) return json(req, { error: "Heslo nesedí." }, 401);
    const includeHidden = role === "teacher";
    let q = sb.from("places").select("*, timeline_entries(*)").order("created_at", { ascending: true });
    if (!includeHidden) q = q.is("hidden_at", null);
    const { data, error } = await q;
    if (error) return json(req, { error: "Data se nepodařilo načíst." }, 500);
    const places = await Promise.all((data || []).map((p) => decorate(sb, p as Record<string, unknown>, includeHidden)));
    return json(req, { ok: true, role, places });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Chyba serveru.";
    return json(req, { error: message }, 500);
  }
});
