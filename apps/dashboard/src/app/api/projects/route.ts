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

  const projectClient = createClient(url, serviceRoleKey, { db: { schema: "project_management" }, auth: { autoRefreshToken: false, persistSession: false } });
  const pwaClient = createClient(url, serviceRoleKey, { db: { schema: "hermes_pwa" }, auth: { autoRefreshToken: false, persistSession: false } });
  const [{ data: projects, error }, { data: statuses }, { data: categories }, { data: tasks }, { data: activities }, { count: conversations }, { data: repositories }, { data: issues }, { data: pullRequests }] = await Promise.all([
    projectClient.from("projects").select("id, project_key, name, description, progress_percent, status_id, category_id, last_activity_at, created_at").order("created_at"),
    projectClient.from("project_statuses").select("id, status_key, name"),
    projectClient.from("project_categories").select("id, name"),
    projectClient.from("tasks").select("project_id, status").not("status", "in", "(done,cancelled)"),
    projectClient.from("project_activity").select("id, project_id, activity_type, summary, occurred_at").order("occurred_at", { ascending: false }).limit(20),
    pwaClient.from("chats").select("id", { count: "exact", head: true }),
    pwaClient.from("github_repositories").select("id, project_id, name, sync_status"),
    pwaClient.from("github_issues").select("repository_id, state").eq("state", "open"),
    pwaClient.from("github_pull_requests").select("repository_id, state").eq("state", "open"),
  ]);
  if (error || !projects) return Response.json({ error: "Unable to load projects" }, { status: 500 });

  const countBy = <T extends Record<string, unknown>>(items: T[], key: keyof T) => items.reduce((counts, item) => counts.set(String(item[key]), (counts.get(String(item[key])) ?? 0) + 1), new Map<string, number>());
  const statusById = new Map((statuses ?? []).map((item) => [item.id, item]));
  const categoryById = new Map((categories ?? []).map((item) => [item.id, item.name]));
  const tasksByProject = countBy(tasks ?? [], "project_id");
  const repositoriesByProject = (repositories ?? []).reduce((groups, item) => groups.set(item.project_id, [...(groups.get(item.project_id) ?? []), item]), new Map<string, typeof repositories>());
  const issuesByRepository = countBy(issues ?? [], "repository_id");
  const pullRequestsByRepository = countBy(pullRequests ?? [], "repository_id");
  const activitiesByProject = countBy(activities ?? [], "project_id");
  const projectData = projects.map((project) => {
    const status = statusById.get(project.status_id);
    const projectRepositories = repositoriesByProject.get(project.id) ?? [];
    const syncStatuses = projectRepositories.map((repository) => repository.sync_status);
    const hermesStatus = syncStatuses.includes("failed") ? "attention" : syncStatuses.includes("syncing") ? "syncing" : projectRepositories.length ? "ready" : "unavailable";
    return {
      id: project.id,
      projectKey: project.project_key,
      name: project.name,
      description: project.description,
      category: categoryById.get(project.category_id) ?? null,
      status: status?.status_key ?? "unknown",
      statusLabel: status?.name ?? "Unknown",
      technologies: projectRepositories.map((repository) => repository.name),
      openIssues: projectRepositories.reduce((total, repository) => total + (issuesByRepository.get(repository.id) ?? 0), 0),
      openTasks: tasksByProject.get(project.id) ?? 0,
      openPullRequests: projectRepositories.reduce((total, repository) => total + (pullRequestsByRepository.get(repository.id) ?? 0), 0),
      progress: Number(project.progress_percent),
      hermesStatus,
      activityCount: activitiesByProject.get(project.id) ?? 0,
      lastActivityAt: project.last_activity_at,
    };
  });
  const activity = (activities ?? []).map((item) => ({ id: item.id, projectId: item.project_id, projectName: projects.find((project) => project.id === item.project_id)?.name ?? "", activityType: item.activity_type, summary: item.summary, occurredAt: item.occurred_at }));
  return Response.json({ data: projectData, activity, totals: { projects: projectData.length, activeProjects: projectData.filter((project) => project.status === "active").length, openTasks: projectData.reduce((total, project) => total + project.openTasks, 0), openIssues: projectData.reduce((total, project) => total + project.openIssues, 0), conversations: conversations ?? 0 } });
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
