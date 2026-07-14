import { z } from "zod";
import { roleSchema } from "./common";

export const profileSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string().min(1),
  role: roleSchema,
  active: z.boolean(),
});
export type Profile = z.infer<typeof profileSchema>;
