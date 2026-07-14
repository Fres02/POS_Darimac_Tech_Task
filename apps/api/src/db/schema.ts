import {
  pgSchema,
  pgTable,
  pgPolicy,
  pgEnum,
  uuid,
  text,
  boolean,
  numeric,
  integer,
  timestamp,
  date,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

const authSchema = pgSchema("auth");

// Supabase-managed table — referenced here only so `profiles.id` can carry a real FK.
export const authUsers = authSchema.table("users", {
  id: uuid("id").primaryKey(),
});

export const roleEnum = pgEnum("role", ["admin", "cashier"]);
export const paymentMethodEnum = pgEnum("payment_method", ["cash"]);

export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id")
      .primaryKey()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    fullName: text("full_name").notNull(),
    role: roleEnum("role").notNull().default("cashier"),
    active: boolean("active").notNull().default(true),
  },
  () => [
    pgPolicy("profiles_select_own_or_admin", {
      for: "select",
      to: "authenticated",
      using: sql`id = auth.uid() OR is_admin()`,
    }),
  ],
).enableRLS();

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    sku: text("sku").unique(),
    priceLkr: numeric("price_lkr", { precision: 10, scale: 2 }).notNull(),
    taxRate: numeric("tax_rate", { precision: 4, scale: 3 }).notNull().default("0"),
    active: boolean("active").notNull().default(true),
    stockQty: integer("stock_qty"),
  },
  () => [
    pgPolicy("products_select_authenticated", {
      for: "select",
      to: "authenticated",
      using: sql`true`,
    }),
    pgPolicy("products_write_admin_only", {
      for: "all",
      to: "authenticated",
      using: sql`is_admin()`,
      withCheck: sql`is_admin()`,
    }),
  ],
).enableRLS();

export const sales = pgTable(
  "sales",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cashierId: uuid("cashier_id")
      .notNull()
      .references(() => profiles.id),
    subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
    tax: numeric("tax", { precision: 10, scale: 2 }).notNull(),
    discount: numeric("discount", { precision: 10, scale: 2 }).notNull().default("0"),
    total: numeric("total", { precision: 10, scale: 2 }).notNull(),
    paymentMethod: paymentMethodEnum("payment_method").notNull().default("cash"),
    // nullable: only cash payments carry a tendered amount; future payment
    // methods (card, etc.) won't populate this column.
    cashTendered: numeric("cash_tendered", { precision: 10, scale: 2 }),
    // timestamptz: always stored as UTC, converted to Asia/Colombo at query time
    // for "daily" boundaries — never use a timezone-less column here.
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("sales_cashier_id_idx").on(table.cashierId),
    index("sales_created_at_idx").on(table.createdAt),
    pgPolicy("sales_select_own_or_admin", {
      for: "select",
      to: "authenticated",
      using: sql`cashier_id = auth.uid() OR is_admin()`,
    }),
    pgPolicy("sales_insert_own", {
      for: "insert",
      to: "authenticated",
      withCheck: sql`cashier_id = auth.uid()`,
    }),
  ],
).enableRLS();

export const saleItems = pgTable(
  "sale_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    saleId: uuid("sale_id")
      .notNull()
      .references(() => sales.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),
    nameSnapshot: text("name_snapshot").notNull(),
    unitPriceSnapshot: numeric("unit_price_snapshot", { precision: 10, scale: 2 }).notNull(),
    qty: integer("qty").notNull(),
    lineTotal: numeric("line_total", { precision: 10, scale: 2 }).notNull(),
  },
  (table) => [
    index("sale_items_sale_id_idx").on(table.saleId),
    index("sale_items_product_id_idx").on(table.productId),
    pgPolicy("sale_items_select_via_sale", {
      for: "select",
      to: "authenticated",
      using: sql`EXISTS (
        SELECT 1 FROM sales
        WHERE sales.id = sale_items.sale_id
          AND (sales.cashier_id = auth.uid() OR is_admin())
      )`,
    }),
    pgPolicy("sale_items_insert_via_own_sale", {
      for: "insert",
      to: "authenticated",
      withCheck: sql`EXISTS (
        SELECT 1 FROM sales
        WHERE sales.id = sale_items.sale_id
          AND sales.cashier_id = auth.uid()
      )`,
    }),
  ],
).enableRLS();

export const dailyReports = pgTable(
  "daily_reports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reportDate: date("report_date").notNull().unique(),
    sentAt: timestamp("sent_at", { withTimezone: true }).notNull().defaultNow(),
    totalsJson: jsonb("totals_json").notNull(),
  },
  () => [
    pgPolicy("daily_reports_select_admin_only", {
      for: "select",
      to: "authenticated",
      using: sql`is_admin()`,
    }),
  ],
).enableRLS();
