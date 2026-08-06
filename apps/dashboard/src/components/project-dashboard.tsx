"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, AlertTriangle, ArrowUpRight, Bot, Check, CircleDot, Clock3, FolderGit2, GitPullRequest, Loader2, Plus, RefreshCw, Search, Sparkles, Zap } from "lucide-react";
import { motion } from "framer-motion";
import type { Project, ProjectActivity, ProjectDashboardResponse } from "@providers/data-provider";

type LoadState = "loading" | "ready" | "error";

export function ProjectDashboard() {
  const [query, setQuery] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [activity, setActivity] = useState<ProjectActivity[]>([]);
  const [totals, setTotals] = useState<ProjectDashboardResponse["totals"] | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoadState("loading");
    setError(null);
    try {
      const response = await fetch("/api/projects", { cache: "no-store" });
      const payload = (await response.json()) as ProjectDashboardResponse & { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Unable to load dashboard data.");
      setProjects(payload.data); setActivity(payload.activity); setTotals(payload.totals); setLoadState("ready");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load dashboard data."); setLoadState("error");
    }
  }, []);

  useEffect(() => { void loadDashboard(); }, [loadDashboard]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return projects;
    return projects.filter((project) => `${project.name} ${project.description ?? ""} ${project.category ?? ""}`.toLowerCase().includes(normalized));
  }, [projects, query]);

  return (
    <main className="app-shell relative min-h-screen overflow-hidden px-4 pb-16 pt-5 text-[var(--ink)] sm:px-6 lg:px-10">
      <div className="app-grid pointer-events-none absolute inset-0 -z-10" />
      <div className="mx-auto max-w-[1440px]">
        <TopBar />
        <header className="relative flex flex-col justify-between gap-8 border-b border-[var(--line)] pb-9 pt-12 md:flex-row md:items-end md:pt-16">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[rgba(84,214,160,.22)] bg-[rgba(84,214,160,.07)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.16em] text-[var(--success)]"><span className="h-1.5 w-1.5 rounded-full bg-[var(--success)] shadow-[0_0_12px_var(--success)]" /> Systems nominal</div>
            <h1 className="text-balance text-4xl font-semibold tracking-[-.045em] text-white sm:text-5xl lg:text-[58px] lg:leading-[1.04]">Build with clarity.<br /><span className="text-[var(--accent)]">Ship with Hermes.</span></h1>
            <p className="mt-5 max-w-xl text-[15px] leading-7 text-[var(--muted)]">A calm, focused view of the projects, decisions, and engineering momentum that matter now.</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-[var(--faint)] md:pb-1"><Clock3 size={15} /><span>Live workspace</span><span className="h-1 w-1 rounded-full bg-[var(--faint)]" /><span>Auto-synced</span></div>
        </header>

        {loadState === "loading" ? <DashboardSkeleton /> : loadState === "error" ? <ErrorState message={error ?? "Unable to load dashboard data."} onRetry={() => void loadDashboard()} /> : (
          <>
            <section aria-label="Workspace overview" className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--line)] lg:grid-cols-4">
              <MetricCard label="Projects" value={totals?.projects ?? 0} detail="in your workspace" icon={<FolderGit2 size={17} />} tone="violet" />
              <MetricCard label="Active now" value={totals?.activeProjects ?? 0} detail="currently moving" icon={<Zap size={17} />} tone="green" />
              <MetricCard label="Open tasks" value={totals?.openTasks ?? 0} detail="across all projects" icon={<CircleDot size={17} />} tone="amber" />
              <MetricCard label="Conversations" value={totals?.conversations ?? 0} detail="with Hermes" icon={<Bot size={17} />} tone="blue" />
            </section>

            <section className="mt-16" aria-labelledby="projects-heading">
              <SectionHeading eyebrow="Workspace" title="Your projects" description="The places where ideas become shipped work." action={<label className="flex min-h-11 w-full items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] px-3.5 text-sm text-[var(--muted)] transition focus-within:border-[var(--accent)] focus-within:ring-4 focus-within:ring-[rgba(167,139,250,.1)] sm:w-[250px]"><Search size={15} aria-hidden="true" /><span className="sr-only">Search projects</span><input className="w-full bg-transparent text-sm text-white outline-none placeholder:text-[var(--faint)]" placeholder="Find a project..." value={query} onChange={(event) => setQuery(event.target.value)} /></label>} />
              {filtered.length === 0 ? <EmptyState searched={Boolean(query.trim())} /> : <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{filtered.map((project) => <ProjectCard key={project.id} project={project} />)}</div>}
            </section>

            <section className="mt-16" aria-labelledby="activity-heading"><SectionHeading eyebrow="Signal" title="Recent activity" description="A concise trail of what changed across your workspace." /><div className="mt-6 overflow-hidden rounded-2xl border border-[var(--line)] bg-[rgba(16,19,26,.72)]">{activity.length ? activity.map((item) => <ActivityRow key={item.id} item={item} />) : <p className="p-8 text-sm text-[var(--muted)]">No project activity has been recorded yet.</p>}</div></section>
          </>
        )}
      </div>
    </main>
  );
}

