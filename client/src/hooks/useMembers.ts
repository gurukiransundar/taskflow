import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addMember, removeMember, updateMemberRole } from "../api/members";
import { workspaceKeys } from "./useWorkspaces";
import type { Role } from "../types";

// After any member change: refresh this workspace (member list)
// and the workspace list (member counts on Dashboard cards)
function useRefreshMembers(workspaceId: string) {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: workspaceKeys.detail(workspaceId) });
    queryClient.invalidateQueries({ queryKey: workspaceKeys.all, exact: true });
  };
}

export function useAddMember(workspaceId: string) {
  const refresh = useRefreshMembers(workspaceId);

  return useMutation({
    mutationFn: ({ email, role }: { email: string; role: Role }) =>
      addMember(workspaceId, email, role),
    onSuccess: refresh,
  });
}

export function useUpdateMemberRole(workspaceId: string) {
  const refresh = useRefreshMembers(workspaceId);

  return useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: Role }) =>
      updateMemberRole(workspaceId, memberId, role),
    onSuccess: refresh,
  });
}

export function useRemoveMember(workspaceId: string) {
  const refresh = useRefreshMembers(workspaceId);

  return useMutation({
    mutationFn: (memberId: string) => removeMember(workspaceId, memberId),
    onSuccess: refresh,
  });
}