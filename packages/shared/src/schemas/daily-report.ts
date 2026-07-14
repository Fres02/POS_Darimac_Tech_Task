import { z } from "zod";
import { moneySchema } from "./common";

export const cashierBreakdownSchema = z.object({
  cashierId: z.string().uuid(),
  cashierName: z.string(),
  revenue: moneySchema,
  transactionCount: z.number().int().nonnegative(),
});
export type CashierBreakdown = z.infer<typeof cashierBreakdownSchema>;

export const topItemSchema = z.object({
  productId: z.string().uuid(),
  name: z.string(),
  qtySold: z.number().int().nonnegative(),
  revenue: moneySchema,
});
export type TopItem = z.infer<typeof topItemSchema>;

export const dailyReportTotalsSchema = z.object({
  totalRevenue: moneySchema,
  transactionCount: z.number().int().nonnegative(),
  perCashier: z.array(cashierBreakdownSchema),
  topItems: z.array(topItemSchema),
});
export type DailyReportTotals = z.infer<typeof dailyReportTotalsSchema>;

export const dailyReportSchema = z.object({
  id: z.string().uuid(),
  reportDate: z.string().date(),
  sentAt: z.string().datetime(),
  totals: dailyReportTotalsSchema,
});
export type DailyReport = z.infer<typeof dailyReportSchema>;
