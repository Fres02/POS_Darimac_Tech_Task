import type { Request, Response, NextFunction } from "express";
import { dashboardSchema } from "@pos/shared";
import { getTodaySummary, getSalesOverTime, getTopProducts } from "../services/dashboard.service";

export async function get(_req: Request, res: Response, next: NextFunction) {
  try {
    const [today, salesOverTime, topProducts] = await Promise.all([
      getTodaySummary(),
      getSalesOverTime(7),
      getTopProducts(7, 5),
    ]);
    res.json(dashboardSchema.parse({ today, salesOverTime, topProducts }));
  } catch (err) {
    next(err);
  }
}
