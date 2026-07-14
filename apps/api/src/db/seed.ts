import "dotenv/config";
import postgres from "postgres";
import { sql } from "drizzle-orm";
import { env } from "../env";
import { supabaseAdmin } from "../lib/supabase";
import { db } from "./client";
import { profiles, products } from "./schema";

// auth.users isn't exposed through the Data API — a direct connection is the
// only way to check "does this seed user already exist" before calling admin.createUser.
const rawSql = postgres(env.DATABASE_URL, { max: 1 });

const SEED_USERS = [
  {
    email: "admin@pos.local",
    password: "Admin123!",
    fullName: "Admin User",
    role: "admin" as const,
  },
  {
    email: "cashier@pos.local",
    password: "Cashier123!",
    fullName: "Cashier One",
    role: "cashier" as const,
  },
];

const SEED_PRODUCTS = [
  { sku: "RICE-1KG", name: "Rice 1kg", priceLkr: "350.00", taxRate: "0.000" },
  { sku: "BREAD-STD", name: "Bread Loaf", priceLkr: "220.00", taxRate: "0.000" },
  { sku: "MILK-400", name: "Milk Powder 400g", priceLkr: "950.00", taxRate: "0.000" },
  { sku: "TEA-200", name: "Tea Leaves 200g", priceLkr: "480.00", taxRate: "0.180" },
  { sku: "COKE-330", name: "Coca-Cola 330ml", priceLkr: "150.00", taxRate: "0.180" },
  { sku: "BISC-PKT", name: "Biscuits Packet", priceLkr: "250.00", taxRate: "0.180" },
  { sku: "SOAP-BAR", name: "Soap Bar", priceLkr: "180.00", taxRate: "0.180" },
  { sku: "BOOK-EX", name: "Exercise Book", priceLkr: "120.00", taxRate: "0.180" },
];

async function findAuthUserIdByEmail(email: string): Promise<string | undefined> {
  const rows = await rawSql`select id from auth.users where email = ${email}`;
  return rows[0]?.id;
}

async function seedUser(user: (typeof SEED_USERS)[number]) {
  let userId = await findAuthUserIdByEmail(user.email);

  if (!userId) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
    });
    if (error || !data.user) {
      throw new Error(`Failed to create auth user ${user.email}: ${error?.message}`);
    }
    userId = data.user.id;
    console.log(`Created auth user: ${user.email}`);
  } else {
    console.log(`Auth user already exists: ${user.email}`);
  }

  await db
    .insert(profiles)
    .values({ id: userId, fullName: user.fullName, role: user.role, active: true })
    .onConflictDoUpdate({
      target: profiles.id,
      set: { fullName: user.fullName, role: user.role, active: true },
    });
}

async function seedProducts() {
  await db
    .insert(products)
    .values(SEED_PRODUCTS)
    .onConflictDoUpdate({
      target: products.sku,
      set: {
        name: sql`excluded.name`,
        priceLkr: sql`excluded.price_lkr`,
        taxRate: sql`excluded.tax_rate`,
      },
    });
  console.log(`Seeded ${SEED_PRODUCTS.length} products`);
}

async function main() {
  for (const user of SEED_USERS) {
    await seedUser(user);
  }
  await seedProducts();

  console.log("\nSeed complete. Demo logins:");
  for (const user of SEED_USERS) {
    console.log(`  ${user.role.padEnd(8)} ${user.email} / ${user.password}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await rawSql.end();
  });
