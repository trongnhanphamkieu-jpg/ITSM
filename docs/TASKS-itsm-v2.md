# ITSM v2.0 — Task Breakdown & Implementation Phases

**Ngày:** 15/03/2026  
**Ref:** PLAN-itsm-v2.md (Draft 2 — Approved)  
**Tổng effort:** ~23 ngày | 5 Phases | ~65 tasks

---

## Quy ước

```
🔴 P0 — Blocking (nền tảng, tất cả feature khác phụ thuộc)
🟠 P1 — Critical (business core)
🟡 P2 — Important (mở rộng nghiệp vụ)
🟢 P3 — Polish (hoàn thiện)

⏱️ = Estimated effort
✅ = Done  |  🔄 = In Progress  |  ⬜ = Not Started
```

---

## PHASE 1 — DATABASE FOUNDATION & MASTER DATA 🔴 P0
> **Ước lượng: ~7 ngày** | Tất cả phases sau phụ thuộc Phase 1

### Lý do P0
- F7 (Master Data) là **nền tảng** cho toàn bộ v2.0 — 16 trường VARCHAR trên 10 models cần quy hoạch
- F6 (Master Category) ảnh hưởng **trực tiếp** đến Budget + Cost — 2 module lõi
- Nếu không làm trước, Wave 2-4 sẽ phải sửa 2 lần

### Sprint V2-1: Master Data Module (Day 1-4)

| # | Task | Priority | Est | Status | Verify | Feature |
|---|------|----------|-----|--------|--------|---------|
| 1.1 | **Schema Migration**: Tạo bảng `master_data_items` | 🔴 P0 | 2h | ⬜ | `npx prisma migrate dev` success | F7 |
| 1.2 | **Schema Migration**: Tạo bảng `master_categories` (tree structure) | 🔴 P0 | 2h | ⬜ | Migration success + self-relation works | F6 |
| 1.3 | **Schema Migration**: Thêm 16 FK columns trên 10 models (nullable) | 🔴 P0 | 3h | ⬜ | `npx prisma validate` pass | F7 |
| 1.4 | **Data Collection Script**: Extract distinct values từ 16 VARCHAR fields | 🔴 P0 | 3h | ⬜ | Script output danh sách values per type | F7 |
| 1.5 | **Data Migration Script**: Insert master_data_items + master_categories từ collected values | 🔴 P0 | 3h | ⬜ | Count items matches distinct values | F7 |
| 1.6 | **Data Migration Script**: Map existing VARCHAR → FK ids trên 10 models | 🔴 P0 | 4h | ⬜ | Query verify: 0 rows with NULL FK where old VARCHAR exists | F7 |
| 1.7 | **Backend Module**: `MasterDataModule` — CRUD API `/api/v1/master-data` | 🔴 P0 | 4h | ⬜ | Supertest: CRUD + filter by type pass | F7 |
| 1.8 | **Backend Module**: `MasterCategoryModule` — CRUD API `/api/v1/master-categories` (tree) | 🔴 P0 | 4h | ⬜ | Supertest: create parent → create child → get tree | F6 |
| 1.9 | **Backend**: Seed script cho default master data | 🟠 P1 | 2h | ⬜ | Seed → verify items in DB | F7 |
| 1.10 | **Frontend Shared**: `<MasterDataSelect>` component — async dropdown từ master data | 🔴 P0 | 3h | ⬜ | Component renders, loads data, fires onChange | F7 |
| 1.11 | **Frontend Shared**: `<MasterCategorySelect>` component — tree dropdown | 🔴 P0 | 3h | ⬜ | Tree renders, selection works | F6 |

**Sprint V2-1 Deliverable:** Bảng master data có data, API hoạt động, shared components ready.

---

### Sprint V2-2: Master Data UI + Form Migration (Day 5-7)

