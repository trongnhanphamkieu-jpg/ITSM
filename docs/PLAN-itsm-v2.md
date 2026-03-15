# PLAN — ITSM v2.0 Upgrade Plan (Final)
## Kế hoạch cải tiến hệ thống ITMS phiên bản 2.0

**Ngày lập:** 15/03/2026  
**Tham chiếu:** BRD v1.6 | PRD v1.6 | SRS v1.6 | PLAN-v1-enhancement.md | schema.prisma  
**Trạng thái:** Chờ duyệt lần 2  
**Phiên bản:** Draft 2 — Cập nhật theo feedback user

---

## 0. QUYẾT ĐỊNH ĐÃ XÁC NHẬN

| # | Câu hỏi | Quyết định |
|---|---------|-----------|
| 1 | Payment Status | ✅ Thêm `partial_paid` (thanh toán một phần) → cần thêm field `paidAmount` |
| 2 | Công nợ NCC | ✅ VỪA view tổng hợp VỪA bảng riêng track lịch sử đối soát (Hybrid) |
| 3 | Danh mục | ✅ BẮT BUỘC chọn từ master — không cho tạo mới tại form kế hoạch |
| 4 | System Roles | ✅ Chỉ giữ 2 system roles: **admin** (full quyền) + **viewer** (chỉ xem). Còn lại custom |
| 5 | Master Data | ✅ Rà soát toàn bộ — xem Section 1.7 bên dưới |

---

## 1. TỔNG QUAN CÁC TÍNH NĂNG MỚI

| # | Tính năng | Mã | Mức độ |
|---|-----------|-----|--------|
| F1 | Trạng thái thanh toán (pending/partial/paid/cancelled) + `paidAmount` | V2-F1 | 🟠 Trung bình |
| F2 | Đính kèm file/email vào chi phí thực tế | V2-F2 | 🟢 Nhẹ |
| F3 | Công nợ NCC — view aggregate + bảng reconciliation | V2-F3 | 🟠 Trung bình |
| F4 | Báo cáo tổng hợp thanh toán/chi phí theo NCC theo năm/tháng | V2-F4 | 🟠 Trung bình |
| F5 | Hạn thanh toán + cảnh báo quá hạn | V2-F5 | 🟠 Trung bình |
| F6 | Danh mục cấu hình trước, dùng chung (bắt buộc) | V2-F6 | 🔴 Nặng |
| F7 | Module Master Data Configuration (quy hoạch toàn bộ dữ liệu chung) | V2-F7 | 🔴 Nặng |
| F8 | Permission theo chức danh (Dynamic RBAC) — 2 system + custom roles | V2-F8 | 🔴 Nặng |

---

## 1.7 🔍 RÀ SOÁT TOÀN BỘ DỮ LIỆU — MASTER DATA AUDIT

> Rà soát toàn bộ 30+ models trong Prisma schema, phát hiện **15+ trường VARCHAR** ​​đang lưu text tự do nhưng thực tế là dữ liệu phân loại nên được quản lý tập trung.

### Kết quả audit — DỮ LIỆU CẦN QUY HOẠCH VÀO MASTER DATA

| # | Trường hiện tại | Model(s) sử dụng | Kiểu hiện tại | Nên chuyển thành | Master Data Type |
|---|----------------|-------------------|---------------|-----------------|-----------------|
| 1 | `department` | `User`, `Project`, `EmailAccount`, `AssetAssignment` | `VARCHAR(100)` | FK → `MasterDataItem` | `department` |
| 2 | `categoryName` | `ActualCost` | `VARCHAR(255)` | FK → `MasterCategory` | `cost_category` |
| 3 | `category` | `HardwareAsset` | `VARCHAR(100)` | FK → `MasterCategory` | `asset_category` |
| 4 | `contractType` | `Contract` | `VARCHAR(50)` | FK → `MasterDataItem` | `contract_type` |
| 5 | `environment` | `VpsServer` | `VARCHAR(20)` | FK → `MasterDataItem` | `environment` |
| 6 | `location` | `HardwareAsset`, `InfraResource`, `VpsServer` | `VARCHAR(255)` | FK → `MasterDataItem` | `location` |
| 7 | `type` (loại xe) | `Vehicle` | `VARCHAR(50)` | FK → `MasterDataItem` | `vehicle_type` |
| 8 | `fuelType` | `Vehicle` | `VARCHAR(30)` | FK → `MasterDataItem` | `fuel_type` |
| 9 | `type` (bảo trì) | `AssetMaintenanceLog` | `VARCHAR(50)` | FK → `MasterDataItem` | `maintenance_type` |
| 10 | `method` (thanh toán) | `ContractPayment` | `VARCHAR(50)` | FK → `MasterDataItem` | `payment_method` |
| 11 | `assignedTo` | `HardwareAsset`, `IpAddress`, `Vehicle`, `AssetAssignment`, `EmailAccount` | `VARCHAR(255)` | FK → `User` (KHÔNG phải master data) | N/A — reference `users` |
| 12 | `unit` | `BudgetItem` | `VARCHAR(50)` | FK → `MasterDataItem` | `unit_of_measure` |
| 13 | `BudgetCategory.name` | `BudgetCategory` | `VARCHAR(255)` | FK → `MasterCategory` | `budget_category` |

