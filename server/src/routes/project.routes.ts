import { Router } from "express";
import * as projectController from "../controllers/project.controller.js";
import { validate } from "../middleware/validate.js";
import { requireWorkspaceRole } from "../middleware/workspaceAccess.js";
import { createProjectSchema, updateProjectSchema } from "../validators/project.validator.js";
import taskRoutes from "./task.routes.js";

// mergeParams lets this router read :workspaceId from the parent URL
const router = Router({ mergeParams: true });

router.get("/", requireWorkspaceRole("VIEWER"), projectController.list);
router.post("/", requireWorkspaceRole("MEMBER"), validate(createProjectSchema), projectController.create);
router.get("/:projectId", requireWorkspaceRole("VIEWER"), projectController.getOne);
router.patch("/:projectId", requireWorkspaceRole("MEMBER"), validate(updateProjectSchema), projectController.update);
router.delete("/:projectId", requireWorkspaceRole("ADMIN"), projectController.remove);
// Tasks: .../projects/:projectId/tasks
router.use("/:projectId/tasks", taskRoutes);

export default router;