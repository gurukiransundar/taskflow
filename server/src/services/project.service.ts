import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import type { CreateProjectInput, UpdateProjectInput } from "../validators/project.validator.js";

export async function listProjects(workspaceId: string) {
  return prisma.project.findMany({
    where: { workspaceId },
    include: { _count: { select: { tasks: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function createProject(workspaceId: string, input: CreateProjectInput) {
  return prisma.project.create({
    data: { ...input, workspaceId },
  });
}

export async function getProject(workspaceId: string, projectId: string) {
  // Checking workspaceId too stops users reaching projects from other workspaces
  const project = await prisma.project.findFirst({
    where: { id: projectId, workspaceId },
    include: { _count: { select: { tasks: true } } },
  });

  if (!project) throw new AppError(404, "Project not found");
  return project;
}

export async function updateProject(
  workspaceId: string,
  projectId: string,
  input: UpdateProjectInput,
) {
  await getProject(workspaceId, projectId);
  return prisma.project.update({ where: { id: projectId }, data: input });
}

export async function deleteProject(workspaceId: string, projectId: string) {
  await getProject(workspaceId, projectId);
  await prisma.project.delete({ where: { id: projectId } });
}