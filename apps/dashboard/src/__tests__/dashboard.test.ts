import { describe, expect, it } from "vitest";
import type { Project } from "../providers/data-provider";

describe("project dashboard contract", () => {
  it("supports project cards with required operational fields", () => {
    const project: Project = {
      id: "project-id",
      name: "Hermes PWA",
      description: "Project dashboard",
      status: "development",
      technologies: ["Supabase"],
      openIssues: 0,
      progress: 0,
      hermesStatus: "ready",
    };

    expect(project.name).toBeTruthy();
    expect(project.status).toBeTruthy();
    expect(project.openIssues).toBeGreaterThanOrEqual(0);
    expect(project.progress).toBeGreaterThanOrEqual(0);
  });
});