| # | Task | Priority | Est | Status | Verify | Feature |
|---|------|----------|-----|--------|--------|---------|
| 2.1 | **Frontend Page**: Master Data Config — main page + tabs by type | 🔴 P0 | 4h | ⬜ | Navigate → xem tabs: Phòng ban, Loại HĐ, Location... | F7 |
| 2.2 | **Frontend**: Category Tree Management UI (CRUD tree view) | 🔴 P0 | 4h | ⬜ | Tạo danh mục cha → tạo con → tree hiển thị đúng | F6 |
| 2.3 | **Frontend**: Sidebar — thêm menu "Master Data Configuration" | 🟠 P1 | 1h | ⬜ | Menu hiện đúng vị trí, navigate OK | F7 |
| 2.4 | **Form Migration**: Budget Plan — `BudgetCategory` chọn từ `MasterCategory` (bắt buộc) | 🔴 P0 | 3h | ⬜ | Tạo plan → chỉ chọn được từ master, không tạo mới | F6 |
| 2.5 | **Form Migration**: Cost form — `categoryName` → `<MasterCategorySelect>` | 🔴 P0 | 2h | ⬜ | Tạo chi phí → chọn category từ dropdown | F6 |
| 2.6 | **Form Migration**: Cost form — thêm `departmentId` dropdown | 🟠 P1 | 1h | ⬜ | Dropdown Phòng ban hiện data | F7 |
| 2.7 | **Form Migration**: User form — `department` text → `<MasterDataSelect type="department">` | 🟠 P1 | 1h | ⬜ | Dropdown thay text input | F7 |
| 2.8 | **Form Migration**: Contract form — `contractType` text → dropdown | 🟠 P1 | 1h | ⬜ | Dropdown Loại HĐ hoạt động | F7 |
| 2.9 | **Form Migration**: Vendor form — `category` text → dropdown | 🟠 P1 | 1h | ⬜ | Dropdown Lĩnh vực NCC | F7 |
| 2.10 | **Form Migration**: HardwareAsset — `category` + `location` → dropdown | 🟠 P1 | 1h | ⬜ | 2 dropdown hoạt động | F7 |
| 2.11 | **Form Migration**: Vehicle — `type` + `fuelType` → dropdown | 🟡 P2 | 1h | ⬜ | 2 dropdown hoạt động | F7 |
| 2.12 | **Form Migration**: EmailAccount/VPS — `provider` + `environment` → dropdown | 🟡 P2 | 1.5h | ⬜ | 2 dropdown hoạt động | F7 |
| 2.13 | **Form Migration**: ContractPayment — `method` → dropdown | 🟡 P2 | 0.5h | ⬜ | Dropdown PTTT hoạt động | F7 |
| 2.14 | **Form Migration**: BudgetItem — `unit` → dropdown | 🟡 P2 | 0.5h | ⬜ | Dropdown đơn vị tính | F7 |
| 2.15 | **Form Migration**: InfraResource/AssetMaintenance — `location`/`type` → dropdown | 🟡 P2 | 1h | ⬜ | Dropdowns hoạt động | F7 |
| 2.16 | **Testing**: Unit test Master Data API + integration test | 🟠 P1 | 2h | ⬜ | `npm test` pass | F7 |

**Sprint V2-2 Deliverable:** UI Master Data hoàn chỉnh. 100% forms dùng dropdown thay text. Phase 1 DONE.

---

## PHASE 2 — PAYMENT & COST ENHANCEMENTS 🟠 P1
> **Ước lượng: ~3.5 ngày** | Phụ thuộc Phase 1 (categories ready)

### Lý do P1
- F1 (Payment Status) là **tiền đề** cho F3 (Công nợ) và F4 (Báo cáo NCC)
- F5 (Hạn thanh toán) liên quan trực tiếp đến thanh toán
- F2 (File upload) nhẹ nhưng nên làm cùng đợt vì cùng module Cost

### Sprint V2-3: Payment Status + File Upload + Due Date (Day 8-10.5)

