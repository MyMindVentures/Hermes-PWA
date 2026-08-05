"use client";

import type { DataProvider } from "@refinedev/core";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";
const SUPABASE_SCHEMA = "hermes_pwa";
export const dataProvider: DataProvider = {
  getList: async ({ resource }) => { const response = await fetch(`${API_URL}/${resource}`); return { data: await response.json(), total: 0 }; },
  getOne: async ({ resource, id }) => { const response = await fetch(`${API_URL}/${resource}/${id}`); return { data: await response.json() }; },
  create: async ({ resource, variables }) => { const response = await fetch(`${API_URL}/${resource}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(variables) }); return { data: await response.json() }; },
  update: async ({ resource, id, variables }) => { const response = await fetch(`${API_URL}/${resource}/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(variables) }); return { data: await response.json() }; },
  deleteOne: async ({ resource, id }) => { const response = await fetch(`${API_URL}/${resource}/${id}`, { method: "DELETE" }); return { data: await response.json() }; },
  getApiUrl: () => API_URL,
};

export type ProjectStatus = "online" | "development" | "offline";
export type Project = { id: string; name: string; description: string; status: ProjectStatus; technologies: string[]; openIssues: number; progress: number; hermesStatus: "ready" | "syncing" | "attention" };
export const demoProjects: Project[] = [
  { id: "costapulse", name: "CostaPulse", description: "AI-powered coastal intelligence platform.", status: "online", technologies: ["Next.js", "Supabase", "AI"], openIssues: 12, progress: 78, hermesStatus: "ready" },
  { id: "hermes", name: "Hermes PWA", description: "Central AI project dashboard and development command center.", status: "development", technologies: ["Next.js", "Refine", "Supabase"], openIssues: 8, progress: 42, hermesStatus: "syncing" },
  { id: "nexus", name: "Nexus Mobile", description: "Cross-platform workspace for teams.", status: "development", technologies: ["Expo", "React Native", "API"], openIssues: 23, progress: 54, hermesStatus: "attention" },
  { id: "atlas", name: "Atlas API", description: "Unified API layer for projects and agents.", status: "offline", technologies: ["Node.js", "Postgres"], openIssues: 4, progress: 19, hermesStatus: "attention" },
];