> **Đã loại bỏ:** `Vendor.category` (vendor_category) và `EmailAccount/VpsServer.provider` (service_provider) — quản lý tập trung tại module NCC & Hợp đồng.

### Dữ liệu GIỮ NGUYÊN (không cần quy hoạch)

| Trường | Lý do giữ nguyên |
|--------|-----------------|
| `user fullName, email, phone` | Dữ liệu cá nhân, không phải phân loại |
| `vendor name, taxCode, address, contacts, category` | Dữ liệu riêng từng NCC — quản lý tại module NCC |
| `contract code, name, value, dates` | Dữ liệu giao dịch, không phải phân loại |
| `EmailAccount/VpsServer.provider` | Quản lý tại module NCC & Hợp đồng |
| `ipAddress, hostname, serialNumber` | Dữ liệu kỹ thuật duy nhất |
| `fileName, storageKey, mimeType` | Metadata file, tự động |
| `invoiceNo, poNumber` | Mã chứng từ duy nhất |
| Tất cả enums (`BudgetStatus`, `ContractStatus`, ...) | Trạng thái workflow cố định, giữ enum |
| `VehicleService` (master list) | ĐÃ LÀ master data module riêng |
| `projects` | ĐÃ CÓ module riêng |

### Tổng kết Master Data Types cần tạo

```
Master Data Configuration (10 types)
├── 📁 Danh mục chi phí (MasterCategory tree)   ← F6: cost_category, budget_category
├── 📁 Loại tài sản (MasterCategory tree)        ← asset_category
├── 📋 Phòng ban / Bộ phận                       ← department
├── 📋 Loại hợp đồng                            ← contract_type
├── 📋 Loại phương tiện                          ← vehicle_type
├── 📋 Loại nhiên liệu                           ← fuel_type
├── 📋 Môi trường vận hành                       ← environment
├── 📋 Vị trí / Địa điểm                        ← location
├── 📋 Loại bảo trì                              ← maintenance_type
├── 📋 Phương thức thanh toán                    ← payment_method
├── 📋 Đơn vị tính                               ← unit_of_measure
├── 📋 Loại tài sản                              ← asset_category
├── 🔒 Chức danh & Phân quyền                   ← F8: roles + permissions
├── ⚙️ Cài đặt chung                            ← system_settings (giữ nguyên)
└── ⚙️ Ngưỡng cảnh báo                          ← alert thresholds (giữ nguyên)
```

> **Tổng: 10 loại master data flat + 3 cây danh mục phân cấp (backend) + 1 hệ thống roles**
>
> **Đã loại bỏ:** `vendor_category` và `service_provider` — quản lý tại module NCC & Hợp đồng.

---

## 2. ĐẶC TẢ CHI TIẾT TỪNG TÍNH NĂNG

### 2.1 V2-F1: Trạng thái thanh toán (CẬP NHẬT)

#### Schema changes

```prisma
// CẬP NHẬT enum — thêm partial_paid
enum PaymentStatus {
  pending        // Chưa thanh toán
  partial_paid   // Thanh toán một phần ← MỚI
  paid           // Đã thanh toán
  cancelled      // Đã hủy
}

model ActualCost {
  // ... fields hiện có ...
  paidAmount     Decimal?       @map("paid_amount") @db.Decimal(18, 2)  // ← MỚI: số tiền đã thanh toán
  // paymentStatus đã có, giữ nguyên
  // paidAt đã có, giữ nguyên
}
```

