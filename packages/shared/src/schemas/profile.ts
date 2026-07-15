import { z } from "zod";
import { roleSchema } from "./common";

export const profileSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string().min(1),
  role: roleSchema,
  active: z.boolean(),
});
export type Profile = z.infer<typeof profileSchema>;

export const userSchema = profileSchema.extend({ email: z.string().email() });
export type User = z.infer<typeof userSchema>;

export const createUserInputSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: roleSchema,
});
export type CreateUserInput = z.infer<typeof createUserInputSchema>;

export const updateUserInputSchema = z.object({
  role: roleSchema.optional(),
  active: z.boolean().optional(),
});
export type UpdateUserInput = z.infer<typeof updateUserInputSchema>;
