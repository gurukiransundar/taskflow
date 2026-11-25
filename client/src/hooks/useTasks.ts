import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTask,
  deleteTask,
  fetchTask,
  fetchTasks,
  updateTask,
  type CreateTaskInput,
  type TaskFilters,
  type UpdateTaskInput,
} from "../api/tasks";
import { projectKeys } from "./useProjects";

// Names for cached task data (they sit "under" the project in the key tree)
export const taskKeys = {
  all: (workspaceId: string, projectId: string) =>
    [...projectKeys.detail(workspaceId, projectId), "tasks"] as const,
  list: (workspaceId: string, projectId: string, filters: TaskFilters) =>
    [...taskKeys.all(workspaceId, projectId), "list", filters] as const,
  detail: (workspaceId: string, projectId: string, taskId: string) =>
    [...taskKeys.all(workspaceId, projectId), "detail", taskId] as const,
};

// All tasks on the board (with filters)
export function useTasks(workspaceId: string, projectId: string, filters: TaskFilters) {
  return useQuery({
    queryKey: taskKeys.list(workspaceId, projectId, filters),
    queryFn: () => fetchTasks(workspaceId, projectId, filters),
    enabled: Boolean(workspaceId && projectId),
    placeholderData: keepPreviousData, // keep showing old cards while new filters load
  });
}

// One task (used by the details popup on Day 10)
export function useTask(workspaceId: string, projectId: string, taskId: string | null) {
  return useQuery({
    queryKey: taskKeys.detail(workspaceId, projectId, taskId ?? ""),
    queryFn: () => fetchTask(workspaceId, projectId, taskId!),
    enabled: Boolean(workspaceId && projectId && taskId),
  });
}

// After any task change: refresh the board + the task counts on project cards
function useRefreshTasks(workspaceId: string, projectId: string) {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: taskKeys.all(workspaceId, projectId) });
    queryClient.invalidateQueries({ queryKey: projectKeys.list(workspaceId), exact: true });
  };
}

export function useCreateTask(workspaceId: string, projectId: string) {
  const refresh = useRefreshTasks(workspaceId, projectId);

  return useMutation({
    mutationFn: (input: CreateTaskInput) => createTask(workspaceId, projectId, input),
    onSuccess: refresh,
  });
}

export function useUpdateTask(workspaceId: string, projectId: string) {
  const refresh = useRefreshTasks(workspaceId, projectId);

  return useMutation({
    mutationFn: ({ taskId, input }: { taskId: string; input: UpdateTaskInput }) =>
      updateTask(workspaceId, projectId, taskId, input),
    onSuccess: refresh,
  });
}

export function useDeleteTask(workspaceId: string, projectId: string) {
  const refresh = useRefreshTasks(workspaceId, projectId);

  return useMutation({
    mutationFn: (taskId: string) => deleteTask(workspaceId, projectId, taskId),
    onSuccess: refresh,
  });
}