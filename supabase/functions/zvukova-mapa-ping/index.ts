import { createClient } from "npm:@supabase/supabase-js@2";

function admin() {
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  let key = "";
  try {
    const keys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}") as Record<string, string>;
    key = keys.default || Object.values(keys)[0] || "";
  } catch { key = ""; }
  if (!key) key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  return createClient(url, key);
}

Deno.serve(async () => {
  try {
    const sb = admin();
    // Triviální dotaz na nastavení appky, ne na data dětí, ať se projekt neuspí.
    const { error, count } = await sb.from("app_settings").select("key", { count: "exact", head: true });
    if (error) {
      return Response.json({ ok: false }, { status: 500 });
    }
    return Response.json({ ok: true, n: count ?? 0 });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
});