| # | Task | Priority | Est | Status | Verify | Feature |
|---|------|----------|-----|--------|--------|---------|
| 3.1 | **Schema Migration**: Thêm `partial_paid` vào `PaymentStatus` enum | 🟠 P1 | 1h | ⬜ | Migration success + enum có 4 values | F1 |
| 3.2 | **Schema Migration**: Thêm `paidAmount` (Decimal, nullable) vào `ActualCost` | 🟠 P1 | 0.5h | ⬜ | Field tồn tại, nullable | F1 |
| 3.3 | **Schema Migration**: Thêm `paymentDueDate` (Date, nullable) vào `ActualCost` | 🟠 P1 | 0.5h | ⬜ | Field tồn tại | F5 |
| 3.4 | **Schema Migration**: Thêm `payment_overdue` vào `NotificationType` enum | 🟠 P1 | 0.5h | ⬜ | Enum có giá trị mới | F5 |
| 3.5 | **Backend API**: `PATCH /actual-costs/:id/payment` — update paidAmount + auto-detect status | 🟠 P1 | 3h | ⬜ | POST 10M → PATCH 5M → status = partial_paid | F1 |
| 3.6 | **Backend Logic**: Validation — paidAmount ≤ amount, auto status transition | 🟠 P1 | 2h | ⬜ | paidAmount > amount → reject | F1 |
| 3.7 | **Backend API**: Cập nhật Cost CRUD — include `paymentDueDate` trong DTO | 🟠 P1 | 1h | ⬜ | Create cost với dueDate → saved OK | F5 |
| 3.8 | **Backend Service**: Cron job cảnh báo quá hạn (daily 8AM) | 🟠 P1 | 3h | ⬜ | Tạo cost due yesterday → cron → notification created | F5 |
| 3.9 | **Frontend**: Payment Status Badge component (4 states + colors) | 🟠 P1 | 1.5h | ⬜ | Badge hiển thị đúng 4 màu/text | F1 |
| 3.10 | **Frontend**: Payment progress bar (paidAmount / amount) | 🟠 P1 | 1h | ⬜ | 50% payment → bar 50% | F1 |
| 3.11 | **Frontend**: Cost list — filter theo paymentStatus | 🟠 P1 | 1h | ⬜ | Filter "Chưa TT" → chỉ hiện pending | F1 |
| 3.12 | **Frontend**: Cost form — thêm field "Hạn thanh toán" (date picker) | 🟠 P1 | 1h | ⬜ | Date picker hoạt động, save OK | F5 |
| 3.13 | **Frontend**: Cost detail — action "Ghi nhận thanh toán" (modal nhập paidAmount) | 🟠 P1 | 2h | ⬜ | Click → modal → nhập số → status update | F1 |
| 3.14 | **Frontend**: Overdue badge ("Quá hạn X ngày") trên cost list | 🟠 P1 | 1h | ⬜ | Cost quá hạn → badge đỏ hiện | F5 |
| 3.15 | **Frontend**: Dashboard widget "Giao dịch quá hạn" | 🟡 P2 | 1.5h | ⬜ | Widget hiển thị list costs quá hạn | F5 |
| 3.16 | **Frontend**: Verify FileUpload component tại Cost form | 🟠 P1 | 1.5h | ⬜ | Upload PDF → hiển thị file → download OK | F2 |
| 3.17 | **Frontend**: Cost detail — section "File đính kèm" | 🟠 P1 | 1h | ⬜ | Xem danh sách file, click download | F2 |
| 3.18 | **Testing**: Unit + API test cho payment + overdue + upload | 🟠 P1 | 2h | ⬜ | All pass | ALL |

**Sprint V2-3 Deliverable:** Thanh toán 4 trạng thái, hạn TT + cảnh báo, file đính kèm. Phase 2 DONE.

---

## PHASE 3 — VENDOR PAYABLES & REPORTING 🟡 P2
> **Ước lượng: ~4.5 ngày** | Phụ thuộc Phase 2 (payment status ready)

### Lý do P2
- F3 (Công nợ) phụ thuộc F1 (payment status phải hoàn chỉnh trước)
- F4 (Báo cáo NCC) phụ thuộc F1 + F3
- Cả 2 là tính năng nghiệp vụ mở rộng, hệ thống hiện tại vẫn chạy được không có

