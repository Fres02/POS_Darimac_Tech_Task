import { and, eq, ilike, or } from "drizzle-orm";
import type { CreateProductInput, UpdateProductInput, Product } from "@pos/shared";
import { HttpError } from "../lib/http-error";
import { db } from "../db/client";
import { products } from "../db/schema";

type ProductRow = typeof products.$inferSelect;

function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    sku: row.sku ?? undefined,
    priceLkr: Number(row.priceLkr),
    taxRate: Number(row.taxRate),
    active: row.active,
    stockQty: row.stockQty ?? undefined,
  };
}

export async function listProducts(search?: string, activeOnly?: boolean): Promise<Product[]> {
  const searchFilter = search
    ? or(ilike(products.name, `%${search}%`), ilike(products.sku, `%${search}%`))
    : undefined;
  const activeFilter = activeOnly ? eq(products.active, true) : undefined;
  const where = [searchFilter, activeFilter].filter(Boolean);

  const rows = await db.query.products.findMany({
    where: where.length ? and(...where) : undefined,
    orderBy: (p, { asc }) => asc(p.name),
  });
  return rows.map(toProduct);
}

export async function createProduct(input: CreateProductInput): Promise<Product> {
  const [row] = await db
    .insert(products)
    .values({
      name: input.name,
      sku: input.sku,
      priceLkr: input.priceLkr.toFixed(2),
      taxRate: input.taxRate.toFixed(3),
      active: input.active,
      stockQty: input.stockQty,
    })
    .returning();
  return toProduct(row);
}

export async function updateProduct(id: string, input: UpdateProductInput): Promise<Product> {
  const values: Partial<typeof products.$inferInsert> = {};
  if (input.name !== undefined) values.name = input.name;
  if (input.sku !== undefined) values.sku = input.sku;
  if (input.priceLkr !== undefined) values.priceLkr = input.priceLkr.toFixed(2);
  if (input.taxRate !== undefined) values.taxRate = input.taxRate.toFixed(3);
  if (input.active !== undefined) values.active = input.active;
  if (input.stockQty !== undefined) values.stockQty = input.stockQty;

  const [row] = await db.update(products).set(values).where(eq(products.id, id)).returning();
  if (!row) throw new HttpError(404, "Product not found");
  return toProduct(row);
}

export async function deactivateProduct(id: string): Promise<Product> {
  const [row] = await db
    .update(products)
    .set({ active: false })
    .where(eq(products.id, id))
    .returning();
  if (!row) throw new HttpError(404, "Product not found");
  return toProduct(row);
}
