# PLAN — ITMS Development Master Plan
## Kế hoạch phát triển hệ thống ITMS

**Ngày lập:** 13/03/2026  
**Tham chiếu:** BRD v1.4 | PRD v1.4 | SRS v1.4 | Technical_Architecture.md | UI_Guideline.md | AGENT_FLOW.md  
**Ước lượng:** 24 tuần (6 tháng) | 4 Phases

---

## Tổng quan

> Phát triển hệ thống ITMS từ đầu bao gồm 13 module nghiệp vụ, phục vụ 50 concurrent users. Mỗi task đều yêu cầu **unit test + responsive test** theo AGENT_FLOW.md.

### Quy ước

```
🔴 P0 — Blocking (nền tảng, các module khác phụ thuộc)
🟠 P1 — Critical (core business)
🟡 P2 — Important (mở rộng)
🟢 P3 — Nice-to-have (polish)

⏱️ = Estimated effort
✅ = Done  |  🔄 = In Progress  |  ⬜ = Not Started
```

---

## PHASE 1 — FOUNDATION (Tuần 1–8) 🔴 P0

> Nền tảng kỹ thuật + module cốt lõi. Tất cả phases sau phụ thuộc vào phase này.

### Sprint 1: Project Setup & Design System (Tuần 1–2)

| # | Task | Priority | Est | Status | Verify |
|---|------|----------|-----|--------|--------|
| 1.1 | **Init monorepo**: Next.js 14 (frontend) + NestJS 10 (backend) + Docker Compose | 🔴 P0 | 4h | ⬜ | `docker-compose up` → 5 containers running |
| 1.2 | **Frontend base config**: Tailwind 4 + shadcn/ui + Bootstrap Icons + Inter font + design tokens từ UI_Guideline.md | 🔴 P0 | 3h | ⬜ | `npm run dev` → page loads với đúng font/colors |
| 1.3 | **Backend base config**: Prisma + PostgreSQL schema + Swagger + Winston logger + .env | 🔴 P0 | 3h | ⬜ | `localhost:4000/api/docs` → Swagger UI hiện |
| 1.4 | **App Shell layout**: Sidebar + Topbar + Content area + Breadcrumb + Responsive collapse | 🔴 P0 | 4h | ⬜ | Test 4 viewports → sidebar collapse trên mobile |
| 1.5 | **Shared UI components**: Button variants, Badge, Avatar, KPI Card, DataTable skeleton, Form Input, Toast | 🔴 P0 | 6h | ⬜ | Unit test + responsive test cho mỗi component |
| 1.6 | **CI/CD pipeline**: GitHub Actions (lint + typecheck + test + build) | 🟡 P2 | 2h | ⬜ | Push → pipeline runs green |
| 1.7 | **Test infrastructure**: Jest/Vitest + Testing Library + Playwright setup + viewport configs | 🔴 P0 | 2h | ⬜ | `npm test` runs + responsive test template works |

**Sprint 1 Deliverable:** Project boots, layout renders, shared components ready, test infra set up.

---

### Sprint 2: Auth & User Management (Tuần 3–4)

| # | Task | Priority | Est | Status | Verify |
|---|------|----------|-----|--------|--------|
| 2.1 | **DB Schema**: `users` table + Prisma migration + seed (admin user) | 🔴 P0 | 2h | ⬜ | `prisma migrate dev` success |
| 2.2 | **Auth API**: POST `/auth/login`, POST `/auth/refresh`, POST `/auth/logout` + JWT + bcrypt | 🔴 P0 | 4h | ⬜ | Supertest: login → access token returned |
| 2.3 | **2FA API**: POST `/auth/2fa/setup`, POST `/auth/2fa/verify` + TOTP | 🟠 P1 | 3h | ⬜ | Generate QR + verify code → success |
| 2.4 | **RBAC Guard**: `@Roles()` decorator + RolesGuard + 5 roles | 🔴 P0 | 3h | ⬜ | Viewer access admin endpoint → 403 |
| 2.5 | **Login Page UI**: theo UI_Guideline (centered card, form, gold CTA) | 🔴 P0 | 3h | ⬜ | Responsive 4 viewports + dark mode |
| 2.6 | **User Management UI**: List + Create/Edit drawer + RBAC | 🟠 P1 | 4h | ⬜ | CRUD user qua UI + test |
| 2.7 | **Auth tests**: Unit (JWT, bcrypt, guard) + API (login flow) + Responsive (login page) | 🔴 P0 | 3h | ⬜ | Coverage ≥ 80% |