### Sprint V2-4: Accounts Payable + Reconciliation (Day 11-13.5)

| # | Task | Priority | Est | Status | Verify | Feature |
|---|------|----------|-----|--------|--------|---------|
| 4.1 | **Schema**: Tạo bảng `vendor_reconciliations` | 🟡 P2 | 1h | ⬜ | Migration success | F3 |
| 4.2 | **Schema**: Tạo bảng `vendor_reconciliation_items` | 🟡 P2 | 1h | ⬜ | FK + cascade OK | F3 |
| 4.3 | **Backend API**: `GET /vendors/:id/payables` — aggregate outstanding costs | 🟡 P2 | 2h | ⬜ | 3 costs pending → total = sum of 3 | F3 |
| 4.4 | **Backend API**: `GET /vendors/payables-summary` — all vendors outstanding | 🟡 P2 | 1.5h | ⬜ | Returns list + totals per vendor | F3 |
| 4.5 | **Backend API**: `POST /vendors/:id/reconciliations` — tạo đối soát mới | 🟡 P2 | 2h | ⬜ | Snapshot costs → reconciliation created | F3 |
| 4.6 | **Backend API**: `GET /vendors/:id/reconciliations` — lịch sử đối soát | 🟡 P2 | 1h | ⬜ | List reconciliations with pagination | F3 |
| 4.7 | **Backend API**: `GET /vendors/:id/reconciliations/:rid` — chi tiết đối soát | 🟡 P2 | 1h | ⬜ | Return items snapshot | F3 |
| 4.8 | **Frontend**: Vendor detail — Tab "Công nợ" (outstanding costs list + total) | 🟡 P2 | 3h | ⬜ | Tab hiện bảng costs pending + tổng | F3 |
| 4.9 | **Frontend**: Vendor detail — Tab "Lịch sử đối soát" + "Tạo đối soát" button | 🟡 P2 | 3h | ⬜ | Click → snapshot → hiện trong lịch sử | F3 |
| 4.10 | **Frontend**: Payables Summary Page — tổng hợp công nợ tất cả NCC | 🟡 P2 | 2h | ⬜ | Trang hiển thị bảng NCC + tổng công nợ | F3 |
| 4.11 | **Frontend**: Dashboard widget — "Tổng công nợ phải trả" | 🟡 P2 | 1h | ⬜ | Widget KPI hiện tổng số | F3 |
| 4.12 | **Testing**: Unit + API test payables + reconciliation | 🟡 P2 | 2h | ⬜ | All pass | F3 |

---

### Sprint V2-5: Vendor Cost Report (Day 13.5-15.5)

| # | Task | Priority | Est | Status | Verify | Feature |
|---|------|----------|-----|--------|--------|---------|
| 5.1 | **Backend API**: `GET /reports/vendor-costs` — aggregate by vendor × month × year | 🟡 P2 | 3h | ⬜ | year=2026: returns 12 months data per vendor | F4 |
| 5.2 | **Frontend Page**: Báo cáo chi phí theo NCC — main page + filters | 🟡 P2 | 2h | ⬜ | Filter year/month/vendor → data loads | F4 |
| 5.3 | **Frontend Chart**: Bar chart — chi phí theo NCC theo tháng (recharts) | 🟡 P2 | 2h | ⬜ | Chart renders correctly | F4 |
| 5.4 | **Frontend Table**: Bảng chi tiết — NCC × Tổng × Đã TT × Chưa TT | 🟡 P2 | 1.5h | ⬜ | Bảng sort + pagination | F4 |
| 5.5 | **Frontend**: Export báo cáo NCC → Excel (xlsx) | 🟡 P2 | 1.5h | ⬜ | Click Export → file .xlsx valid | F4 |
| 5.6 | **Frontend**: Sidebar — thêm mục "Báo cáo NCC" vào Report | 🟢 P3 | 0.5h | ⬜ | Menu item hiện đúng | F4 |
| 5.7 | **Testing**: API test + verify report accuracy | 🟡 P2 | 1.5h | ⬜ | Report totals = sum of actual_costs | F4 |

