import { z } from "zod";

const roleEnum = z.enum(["ADMIN", "MEMBER", "VIEWER"]);

export const workspaceSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(50),
});

export const addMemberSchema = z.object({
  email: z.email("Invalid email").transform((e) => e.toLowerCase()),
  role: roleEnum.default("MEMBER"),
});

export const updateMemberSchema = z.object({
  role: roleEnum,
});

export type AddMemberInput = z.infer<typeof addMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;