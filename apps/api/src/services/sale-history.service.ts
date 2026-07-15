import { desc, eq } from "drizzle-orm";
import type { Role, Sale, SaleSummary } from "@pos/shared";
import { HttpError } from "../lib/http-error";
import { db } from "../db/client";
import { sales, saleItems, profiles } from "../db/schema";

type CurrentUser = { id: string; role: Role };

export async function listSales(user: CurrentUser): Promise<SaleSummary[]> {
  const rows = await db
    .select({
      id: sales.id,
      cashierId: sales.cashierId,
      cashierName: profiles.fullName,
      subtotal: sales.subtotal,
      tax: sales.tax,
      discount: sales.discount,
      total: sales.total,
      paymentMethod: sales.paymentMethod,
      cashTendered: sales.cashTendered,
      createdAt: sales.createdAt,
    })
    .from(sales)
    .innerJoin(profiles, eq(sales.cashierId, profiles.id))
    .where(user.role === "admin" ? undefined : eq(sales.cashierId, user.id))
    .orderBy(desc(sales.createdAt));

  return rows.map((row) => ({
    id: row.id,
    cashierId: row.cashierId,
    cashierName: row.cashierName,
    subtotal: Number(row.subtotal),
    tax: Number(row.tax),
    discount: Number(row.discount),
    total: Number(row.total),
    paymentMethod: row.paymentMethod,
    cashTendered: Number(row.cashTendered),
    change: Number(row.cashTendered) - Number(row.total),
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function getSaleDetail(saleId: string, user: CurrentUser): Promise<Sale> {
  const [saleRow] = await db
    .select({
      id: sales.id,
      cashierId: sales.cashierId,
      cashierName: profiles.fullName,
      subtotal: sales.subtotal,
      tax: sales.tax,
      discount: sales.discount,
      total: sales.total,
      paymentMethod: sales.paymentMethod,
      cashTendered: sales.cashTendered,
      createdAt: sales.createdAt,
    })
    .from(sales)
    .innerJoin(profiles, eq(sales.cashierId, profiles.id))
    .where(eq(sales.id, saleId));

  if (!saleRow) {
    throw new HttpError(404, "Sale not found");
  }
  if (user.role !== "admin" && saleRow.cashierId !== user.id) {
    throw new HttpError(403, "Forbidden");
  }

  const itemRows = await db.select().from(saleItems).where(eq(saleItems.saleId, saleId));

  return {
    id: saleRow.id,
    cashierId: saleRow.cashierId,
    cashierName: saleRow.cashierName,
    subtotal: Number(saleRow.subtotal),
    tax: Number(saleRow.tax),
    discount: Number(saleRow.discount),
    total: Number(saleRow.total),
    paymentMethod: saleRow.paymentMethod,
    cashTendered: Number(saleRow.cashTendered),
    change: Number(saleRow.cashTendered) - Number(saleRow.total),
    createdAt: saleRow.createdAt.toISOString(),
    items: itemRows.map((row) => ({
      id: row.id,
      saleId: row.saleId,
      productId: row.productId,
      nameSnapshot: row.nameSnapshot,
      unitPriceSnapshot: Number(row.unitPriceSnapshot),
      unitTypeSnapshot: row.unitTypeSnapshot,
      qty: Number(row.qty),
      lineTotal: Number(row.lineTotal),
    })),
  };
}
