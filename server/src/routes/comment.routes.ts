import { Router } from "express";
import * as commentController from "../controllers/comment.controller.js";
import { validate } from "../middleware/validate.js";
import { requireWorkspaceRole } from "../middleware/workspaceAccess.js";
import { commentSchema } from "../validators/comment.validator.js";

const router = Router({ mergeParams: true });

router.get("/", requireWorkspaceRole("VIEWER"), commentController.list);
router.post("/", requireWorkspaceRole("MEMBER"), validate(commentSchema), commentController.create);
router.patch("/:commentId", requireWorkspaceRole("MEMBER"), validate(commentSchema), commentController.update);
router.delete("/:commentId", requireWorkspaceRole("MEMBER"), commentController.remove);

export default router;