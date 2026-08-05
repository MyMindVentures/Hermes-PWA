import { createBrowserClient } from "@supabase/ssr";

export const HERMES_SUPABASE_SCHEMA = "hermes_pwa";

export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return createBrowserClient(url, key, { db: { schema: HERMES_SUPABASE_SCHEMA } });
}

export const supabaseBackend = {
  projectRef: "kjjiufximimaxbeiqmce",
  schema: HERMES_SUPABASE_SCHEMA,
  canonicalProjectSchema: "project_management",
} as const;
