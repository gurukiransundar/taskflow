import type { RequestHandler } from "express";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";

type Role = "ADMIN" | "MEMBER" | "VIEWER";

// Higher number = more power
const roleRank: Record<Role, number> = { VIEWER: 1, MEMBER: 2, ADMIN: 3 };

export const requireWorkspaceRole =
  (minRole: Role): RequestHandler =>
  async (req, _res, next) => {
    const workspaceId = String(req.params.workspaceId);

    const membership = await prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId: req.user!.id, workspaceId } },
    });

    // Not a member → pretend it doesn't exist (don't reveal private workspaces)
    if (!membership) throw new AppError(404, "Workspace not found");

    if (roleRank[membership.role] < roleRank[minRole]) {
      throw new AppError(403, "You don't have permission to do this");
    }

    req.membership = { workspaceId, role: membership.role };
    next();
  };