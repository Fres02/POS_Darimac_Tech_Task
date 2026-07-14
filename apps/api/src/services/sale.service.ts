import { inArray } from "drizzle-orm";
import { type CreateSaleInput, type Sale, computeSaleTotals } from "@pos/shared";
import { HttpError } from "../lib/http-error";
import { db } from "../db/client";
import { products, sales, saleItems } from "../db/schema";

export async function createSale(cashierId: string, input: CreateSaleInput): Promise<Sale> {
  return db.transaction(async (tx) => {
    const productIds = input.items.map((item) => item.productId);
    const productRows = await tx.select().from(products).where(inArray(products.id, productIds));
    const productById = new Map(productRows.map((row) => [row.id, row]));

    const lines = input.items.map((item) => {
      const product = productById.get(item.productId);
      if (!product) {
        throw new HttpError(400, `Product ${item.productId} not found`);
      }
      if (!product.active) {
        throw new HttpError(400, `Product "${product.name}" is no longer available`);
      }
      return {
        productId: product.id,
        nameSnapshot: product.name,
        unitPriceSnapshot: Number(product.priceLkr),
        taxRate: Number(product.taxRate),
        qty: item.qty,
      };
    });

    const totals = computeSaleTotals(lines, input.discount);

    if (input.cashTendered < totals.total) {
      throw new HttpError(400, "Cash tendered is less than the total due");
    }
    const change = Number((input.cashTendered - totals.total).toFixed(2));

    const [saleRow] = await tx
      .insert(sales)
      .values({
        cashierId,
        subtotal: totals.subtotal.toFixed(2),
        tax: totals.tax.toFixed(2),
        discount: totals.discount.toFixed(2),
        total: totals.total.toFixed(2),
        paymentMethod: input.paymentMethod,
        cashTendered: input.cashTendered.toFixed(2),
      })
      .returning();

    const itemRows = await tx
      .insert(saleItems)
      .values(
        lines.map((line) => ({
          saleId: saleRow.id,
          productId: line.productId,
          nameSnapshot: line.nameSnapshot,
          unitPriceSnapshot: line.unitPriceSnapshot.toFixed(2),
          qty: line.qty,
          lineTotal: (line.unitPriceSnapshot * line.qty).toFixed(2),
        })),
      )
      .returning();

    return {
      id: saleRow.id,
      cashierId: saleRow.cashierId,
      subtotal: Number(saleRow.subtotal),
      tax: Number(saleRow.tax),
      discount: Number(saleRow.discount),
      total: Number(saleRow.total),
      paymentMethod: saleRow.paymentMethod,
      cashTendered: Number(saleRow.cashTendered),
      change,
      createdAt: saleRow.createdAt.toISOString(),
      items: itemRows.map((row) => ({
        id: row.id,
        saleId: row.saleId,
        productId: row.productId,
        nameSnapshot: row.nameSnapshot,
        unitPriceSnapshot: Number(row.unitPriceSnapshot),
        qty: row.qty,
        lineTotal: Number(row.lineTotal),
      })),
    };
  });
}
