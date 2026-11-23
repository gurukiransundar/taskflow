import type { Request, Response } from "express";
import * as workspaceService from "../services/workspace.service.js";

const param = (req: Request, name: string) => String(req.params[name]);

export async function list(req: Request, res: Response) {
  const workspaces = await workspaceService.listMyWorkspaces(req.user!.id);
  res.json({ workspaces });
}

export async function create(req: Request, res: Response) {
  const workspace = await workspaceService.createWorkspace(req.user!.id, req.body.name);
  res.status(201).json({ workspace });
}

export async function getOne(req: Request, res: Response) {
  const workspace = await workspaceService.getWorkspace(req.membership!.workspaceId);
  res.json({ workspace, myRole: req.membership!.role });
}

export async function rename(req: Request, res: Response) {
  const workspace = await workspaceService.renameWorkspace(
    req.membership!.workspaceId,
    req.body.name,
  );
  res.json({ workspace });
}

export async function remove(req: Request, res: Response) {
  await workspaceService.deleteWorkspace(req.membership!.workspaceId, req.user!.id);
  res.status(204).end();
}

export async function addMember(req: Request, res: Response) {
  const member = await workspaceService.addMember(req.membership!.workspaceId, req.body);
  res.status(201).json({ member });
}

export async function updateMember(req: Request, res: Response) {
  const member = await workspaceService.updateMemberRole(
    req.membership!.workspaceId,
    param(req, "memberId"),
    req.body.role,
  );
  res.json({ member });
}

export async function removeMember(req: Request, res: Response) {
  await workspaceService.removeMember(req.membership!.workspaceId, param(req, "memberId"));
  res.status(204).end();
}