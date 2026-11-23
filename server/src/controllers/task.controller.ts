import type { Request, Response } from "express";
import * as taskService from "../services/task.service.js";
import { listTasksQuerySchema } from "../validators/task.validator.js";

const param = (req: Request, name: string) => String(req.params[name]);
const workspaceId = (req: Request) => req.membership!.workspaceId;

export async function list(req: Request, res: Response) {
  const filters = listTasksQuerySchema.parse(req.query);
  const tasks = await taskService.listTasks(workspaceId(req), param(req, "projectId"), filters);
  res.json({ tasks });
}

export async function create(req: Request, res: Response) {
  const task = await taskService.createTask(
    workspaceId(req),
    param(req, "projectId"),
    req.user!.id,
    req.body,
  );
  res.status(201).json({ task });
}

export async function getOne(req: Request, res: Response) {
  const task = await taskService.getTask(
    workspaceId(req),
    param(req, "projectId"),
    param(req, "taskId"),
  );
  res.json({ task });
}

export async function update(req: Request, res: Response) {
  const task = await taskService.updateTask(
    workspaceId(req),
    param(req, "projectId"),
    param(req, "taskId"),
    req.body,
  );
  res.json({ task });
}

export async function move(req: Request, res: Response) {
  const task = await taskService.moveTask(
    workspaceId(req),
    param(req, "projectId"),
    param(req, "taskId"),
    req.body,
  );
  res.json({ task });
}

export async function remove(req: Request, res: Response) {
  await taskService.deleteTask(
    workspaceId(req),
    param(req, "projectId"),
    param(req, "taskId"),
    req.user!.id,
    req.membership!.role,
  );
  res.status(204).end();
}