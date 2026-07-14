# FEATURES.md — Sri Lankan POS System

A point-of-sale application with Admin and Cashier roles, secure authentication, sales
creation, and an automated daily sales report emailed to the Admin.

This document is the single source of truth for scope. Features are grouped into
**Core (MVP)** — the requirements from the brief — and **Stretch** — additions that
demonstrate depth without expanding scope beyond what's maintainable.

---

## 1. Tech Stack (reference)

| Layer | Choice |
|---|---|
| Frontend | React 19 + Vite + TypeScript, Tailwind CSS, shadcn/ui |
| Client state | Zustand (cart / UI) |
| Server state | TanStack Query (caching, invalidation, optimistic updates) |
| Backend | Node + Express + TypeScript (layered architecture) |
| Validation | Zod (shared schemas across FE/BE via a `shared` package) |
| Database | Supabase (PostgreSQL) |
| ORM / migrations | Drizzle ORM + drizzle-kit |
| Auth | Supabase Auth (JWT), roles enforced via RLS + API middleware |
| Email | Resend (daily sales report) |
| Frontend hosting | Vercel |
| Backend hosting | Render |
| CI/CD | GitHub Actions (lint → typecheck → test → deploy) |

Locale: currency `LKR`, formatting via `Intl.NumberFormat('si-LK')`; timezone
`Asia/Colombo` for all date boundaries (critical for "daily" report cutoffs).

---

## 2. Roles & Permissions

| Capability | Admin | Cashier |
|---|:---:|:---:|
| Log in / log out | ✅ | ✅ |
| Create a sale | ✅ | ✅ |
| View own sales | ✅ | ✅ |
| View all sales (any cashier) | ✅ | ❌ |
| Manage products (create/edit/deactivate) | ✅ | ❌ |
| Manage users (invite/assign role) | ✅ | ❌ |
| View reports / dashboard | ✅ | ❌ |
| Receive daily sales email | ✅ | ❌ |

Enforcement is layered (defense in depth):
1. **UI** — role-gated routes and components (usability, not security).
2. **API middleware** — verifies Supabase JWT and checks role on every protected route.
3. **Database RLS** — Postgres Row Level Security policies as the final backstop, so a
   cashier cannot read another cashier's sales even if the API were bypassed.

---

## 3. Core Features (MVP — required by the brief)

### 3.1 Authentication
- [ ] Email + password login via Supabase Auth.
- [ ] Secure session handling (JWT, httpOnly refresh where applicable).
- [ ] Logout that clears session and client state.
- [ ] Route protection: unauthenticated users redirected to login.
- [ ] Role-based redirect after login (Admin → dashboard, Cashier → POS screen).
- [ ] Basic rate limiting on the login endpoint.

### 3.2 Product Catalog (minimum needed to make sales)
- [ ] Product model: name, SKU/barcode (optional), price (LKR), tax rate, active flag.
- [ ] Seed data so a fresh clone has products to sell immediately.
- [ ] Admin CRUD for products; soft-delete (deactivate) rather than hard delete to
      preserve historical sale integrity.

### 3.3 Sales Creation (POS core)
- [ ] Product grid / search on the POS screen.
- [ ] Cart: add line item, adjust quantity, remove line item (Zustand).
- [ ] Live totals: subtotal, tax, discount, grand total — all in LKR.
- [ ] Optional per-sale discount (amount or %).
- [ ] Checkout: persist sale + line items atomically (single transaction).
- [ ] Each sale records the cashier who created it and a `Asia/Colombo` timestamp.
- [ ] On success: clear cart, show confirmation, invalidate sales queries (TanStack).
- [ ] Simple printable / on-screen receipt.

### 3.4 Daily Sales Report Email
- [ ] Triggered on **Admin login** (per the brief).
- [ ] Aggregates the current day's sales (Asia/Colombo boundaries): total revenue,
      number of transactions, per-cashier breakdown, top items.
- [ ] Rendered as an HTML email (React Email template) and sent via Resend.
- [ ] **Idempotency**: a `daily_report_sent` record prevents duplicate emails if the
      Admin logs in multiple times the same day.
