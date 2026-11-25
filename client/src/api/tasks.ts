import api from "./axios";
import type { Priority, Task, TaskStatus } from "../types";

// Filters the board can send (all optional)
export interface TaskFilters {
  priority?: Priority;
  assigneeId?: string;
  q?: string; // search text
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  dueDate?: string; // "YYYY-MM-DD"
  assigneeId?: string;
}

// For edits: send only what changed. null = clear the field.
export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: Priority;
  dueDate?: string | null;
  assigneeId?: string | null;
}

// Base URL for one project's tasks
const tasksUrl = (workspaceId: string, projectId: string) =>
  `/api/workspaces/${workspaceId}/projects/${projectId}/tasks`;

// GET .../tasks?priority=HIGH&assigneeId=...&q=login
export async function fetchTasks(workspaceId: string, projectId: string, filters: TaskFilters = {}) {
  // Only send filters that have a value
  const params: Record<string, string> = {};
  if (filters.priority) params.priority = filters.priority;
  if (filters.assigneeId) params.assigneeId = filters.assigneeId;
  if (filters.q?.trim()) params.q = filters.q.trim();

  const { data } = await api.get<{ tasks: Task[] }>(tasksUrl(workspaceId, projectId), { params });
  return data.tasks;
}

// GET .../tasks/:taskId
export async function fetchTask(workspaceId: string, projectId: string, taskId: string) {
  const { data } = await api.get<{ task: Task }>(`${tasksUrl(workspaceId, projectId)}/${taskId}`);
  return data.task;
}

// POST .../tasks
export async function createTask(workspaceId: string, projectId: string, input: CreateTaskInput) {
  const { data } = await api.post<{ task: Task }>(tasksUrl(workspaceId, projectId), input);
  return data.task;
}

// PATCH .../tasks/:taskId
export async function updateTask(
  workspaceId: string,
  projectId: string,
  taskId: string,
  input: UpdateTaskInput,
) {
  const { data } = await api.patch<{ task: Task }>(
    `${tasksUrl(workspaceId, projectId)}/${taskId}`,
    input,
  );
  return data.task;
}

// PATCH .../tasks/:taskId/move   (drag and drop, Day 10)
export async function moveTask(
  workspaceId: string,
  projectId: string,
  taskId: string,
  status: TaskStatus,
  position: number,
) {
  const { data } = await api.patch<{ task: Task }>(
    `${tasksUrl(workspaceId, projectId)}/${taskId}/move`,
    { status, position },
  );
  return data.task;
}

// DELETE .../tasks/:taskId
export async function deleteTask(workspaceId: string, projectId: string, taskId: string) {
  await api.delete(`${tasksUrl(workspaceId, projectId)}/${taskId}`);
}