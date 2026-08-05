export type AuthProvider = "github" | "google";
export type SessionUser = { id: string; email?: string; name?: string; avatarUrl?: string };
export interface AuthGateway { signIn(provider: AuthProvider): Promise<void>; signOut(): Promise<void>; getCurrentUser(): Promise<SessionUser | null>; }

/** Existing Hermes AI Supabase project is the single Auth/JWT/session authority. */
export const authConfig = { projectRef: "kjjiufximimaxbeiqmce", providers: ["github", "google"] as const, sessionRecovery: true, refreshTokens: "supabase-managed" as const };
