import { Router } from "express";
import * as taskController from "../controllers/task.controller.js";
import { validate } from "../middleware/validate.js";
import { requireWorkspaceRole } from "../middleware/workspaceAccess.js";
import {
  createTaskSchema,
  moveTaskSchema,
  updateTaskSchema,
} from "../validators/task.validator.js";
import commentRoutes from "./comment.routes.js";

const router = Router({ mergeParams: true });

router.get("/", requireWorkspaceRole("VIEWER"), taskController.list);
router.post("/", requireWorkspaceRole("MEMBER"), validate(createTaskSchema), taskController.create);
router.get("/:taskId", requireWorkspaceRole("VIEWER"), taskController.getOne);
router.patch("/:taskId", requireWorkspaceRole("MEMBER"), validate(updateTaskSchema), taskController.update);
router.patch("/:taskId/move", requireWorkspaceRole("MEMBER"), validate(moveTaskSchema), taskController.move);
router.delete("/:taskId", requireWorkspaceRole("MEMBER"), taskController.remove);

// Comments: .../tasks/:taskId/comments
router.use("/:taskId/comments", commentRoutes);

export default router;