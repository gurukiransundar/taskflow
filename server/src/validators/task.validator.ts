import { z } from "zod";

const statusEnum = z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]);
const priorityEnum = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().max(5000).optional(),
  status: statusEnum.default("TODO"),
  priority: priorityEnum.default("MEDIUM"),
  dueDate: z.coerce.date().optional(),
  assigneeId: z.string().optional(),
});

// Every field optional. null = "clear this field" (e.g. unassign)
export const updateTaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200).optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  status: statusEnum.optional(),
  priority: priorityEnum.optional(),
  dueDate: z.coerce.date().nullable().optional(),
  assigneeId: z.string().nullable().optional(),
});

// Used by drag and drop
export const moveTaskSchema = z.object({
  status: statusEnum,
  position: z.number(),
});

// Filters from the URL, e.g. ?status=TODO&q=login
export const listTasksQuerySchema = z.object({
  status: statusEnum.optional(),
  priority: priorityEnum.optional(),
  assigneeId: z.string().optional(),
  q: z.string().trim().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type MoveTaskInput = z.infer<typeof moveTaskSchema>;
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;