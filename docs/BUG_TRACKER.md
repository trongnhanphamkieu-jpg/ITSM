# ITSM Bug Tracker — E2E Test Findings (16/03/2026)

## ✅ FIXED (đã sửa trong session này)

### ~~BUG-001: Budget total calculation mismatch~~ ✅
- **File:** `frontend/src/app/(dashboard)/budget/plans/[id]/page.tsx`
- **Fix:** Calculate `grandTotal` client-side from all items instead of stale `plan.totalAmount`

### ~~BUG-002: Login thất bại không hiện thông báo lỗi~~ ✅
- **File:** `frontend/src/lib/api.ts`
- **Fix:** Auth endpoints (`/auth/*`) skip 401 token refresh so error propagates to UI

### ~~BUG-003: Missing sidebar i18n keys~~ ✅
- **File:** `frontend/src/lib/i18n.tsx`
- **Fix:** Added `nav.payables`, `nav.vendor_report`, `nav.roles` in vi+en

---

## 🔴 OPEN BUGS

### BUG-004: Infrastructure page blank
- **Priority:** HIGH
- **URL:** `/infrastructure`
- **Description:** Page renders only breadcrumb, no content/tabs/tables
- **Fix needed:** Implement full Infrastructure UI (Server/IP/VLAN/Network/Apps tabs)

### BUG-005: Roles management page blank
- **Priority:** HIGH
- **URL:** `/settings/roles`
- **Description:** Dynamic RBAC UI (v2-F8) not implemented
- **Fix needed:** Build permission matrix grid: roles × modules × permissions

### BUG-006: Dashboard typo "Phan cung"
- **Priority:** MEDIUM
- **Description:** Missing Vietnamese diacritics in chart category name
- **Fix needed:** Update seed data to use proper Unicode

### BUG-007: Dashboard category name truncated
- **Priority:** MEDIUM
- **Description:** 4th category in chart shows only "Ph" instead of full name
- **Fix needed:** Increase chart label width or add text ellipsis + tooltip

### BUG-008: Vehicle detail breadcrumb shows UUID
- **Priority:** MEDIUM
- **URL:** `/vehicles/[id]`
- **Fix needed:** Use `vehicle.licensePlate` instead of `vehicle.id` in breadcrumb

### BUG-009: Activity Log raw DB table names
- **Priority:** MEDIUM
- **URL:** `/activity-log`
- **Fix needed:** Create MODULE_NAME_MAP constant to map table names → Vietnamese names

### BUG-010: Master Data budget categories tab empty
- **Priority:** MEDIUM
- **URL:** `/settings/master-data`
- **Fix needed:** Check API filtering by type and data alignment with seed

### BUG-011: Hard Inventory missing fields
- **Priority:** MEDIUM
- **Fix needed:** Update seed data + add form validation for required fields

### BUG-012: Budget list shows stale totalAmount
- **Priority:** MEDIUM
- **URL:** `/budget/plans`
- **Fix needed:** Migration script to recalculate all plan totals, or compute in list API