**Sprint 2 Deliverable:** User có thể login, 2FA, phân quyền hoạt động.

---

### Sprint 3: Budget Planning (Tuần 5–6)

| # | Task | Priority | Est | Status | Verify |
|---|------|----------|-----|--------|--------|
| 3.1 | **DB Schema**: `budget_plans`, `budget_categories`, `budget_items` + migration | 🔴 P0 | 2h | ⬜ | Schema match SRS § 3.2 |
| 3.2 | **Budget API**: CRUD endpoints + pagination + filter + sort | 🔴 P0 | 4h | ⬜ | Supertest all endpoints |
| 3.3 | **Approval Workflow API**: draft → pending → approved/rejected + audit log | 🔴 P0 | 3h | ⬜ | State transitions + rejection reason |
| 3.4 | **Budget List Page**: DataTable + filters + pagination (theo UI reference) | 🔴 P0 | 4h | ⬜ | Responsive 4 viewports |
| 3.5 | **Budget Create/Edit**: Form drawer + Zod validation + category items | 🔴 P0 | 4h | ⬜ | Create plan → appears in list |
| 3.6 | **Budget Detail Page**: Tabs + items table + approval actions | 🟠 P1 | 3h | ⬜ | Approve/reject + status badge update |
| 3.7 | **Import/Export**: Excel template download + import + export current view | 🟠 P1 | 4h | ⬜ | Import 100 rows < 30s |
| 3.8 | **Budget tests**: Unit + API + Component + Responsive | 🔴 P0 | 3h | ⬜ | All pass |

**Sprint 3 Deliverable:** Budget Planning module hoàn chỉnh.

---

### Sprint 4: Cost Management + Dashboard (Tuần 7–8)

| # | Task | Priority | Est | Status | Verify |
|---|------|----------|-----|--------|--------|
| 4.1 | **DB Schema**: `actual_costs` table + indexes | 🔴 P0 | 2h | ⬜ | Migration success |
| 4.2 | **Cost API**: CRUD + link to budget item + filter by date range/project | 🔴 P0 | 3h | ⬜ | Supertest pass |
| 4.3 | **Cost List & Create Pages**: Form + Table + Import/Export | 🔴 P0 | 4h | ⬜ | Responsive test |
| 4.4 | **Dashboard API**: Aggregate KPIs (budget spent, assets, contracts, alerts) | 🔴 P0 | 3h | ⬜ | Response < 500ms |
| 4.5 | **Dashboard UI**: KPI Cards + Budget vs Actual chart + Asset Donut + Activity + Alerts | 🔴 P0 | 6h | ⬜ | Match UI reference screenshot |
| 4.6 | **Redis Caching**: Dashboard KPIs cached 5 min, invalidate on data change | 🟠 P1 | 2h | ⬜ | Cache hit → latency < 100ms |
| 4.7 | **Phase 1 tests**: Full unit + API + responsive test suite | 🔴 P0 | 4h | ⬜ | Coverage ≥ 80%, 4 viewports |

**Sprint 4 Deliverable:** Cost tracking + Dashboard. Phase 1 COMPLETE.

---

## PHASE 2 — ASSET MANAGEMENT (Tuần 9–14) 🟠 P1