#### Logic
- Khi `paidAmount < amount` → `paymentStatus = 'partial_paid'`
- Khi `paidAmount >= amount` → `paymentStatus = 'paid'`, `paidAt = now()`
- Backend tự kiểm tra consistency khi update

#### API mới
```
PATCH /api/v1/actual-costs/:id/payment
Body: { paidAmount: 5000000, note: "Đợt 1" }
→ Tự tính status dựa trên paidAmount vs amount
```

#### Ảnh hưởng

| Module | Mức độ | Chi tiết |
|--------|--------|----------|
| **Database** | 🟠 Migration | Thêm enum value `partial_paid` + field `paidAmount` |
| Cost Management | 🟠 Thay đổi | Badge 4 trạng thái + progress bar + filter |
| Dashboard | 🟡 Gián tiếp | Widget tổng chưa/đã/đang thanh toán |

---

### 2.2 V2-F2: Đính kèm file chi phí thực tế

#### Hiện trạng: ✅ Schema + Backend SẴN SÀNG
- Model `CostAttachment` đã có
- API `POST /actual-costs/:id/attachments` đã có

#### Việc cần làm
- Kiểm tra + hoàn thiện frontend tích hợp `<FileUpload>` vào Cost create/edit form
- Hiển thị danh sách file đính kèm tại Cost detail

| Module | Mức độ | Chi tiết |
|--------|--------|----------|
| Database | ✅ Không ảnh hưởng | Schema đã sẵn sàng |
| Frontend | 🟡 Thêm component | Tích hợp FileUpload |

---

### 2.3 V2-F3: Công nợ NCC — Hybrid (View + Reconciliation)

#### Schema mới

```prisma
// Bảng lịch sử đối soát công nợ
model VendorReconciliation {
  id               String   @id @default(uuid()) @db.Uuid
  vendorId         String   @map("vendor_id") @db.Uuid
  reconciliationDate DateTime @map("reconciliation_date") @db.Date
  totalOutstanding Decimal  @map("total_outstanding") @db.Decimal(18, 2) // tổng công nợ tại thời điểm đối soát
  totalPaid        Decimal  @map("total_paid") @db.Decimal(18, 2)       // tổng đã thanh toán
  confirmedBy      String   @map("confirmed_by") @db.Uuid
  notes            String?  @db.Text
  createdAt        DateTime @default(now()) @map("created_at")

  vendor      Vendor @relation(fields: [vendorId], references: [id])
  confirmer   User   @relation("ReconciliationConfirmer", fields: [confirmedBy], references: [id])
  items       VendorReconciliationItem[]

  @@index([vendorId, reconciliationDate])
  @@map("vendor_reconciliations")
}

// Chi tiết đối soát — snapshot các khoản chi tại thời điểm đối soát
model VendorReconciliationItem {
  id                String   @id @default(uuid()) @db.Uuid
  reconciliationId  String   @map("reconciliation_id") @db.Uuid
  actualCostId      String   @map("actual_cost_id") @db.Uuid
  amount            Decimal  @db.Decimal(18, 2)
  status            String   @db.VarChar(20) // snapshot trạng thái tại thời điểm đối soát
  note              String?  @db.Text

  reconciliation VendorReconciliation @relation(fields: [reconciliationId], references: [id], onDelete: Cascade)

  @@index([reconciliationId])
  @@map("vendor_reconciliation_items")
}
```

#### API

```
GET  /api/v1/vendors/:id/payables           → Aggregate real-time từ actual_costs
GET  /api/v1/vendors/payables-summary        → Tất cả NCC có công nợ
POST /api/v1/vendors/:id/reconciliations     → Tạo bản đối soát mới
GET  /api/v1/vendors/:id/reconciliations     → Lịch sử đối soát
GET  /api/v1/vendors/:id/reconciliations/:rid → Chi tiết 1 lần đối soát
```

#### Ảnh hưởng

| Module | Mức độ | Chi tiết |
|--------|--------|----------|
| **Database** | 🟠 Migration | 2 bảng mới: `vendor_reconciliations`, `vendor_reconciliation_items` |
| Vendor Module | 🟠 Thay đổi | Tab "Công nợ" + Tab "Lịch sử đối soát" tại vendor detail |
| User model | 🟡 Thêm relation | `reconciliationsConfirmed` relation |
| Dashboard | 🟡 Widget mới | Tổng công nợ toàn hệ thống |

---

### 2.4 V2-F4: Báo cáo chi phí theo NCC

#### API

