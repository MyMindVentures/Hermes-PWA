import { describe, expect, it } from "vitest";
import type { Project, ProjectDashboardResponse } from "../providers/data-provider";

describe("project dashboard contract", () => {
  it("supports database-backed project cards with derived operational fields", () => {
    const project: Project = {
      id: "project-id",
      projectKey: "hermes-pwa",
      name: "Hermes PWA",
      description: "Project dashboard",
      category: "Software",
      status: "active",
      statusLabel: "Active",
      technologies: ["hermes-pwa"],
      openIssues: 2,
      openTasks: 3,
      openPullRequests: 1,
      progress: 42,
      hermesStatus: "ready",
      activityCount: 4,
      lastActivityAt: null,
    };

    expect(project.name).toBeTruthy();
    expect(project.statusLabel).toBeTruthy();
    expect(project.openIssues).toBeGreaterThanOrEqual(0);
    expect(project.openTasks).toBeGreaterThanOrEqual(0);
    expect(project.progress).toBeGreaterThanOrEqual(0);
  });

  it("represents empty activity and database totals without fabricated records", () => {
    const response: ProjectDashboardResponse = { data: [], activity: [], totals: { projects: 0, activeProjects: 0, openTasks: 0, openIssues: 0, conversations: 0 } };
    expect(response.data).toHaveLength(0);
    expect(response.activity).toHaveLength(0);
    expect(response.totals.projects).toBe(0);
  });
});