**Sprint V2-4+5 Deliverable:** Công nợ NCC + Đối soát + Báo cáo NCC. Phase 3 DONE.

---

## PHASE 4 — DYNAMIC RBAC PERMISSION 🔴 P0 (HIGH RISK)
> **Ước lượng: ~7 ngày** | Phụ thuộc Phase 1 (master data ready). **Làm cuối vì ảnh hưởng toàn hệ thống.**

### Lý do P0 nhưng thứ tự cuối
- Đây là P0 về **tầm quan trọng** (security) nhưng xếp Phase 4 vì:
  - Ảnh hưởng **toàn bộ hệ thống** — nếu lỗi sẽ break tất cả
  - Cần tất cả modules ổn định trước rồi mới thay đổi auth
  - Migration User.role → roleId rủi ro cao nhất
- Nếu Phase 1-3 chạy tốt, Phase 4 sẽ an toàn hơn

### Sprint V2-6: Role System + Backend Permission (Day 16-19)

| # | Task | Priority | Est | Status | Verify | Feature |
|---|------|----------|-----|--------|--------|---------|
| 6.1 | **Schema**: Tạo bảng `roles` | 🔴 P0 | 1h | ⬜ | Migration success | F8 |
| 6.2 | **Schema**: Tạo bảng `role_permissions` (15 modules × 7 permissions) | 🔴 P0 | 1h | ⬜ | FK + unique constraint OK | F8 |
| 6.3 | **Schema**: Thêm `User.roleId` FK (nullable ban đầu) | 🔴 P0 | 1h | ⬜ | Column exists, nullable | F8 |
| 6.4 | **Data Migration**: Insert 2 system roles (admin + viewer) | 🔴 P0 | 1h | ⬜ | 2 rows in roles, isSystem=true | F8 |
| 6.5 | **Data Migration**: Insert 3 legacy roles (manager, staff, finance) — custom | 🔴 P0 | 1h | ⬜ | 5 roles total, 3 custom | F8 |
| 6.6 | **Data Migration**: Set default permissions cho 5 roles × 15 modules | 🔴 P0 | 2h | ⬜ | admin: all true, viewer: only canView=true | F8 |
| 6.7 | **Data Migration**: Map User.role enum → User.roleId FK | 🔴 P0 | 2h | ⬜ | 0 users with NULL roleId | F8 |
| 6.8 | **Backend Module**: `RolesModule` — CRUD API `/api/v1/roles` | 🟠 P1 | 3h | ⬜ | Supertest: CRUD pass + system role undeletable | F8 |
| 6.9 | **Backend API**: Permission Matrix — `GET/PUT /roles/:id/permissions` | 🟠 P1 | 3h | ⬜ | Get → 15 modules × 7 booleans. Put → update OK | F8 |
| 6.10 | **Backend Guard**: Tạo `PermissionGuard` (check role_permissions từ DB) | 🔴 P0 | 4h | ⬜ | Staff user no canCreate → POST returns 403 | F8 |
| 6.11 | **Backend**: Tạo `@RequirePermission(module, action)` decorator | 🔴 P0 | 2h | ⬜ | `@RequirePermission('budget_plan', 'create')` works | F8 |
| 6.12 | **Backend**: Refactor ALL controllers — `@Roles()` → `@RequirePermission()` | 🔴 P0 | 4h | ⬜ | Build success, all endpoints guarded | F8 |
| 6.13 | **Backend**: Cache permissions (Redis/memory) — avoid DB query per request | 🟡 P2 | 2h | ⬜ | 2nd request hits cache, not DB | F8 |
| 6.14 | **Backend**: API `GET /auth/me/permissions` — trả về permissions cho current user | 🟠 P1 | 1h | ⬜ | Returns { modules: { budget_plan: { canView: true, ... } } } | F8 |
| 6.15 | **Testing**: Guard tests + role API tests | 🔴 P0 | 3h | ⬜ | Coverage ≥ 80% cho auth module | F8 |