```
GET /api/v1/reports/vendor-costs
  ?year=2026&month=3&vendorId=xxx
→ Response: {
    vendors: [{
      vendorId, vendorName,
      totalCost, paidAmount, unpaidAmount,
      costsByMonth: [{ month: 1, totalCost, paidAmount }, ...]
    }],
    summary: { totalAll, totalPaid, totalUnpaid }
  }
```

| Module | Mức độ | Chi tiết |
|--------|--------|----------|
| Report Module | 🟠 Thêm trang mới | Trang báo cáo + chart + export |
| Database | ✅ Không ảnh hưởng | Dùng aggregate query |

---

### 2.5 V2-F5: Hạn thanh toán + Cảnh báo quá hạn

#### Schema

```prisma
model ActualCost {
  // ... thêm:
  paymentDueDate  DateTime?  @map("payment_due_date") @db.Date

  // Mở rộng notification type:
}

enum NotificationType {
  contract_expiry
  budget_approval
  payment_overdue     // ← MỚI
  system
}
```

#### Cron job
- Chạy hàng ngày 8:00 AM
- Query: `WHERE paymentDueDate < NOW() AND paymentStatus IN ('pending', 'partial_paid')`
- Tạo notification cho creator + manager
- Dashboard widget: "Giao dịch quá hạn thanh toán"

| Module | Mức độ | Chi tiết |
|--------|--------|----------|
| **Database** | 🟠 Migration | Thêm `paymentDueDate`, thêm enum value |
| Cost Management | 🟠 Thay đổi | Field mới trong form + badge "Quá hạn" |
| Notification | 🟡 Thêm logic | Cron job + enum type |
| Dashboard | 🟡 Widget mới | Danh sách quá hạn |

---

### 2.6 V2-F6: Danh mục dùng chung (BẮT BUỘC từ Master)

#### Schema

```prisma
model MasterCategory {
  id          String   @id @default(uuid()) @db.Uuid
  code        String   @unique @db.VarChar(50)
  name        String   @db.VarChar(255)
  type        String   @db.VarChar(50)  // 'budget', 'cost', 'asset'
  parentId    String?  @map("parent_id") @db.Uuid
  description String?  @db.Text
  isActive    Boolean  @default(true) @map("is_active")
  sortOrder   Int      @default(0) @map("sort_order")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  parent      MasterCategory?  @relation("CategoryTree", fields: [parentId], references: [id])
  children    MasterCategory[] @relation("CategoryTree")
  budgetItems BudgetItem[]
  actualCosts ActualCost[]
  hardwareAssets HardwareAsset[]

  @@index([type, isActive])
  @@map("master_categories")
}
```

#### Thay đổi luồng Budget Plan

**TRƯỚC (v1):**
```
Tạo Budget Plan → Tạo BudgetCategory mới → Thêm items
```

**SAU (v2):**
```
Master Data đã cấu hình sẵn danh mục
→ Tạo Budget Plan → CHỌN MasterCategory từ master → Thêm items vào category đã chọn
```

> `BudgetCategory` **VẪN GIỮ** nhưng thêm FK `masterCategoryId` — mỗi `BudgetCategory` PHẢI gắn với 1 `MasterCategory`. Điều này giữ backward compatibility nhưng enforce dữ liệu đồng nhất.

#### Ảnh hưởng

| Module | Mức độ | Chi tiết |
|--------|--------|----------|
| **Database** | 🔴 Migration | Tạo `master_categories`, thêm FK vào `BudgetCategory`, `ActualCost`, `HardwareAsset` |
| **Budget Planning** | 🔴 Thay đổi luồng | Form tạo plan: chọn category từ master, không tạo mới |
| **Cost Management** | 🟠 Thay đổi | `categoryName` → dropdown `MasterCategory` |
| **Hard Inventory** | 🟠 Thay đổi | `category` varchar → dropdown `MasterCategory` |
| **Dữ liệu hiện có** | ⚠️ DATA MIGRATION | Script map existing categories → master |

---

### 2.7 V2-F7: Module Master Data Configuration

#### Schema chính

```prisma
model MasterDataItem {
  id          String   @id @default(uuid()) @db.Uuid
  type        String   @db.VarChar(50)  // 'department', 'contract_type', etc.
  code        String   @db.VarChar(50)
  name        String   @db.VarChar(255)
  description String?  @db.Text
  isActive    Boolean  @default(true) @map("is_active")
  sortOrder   Int      @default(0) @map("sort_order")
  metadata    Json?    @db.JsonB       // extra fields per type
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@unique([type, code])
  @@index([type, isActive])
  @@map("master_data_items")
}
```

