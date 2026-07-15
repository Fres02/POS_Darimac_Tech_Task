import { and, desc, eq, gte, lt, sql } from "drizzle-orm";
import type { TodaySummary, SalesOverTimePoint, DashboardTopProduct } from "@pos/shared";
import { db } from "../db/client";
import { sales, saleItems } from "../db/schema";
import { getColomboDateString, getColomboDayRangeUtc } from "../lib/colombo-time";
import { computeDailyTotals } from "./report.service";

const DAY_MS = 24 * 60 * 60 * 1000;

export async function getTodaySummary(): Promise<TodaySummary> {
  const today = getColomboDateString(new Date());
  const totals = await computeDailyTotals(today);
  const avgBasket =
    totals.transactionCount > 0
      ? Number((totals.totalRevenue / totals.transactionCount).toFixed(2))
      : 0;

  return {
    revenue: totals.totalRevenue,
    transactionCount: totals.transactionCount,
    avgBasket,
  };
}

export async function getSalesOverTime(days: number): Promise<SalesOverTimePoint[]> {
  const todayStr = getColomboDateString(new Date());
  const { start: todayStart } = getColomboDayRangeUtc(todayStr);
  const rangeStart = new Date(todayStart.getTime() - (days - 1) * DAY_MS);
  const rangeEnd = new Date(todayStart.getTime() + DAY_MS);

  const dayExpr = sql<string>`to_char(${sales.createdAt} AT TIME ZONE 'Asia/Colombo', 'YYYY-MM-DD')`;
  const rows = await db
    .select({
      day: dayExpr,
      revenue: sql<string>`coalesce(sum(${sales.total}), 0)`,
      transactionCount: sql<number>`count(*)::int`,
    })
    .from(sales)
    .where(and(gte(sales.createdAt, rangeStart), lt(sales.createdAt, rangeEnd)))
    .groupBy(dayExpr)
    .orderBy(dayExpr);

  const rowsByDay = new Map(rows.map((row) => [row.day, row]));

  // Fill in days with zero sales so the chart shows a continuous range.
  const series: SalesOverTimePoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const dayStr = getColomboDateString(new Date(todayStart.getTime() - i * DAY_MS));
    const row = rowsByDay.get(dayStr);
    series.push({
      date: dayStr,
      revenue: row ? Number(row.revenue) : 0,
      transactionCount: row ? Number(row.transactionCount) : 0,
    });
  }
  return series;
}

export async function getTopProducts(days: number, limit: number): Promise<DashboardTopProduct[]> {
  const todayStr = getColomboDateString(new Date());
  const { start: todayStart } = getColomboDayRangeUtc(todayStr);
  const rangeStart = new Date(todayStart.getTime() - (days - 1) * DAY_MS);
  const rangeEnd = new Date(todayStart.getTime() + DAY_MS);
  const dateFilter = and(gte(sales.createdAt, rangeStart), lt(sales.createdAt, rangeEnd));

  const rows = await db
    .select({
      productId: saleItems.productId,
      name: sql<string>`max(${saleItems.nameSnapshot})`,
      qtySold: sql<string>`coalesce(sum(${saleItems.qty}), 0)`,
      revenue: sql<string>`coalesce(sum(${saleItems.lineTotal}), 0)`,
    })
    .from(saleItems)
    .innerJoin(sales, eq(saleItems.saleId, sales.id))
    .where(dateFilter)
    .groupBy(saleItems.productId)
    .orderBy(desc(sql`sum(${saleItems.lineTotal})`))
    .limit(limit);

  return rows.map((row) => ({
    productId: row.productId,
    name: row.name,
    qtySold: Number(row.qtySold),
    revenue: Number(row.revenue),
  }));
}
