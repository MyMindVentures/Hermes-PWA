export type ProjectRecord = { id: string; userId: string; name: string; repository?: string | null; status: string };
export interface ProjectRepository { listForUser(userId: string): Promise<ProjectRecord[]>; findForUser(userId: string, projectId: string): Promise<ProjectRecord | null>; }
/** Prisma is an optional server-side typed ORM over the existing Hermes AI Supabase PostgreSQL database. */
export const databaseBoundary = { provider: "supabase-postgresql", schema: "hermes_pwa", canonicalProjectRegistry: "project_management", authorization: "rls-and-project-access" as const };
