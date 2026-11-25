import api from "./axios";
import type { Project } from "../types";

export interface CreateProjectInput {
  name: string;
  description?: string;
}

// GET /api/workspaces/:workspaceId/projects → all projects in a workspace
export async function fetchProjects(workspaceId: string) {
  const { data } = await api.get<{ projects: Project[] }>(
    `/api/workspaces/${workspaceId}/projects`,
  );
  return data.projects;
}

// GET /api/workspaces/:workspaceId/projects/:projectId → one project
export async function fetchProject(workspaceId: string, projectId: string) {
  const { data } = await api.get<{ project: Project }>(
    `/api/workspaces/${workspaceId}/projects/${projectId}`,
  );
  return data.project;
}

// POST /api/workspaces/:workspaceId/projects → create a project
export async function createProject(workspaceId: string, input: CreateProjectInput) {
  const { data } = await api.post<{ project: Project }>(
    `/api/workspaces/${workspaceId}/projects`,
    input,
  );
  return data.project;
}

// DELETE /api/workspaces/:workspaceId/projects/:projectId → delete a project (ADMIN)
export async function deleteProject(workspaceId: string, projectId: string) {
  await api.delete(`/api/workspaces/${workspaceId}/projects/${projectId}`);
}