### Sprint 5: Vendor & Contract (Tuần 9–10)

| # | Task | Priority | Est | Status | Verify |
|---|------|----------|-----|--------|--------|
| 5.1 | **DB Schema**: `vendors`, `contracts`, `contract_attachments` | 🟠 P1 | 2h | ⬜ | Match SRS § 3.4 |
| 5.2 | **Vendor API + UI**: CRUD + search + contact info | 🟠 P1 | 4h | ⬜ | Responsive |
| 5.3 | **Contract API + UI**: CRUD + file upload (MinIO) + expiry tracking | 🟠 P1 | 5h | ⬜ | Upload PDF → stored in MinIO |
| 5.4 | **Alert Engine**: Cron check expiry (30/15/7 days) → notifications | 🟠 P1 | 3h | ⬜ | Domain expiring → alert created |
| 5.5 | **Notification API + UI**: Bell icon + unread count + mark read | 🟠 P1 | 3h | ⬜ | Click bell → list notifications |
| 5.6 | **Tests**: Unit + API + responsive | 🟠 P1 | 3h | ⬜ | All pass |

---

### Sprint 6: Soft Inventory (Tuần 11–12)

| # | Task | Priority | Est | Status | Verify |
|---|------|----------|-----|--------|--------|
| 6.1 | **DB Schema**: `email_accounts`, `domains`, `vps_servers`, `software_licenses`, `ssl_certificates` | 🟠 P1 | 3h | ⬜ | Match SRS § 3.5 |
| 6.2 | **Soft Inventory APIs**: CRUD × 5 modules + pagination + filter | 🟠 P1 | 6h | ⬜ | Supertest pass |
| 6.3 | **Soft Inventory UI**: List pages × 5 + Create drawer + Detail view | 🟠 P1 | 8h | ⬜ | Consistent UI across 5 modules |
| 6.4 | **Expiry Alerts**: Integration with Alert Engine (domain, SSL, license) | 🟠 P1 | 2h | ⬜ | Expiring items → dashboard alerts |
| 6.5 | **Import/Export**: Excel templates for each sub-module | 🟠 P1 | 3h | ⬜ | Import + export test |
| 6.6 | **Tests**: Unit + API + responsive | 🟠 P1 | 4h | ⬜ | All pass |

---

### Sprint 7: Hard Inventory + Infrastructure (Tuần 13–14)

| # | Task | Priority | Est | Status | Verify |
|---|------|----------|-----|--------|--------|
| 7.1 | **DB Schema**: `hardware_assets`, `infra_resources`, `ip_addresses` | 🟠 P1 | 2h | ⬜ | Match SRS § 3.6–3.7 |
| 7.2 | **Hard Inventory API + UI**: CRUD + image upload + specs display + tabs | 🟠 P1 | 5h | ⬜ | Match Asset Detail UI reference |
| 7.3 | **Infrastructure API + UI**: IP/VLAN/DC management + bulk actions | 🟠 P1 | 4h | ⬜ | Responsive test |
| 7.4 | **Configuration Module**: Category CRUD + system settings | 🟡 P2 | 3h | ⬜ | Add category → dropdown updated |
| 7.5 | **Tests**: Unit + API + responsive | 🟠 P1 | 3h | ⬜ | All pass |

**Phase 2 Deliverable:** All inventory modules. Phase 2 COMPLETE.

---

## PHASE 3 — EXTENDED MODULES (Tuần 15–20) 🟡 P2

### Sprint 8: Vehicle Cost Management (Tuần 15–16)

