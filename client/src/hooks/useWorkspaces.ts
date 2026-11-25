import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createWorkspace, deleteWorkspace, fetchWorkspace, fetchWorkspaces } from "../api/workspaces";
// Names for each piece of cached data
export const workspaceKeys = {
  all: ["workspaces"] as const,
  detail: (workspaceId: string) => ["workspaces", workspaceId] as const,
};

// All my workspaces (used by the Sidebar and the Dashboard)
export function useWorkspaces() {
  return useQuery({
    queryKey: workspaceKeys.all,
    queryFn: fetchWorkspaces,
  });
}

// One workspace with its members + my role (used by the Workspace page)
export function useWorkspace(workspaceId: string | undefined) {
  return useQuery({
    queryKey: workspaceKeys.detail(workspaceId ?? ""),
    queryFn: () => fetchWorkspace(workspaceId!),
    enabled: Boolean(workspaceId), // don't run until we have an ID
  });
}

// Create a workspace, then refresh every list that shows workspaces
export function useCreateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => createWorkspace(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
    },
  });
}
// Delete a workspace, forget its cached data, refresh the workspace list
export function useDeleteWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workspaceId: string) => deleteWorkspace(workspaceId),
    onSuccess: (_data, workspaceId) => {
      // Remove this workspace + its projects from memory (don't re-fetch a deleted thing)
      queryClient.removeQueries({ queryKey: workspaceKeys.detail(workspaceId) });
      // Refresh only the list (Sidebar + Dashboard)
      queryClient.invalidateQueries({ queryKey: workspaceKeys.all, exact: true });
    },
  });
}
