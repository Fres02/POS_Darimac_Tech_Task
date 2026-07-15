import { z } from "zod";
import { moneySchema } from "./common";

export const todaySummarySchema = z.object({
  revenue: moneySchema,
  transactionCount: z.number().int().nonnegative(),
  avgBasket: moneySchema,
});
export type TodaySummary = z.infer<typeof todaySummarySchema>;

export const salesOverTimePointSchema = z.object({
  date: z.string().date(),
  revenue: moneySchema,
  transactionCount: z.number().int().nonnegative(),
});
export type SalesOverTimePoint = z.infer<typeof salesOverTimePointSchema>;

export const dashboardTopProductSchema = z.object({
  productId: z.string().uuid(),
  name: z.string(),
  qtySold: z.number().nonnegative(),
  revenue: moneySchema,
});
export type DashboardTopProduct = z.infer<typeof dashboardTopProductSchema>;

export const dashboardSchema = z.object({
  today: todaySummarySchema,
  salesOverTime: z.array(salesOverTimePointSchema),
  topProducts: z.array(dashboardTopProductSchema),
});
export type Dashboard = z.infer<typeof dashboardSchema>;
