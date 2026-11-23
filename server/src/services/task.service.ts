import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { getProject } from "./project.service.js";
import type {
  CreateTaskInput,
  ListTasksQuery,
  MoveTaskInput,
  UpdateTaskInput,
} from "../validators/task.validator.js";

const userFields = { id: true, name: true, email: true, avatarUrl: true } as const;

// What every task response includes
const taskInclude = {
  assignee: { select: userFields },
  creator: { select: userFields },
  _count: { select: { comments: true } },
} as const;

// An assignee must belong to the workspace
async function ensureMember(workspaceId: string, userId: string) {
  const member = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  });
  if (!member) throw new AppError(400, "Assignee must be a member of this workspace");
}

// New tasks go to the bottom of their column
async function nextPosition(projectId: string, status: CreateTaskInput["status"]) {
  const last = await prisma.task.findFirst({
    where: { projectId, status },
    orderBy: { position: "desc" },
    select: { position: true },
  });
  return (last?.position ?? 0) + 1000;
}

export async function listTasks(workspaceId: string, projectId: string, filters: ListTasksQuery) {
  await getProject(workspaceId, projectId);

  return prisma.task.findMany({
    where: {
      projectId,
      status: filters.status,
      priority: filters.priority,
      assigneeId: filters.assigneeId,
      ...(filters.q
        ? {
            OR: [
              { title: { contains: filters.q, mode: "insensitive" } },
              { description: { contains: filters.q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: taskInclude,
    orderBy: [{ status: "asc" }, { position: "asc" }],
  });
}

export async function createTask(
  workspaceId: string,
  projectId: string,
  creatorId: string,
  input: CreateTaskInput,
) {
  await getProject(workspaceId, projectId);
  if (input.assigneeId) await ensureMember(workspaceId, input.assigneeId);

  const position = await nextPosition(projectId, input.status);

  return prisma.task.create({
    data: { ...input, projectId, creatorId, position },
    include: taskInclude,
  });
}

export async function getTask(workspaceId: string, projectId: string, taskId: string) {
  // Task must be in THIS project, and the project in THIS workspace
  const task = await prisma.task.findFirst({
    where: { id: taskId, projectId, project: { workspaceId } },
    include: taskInclude,
  });

  if (!task) throw new AppError(404, "Task not found");
  return task;
}

export async function updateTask(
  workspaceId: string,
  projectId: string,
  taskId: string,
  input: UpdateTaskInput,
) {
  const task = await getTask(workspaceId, projectId, taskId);
  if (input.assigneeId) await ensureMember(workspaceId, input.assigneeId);

  // Moved to a new column? Put it at the bottom of that column
  let position: number | undefined;
  if (input.status && input.status !== task.status) {
    position = await nextPosition(projectId, input.status);
  }

  return prisma.task.update({
    where: { id: taskId },
    data: { ...input, position },
    include: taskInclude,
  });
}

export async function moveTask(
  workspaceId: string,
  projectId: string,
  taskId: string,
  input: MoveTaskInput,
) {
  await getTask(workspaceId, projectId, taskId);

  return prisma.task.update({
    where: { id: taskId },
    data: { status: input.status, position: input.position },
    include: taskInclude,
  });
}

export async function deleteTask(
  workspaceId: string,
  projectId: string,
  taskId: string,
  userId: string,
  role: string,
) {
  const task = await getTask(workspaceId, projectId, taskId);

  if (role !== "ADMIN" && task.creatorId !== userId) {
    throw new AppError(403, "Only the task creator or an admin can delete this task");
  }

  // Cascade deletes its comments too
  await prisma.task.delete({ where: { id: taskId } });
}