function TopBar() { return <nav aria-label="Primary" className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--accent-strong)] text-white shadow-[0_0_25px_rgba(139,92,246,.3)]"><Sparkles size={17} /></div><span className="text-sm font-semibold tracking-tight text-white">Hermes<span className="text-[var(--muted)]">/workspace</span></span></div><div className="hidden items-center gap-6 text-xs font-medium text-[var(--muted)] sm:flex"><span className="text-white">Overview</span><span className="transition hover:text-white">Projects</span><span className="transition hover:text-white">Activity</span></div><div className="flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-1.5 text-[11px] text-[var(--muted)]"><span className="grid h-5 w-5 place-items-center rounded-full bg-[#e2c2a4] text-[9px] font-bold text-[#4b3020]">P</span> Parallax</div></nav>; }

function SectionHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) { return <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="mb-2 text-[10px] font-semibold uppercase tracking-[.18em] text-[var(--accent)]">{eyebrow}</p><h2 id={title === "Your projects" ? "projects-heading" : "activity-heading"} className="text-2xl font-semibold tracking-[-.03em] text-white">{title}</h2><p className="mt-2 text-sm text-[var(--muted)]">{description}</p></div>{action}</div>; }

function MetricCard({ label, value, detail, icon, tone }: { label: string; value: number; detail: string; icon: React.ReactNode; tone: "violet" | "green" | "amber" | "blue" }) { const tones = { violet: "text-[var(--accent)] bg-[rgba(167,139,250,.1)]", green: "text-[var(--success)] bg-[rgba(84,214,160,.1)]", amber: "text-[var(--warning)] bg-[rgba(242,187,104,.1)]", blue: "text-[#82b5ff] bg-[rgba(130,181,255,.1)]" }; return <article className="bg-[var(--surface)] p-5 transition hover:bg-[var(--surface-raised)] sm:p-6"><div className={`mb-8 grid h-9 w-9 place-items-center rounded-xl ${tones[tone]}`}>{icon}</div><p className="text-xs font-medium text-[var(--muted)]">{label}</p><div className="mt-1 flex items-baseline gap-2"><strong className="text-3xl font-semibold tracking-[-.04em] text-white">{value}</strong><span className="text-[10px] text-[var(--faint)]">{detail}</span></div></article>; }