| # | Task | Priority | Est | Status | Verify |
|---|------|----------|-----|--------|--------|
| 8.1 | **DB Schema**: `vehicles`, `vehicle_services`, `vehicle_variable_costs`, `vehicle_cost_types` | 🟡 P2 | 2h | ⬜ | Match SRS § 3.9 |
| 8.2 | **Vehicle API + UI**: CRUD vehicles + services matrix + variable costs | 🟡 P2 | 6h | ⬜ | Service × Vehicle matrix works |
| 8.3 | **Vehicle Cost Report**: Monthly/yearly aggregation + charts | 🟡 P2 | 3h | ⬜ | Report data matches |
| 8.4 | **Anomaly Detection**: Cost threshold alerts per vehicle | 🟡 P2 | 2h | ⬜ | Over threshold → alert |
| 8.5 | **Tests**: Unit + API + responsive | 🟡 P2 | 3h | ⬜ | All pass |

---

### Sprint 9: Project Budget + Cost Forecast (Tuần 17–18)

| # | Task | Priority | Est | Status | Verify |
|---|------|----------|-----|--------|--------|
| 9.1 | **DB Schema**: `projects`, `cost_forecasts`, `cost_forecast_items`, `cost_forecast_history` | 🟡 P2 | 2h | ⬜ | Match SRS § 3.10–3.11 |
| 9.2 | **Project Budget API + UI**: CRUD projects + link budget items + summary | 🟡 P2 | 4h | ⬜ | Budget rollup by project works |
| 9.3 | **Cost Forecast API**: CRUD + approval workflow + clone from previous month | 🟡 P2 | 4h | ⬜ | Clone forecast + approve |
| 9.4 | **Cost Forecast UI**: Create wizard + detail + approval + vs actual compare | 🟡 P2 | 6h | ⬜ | 7 screens theo UI/UX Handoff |
| 9.5 | **Yearly Summary View**: Aggregate 12 months + variance analysis | 🟡 P2 | 3h | ⬜ | Yearly view renders correctly |
| 9.6 | **Tests**: Unit + API + responsive | 🟡 P2 | 3h | ⬜ | All pass |

---

### Sprint 10: Activity Log + Reports (Tuần 19–20)

| # | Task | Priority | Est | Status | Verify |
|---|------|----------|-----|--------|--------|
| 10.1 | **Activity Log UI**: Login history + data changes + "my history" tab (trên `audit_logs`) | 🟡 P2 | 4h | ⬜ | Filter by user, module, timerange |
| 10.2 | **Audit Interceptor**: Tự động ghi log cho mọi create/update/delete | 🟡 P2 | 3h | ⬜ | Edit budget → log entry created |
| 10.3 | **Report Module API**: Budget summary, cost comparison, asset overview, project budget | 🟡 P2 | 4h | ⬜ | Report data accurate |
| 10.4 | **Report UI**: Table views + chart visualizations + Export PDF/Excel | 🟡 P2 | 4h | ⬜ | Export 5,000 rows → file valid |
| 10.5 | **Email Notifications**: Alert email cho expiry + budget approval + anomaly | 🟡 P2 | 3h | ⬜ | Email received |
| 10.6 | **Tests**: Unit + API + responsive | 🟡 P2 | 3h | ⬜ | All pass |

**Phase 3 Deliverable:** All 13 modules implemented. Phase 3 COMPLETE.

---

## PHASE 4 — POLISH & PRODUCTION (Tuần 21–24) 🟢 P3

### Sprint 11: Security & Performance (Tuần 21–22)

| # | Task | Priority | Est | Status | Verify |
|---|------|----------|-----|--------|--------|
| 11.1 | **Security hardening**: CSP headers, CORS, Helmet, rate limiting | 🟠 P1 | 3h | ⬜ | OWASP ZAP scan pass |
| 11.2 | **Performance tuning**: Redis caching strategy, DB index verification, bundle analyze | 🟠 P1 | 4h | ⬜ | P95 < 500ms |
| 11.3 | **E2E tests (Playwright)**: Login flow, budget CRUD, approval, export | 🟠 P1 | 6h | ⬜ | 10 E2E scenarios pass |
| 11.4 | **Load test (k6)**: 50 concurrent users simulation | 🟡 P2 | 3h | ⬜ | No degradation at 50 users |
| 11.5 | **Accessibility audit**: Keyboard nav, ARIA labels, contrast ratios | 🟡 P2 | 3h | ⬜ | No critical a11y issues |

