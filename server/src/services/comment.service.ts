import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { getTask } from "./task.service.js";

const userFields = { id: true, name: true, email: true, avatarUrl: true } as const;
const commentInclude = { author: { select: userFields } } as const;

interface TaskRef {
  workspaceId: string;
  projectId: string;
  taskId: string;
}

async function getComment(taskId: string, commentId: string) {
  const comment = await prisma.comment.findFirst({ where: { id: commentId, taskId } });
  if (!comment) throw new AppError(404, "Comment not found");
  return comment;
}

export async function listComments(ref: TaskRef) {
  await getTask(ref.workspaceId, ref.projectId, ref.taskId);

  return prisma.comment.findMany({
    where: { taskId: ref.taskId },
    include: commentInclude,
    orderBy: { createdAt: "asc" },
  });
}

export async function createComment(ref: TaskRef, authorId: string, content: string) {
  await getTask(ref.workspaceId, ref.projectId, ref.taskId);

  return prisma.comment.create({
    data: { content, taskId: ref.taskId, authorId },
    include: commentInclude,
  });
}

export async function updateComment(
  ref: TaskRef,
  commentId: string,
  userId: string,
  content: string,
) {
  await getTask(ref.workspaceId, ref.projectId, ref.taskId);
  const comment = await getComment(ref.taskId, commentId);

  if (comment.authorId !== userId) {
    throw new AppError(403, "You can only edit your own comments");
  }

  return prisma.comment.update({
    where: { id: commentId },
    data: { content },
    include: commentInclude,
  });
}

export async function deleteComment(
  ref: TaskRef,
  commentId: string,
  userId: string,
  role: string,
) {
  await getTask(ref.workspaceId, ref.projectId, ref.taskId);
  const comment = await getComment(ref.taskId, commentId);

  if (comment.authorId !== userId && role !== "ADMIN") {
    throw new AppError(403, "You can only delete your own comments");
  }

  await prisma.comment.delete({ where: { id: commentId } });
}