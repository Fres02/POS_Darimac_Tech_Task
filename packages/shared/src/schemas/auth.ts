import { z } from "zod";
import { profileSchema } from "./profile";

export const loginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
export type LoginRequest = z.infer<typeof loginRequestSchema>;

export const loginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresAt: z.number(),
  profile: profileSchema,
});
export type LoginResponse = z.infer<typeof loginResponseSchema>;