- [ ] Failure is non-blocking: a failed email never blocks login; errors are logged.

---

## 4. Stretch Features (demonstrate depth — build only after MVP is solid)

### 4.1 Admin Dashboard
- [ ] Today's revenue, transaction count, average basket value.
- [ ] Sales-over-time chart and top-selling products.
- [ ] Per-cashier performance view.

### 4.2 Reporting & Export
- [ ] Date-range sales report with filters.
- [ ] CSV / PDF export of a report.
- [ ] Manual "resend today's report" button for the Admin.

### 4.3 Scheduled Report (in addition to login trigger)
- [ ] End-of-day cron (GitHub Actions or Render cron) that sends the report at a fixed
      time, so the Admin gets it even without logging in.

### 4.4 User Management
- [ ] Admin invites a cashier and assigns a role.
- [ ] Deactivate a user without deleting sales history.

### 4.5 Inventory (light)
- [ ] Optional stock quantity per product, decremented on sale.
- [ ] Low-stock indicator on the dashboard.

### 4.6 UX polish
- [ ] Keyboard-first POS flow (barcode/search focus, Enter to add).
- [ ] Offline-tolerant cart (survives refresh) via persisted Zustand store.
- [ ] Dark mode.

---

## 5. Non-Functional Requirements (the "software engineer skills" the brief grades)

- **Type safety** — strict TypeScript end to end; Zod schemas in a shared package are
  the single source of truth for request/response types across frontend and backend.
- **State handling** — explicit separation: TanStack Query owns server state; Zustand
  owns local UI/cart state. Documented in the README.
- **Maintainability** — pnpm monorepo (`apps/web`, `apps/api`, `packages/shared`),
  ESLint + Prettier, conventional commits, layered backend
  (`routes → middleware → controllers → services → data`).
- **Database management** — normalized schema, Drizzle migrations checked into git,
  RLS policies as code, seed script.
- **Security** — RLS + API role checks, input validation on every endpoint, secrets in
  env vars (never committed), CORS locked to the frontend origin, login rate limiting.
- **Deployment** — Vercel (frontend) + Render (backend), independent deploys;
  keep-warm cron to mitigate Render free-tier sleep and Supabase 7-day pause.
- **CI/CD** — GitHub Actions: install → lint → typecheck → test → build → deploy;
  preview deploys per PR on Vercel.
- **Observability** — structured request logging, a `/health` endpoint (also used by
  the keep-warm ping), and basic error tracking.
- **Documentation** — README with architecture diagram, tech-decision table (including
  why alternatives were rejected), and local setup instructions.
- **Testing** — unit tests on services (totals, tax, report aggregation); at least one
  integration test on the sales-creation flow.

---

## 6. Data Model (high level)

```
profiles      (id → auth.users, full_name, role[admin|cashier], active)
products      (id, name, sku, price_lkr, tax_rate, active, stock_qty?)
sales         (id, cashier_id → profiles, subtotal, tax, discount, total,
               created_at [Asia/Colombo])
sale_items    (id, sale_id → sales, product_id → products, name_snapshot,
               unit_price_snapshot, qty, line_total)
daily_reports (id, report_date, sent_at, totals_json)   -- idempotency guard
```

Note: `sale_items` stores price/name **snapshots** so historical receipts stay correct
even after a product's price changes or it is deactivated.

---

## 7. Suggested Build Order

1. Repo scaffold (monorepo, shared Zod package, lint/format, CI skeleton).
2. Database schema + RLS + seed (Drizzle migrations).
3. Auth: login, session, role-based routing.
4. Products: Admin CRUD + seed.
5. **Sales creation** (the heart of the app) — cart, checkout transaction, receipt.
6. **Daily report email** on Admin login (with idempotency).
7. Deployment (Vercel + Render + keep-warm cron) — deploy early, not at the end.
8. Dashboard + stretch features as time allows.
9. Tests, README, architecture diagram, polish.

> Deploy after step 5, not at the very end — a live, working demo link is worth more
> than one extra feature, and it de-risks the "it works on my machine" problem.