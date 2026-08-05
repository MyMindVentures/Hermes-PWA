export type ProjectContext = { projectId: string; repository?: string; files?: string[]; recentIssues?: string[] };
export type ChatRequest = { context: ProjectContext; messages: Array<{ role: "user" | "assistant"; content: string }> };
export interface HermesAiGateway { streamChat(request: ChatRequest): Promise<ReadableStream<Uint8Array>>; }
export const aiConfig = { streaming: true, modelConfiguredServerSide: true, persistence: "database" as const };

/** Vercel AI SDK route integration belongs in apps/api and must enforce project authorization. */
export function buildProjectSystemPrompt(context: ProjectContext) { return `You are Hermes, an engineering assistant. Project: ${context.projectId}. Repository: ${context.repository ?? "not connected"}. Use only authorized project context.`; }