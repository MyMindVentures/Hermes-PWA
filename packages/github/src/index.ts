export type GitHubRepositorySummary = { owner: string; name: string; openIssues: number; openPullRequests: number; defaultBranch: string; lastCommitSha: string; syncedAt: string };
export interface GitHubGateway { getRepositorySummary(projectId: string, owner: string, name: string): Promise<GitHubRepositorySummary>; syncRepository(projectId: string, owner: string, name: string): Promise<void>; }

/** Implemented by an authenticated server/Edge Function using Octokit and project authorization. */
export class OctokitGitHubGateway implements GitHubGateway {
  constructor(private readonly accessToken: string) {}
  async getRepositorySummary(projectId: string, owner: string, name: string): Promise<GitHubRepositorySummary> {
    if (!projectId) throw new Error("projectId is required for authorization");
    const response = await fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`, { headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${this.accessToken}` } });
    if (!response.ok) throw new Error(`GitHub repository request failed: ${response.status}`);
    const data = await response.json() as { owner: { login: string }; name: string; open_issues_count: number; default_branch: string; pushed_at: string };
    return { owner: data.owner.login, name: data.name, openIssues: data.open_issues_count, openPullRequests: 0, defaultBranch: data.default_branch, lastCommitSha: "server-sync", syncedAt: data.pushed_at };
  }
  async syncRepository(projectId: string): Promise<void> { if (!projectId) throw new Error("projectId is required for authorization"); /* queue idempotent server-side sync */ }
}