---

### Sprint V2-7: Permission Frontend + Full Regression (Day 20-23)

| # | Task | Priority | Est | Status | Verify | Feature |
|---|------|----------|-----|--------|--------|---------|
| 7.1 | **Frontend Page**: Role Management UI (Master Data → Roles tab) | 🟠 P1 | 3h | ⬜ | Tạo/sửa/xóa role (trừ system) | F8 |
| 7.2 | **Frontend**: Permission Matrix UI — checkbox grid (15 modules × 7 actions) | 🟠 P1 | 4h | ⬜ | Tick/untick → save → verify API | F8 |
| 7.3 | **Frontend**: System role lock — admin/viewer disabled edit/delete | 🟠 P1 | 1h | ⬜ | Button delete disabled cho admin/viewer | F8 |
| 7.4 | **Frontend**: User form — `role` enum → Role dropdown (từ API) | 🟠 P1 | 1.5h | ⬜ | Dropdown hiện 5 roles, create user OK | F8 |
| 7.5 | **Frontend Hook**: `usePermissions()` — load + cache permissions client-side | 🔴 P0 | 2h | ⬜ | Hook returns permissions object | F8 |
| 7.6 | **Frontend**: Dynamic Sidebar — ẩn/hiện menu items theo `canView` | 🔴 P0 | 2h | ⬜ | Viewer login → chỉ thấy menu được phép | F8 |
| 7.7 | **Frontend Component**: `<PermissionGate>` wrapper — ẩn buttons theo permission | 🔴 P0 | 2h | ⬜ | `<PermissionGate module="cost" action="create">` → ẩn nếu không có quyền | F8 |
| 7.8 | **Frontend**: Áp dụng `<PermissionGate>` cho tất cả Create/Edit/Delete buttons | 🟠 P1 | 3h | ⬜ | Staff user không thấy nút Edit trên module bị khóa | F8 |
| 7.9 | **Frontend**: Error page — 403 Forbidden page | 🟡 P2 | 1h | ⬜ | Navigate trực tiếp URL bị cấm → hiện 403 page | F8 |
| 7.10 | **Frontend Route Guard**: Check permission trước khi render page | 🟠 P1 | 2h | ⬜ | Truy cập /costs/create khi không có canCreate → redirect | F8 |

---

## PHASE 5 — INTEGRATION TESTING & POLISH 🟢 P3
> **Ước lượng: ~1 ngày** | Chạy sau khi tất cả Phases hoàn thành

### Sprint V2-8: Regression + Dashboard + Cleanup (Day 23)

| # | Task | Priority | Est | Status | Verify | Feature |
|---|------|----------|-----|--------|--------|---------|
| 8.1 | **Dashboard**: Widget "Thanh toán" — tổng pending/partial/paid | 🟢 P3 | 1h | ⬜ | 3 KPI cards hiện đúng | F1 |
| 8.2 | **Dashboard**: Widget "Công nợ NCC" — top 5 NCC có công nợ cao nhất | 🟢 P3 | 1h | ⬜ | Widget hiện đúng | F3 |
| 8.3 | **Full Regression**: Test all 13 modules + CRUD + permissions | 🟠 P1 | 3h | ⬜ | Tất cả modules hoạt động bình thường | ALL |
| 8.4 | **Cleanup**: Deprecated cột VARCHAR cũ (add comment/mark) | 🟢 P3 | 1h | ⬜ | Schema comments added | F7 |
| 8.5 | **Documentation**: Cập nhật BRD v2.0 | 🟢 P3 | 1h | ⬜ | BRD reflect v2 features | ALL |
| 8.6 | **Documentation**: Cập nhật PRD v2.0 | 🟢 P3 | 1h | ⬜ | PRD reflect v2 stories | ALL |
| 8.7 | **Documentation**: Cập nhật SRS v2.0 (schema + API) | 🟢 P3 | 1.5h | ⬜ | SRS match code | ALL |
| 8.8 | **Documentation**: User Guide v2.0 | 🟢 P3 | 1h | ⬜ | Guide covers new features | ALL |

