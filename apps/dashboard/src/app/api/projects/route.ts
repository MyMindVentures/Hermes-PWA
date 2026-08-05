import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return Response.json({ error: "Supabase is not configured" }, { status: 503 });
  const supabase = createServerClient(url, key, { db: { schema: "hermes_pwa" }, cookies: { getAll: () => cookieStore.getAll(), setAll: () => undefined } });
  const { data: user, error: userError } = await supabase.auth.getUser();
  if (userError || !user.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await supabase.from("project_access").select("project_id, access_role").eq("user_id", user.user.id);
  if (error) return Response.json({ error: "Unable to load projects" }, { status: 500 });
  return Response.json({ data });
}