#### Seed data ví dụ

```json
// type = "department"
[
  { "code": "IT", "name": "Phòng Công nghệ Thông tin" },
  { "code": "FIN", "name": "Phòng Tài chính" },
  { "code": "HR", "name": "Phòng Nhân sự" },
  { "code": "MKT", "name": "Phòng Marketing" }
]

// type = "contract_type"
[
  { "code": "maintenance", "name": "Bảo trì" },
  { "code": "service", "name": "Dịch vụ" },
  { "code": "purchase", "name": "Mua sắm" },
  { "code": "subscription", "name": "Thuê bao" },
  { "code": "support", "name": "Hỗ trợ kỹ thuật" }
]

// type = "payment_method"
[
  { "code": "bank_transfer", "name": "Chuyển khoản" },
  { "code": "cash", "name": "Tiền mặt" },
  { "code": "credit_card", "name": "Thẻ tín dụng" }
]
```

#### Data Migration Map (12 trường cần chuyển)

| # | Field → Master Data | Migration Script |
|---|---------------------|-----------------|
| 1 | `User.department` → FK `departmentId` | Collect distinct → create items → update FK |
| 2 | `Project.department` → FK `departmentId` | Same as above |
| 3 | `EmailAccount.department` → FK `departmentId` | Same |
| 4 | `ActualCost.categoryName` → FK `masterCategoryId` | Collect distinct → create MasterCategory → update FK |
| 5 | `HardwareAsset.category` → FK `masterCategoryId` | Same |
| 6 | `Contract.contractType` → FK `contractTypeId` | Same |
| 7 | `VpsServer.environment` → FK `environmentId` | Same |
| 8 | `HardwareAsset.location` → FK `locationId` | Same |
| 9 | `Vehicle.type` → FK `vehicleTypeId` | Same |
| 10 | `Vehicle.fuelType` → FK `fuelTypeId` | Same |
| 11 | `AssetMaintenanceLog.type` → FK `maintenanceTypeId` | Same |
| 12 | `ContractPayment.method` → FK `paymentMethodId` | Same |
| 13 | `BudgetItem.unit` → FK `unitId` | Same |

