import type { Request, Response } from "express";
import * as commentService from "../services/comment.service.js";

const param = (req: Request, name: string) => String(req.params[name]);

const taskRef = (req: Request) => ({
  workspaceId: req.membership!.workspaceId,
  projectId: param(req, "projectId"),
  taskId: param(req, "taskId"),
});

export async function list(req: Request, res: Response) {
  const comments = await commentService.listComments(taskRef(req));
  res.json({ comments });
}

export async function create(req: Request, res: Response) {
  const comment = await commentService.createComment(taskRef(req), req.user!.id, req.body.content);
  res.status(201).json({ comment });
}

export async function update(req: Request, res: Response) {
  const comment = await commentService.updateComment(
    taskRef(req),
    param(req, "commentId"),
    req.user!.id,
    req.body.content,
  );
  res.json({ comment });
}

export async function remove(req: Request, res: Response) {
  await commentService.deleteComment(
    taskRef(req),
    param(req, "commentId"),
    req.user!.id,
    req.membership!.role,
  );
  res.status(204).end();
}