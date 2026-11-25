import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createProject,
  deleteProject,
  fetchProject,
  fetchProjects,
  type CreateProjectInput,
} from "../api/projects";
import { workspaceKeys } from "./useWorkspaces";

// Names for cached project data
export const projectKeys = {
  list: (workspaceId: string) => ["workspaces", workspaceId, "projects"] as const,
  detail: (workspaceId: string, projectId: string) =>
    ["workspaces", workspaceId, "projects", projectId] as const,
};

// All projects in one workspace (used by the Workspace page)
export function useProjects(workspaceId: string | undefined) {
  return useQuery({
    queryKey: projectKeys.list(workspaceId ?? ""),
    queryFn: () => fetchProjects(workspaceId!),
    enabled: Boolean(workspaceId),
  });
}

// One project (used by the Board page for its name)
export function useProject(workspaceId: string | undefined, projectId: string | undefined) {
  return useQuery({
    queryKey: projectKeys.detail(workspaceId ?? "", projectId ?? ""),
    queryFn: () => fetchProject(workspaceId!, projectId!),
    enabled: Boolean(workspaceId && projectId),
  });
}

// Create a project, then refresh the project list and the workspace counts
export function useCreateProject(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProjectInput) => createProject(workspaceId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.list(workspaceId) });
      queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
    },
  });
}

// Delete a project, then refresh the project list and workspace counts
export function useDeleteProject(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => deleteProject(workspaceId, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.list(workspaceId) });
      queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
    },
  });
}