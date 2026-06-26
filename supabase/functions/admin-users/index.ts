import { createClient } from "jsr:@supabase/supabase-js@2";

// Admin-only user management. Holds the service-role key server-side and exposes
// create / update / reset_password / delete, callable only by an authenticated admin.
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Identify the caller and require an admin profile.
    const token = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
    const { data: userData, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userData.user) return json({ error: "Unauthorized" }, 401);

    const { data: caller } = await admin
      .from("profiles").select("role").eq("id", userData.user.id).single();
    if (!caller || caller.role !== "admin") return json({ error: "Forbidden: admin only" }, 403);

    const body = await req.json();
    const action = body.action as string;

    if (action === "create") {
      const { email, password, full_name, role, sbus, countries, brands, regions, is_global } = body;
      const { data: created, error } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: full_name ?? "" },
      });
      if (error || !created.user) return json({ error: error?.message ?? "create failed" }, 400);
      const { error: pErr } = await admin.from("profiles").insert({
        id: created.user.id,
        email,
        full_name: full_name ?? "",
        role,
        sbus: sbus ?? [],
        countries: countries ?? [],
        brands: brands ?? [],
        regions: regions ?? [],
        is_global: is_global ?? false,
      });
      if (pErr) {
        await admin.auth.admin.deleteUser(created.user.id); // rollback orphaned auth user
        return json({ error: pErr.message }, 400);
      }
      return json({ ok: true, id: created.user.id });
    }

    if (action === "update") {
      const { id, full_name, role, sbus, countries, brands, regions, is_global } = body;
      const patch: Record<string, unknown> = {};
      if (full_name !== undefined) patch.full_name = full_name;
      if (role !== undefined) patch.role = role;
      if (sbus !== undefined) patch.sbus = sbus;
      if (countries !== undefined) patch.countries = countries;
      if (brands !== undefined) patch.brands = brands;
      if (regions !== undefined) patch.regions = regions;
      if (is_global !== undefined) patch.is_global = is_global;
      const { error } = await admin.from("profiles").update(patch).eq("id", id);
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true });
    }

    if (action === "reset_password") {
      const { id, password } = body;
      const { error } = await admin.auth.admin.updateUserById(id, { password });
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true });
    }

    if (action === "delete") {
      const { id } = body;
      if (id === userData.user.id) return json({ error: "You cannot delete yourself" }, 400);
      const { error } = await admin.auth.admin.deleteUser(id);
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
