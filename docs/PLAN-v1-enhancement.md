# ITMS v1 Enhancement Plan (Final)

> **Ngày:** 15/03/2026 | **Ref:** Enhancement-note-p1 + System Assessment + Data Linking Audit
> **Trạng thái:** Chờ duyệt

---

## TỔNG QUAN

| Nguồn | Số item |
|-------|---------|
| Enhancement-note-p1 | 11 |
| System assessment gaps | 15+ |
| Data linking audit | 25+ |
| **Tổng (sau merge/dedupe)** | **~35 tasks** |

---

## PHASE A — 🔴 CRITICAL (Phải hoàn thành trước v1)

> **Estimate: ~12 ngày** | Không release nếu thiếu

### A1. Shared Components Foundation ⏱️ 1 ngày
> _Các component dùng chung, làm TRƯỚC tất cả task khác_

| Sub-task | Chi tiết |
|----------|----------|
| A1.1 `<VendorSelect>` | Async search dropdown, load từ `/api/v1/vendors?status=active` |
| A1.2 `<ContractSelect>` | Filter theo vendorId (cascade), load từ `/api/v1/contracts` |
| A1.3 `<ProjectSelect>` | Load từ `/api/v1/projects?status=active` |
| A1.4 `<CategorySelect>` | Load từ BudgetCategory hoặc Category master |
| A1.5 `<UserSelect>` | Load từ `/api/v1/users?status=active` (cho assignedTo) |
| A1.6 `<CurrencyInput>` | Auto-format dấu chấm khi gõ, lưu raw number |
| A1.7 `formatCurrency()` | Shared utility `Intl.NumberFormat('vi-VN')` |
| A1.8 `<FileUpload>` | Drag & drop + progress, connect MinIO |
| A1.9 `<ExportButton>` | Shared export trigger cho tất cả list pages |

> **Lý do P0:** Mọi task sau đều phụ thuộc vào các component này.

---

### A2. Schema Migration — Fix broken FKs ⏱️ 0.5 ngày
> _4 field VARCHAR phải thành FK_

| Migration | Hiện tại | Sửa thành |
|-----------|----------|-----------|
| `ActualCost.vendor` → `vendorId` | `VARCHAR(255)` | `UUID FK → Vendor` |
| `ActualCost.categoryName` → `categoryId` | `VARCHAR(255)` | `UUID FK → Category` (tạo model mới) |
| `CostForecastItem.vendor` → `vendorId` | `VARCHAR(255)` | `UUID FK → Vendor` |
| `*.assignedTo` → `assignedToId` (4 bảng) | `VARCHAR(255)` | `UUID FK → User` |

> ⚠️ Cần data migration script cho dữ liệu hiện có.

---

### A3. Data Linking — Cost Module ⏱️ 1 ngày
> _Enhancement #1, #7 + Data Linking Audit 2.1_

**File:** `costs/create/page.tsx`

| Field hiện tại | Sửa thành | Ref |
|----------------|-----------|-----|
| `vendor` text input (L180) | `<VendorSelect>` → lưu `vendorId` | Enhancement #1 |
| `categoryName` text input (L123) | `<CategorySelect>` dropdown | Enhancement #1 |
| `budgetItemId` flat select (L208) | 2-step cascade: Plan → Item | Enhancement #7 |
| `amount` number input (L152) | `<CurrencyInput>` dấu chấm | Enhancement #4 |

---

### A4. Data Linking — Soft Inventory (5 tabs) ⏱️ 1 ngày
> _Data Linking Audit 2.2 — 10 field fix, FE only_

**File:** `inventory/soft/page.tsx` — thêm vào `createFields` của mỗi tab:

| Tab | Thêm field |
|-----|------------|
| Email | `vendorId` (VendorSelect) + `contractId` (ContractSelect) |
| Domain | `vendorId` + `contractId` |
| VPS | `vendorId` + `contractId` |
| License | `vendorId` + `contractId` |
| SSL | `vendorId` + `contractId` |

> ✅ Schema FK đã có sẵn → chỉ thêm dropdown vào form.

---