---

## TỔNG HỢP

| Phase | Sprint | Days | Tasks | Features | Priority |
|-------|--------|------|-------|----------|----------|
| Phase 1: Foundation | V2-1, V2-2 | Day 1-7 | 27 tasks | F6, F7 | 🔴 P0 |
| Phase 2: Payment & Cost | V2-3 | Day 8-10.5 | 18 tasks | F1, F2, F5 | 🟠 P1 |
| Phase 3: Payables & Report | V2-4, V2-5 | Day 11-15.5 | 19 tasks | F3, F4 | 🟡 P2 |
| Phase 4: Permission | V2-6, V2-7 | Day 16-23 | 25 tasks | F8 | 🔴 P0 |
| Phase 5: Polish | V2-8 | Day 23+ | 8 tasks | ALL | 🟢 P3 |
| **TOTAL** | **8 sprints** | **~23 ngày** | **~97 tasks** | **8 features** | |

---

## DEPENDENCY MAP

```
┌─────────────────────────────────────────────────────────────┐
│  PHASE 1: Foundation 🔴 (Day 1-7)                            │
│                                                              │
│  Sprint V2-1: Schema + Migration + API + Components          │
│  Sprint V2-2: Master Data UI + 16 Form Migrations           │
│       ↓ Categories + Master Data ready                       │
├──────────────────────────────────────────────────────────────┤
│  PHASE 2: Payment & Cost 🟠 (Day 8-10.5)                    │
│                                                              │
│  Sprint V2-3: partial_paid + paidAmount + dueDate +          │
│               overdue cron + file upload                     │
│       ↓ Payment status hoàn chỉnh                           │
├──────────────────────────────────────────────────────────────┤
│  PHASE 3: Payables & Report 🟡 (Day 11-15.5)                │
│                                                              │
│  Sprint V2-4: Vendor payables + reconciliation              │
│  Sprint V2-5: Vendor cost report + chart + export            │
│       ↓ Business logic hoàn chỉnh                           │
├──────────────────────────────────────────────────────────────┤
│  PHASE 4: Permission 🔴 (Day 16-23)                         │
│  ⚠️ HIGH RISK — làm cuối vì ảnh hưởng toàn hệ thống        │
│                                                              │
│  Sprint V2-6: roles + permissions + guard refactor          │
│  Sprint V2-7: Frontend permission UI + dynamic sidebar      │
│       ↓ Auth system hoàn chỉnh                              │
├──────────────────────────────────────────────────────────────┤
│  PHASE 5: Polish 🟢 (Day 23+)                               │
│                                                              │
│  Sprint V2-8: Dashboard widgets + Regression + Docs         │
└──────────────────────────────────────────────────────────────┘
```

---

## DONE WHEN

- [ ] 13 master data types đã seed + UI quản lý
- [ ] 16 VARCHAR fields chuyển về FK dropdown
- [ ] Budget Plan bắt buộc chọn MasterCategory
- [ ] 4 trạng thái thanh toán (pending/partial/paid/cancelled) hoạt động
- [ ] paidAmount + progress bar hiển thị đúng
- [ ] Hạn TT + cảnh báo quá hạn cron chạy hàng ngày
- [ ] File upload tại Chi phí thực tế OK
- [ ] Vendor Payables tab + Reconciliation history
- [ ] Báo cáo NCC theo tháng/năm + export Excel
- [ ] 2 system roles (admin/viewer) + custom roles CRUD
- [ ] Permission matrix 15 modules × 7 actions
- [ ] Dynamic sidebar + PermissionGate hoạt động
- [ ] Full regression test pass
- [ ] BRD/PRD/SRS v2.0 updated

---

*Living document — cập nhật ✅ khi task hoàn thành.*