---

### Sprint 12: Production Deploy & Docs (Tuần 23–24)

| # | Task | Priority | Est | Status | Verify |
|---|------|----------|-----|--------|--------|
| 12.1 | **Production Docker setup**: docker-compose.prod.yml + Nginx SSL | 🟠 P1 | 4h | ⬜ | Prod containers run stable |
| 12.2 | **Database backup**: Automated daily backup script + restore test | 🟠 P1 | 2h | ⬜ | Backup + restore success |
| 12.3 | **Monitoring**: PM2 + health check endpoint + error alerts | 🟡 P2 | 3h | ⬜ | Health check returns 200 |
| 12.4 | **User documentation**: Hướng dẫn sử dụng (key flows) | 🟢 P3 | 4h | ⬜ | Doc covers login, budget, report |
| 12.5 | **Seed data**: Demo data cho staging | 🟢 P3 | 2h | ⬜ | Staging has realistic data |
| 12.6 | **Final regression test**: Full E2E + responsive + security | 🟠 P1 | 4h | ⬜ | ALL TESTS GREEN |

**Phase 4 Deliverable:** Production-ready ITMS. PROJECT COMPLETE.

---

## TỔNG HỢP EFFORT

| Phase | Sprints | Tuần | Est (giờ) | Priority |
|-------|---------|------|-----------|----------|
| Phase 1: Foundation | Sprint 1–4 | 1–8 | ~120h | 🔴 P0 |
| Phase 2: Asset Mgmt | Sprint 5–7 | 9–14 | ~80h | 🟠 P1 |
| Phase 3: Extended | Sprint 8–10 | 15–20 | ~75h | 🟡 P2 |
| Phase 4: Polish | Sprint 11–12 | 21–24 | ~40h | 🟢 P3 |
| **TOTAL** | **12 sprints** | **24 tuần** | **~315h** | |

---

## DEPENDENCY MAP

```
Sprint 1 (Setup) ──→ Sprint 2 (Auth) ──→ Sprint 3 (Budget) ──→ Sprint 4 (Cost + Dashboard)
                                │                                         │
                                ▼                                         ▼
                        Sprint 5 (Vendor/Contract) ──→ Sprint 6 (Soft Inv) ──→ Sprint 7 (Hard Inv)
                                                                                    │
                                                              ┌────────────────────┘
                                                              ▼
                                                    Sprint 8 (Vehicle)
                                                    Sprint 9 (Project + Forecast)
                                                    Sprint 10 (Activity Log + Reports)
                                                              │
                                                              ▼
                                                    Sprint 11 (Security + Perf)
                                                    Sprint 12 (Production)
```

---

## QUY TẮC THỰC HIỆN

> Áp dụng theo AGENT_FLOW.md

1. **Mỗi sprint** = 1 bàn giao. Agent ghi DAILYSTANDUP.md sau mỗi session.
2. **Mỗi task** phải có unit test + responsive test (4 viewports).
3. **Trước khi bắt sprint mới**, review sprint trước (code + tests).
4. **UI phải tuân thủ** UI_Guideline.md — không ngoại lệ.
5. **API phải tuân thủ** Technical_Architecture.md § 9 — response format chuẩn.

---

## Done When

- [ ] 13 modules hoàn chỉnh, hoạt động trên staging
- [ ] Unit test coverage ≥ 80%
- [ ] Responsive test pass trên 4 viewports
- [ ] E2E test 10 luồng chính pass
- [ ] Security scan pass (OWASP ZAP)
- [ ] Load test 50 users pass
- [ ] Production deployed và stable 48h

---

*Kế hoạch này là living document. Cập nhật đánh dấu `✅` khi task hoàn thành.*