### A5. Data Linking — Hard Inventory (3 tabs) ⏱️ 0.5 ngày
> _Data Linking Audit 2.3 + Enhancement #9_

**File:** `inventory/hard/page.tsx`

| Tab | Thêm field |
|-----|------------|
| Hardware | `vendorId` + `contractId` + `assignedToId` (UserSelect) |
| Infra | `vendorId` |
| IP | `assignedToId` (UserSelect) |

---

### A6. Data Linking — Vehicle + Budget + Forecast ⏱️ 0.5 ngày
> _Data Linking Audit 2.4, 2.5, 2.6_

| Module | Thêm field |
|--------|------------|
| Vehicle create | `vendorId` (VendorSelect) |
| Budget Item row | `projectId` (ProjectSelect) |
| Forecast Item | `vendorId` (VendorSelect) — sau migration A2 |

---

### A7. Number Formatting — Dấu chấm toàn hệ thống ⏱️ 0.5 ngày
> _Enhancement #4_

- Áp dụng `<CurrencyInput>` tại: Budget (unitPrice), Cost (amount), Contract (value), Vehicle (cost, monthlyCost), Forecast (estimatedAmount)
- Áp dụng `formatCurrency()` tại: tất cả hiển thị số tiền (tables, cards, KPIs)

---

### A8. File Upload — MinIO Integration ⏱️ 1.5 ngày
> _Enhancement #2_

| Tích hợp tại | Loại file |
|-------------|-----------|
| Contract form + detail | PDF/Excel hợp đồng |
| Cost create | Hóa đơn scan (PDF/JPG/PNG) |
| Vendor detail | Tài liệu NCC |

---

### A9. Contract Status + Detail Page ⏱️ 1 ngày
> _Enhancement #3 + Data Linking Audit 3.2_

- Tạo `/contracts/[id]` detail page: info cards, linked assets, attachments, timeline
- Status management: badges + dropdown đổi trạng thái (draft → active → expired → terminated)
- `PATCH /api/v1/contracts/:id/status` + validation rules

---

### A10. Edit All + Admin Revert ⏱️ 1 ngày
> _Enhancement #10_

| Module | Edit | Admin Revert |
|--------|------|-------------|
| Budget Plan | Reuse create form + pre-fill | approved → draft API + button |
| Cost | Inline edit hoặc edit page | N/A |
| Vendor | Edit form (hiện chỉ có view) | N/A |
| Contract | Edit form | N/A |
| All Inventory | Edit trong drawer | N/A |
| Vehicle | Edit form | N/A |
| Forecast | Reuse create + pre-fill | approved → draft API |

---

### A11. Export Excel — Core Modules ⏱️ 2 ngày
> _Enhancement #11_

Backend `ExcelJS` service + `<ExportButton>` trên:
- Budget Plans, Actual Costs, Vendors, Contracts
- Soft/Hard Inventory (all tabs), Vehicles
- Cost Forecasts, Activity Log

---

### A12. Users API Integration ⏱️ 0.5 ngày
- `/settings/users` → kết nối real API thay mock data

### A13. Fix Broken Links ⏱️ 0.5 ngày
- Sidebar `/budgets` → `/budget/plans`
- API client issues từ DAILYSTANDUP

---

## PHASE B — 🟠 IMPORTANT (Nên có cho v1)

> **Estimate: ~8 ngày**

