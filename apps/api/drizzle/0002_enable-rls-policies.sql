ALTER TABLE "daily_reports" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "sale_items" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "sales" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "daily_reports_select_admin_only" ON "daily_reports" AS PERMISSIVE FOR SELECT TO "authenticated" USING (is_admin());--> statement-breakpoint
CREATE POLICY "products_select_authenticated" ON "products" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "products_write_admin_only" ON "products" AS PERMISSIVE FOR ALL TO "authenticated" USING (is_admin()) WITH CHECK (is_admin());--> statement-breakpoint
CREATE POLICY "profiles_select_own_or_admin" ON "profiles" AS PERMISSIVE FOR SELECT TO "authenticated" USING (id = auth.uid() OR is_admin());--> statement-breakpoint
CREATE POLICY "sale_items_select_via_sale" ON "sale_items" AS PERMISSIVE FOR SELECT TO "authenticated" USING (EXISTS (
        SELECT 1 FROM sales
        WHERE sales.id = sale_items.sale_id
          AND (sales.cashier_id = auth.uid() OR is_admin())
      ));--> statement-breakpoint
CREATE POLICY "sale_items_insert_via_own_sale" ON "sale_items" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (EXISTS (
        SELECT 1 FROM sales
        WHERE sales.id = sale_items.sale_id
          AND sales.cashier_id = auth.uid()
      ));--> statement-breakpoint
CREATE POLICY "sales_select_own_or_admin" ON "sales" AS PERMISSIVE FOR SELECT TO "authenticated" USING (cashier_id = auth.uid() OR is_admin());--> statement-breakpoint
CREATE POLICY "sales_insert_own" ON "sales" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (cashier_id = auth.uid());