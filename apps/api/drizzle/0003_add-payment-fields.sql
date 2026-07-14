CREATE TYPE "public"."payment_method" AS ENUM('cash');--> statement-breakpoint
ALTER TABLE "sales" ADD COLUMN "payment_method" "payment_method" DEFAULT 'cash' NOT NULL;--> statement-breakpoint
ALTER TABLE "sales" ADD COLUMN "cash_tendered" numeric(10, 2);