import api from "./axios";
import type { Role, WorkspaceMember } from "../types";

// POST /api/workspaces/:workspaceId/members → add someone by email
export async function addMember(workspaceId: string, email: string, role: Role) {
  const { data } = await api.post<{ member: WorkspaceMember }>(
    `/api/workspaces/${workspaceId}/members`,
    { email, role },
  );
  return data.member;
}

// PATCH /api/workspaces/:workspaceId/members/:memberId → change their role
export async function updateMemberRole(workspaceId: string, memberId: string, role: Role) {
  const { data } = await api.patch<{ member: WorkspaceMember }>(
    `/api/workspaces/${workspaceId}/members/${memberId}`,
    { role },
  );
  return data.member;
}

// DELETE /api/workspaces/:workspaceId/members/:memberId → remove them
export async function removeMember(workspaceId: string, memberId: string) {
  await api.delete(`/api/workspaces/${workspaceId}/members/${memberId}`);
}