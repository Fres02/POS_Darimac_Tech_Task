ALTER TABLE "products" ADD COLUMN "category" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "failed_login_attempts" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "locked" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "sale_items" ADD COLUMN "line_discount" numeric(10, 2) DEFAULT '0' NOT NULL;