function ProjectCard({ project }: { project: Project }) { const router = useRouter(); const statusTone = project.status === "active" ? "text-[var(--success)]" : project.status === "paused" ? "text-[var(--warning)]" : "text-[var(--muted)]"; return <motion.button type="button" whileHover={{ y: -4 }} onClick={() => router.push(`/projects/show/${project.id}`)} className="group relative flex min-h-[310px] flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 text-left transition-colors hover:border-[rgba(167,139,250,.45)] hover:bg-[var(--surface-raised)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] sm:p-6"><div className="flex items-start justify-between gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl border border-[rgba(167,139,250,.18)] bg-[rgba(167,139,250,.08)] text-[var(--accent)]"><FolderGit2 size={18} /></div><span className={`flex items-center gap-1.5 pt-1 text-[10px] font-semibold uppercase tracking-[.12em] ${statusTone}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{project.statusLabel}</span></div><div className="mt-7 flex-1"><div className="flex items-start justify-between gap-3"><h3 className="text-lg font-semibold tracking-[-.02em] text-white transition group-hover:text-[var(--accent)]">{project.name}</h3><ArrowUpRight size={17} className="shrink-0 text-[var(--faint)] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--accent)]" /></div><p className="mt-2 min-h-10 text-sm leading-6 text-[var(--muted)]">{project.description ?? "No project description available."}</p><div className="mt-4 flex flex-wrap gap-1.5">{project.category ? <span className="rounded-md bg-white/[.06] px-2 py-1 text-[10px] font-medium text-[var(--muted)]">{project.category}</span> : null}{project.technologies.slice(0, 3).map((technology) => <span className="rounded-md bg-white/[.04] px-2 py-1 text-[10px] text-[var(--faint)]" key={technology}>{technology}</span>)}</div></div><div className="mt-6"><div className="mb-2 flex justify-between text-[10px] text-[var(--faint)]"><span>Progress</span><strong className="font-mono text-[var(--muted)]">{project.progress}%</strong></div><div className="h-1 overflow-hidden rounded-full bg-white/[.08]" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={project.progress} aria-label={`${project.name} progress`}><span className="block h-full rounded-full bg-[var(--accent)]" style={{ width: `${Math.min(100, Math.max(0, project.progress))}%` }} /></div></div><div className="mt-5 flex items-center justify-between border-t border-[var(--line)] pt-4 text-[10px] text-[var(--faint)]"><span><CircleDot className="mr-1 inline" size={12} />{project.openTasks} open tasks</span><span><GitPullRequest className="mr-1 inline" size={12} />{project.openPullRequests} open PRs</span><Sparkles className="text-[var(--accent)]" size={14} /></div></motion.button>; }

function ActivityRow({ item }: { item: ProjectActivity }) { return <div className="group flex items-start gap-4 border-b border-[var(--line)] p-5 transition last:border-0 hover:bg-white/[.025] sm:items-center"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[rgba(167,139,250,.1)] text-[var(--accent)]"><Activity size={15} /></div><div className="min-w-0 flex-1"><strong className="block truncate text-sm font-medium text-white">{item.summary}</strong><span className="mt-1 block text-xs text-[var(--muted)]">{item.projectName} <span className="text-[var(--faint)]">·</span> {item.activityType}</span></div><time className="shrink-0 text-[10px] text-[var(--faint)]" dateTime={item.occurredAt}>{new Date(item.occurredAt).toLocaleDateString()}</time></div>; }
function DashboardSkeleton() { return <div className="mt-8 animate-pulse space-y-8" aria-label="Loading dashboard" role="status"><div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-[var(--line)] lg:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div className="h-36 bg-[var(--surface)]" key={index} />)}</div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <div className="h-[310px] rounded-2xl bg-[var(--surface)]" key={index} />)}</div></div>; }
function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) { return <section role="alert" className="mt-12 rounded-2xl border border-red-400/30 bg-red-400/[.08] p-6"><div className="flex gap-3"><AlertTriangle className="shrink-0 text-red-300" /><div><h2 className="font-semibold text-white">Dashboard data unavailable</h2><p className="mt-1 text-sm text-red-100/70">{message}</p><button type="button" onClick={onRetry} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border border-red-300/40 px-4 text-sm font-semibold text-red-100 hover:bg-red-300/10"><RefreshCw size={15} /> Retry</button></div></div></section>; }
function EmptyState({ searched }: { searched: boolean }) { return <div className="mt-6 rounded-2xl border border-dashed border-[var(--line-strong)] bg-[var(--surface-soft)] p-12 text-center"><div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-white/[.05] text-[var(--faint)]"><Loader2 size={19} /></div><p className="mt-4 text-sm text-[var(--muted)]">{searched ? "No projects match your search." : "No projects are available for your account yet."}</p></div>; }

export default ProjectDashboard;
