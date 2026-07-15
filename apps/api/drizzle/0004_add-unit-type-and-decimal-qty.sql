CREATE TYPE "public"."unit_type" AS ENUM('each', 'kg', 'l');--> statement-breakpoint
ALTER TABLE "sale_items" ALTER COLUMN "qty" SET DATA TYPE numeric(10, 3);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "unit_type" "unit_type" DEFAULT 'each' NOT NULL;