| # | Task | Effort |
|---|------|--------|
| B1 | **Dashboard Filters** — Tháng/Quý selector (Enhancement #5) | 1 ngày |
| B2 | **Dashboard Alerts** — Cron job check HĐ/domain hết hạn + widget (Enhancement #6) | 1.5 ngày |
| B3 | **Vendor Detail Enhancement** — Hiển thị linked assets, costs, xe (Audit 3.1) | 1 ngày |
| B4 | **Infrastructure Module Full** — VLAN, network diagrams, environments, apps | 2 ngày |
| B5 | **Configuration Module** — Category CRUD, alert thresholds, company config | 1.5 ngày |
| B6 | **Reports Enhancement** — Thêm báo cáo xe/HĐ/hạ tầng + bộ lọc linh hoạt | 2 ngày |
| B7 | **Dashboard NCC aggregation** — Top 5 NCC, costs by vendor chart (Audit 3.4) | 0.5 ngày |
| B8 | **User profile → "Tài sản được giao"** view (Audit 3.3) | 0.5 ngày |

---

## PHASE C — 🟡 POLISH (v1.1+)

| # | Task | Effort |
|---|------|--------|
| C1 | API & Key Token Management — Soft Inventory tab mới (Enhancement #8) | 1 ngày |
| C2 | 2FA UI setup/verify | 1 ngày |
| C3 | Redis caching strategy | 1 ngày |
| C4 | i18n (EN/VI) | 2 ngày |
| C5 | Playwright E2E (10 flows) | 2-3 ngày |
| C6 | Backend Unit Tests (80% coverage) | 2-3 ngày |
| C7 | Dark mode, Accessibility audit | 2 ngày |

---

## THỨ TỰ THỰC HIỆN (Dependency chain)

```
 ┌──────────────────────────────────────────────────────┐
 │  WEEK 1: Foundation + Data Linking                    │
 │                                                       │
 │  Day 1: A1 Shared Components                          │
 │         (VendorSelect, CurrencyInput, FileUpload...)  │
 │  Day 2: A2 Schema Migration (4 FK fixes)              │
 │  Day 3: A3 Cost Module linking                        │
 │       + A7 Number formatting toàn hệ thống            │
 │  Day 4: A4 Soft Inventory (10 field)                  │
 │       + A5 Hard Inventory (5 field)                   │
 │  Day 5: A6 Vehicle + Budget + Forecast linking        │
 │       + A12 Users API + A13 Fix links                 │
 ├──────────────────────────────────────────────────────┤
 │  WEEK 2: Features + Polish                            │
 │                                                       │
 │  Day 6-7: A8 File Upload (MinIO)                      │
 │  Day 8:   A9 Contract Status + Detail Page            │
 │  Day 9:   A10 Edit All + Admin Revert                 │
 │  Day 10-11: A11 Export Excel                          │
 ├──────────────────────────────────────────────────────┤
 │  WEEK 3: Phase B                                      │
 │                                                       │
 │  Day 12: B1 Dashboard Filters + B7 NCC aggregation    │
 │  Day 13-14: B2 Dashboard Alerts (cron)                │
 │  Day 15: B3 Vendor Detail + B8 User assets            │
 │  Day 16-17: B4 Infrastructure Full                    │
 │  Day 18-19: B5 Config + B6 Reports                    │
 └──────────────────────────────────────────────────────┘
```

---

## CROSS-REFERENCE MAP

| Enhancement Note # | Plan Task ID(s) |
|--------------------|-|
| 1. Vendor dropdown liên kết | **A1.1, A3, A4, A5, A6** |
| 2. File upload | **A1.8, A8** |
| 3. Trạng thái hợp đồng | **A9** |
| 4. Dấu chấm số tiền | **A1.6, A1.7, A7** |
| 5. Dashboard filter tháng/quý | **B1** |
| 6. Dashboard cảnh báo | **B2** |
| 7. Cost → Budget linking | **A3** |
| 8. API/key token | **C1** |
| 9. Filter NCC + trạng thái tài sản | **A4, A5** (đã merge) |
| 10. Edit all + Admin revert | **A10** |
| 11. Export Excel | **A1.9, A11** |

| Data Linking Audit | Plan Task ID(s) |
|--------------------|------|
| Schema FKs (4 fields) | **A2** |
| Cost form (3 fields) | **A3** |
| Soft Inventory (10 fields) | **A4** |
| Hard Inventory (5 fields) | **A5** |
| Vehicle + Budget + Forecast (3 fields) | **A6** |
| Vendor detail cross-ref | **B3** |
| Contract detail page | **A9** |
| User "tài sản được giao" | **B8** |
| Dashboard NCC aggregation | **B7** |

---

*Plan đã tích hợp TOÀN BỘ: Enhancement-note-p1 (11 items) + System Assessment (15+ gaps) + Data Linking Audit (25+ gaps).*
*Tổng Phase A: ~12 ngày | Phase A+B: ~20 ngày | Full: ~30 ngày.*
