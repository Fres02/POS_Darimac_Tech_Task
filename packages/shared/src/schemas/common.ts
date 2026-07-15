import { z } from "zod";

export const roleSchema = z.enum(["admin", "cashier"]);
export type Role = z.infer<typeof roleSchema>;

export const moneySchema = z.number().nonnegative().multipleOf(0.01);
export type Money = z.infer<typeof moneySchema>;

export const unitTypeSchema = z.enum(["each", "kg", "l"]);
export type UnitType = z.infer<typeof unitTypeSchema>;
