"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { HERMES_SUPABASE_SCHEMA } from "@/lib/supabase";

export default function Login() {
  const [message, setMessage] = useState("");
  const signIn = async (provider: "github" | "google") => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) { setMessage("Configure Supabase environment variables to enable authentication."); return; }
    const supabase = createClient(url, key, { db: { schema: HERMES_SUPABASE_SCHEMA } });
    await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: `${window.location.origin}/auth/callback` } });
  };
  return <main className="grid min-h-screen place-items-center bg-[#090d18] p-6 text-slate-100"><section className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-8"><div className="mb-8 flex items-center gap-3"><div className="rounded-lg bg-violet-500 p-2">✦</div><strong className="text-xl">hermes</strong></div><h1 className="text-2xl font-bold">Welcome back</h1><p className="mt-2 text-sm text-slate-400">Sign in to your AI project workspace.</p><div className="mt-8 grid gap-3"><button onClick={() => signIn("github")} className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-semibold hover:bg-slate-700">Continue with GitHub</button><button onClick={() => signIn("google")} className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-semibold hover:bg-slate-700">Continue with Google</button></div>{message && <p className="mt-5 rounded-lg bg-amber-500/10 p-3 text-xs text-amber-300">{message}</p>}</section></main>;
}
