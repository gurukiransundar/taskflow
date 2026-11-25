import api from "./axios";
import type { Role, Workspace, WorkspaceDetails, WorkspaceListItem } from "../types";

// GET /api/workspaces → all workspaces I belong to
export async function fetchWorkspaces() {
  const { data } = await api.get<{ workspaces: WorkspaceListItem[] }>("/api/workspaces");
  return data.workspaces;
}

// GET /api/workspaces/:workspaceId → one workspace with its members
export async function fetchWorkspace(workspaceId: string) {
  const { data } = await api.get<{ workspace: WorkspaceDetails; myRole: Role }>(
    `/api/workspaces/${workspaceId}`,
  );
  return data;
}

// POST /api/workspaces → create a new workspace
export async function createWorkspace(name: string) {
  const { data } = await api.post<{ workspace: Workspace }>("/api/workspaces", { name });
  return data.workspace;
}
// DELETE /api/workspaces/:workspaceId → delete a workspace (owner only)
export async function deleteWorkspace(workspaceId: string) {
  await api.delete(`/api/workspaces/${workspaceId}`);
}