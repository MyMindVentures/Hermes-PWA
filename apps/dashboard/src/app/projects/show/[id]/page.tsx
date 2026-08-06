"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, CircleDot, FolderGit2, GitPullRequest, MessageSquare, Send, Sparkles } from "lucide-react";
import type { Project, ProjectDashboardResponse } from "@providers/data-provider";

const emptyProject: Project = { id: "", projectKey: "", name: "", description: null, category: null, status: "unknown", statusLabel: "Unknown", technologies: [], openIssues: 0, openTasks: 0, openPullRequests: 0, progress: 0, hermesStatus: "unavailable", activityCount: 0, lastActivityAt: null };

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<Project>(emptyProject);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/projects", { cache: "no-store" })
      .then(async (response) => {
        const payload = (await response.json()) as ProjectDashboardResponse & { error?: string };
        if (!response.ok) throw new Error(payload.error ?? "Unable to load project.");
        const record = payload.data.find((item) => item.id === id);
        if (!record) throw new Error("Project not found.");
        setProject(record);
        setMessages([`Project context loaded for ${record.name}. What would you like to work on?`]);
      })
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Unable to load project."));
  }, [id]);

  const send = () => {
    const message = input.trim();
    if (!message) return;
    setMessages((current) => [...current, message]);
    setInput("");
  };

  if (error) return <main className="grid min-h-screen place-items-center bg-[#090d18] p-6 text-slate-100"><section role="alert" className="max-w-md rounded-xl border border-red-400/30 bg-red-400/10 p-6"><h1 className="font-semibold">Project unavailable</h1><p className="mt-2 text-sm text-red-100/70">{error}</p><button type="button" onClick={() => router.back()} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-700 px-4 text-sm"><ArrowLeft size={15} /> Back</button></section></main>;

  return <main className="min-h-screen bg-[#090d18] p-5 text-slate-100 md:p-8"><div className="mx-auto max-w-7xl"><button type="button" onClick={() => router.back()} className="inline-flex min-h-11 items-center gap-2 text-sm text-slate-400 hover:text-white"><ArrowLeft size={15} /> Projects</button><header className="mt-6 flex flex-col gap-4 border-b border-slate-800 pb-8 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-mono text-xs text-slate-500">WORKSPACE / PROJECTS / {project.projectKey || "LOADING"}</p><h1 className="mt-3 text-3xl font-semibold">{project.name || "Loading project…"}</h1><p className="mt-2 max-w-2xl text-sm text-slate-400">{project.description ?? "No project description available."}</p></div><span className="rounded-md bg-emerald-400/10 px-3 py-2 font-mono text-xs text-emerald-300">● {project.statusLabel}</span></header><section className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_.9fr]"><article className="flex min-h-[540px] flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-900/70"><div className="flex items-center gap-3 border-b border-slate-800 p-5"><Sparkles className="text-violet-400" size={17} /><div><p className="font-mono text-[10px] tracking-widest text-violet-400">HERMES AI</p><h2 className="mt-1 font-semibold">Project assistant</h2></div></div><div className="flex-1 space-y-4 overflow-auto p-5">{messages.map((message, index) => <div className={`flex gap-3 ${index % 2 ? "flex-row-reverse" : ""}`} key={`${message}-${index}`}><div className="grid size-7 shrink-0 place-items-center rounded-lg bg-violet-500/15 text-violet-400"><Sparkles size={14} /></div><p className="max-w-[85%] rounded-lg border border-slate-800 bg-slate-800/60 p-3 text-sm leading-6 text-slate-300">{message}</p></div>)}</div><div className="m-4 rounded-lg border border-slate-700 bg-slate-950 p-3"><label className="sr-only" htmlFor="project-message">Ask Hermes about this project</label><textarea id="project-message" value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); send(); } }} rows={2} placeholder="Ask Hermes about this project…" className="w-full resize-none bg-transparent text-sm outline-none" /><div className="flex items-center justify-between"><span className="font-mono text-[9px] text-slate-600">Enter to send · Shift + Enter for newline</span><button type="button" onClick={send} aria-label="Send message" className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md bg-violet-500"><Send size={15} /></button></div></div></article><article className="rounded-xl border border-slate-800 bg-slate-900/70"><div className="border-b border-slate-800 p-5"><div className="flex items-center gap-3"><FolderGit2 className="text-violet-400" size={18} /><div><p className="font-mono text-[10px] tracking-widest text-slate-400">PROJECT SIGNALS</p><h2 className="mt-1 font-semibold">Live overview</h2></div></div></div><div className="grid grid-cols-2 gap-3 p-5"><Signal label="Progress" value={`${project.progress}%`} /><Signal label="Open tasks" value={project.openTasks} icon={<CircleDot size={15} />} /><Signal label="Open issues" value={project.openIssues} icon={<CircleDot size={15} />} /><Signal label="Open pull requests" value={project.openPullRequests} icon={<GitPullRequest size={15} />} /><Signal label="Activity events" value={project.activityCount} icon={<MessageSquare size={15} />} /><Signal label="Hermes sync" value={project.hermesStatus} /></div><div className="border-t border-slate-800 p-5"><h2 className="text-sm font-semibold">Connected repositories</h2>{project.technologies.length ? <div className="mt-3 flex flex-wrap gap-2">{project.technologies.map((technology) => <span key={technology} className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-300">{technology}</span>)}</div> : <p className="mt-3 text-sm text-slate-500">No repository records are connected yet.</p>}</div></article></section></div></main>;
}

function Signal({ label, value, icon }: { label: string; value: string | number; icon?: React.ReactNode }) { return <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">{icon ? <div className="mb-3 text-slate-500">{icon}</div> : null}<span className="block text-[10px] text-slate-500">{label}</span><strong className="mt-1 block break-words text-xl">{value}</strong></div>; }
