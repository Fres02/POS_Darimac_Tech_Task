import { and, desc, eq, gte, lt, sql } from "drizzle-orm";
import { render } from "@react-email/render";
import type { DailyReportTotals } from "@pos/shared";
import { db } from "../db/client";
import { sales, saleItems, profiles, dailyReports } from "../db/schema";
import { getColomboDayRangeUtc } from "../lib/colombo-time";
import { resend } from "../lib/resend";
import { env } from "../env";
import { logger } from "../logger";
import { DailyReportEmail } from "../emails/DailyReportEmail";

export async function computeDailyTotals(reportDateColombo: string): Promise<DailyReportTotals> {
  const { start, end } = getColomboDayRangeUtc(reportDateColombo);
  const dateFilter = and(gte(sales.createdAt, start), lt(sales.createdAt, end));

  const [totalsRow] = await db
    .select({
      totalRevenue: sql<string>`coalesce(sum(${sales.total}), 0)`,
      transactionCount: sql<number>`count(*)::int`,
    })
    .from(sales)
    .where(dateFilter);

  const perCashierRows = await db
    .select({
      cashierId: sales.cashierId,
      cashierName: profiles.fullName,
      revenue: sql<string>`coalesce(sum(${sales.total}), 0)`,
      transactionCount: sql<number>`count(*)::int`,
    })
    .from(sales)
    .innerJoin(profiles, eq(sales.cashierId, profiles.id))
    .where(dateFilter)
    .groupBy(sales.cashierId, profiles.fullName)
    .orderBy(desc(sql`sum(${sales.total})`));

  const topItemRows = await db
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
    .limit(5);

  return {
    totalRevenue: Number(totalsRow?.totalRevenue ?? 0),
    transactionCount: Number(totalsRow?.transactionCount ?? 0),
    perCashier: perCashierRows.map((row) => ({
      cashierId: row.cashierId,
      cashierName: row.cashierName,
      revenue: Number(row.revenue),
      transactionCount: Number(row.transactionCount),
    })),
    topItems: topItemRows.map((row) => ({
      productId: row.productId,
      name: row.name,
      qtySold: Number(row.qtySold),
      revenue: Number(row.revenue),
    })),
  };
}

// Idempotency: if a daily_reports row already exists for this date, the
// email has already gone out today — skip silently. The row is only
// inserted after a successful send, so a prior failure is retried on the
// next admin login rather than being permanently skipped for the day.
export async function ensureDailyReportSent(reportDateColombo: string, adminEmail: string) {
  const existing = await db.query.dailyReports.findFirst({
    where: eq(dailyReports.reportDate, reportDateColombo),
  });
  if (existing) return;

  const totals = await computeDailyTotals(reportDateColombo);
  const html = await render(<DailyReportEmail reportDate={reportDateColombo} totals={totals} />);

  const { error } = await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to: adminEmail,
    subject: `Daily Sales Report — ${reportDateColombo}`,
    html,
  });
  if (error) {
    throw new Error(`Resend failed: ${error.message}`);
  }

  await db.insert(dailyReports).values({
    reportDate: reportDateColombo,
    totalsJson: totals,
  });

  logger.info({ reportDateColombo, adminEmail }, "Daily sales report email sent");
}
