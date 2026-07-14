import "dotenv/config";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL, { max: 1 });

try {
  await sql`insert into products (name, sku, price_lkr, tax_rate, active) values ('dup test', 'RICE-1KG', 10, 0, true)`;
} catch (err) {
  console.log("code:", err.code);
  console.log("name:", err.constructor?.name);
  console.log("keys:", Object.keys(err));
  console.log("instanceof Error:", err instanceof Error);
}

await sql.end();