> **Đã loại bỏ:** `Vendor.category` (row cũ #6), `EmailAccount/VpsServer.provider` (rows cũ #8, #9) — giữ nguyên VARCHAR, quản lý tại module NCC.

> Chiến lược: **THÊM CỘT FK MỚI** bên cạnh cột cũ → migrate data → verify → deprecated cột cũ.

#### Ảnh hưởng tổng hợp

| Module | Mức độ | Chi tiết |
|--------|--------|----------|
| **Database** | 🔴 Migration lớn | 1 bảng mới + 13 FK mới trên 8 models |
| **Tất cả forms** | 🟠 Thay đổi | Text input → dropdown từ master data |
| **Sidebar** | 🟠 Thay đổi | Thêm mục "Master Data Configuration" |
| **Configuration cũ** | 🟠 Merge | Merge vào Master Data module |
| **NCC & Hợp đồng** | ✅ Không ảnh hưởng | Vendor.category + provider giữ nguyên |

---

### 2.8 V2-F8: Dynamic RBAC — 2 System Roles + Custom

#### Schema

```prisma
model Role {
  id          String   @id @default(uuid()) @db.Uuid
  code        String   @unique @db.VarChar(50)
  name        String   @db.VarChar(255)
  description String?  @db.Text
  isSystem    Boolean  @default(false) @map("is_system")  // true = không thể xóa
  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  permissions RolePermission[]
  users       User[]

  @@map("roles")
}

model RolePermission {
  id         String  @id @default(uuid()) @db.Uuid
  roleId     String  @map("role_id") @db.Uuid
  module     String  @db.VarChar(50)   // 15 module codes
  canView    Boolean @default(false) @map("can_view")
  canCreate  Boolean @default(false) @map("can_create")
  canEdit    Boolean @default(false) @map("can_edit")
  canDelete  Boolean @default(false) @map("can_delete")
  canExport  Boolean @default(false) @map("can_export")
  canImport  Boolean @default(false) @map("can_import")
  canApprove Boolean @default(false) @map("can_approve")

  role Role @relation(fields: [roleId], references: [id], onDelete: Cascade)

  @@unique([roleId, module])
  @@index([roleId])
  @@map("role_permissions")
}
```

#### System Roles (không thể xóa/sửa)

| Role | Code | Permissions |
|------|------|-------------|
| **Quản trị viên** | `admin` | ALL = true trên tất cả modules |
| **Người xem** | `viewer` | canView = true trên tất cả modules, còn lại false |

#### Module codes cho permission matrix

```
dashboard, budget_plan, actual_cost, vendor, contract,
soft_inventory, hard_inventory, infrastructure, vehicle,
cost_forecast, project, report, activity_log, master_data,
user_management
```

#### Migration plan cho User.role

```
1. Tạo bảng roles + role_permissions
2. Insert 2 system roles (admin, viewer)
3. Insert 3 legacy roles (manager, staff, finance) — NOT system, editable
4. Thêm User.roleId FK (nullable ban đầu)
5. Script: map User.role enum → User.roleId
6. Set User.roleId NOT NULL
7. Giữ User.role enum (deprecated) cho backward compat
8. Refactor RolesGuard → PermissionGuard (check từ role_permissions)
```

#### Ảnh hưởng

| Module | Mức độ | Chi tiết |
|--------|--------|----------|
| **Database** | 🔴 Migration | 2 bảng mới + FK mới trên `users` |
| **Auth/Guard (core)** | 🔴 Thay đổi core | RolesGuard → PermissionGuard, check DB |
| **Tất cả API** | 🟠 Gián tiếp | Guard thay đổi logic nhưng decorator tương tự |
| **Sidebar** | 🔴 Thay đổi | Menu items hiển thị/ẩn theo permission |
| **User Management** | 🔴 Thay đổi | Chọn Role từ dropdown thay vì enum |
| **Master Data** | 🟠 Liên kết | Role management nằm trong Master Data |
| **Dữ liệu hiện có** | ⚠️ DATA MIGRATION | Map enum → roles table |

---

## 3. MA TRẬN ẢNH HƯỞNG TỔNG HỢP

| Module bị ảnh hưởng | F1 | F2 | F3 | F4 | F5 | F6 | F7 | F8 |
|---------------------|----|----|----|----|----|----|----|----|
| **Database Schema** | 🟠 | ✅ | 🟠 | ✅ | 🟠 | 🔴 | 🔴 | 🔴 |
| **Cost Management** | 🟠 | 🟡 | 🟡 | ✅ | 🟠 | 🟠 | 🟠 | 🟡 |
| **Vendor Module** | ✅ | ✅ | 🟠 | ✅ | ✅ | ✅ | 🟠 | 🟡 |
| **Budget Planning** | ✅ | ✅ | ✅ | ✅ | ✅ | 🔴 | 🟠 | 🟡 |
| **Dashboard** | 🟡 | ✅ | 🟡 | ✅ | 🟡 | ✅ | ✅ | 🟡 |
| **Report Module** | ✅ | ✅ | ✅ | 🟠 | ✅ | 🟡 | ✅ | 🟡 |
| **Auth System** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🔴 |
| **Sidebar / Nav** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🟠 | 🔴 |
| **Notification** | ✅ | ✅ | ✅ | ✅ | 🟡 | ✅ | ✅ | ✅ |
| **Configuration** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🔴 | 🟡 |
| **Hard Inventory** | ✅ | ✅ | ✅ | ✅ | ✅ | 🟠 | 🟠 | 🟡 |
| **Soft Inventory** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🟠 | 🟡 |
| **Vehicle Module** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🟠 | 🟡 |
| **User Management** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🟠 | 🔴 |

> ✅ = Không ảnh hưởng | 🟡 = Gián tiếp (widget) | 🟠 = Thay đổi trực tiếp | 🔴 = Thay đổi luồng

---

## 4. DATABASE MIGRATION STRATEGY

### Nguyên tắc an toàn

```
1. KHÔNG XÓA CỘT CŨ trong v2.0 — chỉ thêm cột mới
2. Cột mới ban đầu NULLABLE — sau khi migrate data mới set NOT NULL
3. BACKUP trước mỗi migration
4. Script migration có ROLLBACK
5. Test trên staging trước khi chạy production
```

### Thứ tự migration

```
Migration 1: Tạo bảng master (safe)
  → master_categories, master_data_items, roles, role_permissions
  → vendor_reconciliations, vendor_reconciliation_items

Migration 2: Thêm FK columns (safe)
  → ActualCost: +paidAmount, +paymentDueDate, +masterCategoryId
  → BudgetCategory: +masterCategoryId
  → HardwareAsset: +masterCategoryId, +locationId
  → User: +roleId, +departmentId
  → Contract: +contractTypeId
  → Vendor: +vendorCategoryId
  → ...16 FK columns tổng cộng

Migration 3: PaymentStatus enum (safe)
  → Thêm 'partial_paid' vào enum
  → Thêm 'payment_overdue' vào NotificationType

Migration 4: Data migration script (cẩn thận)
  → Collect distinct values → create master data items
  → Map existing VARCHAR → FK ids
  → Verify data consistency

Migration 5: Set constraints (sau khi verify)
  → Thêm NOT NULL cho roleId (sau khi tất cả users có roleId)
  → Thêm FK constraints
```

---

## 5. IMPLEMENTATION ROADMAP

### Dependency chain

```
Wave 1 (Foundation) → Wave 2 (Core) → Wave 3 (Business) → Wave 4 (Permission)
     F7, F6               F1, F2, F5        F3, F4              F8
```

### WAVE 1: FOUNDATION (~7 ngày) 🔴

| # | Task | Effort | Feature |
|---|------|--------|---------|
| W1.1 | Schema: `master_data_items` table | 0.5d | F7 |
| W1.2 | Backend: Master Data CRUD API | 0.5d | F7 |
| W1.3 | Seed: Collect existing varchar → create master data items | 1d | F7 |
| W1.4 | Frontend: Master Data Config page (tabs by type) | 1d | F7 |
| W1.5 | Frontend: `<MasterDataSelect>` shared component | 0.5d | F7 |
| W1.6 | Schema: `master_categories` table | 0.5d | F6 |
| W1.7 | Backend: Master Categories CRUD API (tree) | 0.5d | F6 |
| W1.8 | Data migration: BudgetCategory + categoryName → MasterCategory | 0.5d | F6 |
| W1.9 | Frontend: Category tree management UI | 0.5d | F6 |
| W1.10 | Frontend: Cập nhật Budget Plan form — chọn từ master | 0.5d | F6 |
| W1.11 | Frontend: Cập nhật Cost form — category dropdown | 0.5d | F6 |
| W1.12 | Cập nhật tất cả forms: text input → MasterDataSelect | 1d | F7 |

### WAVE 2: CORE ENHANCEMENTS (~3.5 ngày) 🟠

| # | Task | Effort | Feature |
|---|------|--------|---------|
| W2.1 | Schema: thêm `partial_paid`, `paidAmount` | 0.25d | F1 |
| W2.2 | Backend: PATCH payment status API + auto-detect logic | 0.5d | F1 |
| W2.3 | Frontend: Payment badge (4 states) + filter + progress bar | 0.5d | F1 |
| W2.4 | Frontend: Verify + integrate FileUpload vào Cost form | 0.5d | F2 |
| W2.5 | Schema: thêm `paymentDueDate` + `payment_overdue` enum | 0.25d | F5 |
| W2.6 | Backend: Cron job cảnh báo quá hạn + notification | 0.5d | F5 |
| W2.7 | Frontend: Due date field + overdue badge + dashboard widget | 0.5d | F5 |
| W2.8 | Testing Wave 2 | 0.5d | ALL |

### WAVE 3: BUSINESS LOGIC (~4.5 ngày) 🟠

| # | Task | Effort | Feature |
|---|------|--------|---------|
| W3.1 | Schema: `vendor_reconciliations`, `vendor_reconciliation_items` | 0.5d | F3 |
| W3.2 | Backend: Payables aggregate API | 0.5d | F3 |
| W3.3 | Backend: Reconciliation CRUD API | 0.5d | F3 |
| W3.4 | Frontend: Vendor "Công nợ" tab + Reconciliation history | 1d | F3 |
| W3.5 | Frontend: Payables summary page + Dashboard widget | 0.5d | F3 |
| W3.6 | Backend: Vendor cost report API | 0.5d | F4 |
| W3.7 | Frontend: Vendor cost report page (chart + table + filters) | 1d | F4 |
| W3.8 | Frontend: Export vendor report to Excel | 0.25d | F4 |
| W3.9 | Testing Wave 3 | 0.5d | ALL |

### WAVE 4: PERMISSION SYSTEM (~8 ngày) 🔴

| # | Task | Effort | Feature |
|---|------|--------|---------|
| W4.1 | Schema: `roles`, `role_permissions` | 0.5d | F8 |
| W4.2 | Data migration: enum → roles table + map users | 0.5d | F8 |
| W4.3 | Schema: `User.roleId` FK + backward compat | 0.5d | F8 |
| W4.4 | Backend: Roles CRUD API | 0.5d | F8 |
| W4.5 | Backend: Permission Matrix API | 0.5d | F8 |
| W4.6 | Backend: Refactor RolesGuard → PermissionGuard | 1.5d | F8 |
| W4.7 | Frontend: Role Management UI (Master Data) | 1d | F8 |
| W4.8 | Frontend: Permission Matrix UI (checkboxes grid) | 1d | F8 |
| W4.9 | Frontend: Dynamic sidebar + button-level permission | 1d | F8 |
| W4.10 | Full regression testing | 1d | ALL |

---

## 6. TỔNG HỢP EFFORT

| Wave | Features | Ước lượng | Priority |
|------|----------|-----------|----------|
| Wave 1: Foundation | F6, F7 | **~7 ngày** | 🔴 Critical |
| Wave 2: Core Enhancement | F1, F2, F5 | **~3.5 ngày** | 🟠 Important |
| Wave 3: Business Logic | F3, F4 | **~4.5 ngày** | 🟠 Important |
| Wave 4: Permission | F8 | **~8 ngày** | 🔴 Critical (high risk) |
| **TOTAL** | **8 features** | **~23 ngày** | |

---

## 7. RỦI RO & GIẢM THIỂU

| Rủi ro | Mức | Giảm thiểu |
|--------|-----|-----------|
| Data migration lỗi (F6, F7, F8) | 🔴 Cao | Backup trước migrate, script có rollback, test staging |
| PermissionGuard break existing APIs (F8) | 🔴 Cao | Giữ backward compat enum, roll out gradually |
| Category migration không khớp (F6) | 🟠 TB | Verify script chạy report trước + sau |
| 16 FK migration cùng lúc (F7) | 🟠 TB | Chia nhỏ migration, mỗi lần 3-4 fields |
| Cron job quên chạy (F5) | 🟡 Thấp | Health check endpoint + monitoring |
| Performance aggregate query (F3, F4) | 🟡 Thấp | Index trên paymentStatus, vendorId |

---

## 8. VERIFICATION PLAN

### Automated Tests
```bash
# Backend unit tests
cd backend && npm test

# Specific module tests
npm test -- --testPathPattern=cost
npm test -- --testPathPattern=vendor
npm test -- --testPathPattern=auth

# Prisma migration verify
npx prisma migrate dev --preview-feature
npx prisma validate
```

### Manual Verification Checklist

| # | Feature | Test Steps |
|---|---------|-----------|
| 1 | F1 Partial payment | Tạo chi phí 10M → thanh toán 5M → kiểm tra badge "Thanh toán 1 phần" + progress 50% |
| 2 | F2 File upload | Tạo chi phí → drag-drop PDF → xem file đính kèm → download → verify |
| 3 | F3 Công nợ | Tạo 3 chi phí pending cho NCC A → Vendor detail → tab Công nợ = tổng 3 chi phí |
| 4 | F3 Đối soát | Tab Đối soát → "Tạo đối soát mới" → snapshot → verify lịch sử |
| 5 | F4 Báo cáo | Báo cáo → Báo cáo NCC → chọn 2026 → xem biểu đồ 12 tháng → Export Excel |
| 6 | F5 Quá hạn | Tạo chi phí hạn TT = hôm qua → chờ cron → kiểm tra notification + badge "Quá hạn" |
| 7 | F6 Category | Master Data → tạo danh mục "Phần cứng" → Budget Plan → danh mục hiện trong dropdown |
| 8 | F7 Master Data | Tạo Phòng ban "IT" → tạo User → dropdown Phòng ban hiện "IT" |
| 9 | F8 Permission | Tạo role "Kế toán" → tick view Cost + Report → tạo user role Kế toán → login → chỉ thấy 2 menu |
| 10 | F8 System roles | Thử xóa role "admin" → phải từ chối. Thử xóa role custom → OK |

---

*Plan này cần review và approved trước khi implementation. Sau khi approved sẽ cập nhật BRD/PRD/SRS v2.0.*
