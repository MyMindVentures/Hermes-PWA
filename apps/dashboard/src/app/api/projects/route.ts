import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !publishableKey || !serviceRoleKey) return Response.json({ error: "Supabase is not configured" }, { status: 503 });

  const authClient = createServerClient(url, publishableKey, {
    db: { schema: "hermes_pwa" },
    cookies: { getAll: () => cookieStore.getAll(), setAll: () => undefined },
  });
  const { data: user, error: userError } = await authClient.auth.getUser();
  if (userError || !user.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const adminClient = createClient(url, serviceRoleKey, { db: { schema: "project_management" }, auth: { autoRefreshToken: false, persistSession: false } });
  const { data, error } = await adminClient.from("projects").select("id, project_key, name, description, progress_percent, metadata").order("created_at");
  if (error) return Response.json({ error: "Unable to load projects" }, { status: 500 });
  return Response.json({ data: data.map((project) => ({ ...project, status: "Active" })) });
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
