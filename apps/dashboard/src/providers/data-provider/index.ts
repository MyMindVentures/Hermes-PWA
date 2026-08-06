"use client";

import type { DataProvider } from "@refinedev/core";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

export const dataProvider: DataProvider = {
  getList: async ({ resource }) => { const response = await fetch(`${API_URL}/${resource}`); return { data: await response.json(), total: 0 }; },
  getOne: async ({ resource, id }) => { const response = await fetch(`${API_URL}/${resource}/${id}`); return { data: await response.json() }; },
  create: async ({ resource, variables }) => { const response = await fetch(`${API_URL}/${resource}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(variables) }); return { data: await response.json() }; },
  update: async ({ resource, id, variables }) => { const response = await fetch(`${API_URL}/${resource}/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(variables) }); return { data: await response.json() }; },
  deleteOne: async ({ resource, id }) => { const response = await fetch(`${API_URL}/${resource}/${id}`, { method: "DELETE" }); return { data: await response.json() }; },
  getApiUrl: () => API_URL,
};

export type ProjectStatus = "active" | "planned" | "paused" | "retired" | "unknown";
export type HermesStatus = "ready" | "syncing" | "attention" | "unavailable";

export type Project = {
  id: string;
  projectKey: string;
  name: string;
  description: string | null;
  category: string | null;
  status: ProjectStatus;
  statusLabel: string;
  technologies: string[];
  openIssues: number;
  openTasks: number;
  openPullRequests: number;
  progress: number;
  hermesStatus: HermesStatus;
  activityCount: number;
  lastActivityAt: string | null;
};

export type ProjectActivity = {
  id: string;
  projectId: string;
  projectName: string;
  activityType: string;
  summary: string;
  occurredAt: string;
};

export type ProjectDashboardResponse = {
  data: Project[];
  activity: ProjectActivity[];
  totals: {
    projects: number;
    activeProjects: number;
    openTasks: number;
    openIssues: number;
    conversations: number;
  };
};
