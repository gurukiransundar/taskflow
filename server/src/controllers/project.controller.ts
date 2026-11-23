import type { Request, Response } from "express";
import * as projectService from "../services/project.service.js";

const param = (req: Request, name: string) => String(req.params[name]);

export async function list(req: Request, res: Response) {
  const projects = await projectService.listProjects(req.membership!.workspaceId);
  res.json({ projects });
}

export async function create(req: Request, res: Response) {
  const project = await projectService.createProject(req.membership!.workspaceId, req.body);
  res.status(201).json({ project });
}

export async function getOne(req: Request, res: Response) {
  const project = await projectService.getProject(
    req.membership!.workspaceId,
    param(req, "projectId"),
  );
  res.json({ project });
}

export async function update(req: Request, res: Response) {
  const project = await projectService.updateProject(
    req.membership!.workspaceId,
    param(req, "projectId"),
    req.body,
  );
  res.json({ project });
}

export async function remove(req: Request, res: Response) {
  await projectService.deleteProject(req.membership!.workspaceId, param(req, "projectId"));
  res.status(204).end();
}