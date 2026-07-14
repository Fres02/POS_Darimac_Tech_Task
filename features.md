# ROADMAP.md — Sri Lankan POS System

Implementation-ordered feature roadmap. Phases follow dependencies — **complete each
phase before starting the next**. A working Phase 5 beats a broken Phase 9.

## Legend

- **[MVP]** — required for the assessment; ship these first.
- **[+]** — stretch; demonstrates depth. Pull in top-down after MVP is solid.
- **[full]** — real-world POS feature, likely out of scope here. Keep in the README
  under "Future work" to show you considered it without burning time building it.

> **Target:** finish all **[MVP]** items = a complete, defensible submission covering
> every requirement in the brief. Then add **[+]** items as time allows. Highest
> "wow per hour": the dashboard (50–51) and cash/change flow (33–35).

> **Deploy early** — do the first deployment pass right after Phase 5, not at the end.
> A live demo link kills the "works on my machine" risk and de-pressurizes the ops work.

---

## Phase 0 — Foundation

- [x] 1. Monorepo scaffold: `apps/web`, `apps/api`, `packages/shared` **[MVP]**
- [x] 2. Tooling: TypeScript strict, ESLint, Prettier, env handling **[MVP]**
- [x] 3. Shared Zod schemas + types package (single source of truth) **[MVP]**
- [x] 4. CI skeleton (lint → typecheck → build) **[MVP]**
- [x] 5. `/health` endpoint + logging setup **[MVP]**

## Phase 1 — Data layer

- [x] 6. Database schema: profiles, products, sales, sale_items, daily_reports **[MVP]**
- [x] 7. Drizzle migrations checked into git **[MVP]**
- [x] 8. RLS policies (role-based row access) **[MVP]**
- [x] 9. Seed script (users + products so a fresh clone works) **[MVP]**

## Phase 2 — Authentication & authorization

- [x] 10. Email/password login via Supabase Auth **[MVP]**
- [x] 11. Session handling + logout **[MVP]**
- [x] 12. API auth middleware (JWT verify + role check) **[MVP]**
- [x] 13. Route protection + role-based redirect (Admin vs Cashier) **[MVP]**
- [x] 14. Login rate limiting **[MVP]**
- [ ] 15. Password reset flow **[+]**
- [ ] 16. Account lockout after repeated failures **[full]**

## Phase 3 — Product catalog

- [x] 17. Product list + search (read) **[MVP]**
- [x] 18. Admin product CRUD, soft-delete/deactivate **[MVP]**
- [ ] 19. Categories / product grouping **[+]**
- [ ] 20. Barcode/SKU field + scan-to-add **[+]**
- [ ] 21. Product images **[full]**
- [ ] 22. Unit types / weighted items (per kg) **[full]**

## Phase 4 — Sales creation (the core)

- [x] 23. Product grid on POS screen **[MVP]**
- [x] 24. Cart: add / update qty / remove (Zustand) **[MVP]**
- [x] 25. Live totals: subtotal, tax, discount, grand total in LKR **[MVP]**
- [x] 26. Per-sale discount (amount or %) **[MVP]**
- [x] 27. Checkout — persist sale + items in one transaction **[MVP]**
- [x] 28. Record cashier + Asia/Colombo timestamp **[MVP]**
- [x] 29. Clear cart + invalidate queries on success **[MVP]**
- [ ] 30. Per-line-item discount **[+]**
- [ ] 31. Hold / resume a sale (park an order) **[full]**
- [ ] 32. Void / cancel a sale before checkout **[+]**

## Phase 5 — Payment & receipt

- [x] 33. Payment method selection (cash) **[MVP]**
- [x] 34. Cash tendered + change calculation **[MVP]**
- [x] 35. On-screen / printable receipt **[MVP]**
- [ ] 36. Card / digital payment methods **[+]**
- [ ] 37. Split payment across methods **[full]**
- [ ] 38. Receipt reprint from sales history **[+]**

## Phase 6 — Daily sales report email

- [ ] 39. Daily aggregation query (Asia/Colombo boundaries) **[MVP]**
- [ ] 40. React Email template for the report **[MVP]**
- [ ] 41. Send via Resend on Admin login **[MVP]**
- [ ] 42. Idempotency guard (no duplicate emails same day) **[MVP]**
- [ ] 43. Non-blocking failure handling + logging **[MVP]**
- [ ] 44. Scheduled end-of-day cron send **[+]**
- [ ] 45. Manual "resend today's report" button **[+]**

## Phase 7 — Sales history & reporting

- [ ] 46. Cashier: view own sales **[MVP]**
- [ ] 47. Admin: view all sales **[MVP]**
- [ ] 48. Sale detail view **[MVP]**
- [ ] 49. Date-range filtering **[+]**
- [ ] 50. Admin dashboard: today's revenue, txn count, avg basket **[+]**
- [ ] 51. Charts: sales over time, top products **[+]**
- [ ] 52. Per-cashier performance view **[+]**
- [ ] 53. CSV / PDF export **[+]**

## Phase 8 — Refunds & returns

- [ ] 54. Refund / return against an existing sale **[+]**
- [ ] 55. Return reason tracking **[full]**
- [ ] 56. Refund reflected in reports (negative entries) **[full]**

## Phase 9 — User & store management

- [ ] 57. Admin invites cashier + assigns role **[+]**
- [ ] 58. Deactivate user (preserve sale history) **[+]**
- [ ] 59. Store/tax settings (configurable VAT rate) **[+]**
- [ ] 60. Multi-terminal / shift management (open/close till, cash reconciliation) **[full]**

## Phase 10 — Inventory (light)

- [ ] 61. Optional stock qty per product, decrement on sale **[+]**
- [ ] 62. Low-stock indicator on dashboard **[+]**
- [ ] 63. Stock adjustment / receiving **[full]**
- [ ] 64. Supplier / purchase orders **[full]**

## Phase 11 — Deployment & ops

_(Do the first pass right after Phase 5, not last.)_

- [ ] 65. Deploy frontend → Vercel, backend → Render **[MVP]**
- [ ] 66. Full CI/CD pipeline with deploy + PR previews **[MVP]**
- [ ] 67. Keep-warm cron (Render sleep + Supabase 7-day pause) **[MVP]**
- [ ] 68. Error tracking / monitoring **[+]**

## Phase 12 — Polish & quality

- [ ] 69. Unit tests: totals, tax, report aggregation **[MVP]**
- [ ] 70. Integration test: sales-creation flow **[MVP]**
- [ ] 71. README: architecture diagram + tech-decision table **[MVP]**
- [ ] 72. Keyboard-first POS flow **[+]**
- [ ] 73. Persisted cart (survives refresh) **[+]**
- [ ] 74. Dark mode + responsive tablet layout **[+]**
- [ ] 75. Loading / error / empty states throughout **[MVP]**

---

## Notes worth keeping in mind

- **Price/name snapshots** on `sale_items` — never rely only on a live product FK, or
  changing a price later corrupts historical receipts.
- **Timezone** — all "daily" boundaries use `Asia/Colombo`; a sale at 23:00 Colombo
  must land in the correct day.
- **Idempotency** — logging in twice must not email the Admin's report twice.
- **Login-triggered email** is per the brief; the scheduled cron (44) is the more
  production-correct approach — note this in the README.
