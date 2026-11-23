import { Router } from "express";
import * as workspaceController from "../controllers/workspace.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { requireWorkspaceRole } from "../middleware/workspaceAccess.js";
import {
  addMemberSchema,
  updateMemberSchema,
  workspaceSchema,
} from "../validators/workspace.validator.js";
import projectRoutes from "./project.routes.js";

const router = Router();

// Every route below needs login
router.use(requireAuth);

// Workspaces
router.get("/", workspaceController.list);
router.post("/", validate(workspaceSchema), workspaceController.create);
router.get("/:workspaceId", requireWorkspaceRole("VIEWER"), workspaceController.getOne);
router.patch("/:workspaceId", requireWorkspaceRole("ADMIN"), validate(workspaceSchema), workspaceController.rename);
router.delete("/:workspaceId", requireWorkspaceRole("ADMIN"), workspaceController.remove);

// Members
router.post("/:workspaceId/members", requireWorkspaceRole("ADMIN"), validate(addMemberSchema), workspaceController.addMember);
router.patch("/:workspaceId/members/:memberId", requireWorkspaceRole("ADMIN"), validate(updateMemberSchema), workspaceController.updateMember);
router.delete("/:workspaceId/members/:memberId", requireWorkspaceRole("ADMIN"), workspaceController.removeMember);

// Projects (nested): /api/workspaces/:workspaceId/projects
router.use("/:workspaceId/projects", projectRoutes);

export default router;