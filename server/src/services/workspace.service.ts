import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import type { AddMemberInput, UpdateMemberInput } from "../validators/workspace.validator.js";

const userFields = { id: true, name: true, email: true, avatarUrl: true } as const;

export async function createWorkspace(userId: string, name: string) {
  // Create the workspace AND make the creator an ADMIN member in one go
  return prisma.workspace.create({
    data: {
      name,
      ownerId: userId,
      members: { create: { userId, role: "ADMIN" } },
    },
  });
}

export async function listMyWorkspaces(userId: string) {
  const memberships = await prisma.workspaceMember.findMany({
    where: { userId },
    include: {
      workspace: {
        include: { _count: { select: { members: true, projects: true } } },
      },
    },
    orderBy: { joinedAt: "desc" },
  });

  return memberships.map((m) => ({ ...m.workspace, myRole: m.role }));
}

export async function getWorkspace(workspaceId: string) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      members: {
        include: { user: { select: userFields } },
        orderBy: { joinedAt: "asc" },
      },
      _count: { select: { projects: true } },
    },
  });

  if (!workspace) throw new AppError(404, "Workspace not found");
  return workspace;
}

export async function renameWorkspace(workspaceId: string, name: string) {
  return prisma.workspace.update({ where: { id: workspaceId }, data: { name } });
}

export async function deleteWorkspace(workspaceId: string, userId: string) {
  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
  if (!workspace) throw new AppError(404, "Workspace not found");

  if (workspace.ownerId !== userId) {
    throw new AppError(403, "Only the owner can delete this workspace");
  }

  // Cascade deletes members, projects, tasks and comments too
  await prisma.workspace.delete({ where: { id: workspaceId } });
}

export async function addMember(workspaceId: string, input: AddMemberInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) throw new AppError(404, "No user with that email. Ask them to sign up first.");

  const existing = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId: user.id, workspaceId } },
  });
  if (existing) throw new AppError(409, "This user is already a member");

  return prisma.workspaceMember.create({
    data: { userId: user.id, workspaceId, role: input.role },
    include: { user: { select: userFields } },
  });
}

// Finds a member in this workspace and blocks changes to the owner
async function findEditableMember(workspaceId: string, memberId: string) {
  const member = await prisma.workspaceMember.findFirst({
    where: { id: memberId, workspaceId },
    include: { workspace: { select: { ownerId: true } } },
  });

  if (!member) throw new AppError(404, "Member not found");

  if (member.userId === member.workspace.ownerId) {
    throw new AppError(400, "The workspace owner can't be changed or removed");
  }

  return member;
}

export async function updateMemberRole(
  workspaceId: string,
  memberId: string,
  role: UpdateMemberInput["role"],
) {
  await findEditableMember(workspaceId, memberId);

  return prisma.workspaceMember.update({
    where: { id: memberId },
    data: { role },
    include: { user: { select: userFields } },
  });
}

export async function removeMember(workspaceId: string, memberId: string) {
  await findEditableMember(workspaceId, memberId);
  await prisma.workspaceMember.delete({ where: { id: memberId } });
}