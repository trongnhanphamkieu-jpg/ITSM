# SRS – ĐẶC TẢ YÊU CẦU PHẦN MỀM
## Hệ thống Quản trị Công nghệ Thông tin Nội bộ (IT Management System – ITMS)

**Phiên bản:** 1.6  
**Ngày lập:** 13/03/2026  
**Cập nhật:** 15/03/2026 – v1.6: Bổ sung SRS cho liên kết dữ liệu xuyên module, shared components, schema migration, file upload, number formatting, edit/revert, export  
**Lịch sử:** 14/03 v1.5 – Redesign Module 10 Vehicle Cost subscription model  
**Người soạn:** Team Phát triển  
**Trạng thái:** Bản nháp  
**Tham chiếu:** BRD_IT_Management_System.md v1.6 | PRD_IT_Management_System.md v1.6

---

## 1. GIỚI THIỆU

### 1.1 Mục đích tài liệu

Tài liệu này mô tả đầy đủ và chính xác các yêu cầu chức năng, phi chức năng và kỹ thuật của hệ thống ITMS. Đây là cơ sở để team phát triển thiết kế, lập trình, kiểm thử và bàn giao sản phẩm.

### 1.2 Phạm vi

ITMS là ứng dụng web nội bộ bao gồm 12 module chức năng:
1. Budget Planning
2. Cost Management
3. Vendor & Contract Management
4. Inventory Management (Soft + Hard)
5. Access Control
6. Infrastructure Management
7. Configuration
8. Dashboard
9. Report
10. Vehicle Cost Management
11. Project Budget
12. Activity Log
13. Cost Forecast (Dự chi)

### 1.3 Định nghĩa & Viết tắt

| Thuật ngữ | Giải thích |
|-----------|-----------|
| ITMS | IT Management System – Hệ thống quản trị IT nội bộ |
| RBAC | Role-Based Access Control – Phân quyền theo vai trò |
| CRUD | Create, Read, Update, Delete |
| SLA | Service Level Agreement |
| KPI | Key Performance Indicator |
| NCC | Nhà cung cấp |
| HĐ | Hợp đồng |
| VM | Virtual Machine |
| AP | Access Point |
| VLAN | Virtual Local Area Network |
| SSL | Secure Sockets Layer |
| 2FA | Two-Factor Authentication |
| JWT | JSON Web Token |
| API | Application Programming Interface |
| DTO | Data Transfer Object |
| VCM | Vehicle Cost Management – Module quản lý chi phí theo xe |
| ZNS | Zalo Notification Service – dịch vụ gửi thông báo qua Zalo |
| SMS | Short Message Service – tin nhắn văn bản |
| GPS | Global Positioning System – thiết bị định vị xe |

---

## 2. KIẾN TRÚC HỆ THỐNG

### 2.1 Tổng quan kiến trúc

```
[Browser Client]
       │
       ▼
[Next.js Frontend App] ──── Static Assets (CDN)
       │
       ▼ REST API / HTTP
[NestJS Backend API Server]
       │
       ├──── [PostgreSQL Database]
       ├──── [Redis Cache]
       └──── [MinIO / S3 File Storage]
```

### 2.2 Công nghệ sử dụng

| Layer | Công nghệ | Phiên bản |
|-------|-----------|-----------|
| Frontend | Next.js + React | 14.x |
| UI Library | TailwindCSS + ShadCN/UI | Latest |
| Backend | NestJS (Node.js) | 10.x |
| ORM | Prisma | 5.x |
| Database | PostgreSQL | 16.x |
| Cache | Redis | 7.x |
| File Storage | MinIO | Latest |
| Auth | JWT + Passport.js | |
| 2FA | otplib (TOTP) | |
| Email | Nodemailer / SMTP | |
| Export Excel | ExcelJS | |
| Export PDF | Puppeteer | |
| API Docs | Swagger/OpenAPI | |

### 2.3 Mô hình triển khai

```
Docker Compose (Development / Staging)
├── itms-frontend   (port 3000)
├── itms-backend    (port 4000)
├── postgres        (port 5432)
├── redis           (port 6379)
└── minio           (port 9000, 9001)

Production: Kubernetes / Docker Swarm
```

---

## 3. MÔ HÌNH DỮ LIỆU (DATABASE SCHEMA)

### 3.1 Module Authentication & Users

```sql
-- Bảng người dùng hệ thống
users
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
  full_name       VARCHAR(255) NOT NULL
  email           VARCHAR(255) UNIQUE NOT NULL
  password_hash   VARCHAR(255) NOT NULL
  role            ENUM('admin','manager','staff','finance','viewer')
  status          ENUM('active','locked','inactive') DEFAULT 'active'
  two_fa_secret   VARCHAR(255)
  two_fa_enabled  BOOLEAN DEFAULT false
  department      VARCHAR(100)
  phone           VARCHAR(20)
  avatar_url      VARCHAR(500)
  last_login_at   TIMESTAMP
  created_at      TIMESTAMP DEFAULT NOW()
  updated_at      TIMESTAMP DEFAULT NOW()
  created_by      UUID REFERENCES users(id)

-- Bảng phân quyền module
user_permissions
  id              UUID PRIMARY KEY
  user_id         UUID REFERENCES users(id)
  module          VARCHAR(50)  -- 'budget','cost','vendor','inventory','infra','report'
  can_view        BOOLEAN DEFAULT false
  can_create      BOOLEAN DEFAULT false
  can_edit        BOOLEAN DEFAULT false
  can_delete      BOOLEAN DEFAULT false
  can_export      BOOLEAN DEFAULT false
  can_import      BOOLEAN DEFAULT false

-- Bảng ghi log hoạt động
audit_logs
  id              UUID PRIMARY KEY
  user_id         UUID REFERENCES users(id)
  action          VARCHAR(50)   -- 'CREATE','UPDATE','DELETE','LOGIN','LOGOUT','EXPORT','IMPORT'
  module          VARCHAR(50)
  target_id       UUID
  target_type     VARCHAR(50)
  before_value    JSONB
  after_value     JSONB
  ip_address      VARCHAR(45)
  user_agent      TEXT
  created_at      TIMESTAMP DEFAULT NOW()
```

---

### 3.2 Module Budget Planning

```sql
-- Kế hoạch ngân sách theo năm
budget_plans
  id              UUID PRIMARY KEY
  year            INTEGER NOT NULL
  name            VARCHAR(255)
  total_amount    DECIMAL(18,2) DEFAULT 0
  currency        VARCHAR(10) DEFAULT 'VND'
  status          ENUM('draft','pending','approved','in_progress','closed')
  approved_by     UUID REFERENCES users(id)
  approved_at     TIMESTAMP
  notes           TEXT
  version         INTEGER DEFAULT 1
  created_at      TIMESTAMP DEFAULT NOW()
  updated_at      TIMESTAMP DEFAULT NOW()
  created_by      UUID REFERENCES users(id)

-- Chi tiết kế hoạch theo hạng mục
budget_items
  id              UUID PRIMARY KEY
  plan_id         UUID REFERENCES budget_plans(id)
  category_id     UUID REFERENCES categories(id)
  item_name       VARCHAR(255) NOT NULL
  description     TEXT
  q1_amount       DECIMAL(18,2) DEFAULT 0
  q2_amount       DECIMAL(18,2) DEFAULT 0
  q3_amount       DECIMAL(18,2) DEFAULT 0
  q4_amount       DECIMAL(18,2) DEFAULT 0
  annual_amount   DECIMAL(18,2) GENERATED ALWAYS AS (q1_amount+q2_amount+q3_amount+q4_amount) STORED
  project_id      UUID REFERENCES projects(id)  -- NULL = không thuộc dự án nào ("Chung")
  notes           TEXT
  sort_order      INTEGER DEFAULT 0
  created_at      TIMESTAMP DEFAULT NOW()
  updated_at      TIMESTAMP DEFAULT NOW()
  created_by      UUID REFERENCES users(id)

-- Lịch sử phiên bản kế hoạch
budget_plan_history
  id              UUID PRIMARY KEY
  plan_id         UUID REFERENCES budget_plans(id)
  version         INTEGER
  snapshot_data   JSONB
  change_note     TEXT
  changed_by      UUID REFERENCES users(id)
  changed_at      TIMESTAMP DEFAULT NOW()
```

---

### 3.3 Module Cost Management

```sql
-- Chi phí thực tế
actual_costs
  id              UUID PRIMARY KEY
  budget_item_id  UUID REFERENCES budget_items(id)
  vendor_id       UUID REFERENCES vendors(id)
  contract_id     UUID REFERENCES contracts(id)
  cost_name       VARCHAR(255) NOT NULL
  amount          DECIMAL(18,2) NOT NULL
  currency        VARCHAR(10) DEFAULT 'VND'
  expense_date    DATE NOT NULL
  invoice_number  VARCHAR(100)
  po_number       VARCHAR(100)
  payment_status  ENUM('pending','paid','cancelled') DEFAULT 'pending'
  paid_at         DATE
  notes           TEXT
  project_id      UUID REFERENCES projects(id)  -- NULL = không thuộc dự án nào
  created_at      TIMESTAMP DEFAULT NOW()
  created_by      UUID REFERENCES users(id)

-- File đính kèm hóa đơn
cost_attachments
  id              UUID PRIMARY KEY
  cost_id         UUID REFERENCES actual_costs(id)
  file_name       VARCHAR(255)
  file_url        VARCHAR(500)
  file_size       INTEGER
  mime_type       VARCHAR(100)
  uploaded_at     TIMESTAMP DEFAULT NOW()
  uploaded_by     UUID REFERENCES users(id)
```

---

### 3.4 Module Vendor & Contract

```sql
-- Nhà cung cấp
vendors
  id              UUID PRIMARY KEY
  code            VARCHAR(50) UNIQUE
  name            VARCHAR(255) NOT NULL
  tax_code        VARCHAR(50) UNIQUE
  address         TEXT
  website         VARCHAR(255)
  contact_name    VARCHAR(100)
  contact_email   VARCHAR(100)
  contact_phone   VARCHAR(20)
  category        VARCHAR(100)  -- loại dịch vụ cung cấp
  status          ENUM('active','inactive') DEFAULT 'active'
  notes           TEXT
  created_at      TIMESTAMP DEFAULT NOW()
  created_by      UUID REFERENCES users(id)

-- Hợp đồng
contracts
  id              UUID PRIMARY KEY
  contract_number VARCHAR(100) UNIQUE NOT NULL
  vendor_id       UUID REFERENCES vendors(id)
  contract_type   VARCHAR(100)  -- bảo trì, dịch vụ, mua sắm, thuê bao, hỗ trợ
  name            VARCHAR(255)
  value           DECIMAL(18,2)
  currency        VARCHAR(10) DEFAULT 'VND'
  sign_date       DATE
  start_date      DATE
  end_date        DATE
  auto_renew      BOOLEAN DEFAULT false
  status          ENUM('draft','active','expired','terminated','renewed')
  alert_days      INTEGER DEFAULT 30  -- cảnh báo trước bao nhiêu ngày
  notes           TEXT
  created_at      TIMESTAMP DEFAULT NOW()
  created_by      UUID REFERENCES users(id)

-- File đính kèm hợp đồng
contract_attachments
  id              UUID PRIMARY KEY
  contract_id     UUID REFERENCES contracts(id)
  file_name       VARCHAR(255)
  file_url        VARCHAR(500)
  file_size       INTEGER
  uploaded_at     TIMESTAMP DEFAULT NOW()
  uploaded_by     UUID REFERENCES users(id)

-- Lịch sử thanh toán hợp đồng
contract_payments
  id              UUID PRIMARY KEY
  contract_id     UUID REFERENCES contracts(id)
  amount          DECIMAL(18,2)
  payment_date    DATE
  notes           TEXT
  created_at      TIMESTAMP DEFAULT NOW()
  created_by      UUID REFERENCES users(id)
```

---

### 3.5 Module Inventory – Soft Assets

```sql
-- Email accounts
email_accounts
  id              UUID PRIMARY KEY
  email_address   VARCHAR(255) UNIQUE NOT NULL
  display_name    VARCHAR(255)
  owner_name      VARCHAR(255)
  department      VARCHAR(100)
  provider        VARCHAR(100)   -- Google Workspace, Microsoft 365...
  plan            VARCHAR(100)
  expire_date     DATE
  status          ENUM('active','inactive','suspended')
  cost_per_year   DECIMAL(18,2)
  notes           TEXT
  created_at      TIMESTAMP DEFAULT NOW()

-- Quản lý domain
domains
  id              UUID PRIMARY KEY
  domain_name     VARCHAR(255) UNIQUE NOT NULL
  registrar       VARCHAR(100)
  register_date   DATE
  expire_date     DATE NOT NULL
  auto_renew      BOOLEAN DEFAULT true
  status          ENUM('active','expired','transferred','reserved')
  dns_provider    VARCHAR(100)
  ip_address      VARCHAR(45)
  cost_per_year   DECIMAL(18,2)
  managed_by      VARCHAR(100)
  notes           TEXT
  created_at      TIMESTAMP DEFAULT NOW()
  updated_at      TIMESTAMP DEFAULT NOW()
  created_by      UUID REFERENCES users(id)
```

---

### 3.5 Module Inventory – Soft Assets

```sql
-- Email accounts
email_accounts
  id              UUID PRIMARY KEY
  email_address   VARCHAR(255) UNIQUE NOT NULL
  display_name    VARCHAR(255)
  owner_name      VARCHAR(255)
  department      VARCHAR(100)
  provider        VARCHAR(100)   -- Google Workspace, Microsoft 365...
  plan            VARCHAR(100)
  expire_date     DATE
  status          ENUM('active','inactive','suspended')
  cost_per_year   DECIMAL(18,2)
  notes           TEXT
  created_at      TIMESTAMP DEFAULT NOW()
  updated_at      TIMESTAMP DEFAULT NOW()
  created_by      UUID REFERENCES users(id)

-- Quản lý domain
domains
  id              UUID PRIMARY KEY
  domain_name     VARCHAR(255) UNIQUE NOT NULL
  registrar       VARCHAR(100)
  register_date   DATE
  expire_date     DATE NOT NULL
  auto_renew      BOOLEAN DEFAULT true
  status          ENUM('active','expired','transferred','reserved')
  dns_provider    VARCHAR(100)
  ip_address      VARCHAR(45)
  cost_per_year   DECIMAL(18,2)
  managed_by      VARCHAR(100)
  notes           TEXT
  created_at      TIMESTAMP DEFAULT NOW()
  updated_at      TIMESTAMP DEFAULT NOW()
  created_by      UUID REFERENCES users(id)

-- VPS / Cloud Server
vps_servers
  id              UUID PRIMARY KEY
  hostname        VARCHAR(255) UNIQUE NOT NULL
  ip_address      VARCHAR(45)
  provider        VARCHAR(100)  -- AWS, GCP, Azure, Vultr, Linode...
  region          VARCHAR(100)
  plan            VARCHAR(100)
  cpu             VARCHAR(50)
  ram             VARCHAR(50)
  storage         VARCHAR(50)
  os              VARCHAR(100)
  purpose         TEXT
  environment     ENUM('production','staging','testing','development')
  expire_date     DATE
  cost_per_month  DECIMAL(18,2)
  status          ENUM('running','stopped','suspended','terminated')
  managed_by      VARCHAR(100)
  notes           TEXT
  created_at      TIMESTAMP DEFAULT NOW()
  updated_at      TIMESTAMP DEFAULT NOW()
  created_by      UUID REFERENCES users(id)

-- License phần mềm
software_licenses
  id              UUID PRIMARY KEY
  software_name   VARCHAR(255) NOT NULL
  vendor          VARCHAR(100)
  license_type    VARCHAR(100)  -- perpetual, subscription, concurrent
  license_key     TEXT         -- encrypted
  total_quantity  INTEGER
  used_quantity   INTEGER DEFAULT 0
  purchase_date   DATE
  expire_date     DATE
  cost_total      DECIMAL(18,2)
  notes           TEXT
  created_at      TIMESTAMP DEFAULT NOW()
  updated_at      TIMESTAMP DEFAULT NOW()
  created_by      UUID REFERENCES users(id)

-- Người được gán license
license_assignments
  id              UUID PRIMARY KEY
  license_id      UUID REFERENCES software_licenses(id)
  assigned_to     VARCHAR(255)  -- tên người dùng
  department      VARCHAR(100)
  assigned_date   DATE
  returned_date   DATE
  created_at      TIMESTAMP DEFAULT NOW()
  created_by      UUID REFERENCES users(id)

-- SSL Certificates
ssl_certificates
  id              UUID PRIMARY KEY
  domain_name     VARCHAR(255) NOT NULL
  san_domains     TEXT[]        -- Subject Alternative Names
  issuer          VARCHAR(100)  -- Let's Encrypt, DigiCert, Comodo...
  issue_date      DATE
  expire_date     DATE NOT NULL
  certificate_type VARCHAR(50)  -- DV, OV, EV, wildcard
  auto_renew      BOOLEAN DEFAULT false
  managed_by      VARCHAR(100)
  notes           TEXT
  created_at      TIMESTAMP DEFAULT NOW()
  updated_at      TIMESTAMP DEFAULT NOW()
  created_by      UUID REFERENCES users(id)
```

---

### 3.6 Module Inventory – Hard Assets

```sql
-- Thiết bị phần cứng
hardware_assets
  id              UUID PRIMARY KEY
  asset_code      VARCHAR(100) UNIQUE NOT NULL  -- mã tài sản tự sinh
  asset_name      VARCHAR(255) NOT NULL
  asset_type      VARCHAR(100)  -- máy tính, laptop, server, switch, router, AP, máy in, điện thoại...
  brand           VARCHAR(100)
  model           VARCHAR(100)
  serial_number   VARCHAR(100) UNIQUE
  spec            TEXT          -- cấu hình chi tiết
  purchase_date   DATE
  purchase_price  DECIMAL(18,2)
  vendor_id       UUID REFERENCES vendors(id)
  warranty_expire DATE
  location        VARCHAR(255)
  department      VARCHAR(100)
  assigned_to     VARCHAR(255)
  assigned_date   DATE
  status          ENUM('in_use','in_storage','repairing','broken','disposed')
  notes           TEXT
  created_at      TIMESTAMP DEFAULT NOW()
  created_by      UUID REFERENCES users(id)

-- Lịch sử gán/thu hồi thiết bị
asset_assignments
  id              UUID PRIMARY KEY
  asset_id        UUID REFERENCES hardware_assets(id)
  assigned_to     VARCHAR(255)
  department      VARCHAR(100)
  assigned_date   DATE
  returned_date   DATE
  handed_by       UUID REFERENCES users(id)
  notes           TEXT

-- Lịch sử bảo trì
asset_maintenance_logs
  id              UUID PRIMARY KEY
  asset_id        UUID REFERENCES hardware_assets(id)
  maintenance_date DATE
  maintenance_type VARCHAR(100)  -- định kỳ, sửa chữa, nâng cấp
  description     TEXT
  vendor          VARCHAR(100)
  cost            DECIMAL(18,2)
  performed_by    VARCHAR(100)
  created_at      TIMESTAMP DEFAULT NOW()
  created_by      UUID REFERENCES users(id)
```

---

### 3.7 Module Infrastructure Management

```sql
-- Tài nguyên hạ tầng
infra_resources
  id              UUID PRIMARY KEY
  name            VARCHAR(255) NOT NULL
  type            ENUM('server','vm','database','hosting','firewall','switch','access_point','load_balancer','nas','other')
  hostname        VARCHAR(255)
  ip_address      VARCHAR(45)
  os              VARCHAR(100)
  cpu             VARCHAR(50)
  ram             VARCHAR(50)
  storage         VARCHAR(100)
  location        VARCHAR(255)  -- datacenter, rack, vị trí vật lý
  environment     ENUM('production','staging','testing','development')
  status          ENUM('running','stopped','maintenance','decommissioned')
  managed_by      VARCHAR(100)
  description     TEXT
  expire_date     DATE
  notes           TEXT
  created_at      TIMESTAMP DEFAULT NOW()
  created_by      UUID REFERENCES users(id)

-- Quản lý địa chỉ IP
ip_addresses
  id              UUID PRIMARY KEY
  ip_address      VARCHAR(45) UNIQUE NOT NULL
  subnet          VARCHAR(50)
  vlan_id         UUID REFERENCES vlans(id)
  resource_id     UUID REFERENCES infra_resources(id)
  status          ENUM('available','in_use','reserved','deprecated')
  assigned_to     VARCHAR(255)
  hostname        VARCHAR(255)
  notes           TEXT
  created_at      TIMESTAMP DEFAULT NOW()
  updated_at      TIMESTAMP DEFAULT NOW()

-- Quản lý VLAN
vlans
  id              UUID PRIMARY KEY
  vlan_id         INTEGER UNIQUE NOT NULL
  name            VARCHAR(100)
  description     TEXT
  subnet          VARCHAR(50)
  gateway         VARCHAR(45)
  purpose         TEXT
  created_at      TIMESTAMP DEFAULT NOW()
  updated_at      TIMESTAMP DEFAULT NOW()

-- Sơ đồ mạng
network_diagrams
  id              UUID PRIMARY KEY
  name            VARCHAR(255)
  description     TEXT
  file_url        VARCHAR(500)
  file_name       VARCHAR(255)
  version         VARCHAR(50)
  is_current      BOOLEAN DEFAULT false
  uploaded_at     TIMESTAMP DEFAULT NOW()
  uploaded_by     UUID REFERENCES users(id)

-- Tài khoản admin hệ thống
system_admin_accounts
  id              UUID PRIMARY KEY
  system_name     VARCHAR(255) NOT NULL
  username        VARCHAR(255) NOT NULL
  role            VARCHAR(100)
  status          ENUM('active','inactive','locked')
  owner           VARCHAR(100)
  last_changed    DATE
  notes           TEXT
  created_at      TIMESTAMP DEFAULT NOW()
  updated_at      TIMESTAMP DEFAULT NOW()
  created_by      UUID REFERENCES users(id)
  UNIQUE(system_name, username)

-- Môi trường vận hành
environments
  id              UUID PRIMARY KEY
  name            ENUM('production','staging','testing','development')
  description     TEXT
  color           VARCHAR(20)  -- màu hiển thị UI
  notes           TEXT
  created_at      TIMESTAMP DEFAULT NOW()
  updated_at      TIMESTAMP DEFAULT NOW()

-- Ứng dụng nội bộ đang vận hành
internal_applications
  id              UUID PRIMARY KEY
  name            VARCHAR(255) NOT NULL
  description     TEXT
  url             VARCHAR(500)
  environment_id  UUID REFERENCES environments(id)
  status          ENUM('running','stopped','maintenance','deprecated')
  tech_stack      VARCHAR(255)
  pic_name        VARCHAR(100)   -- người phụ trách
  pic_contact     VARCHAR(100)
  infra_resources UUID[]  -- danh sách resource liên quan
  go_live_date    DATE
  notes           TEXT
  created_at      TIMESTAMP DEFAULT NOW()
  updated_at      TIMESTAMP DEFAULT NOW()
  created_by      UUID REFERENCES users(id)

-- User theo từng hệ thống
application_users
  id              UUID PRIMARY KEY
  application_id  UUID REFERENCES internal_applications(id)
  username        VARCHAR(255)
  display_name    VARCHAR(255)
  email           VARCHAR(255)
  role            VARCHAR(100)
  status          ENUM('active','inactive','locked')
  last_login      DATE
  notes           TEXT
  created_at      TIMESTAMP DEFAULT NOW()
  updated_at      TIMESTAMP DEFAULT NOW()
```

---

### 3.8 Bảng cấu hình danh mục

```sql
-- Danh mục dùng chung
categories
  id              UUID PRIMARY KEY
  module          VARCHAR(50)   -- 'budget','cost','vendor','asset','infra'
  type            VARCHAR(50)   -- loại danh mục trong module
  code            VARCHAR(50)   -- mã danh mục
  name            VARCHAR(255) NOT NULL
  description     TEXT
  is_active       BOOLEAN DEFAULT true
  sort_order      INTEGER DEFAULT 0
  created_at      TIMESTAMP DEFAULT NOW()
  updated_at      TIMESTAMP DEFAULT NOW()

-- Cài đặt hệ thống
system_settings
  id              UUID PRIMARY KEY
  key             VARCHAR(100) UNIQUE NOT NULL
  value           TEXT
  description     TEXT
  updated_at      TIMESTAMP DEFAULT NOW()
  updated_by      UUID REFERENCES users(id)
```

---

### 3.9 Module Project Budget

```sql
-- Dự án IT
projects
  id              UUID PRIMARY KEY
  code            VARCHAR(50) UNIQUE NOT NULL  -- mã dự án
  name            VARCHAR(255) NOT NULL
  description     TEXT
  start_date      DATE
  end_date        DATE
  department      VARCHAR(100)  -- bộ phận phụ trách
  status          ENUM('active','closed') DEFAULT 'active'
  notes           TEXT
  created_at      TIMESTAMP DEFAULT NOW()
  created_by      UUID REFERENCES users(id)
```

> **Liên kết với các bảng khác:**
> - `budget_items.project_id` → phân bổ ngân sách kế hoạch theo dự án
> - `actual_costs.project_id` → ghi nhận chi phí thực tế theo dự án
>
> **View tổng hợp ngân sách theo dự án:**
> ```sql
> -- VIEW: project_budget_summary
> -- Cột: project_id, project_code, project_name,
> --        planned_budget   (SUM budget_items.annual_amount WHERE project_id = X),
> --        actual_cost      (SUM actual_costs.amount WHERE project_id = X),
> --        remaining        (planned_budget - actual_cost),
> --        usage_percent    (actual_cost / planned_budget * 100)
> ```

---

### 3.10 Module Vehicle Cost Management

```sql
-- Danh mục xe
vehicles
  id              UUID PRIMARY KEY
  license_plate   VARCHAR(20) UNIQUE NOT NULL  -- biển số xe
  brand           VARCHAR(100)
  model           VARCHAR(100)
  year            INTEGER
  type            VARCHAR(50)       -- sedan, suv, truck, van, motorcycle...
  fuel_type       VARCHAR(30)       -- xăng, dầu, điện
  color           VARCHAR(30)
  vin             VARCHAR(50)
  mileage         INTEGER DEFAULT 0
  status          ENUM('active','maintenance','disposed') DEFAULT 'active'
  assigned_to     VARCHAR(255)      -- người phụ trách
  insurance_expiry DATE
  registration_expiry DATE
  cost            DECIMAL(15,2)     -- giá trị xe
  notes           TEXT
  vendor_id       UUID REFERENCES vendors(id)
  created_by_id   UUID REFERENCES users(id)
  created_at      TIMESTAMP DEFAULT NOW()
  updated_at      TIMESTAMP DEFAULT NOW()
  deleted_at      TIMESTAMP         -- soft delete

-- Danh mục dịch vụ (master list — cả cố định và biến đổi)
vehicle_services
  id              UUID PRIMARY KEY
  name            VARCHAR(255) NOT NULL    -- GPS, Camera, SIM, Thay dầu, Sửa lốp...
  description     TEXT
  cost_type       VARCHAR(20) DEFAULT 'fixed'  -- 'fixed' hoặc 'variable'
  frequency       ENUM('monthly','quarterly','yearly','one_time') DEFAULT 'monthly'
  default_cost    DECIMAL(15,2)    -- giá mặc định (dùng auto-fill khi gắn subscription)
  is_active       BOOLEAN DEFAULT true
  created_at      TIMESTAMP DEFAULT NOW()
  updated_at      TIMESTAMP DEFAULT NOW()

-- Subscription: gắn dịch vụ cố định vào xe
vehicle_service_subscriptions
  id              UUID PRIMARY KEY
  vehicle_id      UUID REFERENCES vehicles(id)
  service_id      UUID REFERENCES vehicle_services(id)
  monthly_cost    DECIMAL(15,2) NOT NULL  -- chi phí/tháng (có thể khác default_cost)
  start_date      DATE NOT NULL
  end_date        DATE             -- NULL = đang active, có giá trị = đã kết thúc
  is_active       BOOLEAN DEFAULT true
  notes           TEXT
  created_by_id   UUID REFERENCES users(id)
  created_at      TIMESTAMP DEFAULT NOW()
  updated_at      TIMESTAMP DEFAULT NOW()
  INDEX(vehicle_id)
  INDEX(service_id)
  INDEX(is_active)

-- Chi phí biến đổi: chi phí phát sinh 1 lần cho xe
vehicle_variable_costs
  id              UUID PRIMARY KEY
  vehicle_id      UUID REFERENCES vehicles(id)
  service_id      UUID REFERENCES vehicle_services(id)  -- dịch vụ biến đổi
  amount          DECIMAL(15,2) NOT NULL
  date            DATE NOT NULL
  mileage_at_service INTEGER       -- km lúc bảo dưỡng
  notes           TEXT
  created_by_id   UUID REFERENCES users(id)
  created_at      TIMESTAMP DEFAULT NOW()
  updated_at      TIMESTAMP DEFAULT NOW()
```

> **Tính tổng chi phí cố định/tháng:**
> ```sql
> -- Tổng cố định/tháng = SUM(monthly_cost) WHERE is_active = true
> SELECT SUM(monthly_cost) AS fixed_monthly_total
> FROM vehicle_service_subscriptions
> WHERE vehicle_id = :id AND is_active = true;
> ```
>
> **View tổng hợp chi phí từng xe/tháng** (cho dashboard và báo cáo):
> ```sql
> -- VIEW: vehicle_monthly_cost_summary
> -- Cột: vehicle_id, license_plate, year, month,
> --        fixed_cost      (SUM subscriptions active trong tháng),
> --        variable_cost   (SUM vehicle_variable_costs),
> --        total_cost      (fixed_cost + variable_cost)
> ```

---

### 3.11 Module Cost Forecast (Dự chi)

```sql
-- Bảng dự chi hàng tháng
cost_forecasts
  id              UUID PRIMARY KEY
  year            INTEGER NOT NULL
  month           INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12)
  name            VARCHAR(255)  -- tên bảng dự chi, ví dụ: "Dự chi tháng 4/2026"
  total_amount    DECIMAL(18,2) DEFAULT 0  -- tự tính từ tổng items
  currency        VARCHAR(10) DEFAULT 'VND'
  status          ENUM('draft','pending','approved','rejected','closed') DEFAULT 'draft'
  approved_by     UUID REFERENCES users(id)
  approved_at     TIMESTAMP
  reject_reason   TEXT
  notes           TEXT
  created_at      TIMESTAMP DEFAULT NOW()
  updated_at      TIMESTAMP DEFAULT NOW()
  created_by      UUID REFERENCES users(id)
  UNIQUE(year, month)  -- mỗi tháng chỉ có 1 bảng dự chi

-- Chi tiết các khoản dự chi
cost_forecast_items
  id              UUID PRIMARY KEY
  forecast_id     UUID REFERENCES cost_forecasts(id) ON DELETE CASCADE
  category_id     UUID REFERENCES categories(id)
  item_name       VARCHAR(255) NOT NULL
  description     TEXT
  estimated_amount DECIMAL(18,2) NOT NULL
  vendor_id       UUID REFERENCES vendors(id)  -- NCC dự kiến
  project_id      UUID REFERENCES projects(id)  -- dự án liên quan
  priority        ENUM('critical','high','medium','low') DEFAULT 'medium'
  notes           TEXT
  sort_order      INTEGER DEFAULT 0
  created_at      TIMESTAMP DEFAULT NOW()
  updated_at      TIMESTAMP DEFAULT NOW()
  created_by      UUID REFERENCES users(id)

-- Lịch sử phê duyệt dự chi
cost_forecast_history
  id              UUID PRIMARY KEY
  forecast_id     UUID REFERENCES cost_forecasts(id)
  action          VARCHAR(50)  -- 'submit','approve','reject','resubmit'
  comment         TEXT
  performed_by    UUID REFERENCES users(id)
  performed_at    TIMESTAMP DEFAULT NOW()
```

> **View so sánh dự chi vs thực tế:**
> ```sql
> -- VIEW: forecast_vs_actual_monthly
> -- Cột: year, month,
> --        forecast_total  (SUM cost_forecast_items.estimated_amount),
> --        actual_total    (SUM actual_costs.amount WHERE expense_date IN month/year),
> --        variance        (forecast_total - actual_total),
> --        accuracy_pct    (actual_total / forecast_total * 100)
> ```

---

## 4. ĐẶC TẢ API (REST API)

### 4.1 Quy ước chung

- Base URL: `/api/v1`
- Authentication: `Authorization: Bearer <JWT_TOKEN>`
- Content-Type: `application/json`
- Phân trang: `?page=1&limit=20&sortBy=createdAt&sortOrder=desc`
- Tìm kiếm: `?search=keyword`
- Lọc: `?status=active&type=server`

### 4.2 Authentication APIs

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/v1/auth/login` | Đăng nhập |
| POST | `/api/v1/auth/logout` | Đăng xuất |
| POST | `/api/v1/auth/refresh` | Làm mới token |
| POST | `/api/v1/auth/2fa/enable` | Bật 2FA |
| POST | `/api/v1/auth/2fa/verify` | Xác thực 2FA |
| POST | `/api/v1/auth/change-password` | Đổi mật khẩu |
| POST | `/api/v1/auth/forgot-password` | Quên mật khẩu |

**POST /api/v1/auth/login**
```json
Request:
{
  "email": "user@company.com",
  "password": "password123",
  "totp_code": "123456"  // bắt buộc nếu 2FA được bật
}

Response 200:
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "expires_in": 28800,
  "user": {
    "id": "uuid",
    "full_name": "Nguyễn Văn A",
    "email": "user@company.com",
    "role": "manager"
  }
}
```

---

### 4.3 Budget Planning APIs

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/v1/budget-plans` | Danh sách kế hoạch ngân sách |
| POST | `/api/v1/budget-plans` | Tạo kế hoạch mới |
| GET | `/api/v1/budget-plans/:id` | Chi tiết kế hoạch |
| PUT | `/api/v1/budget-plans/:id` | Cập nhật kế hoạch |
| DELETE | `/api/v1/budget-plans/:id` | Xóa kế hoạch (soft delete) |
| POST | `/api/v1/budget-plans/:id/submit` | Gửi phê duyệt |
| POST | `/api/v1/budget-plans/:id/approve` | Phê duyệt |
| POST | `/api/v1/budget-plans/:id/reject` | Từ chối |
| GET | `/api/v1/budget-plans/:id/history` | Lịch sử thay đổi |
| POST | `/api/v1/budget-plans/import` | Import từ Excel |
| GET | `/api/v1/budget-plans/:id/export` | Xuất Excel/PDF |

---

### 4.4 Cost Management APIs

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/v1/actual-costs` | Danh sách chi phí thực tế |
| POST | `/api/v1/actual-costs` | Thêm chi phí |
| GET | `/api/v1/actual-costs/:id` | Chi tiết chi phí |
| PUT | `/api/v1/actual-costs/:id` | Cập nhật |
| DELETE | `/api/v1/actual-costs/:id` | Xóa |
| POST | `/api/v1/actual-costs/:id/attachments` | Upload file hóa đơn |
| POST | `/api/v1/actual-costs/import` | Import từ Excel |
| GET | `/api/v1/actual-costs/export` | Xuất Excel |
| GET | `/api/v1/actual-costs/comparison` | So sánh kế hoạch vs thực tế |

---

### 4.5 Vendor & Contract APIs

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/v1/vendors` | Danh sách nhà cung cấp |
| POST | `/api/v1/vendors` | Thêm nhà cung cấp |
| GET | `/api/v1/vendors/:id` | Chi tiết |
| PUT | `/api/v1/vendors/:id` | Cập nhật |
| DELETE | `/api/v1/vendors/:id` | Xóa |
| GET | `/api/v1/contracts` | Danh sách hợp đồng |
| POST | `/api/v1/contracts` | Thêm hợp đồng |
| GET | `/api/v1/contracts/:id` | Chi tiết |
| PUT | `/api/v1/contracts/:id` | Cập nhật |
| DELETE | `/api/v1/contracts/:id` | Xóa |
| POST | `/api/v1/contracts/:id/attachments` | Upload file HĐ |
| GET | `/api/v1/contracts/expiring` | Danh sách sắp hết hạn |
| GET | `/api/v1/contracts/export` | Xuất Excel |

---

### 4.6 Inventory APIs

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/v1/inventory/emails` | Email accounts |
| POST | `/api/v1/inventory/emails` | Thêm |
| PUT | `/api/v1/inventory/emails/:id` | Sửa |
| DELETE | `/api/v1/inventory/emails/:id` | Xóa |
| GET | `/api/v1/inventory/domains` | Domains |
| POST | `/api/v1/inventory/domains` | Thêm |
| GET | `/api/v1/inventory/vps` | VPS servers |
| GET | `/api/v1/inventory/licenses` | Licenses |
| POST | `/api/v1/inventory/licenses/:id/assign` | Gán license |
| GET | `/api/v1/inventory/ssl` | SSL certificates |
| GET | `/api/v1/inventory/hardware` | Thiết bị phần cứng |
| POST | `/api/v1/inventory/hardware` | Thêm thiết bị |
| POST | `/api/v1/inventory/hardware/:id/assign` | Gán thiết bị |
| GET | `/api/v1/inventory/hardware/:id/history` | Lịch sử thiết bị |
| POST | `/api/v1/inventory/hardware/:id/maintenance` | Ghi bảo trì |
| POST | `/api/v1/inventory/hardware/import` | Import Excel |
| GET | `/api/v1/inventory/hardware/export` | Xuất Excel |
| GET | `/api/v1/inventory/expiring` | Tất cả items sắp hết hạn |

---

### 4.7 Infrastructure APIs

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/v1/infra/resources` | Danh sách tài nguyên |
| POST | `/api/v1/infra/resources` | Thêm |
| PUT | `/api/v1/infra/resources/:id` | Cập nhật |
| DELETE | `/api/v1/infra/resources/:id` | Xóa |
| GET | `/api/v1/infra/ip-addresses` | Quản lý IP |
| POST | `/api/v1/infra/ip-addresses` | Thêm IP |
| GET | `/api/v1/infra/vlans` | Danh sách VLAN |
| POST | `/api/v1/infra/vlans` | Thêm VLAN |
| GET | `/api/v1/infra/network-diagrams` | Sơ đồ mạng |
| POST | `/api/v1/infra/network-diagrams` | Upload sơ đồ |
| GET | `/api/v1/infra/admin-accounts` | Tài khoản admin |
| GET | `/api/v1/infra/environments` | Môi trường |
| GET | `/api/v1/infra/applications` | Ứng dụng nội bộ |
| POST | `/api/v1/infra/applications` | Thêm ứng dụng |
| GET | `/api/v1/infra/applications/:id/users` | Users của ứng dụng |

---

### 4.8 Dashboard & Report APIs

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/v1/dashboard/summary` | Tổng hợp KPI |
| GET | `/api/v1/dashboard/budget-overview` | Tổng quan ngân sách |
| GET | `/api/v1/dashboard/cost-trend` | Xu hướng chi phí |
| GET | `/api/v1/dashboard/alerts` | Danh sách cảnh báo |
| GET | `/api/v1/dashboard/asset-stats` | Thống kê tài sản |
| GET | `/api/v1/dashboard/vehicle-cost` | Tổng chi phí xe tháng hiện tại |
| GET | `/api/v1/dashboard/project-cost` | Chi phí theo dự án (pie chart) |
| GET | `/api/v1/reports/budget` | Báo cáo ngân sách |
| GET | `/api/v1/reports/cost-by-vendor` | Chi phí theo NCC |
| GET | `/api/v1/reports/cost-by-project` | Chi phí theo dự án |
| GET | `/api/v1/reports/inventory` | Báo cáo inventory |
| GET | `/api/v1/reports/contracts` | Báo cáo hợp đồng |
| GET | `/api/v1/reports/infrastructure` | Báo cáo hạ tầng |
| GET | `/api/v1/reports/vehicles` | Báo cáo chi phí xe |
| GET | `/api/v1/reports/*/export` | Xuất Excel/PDF |

---

### 4.9 Vehicle Cost Management APIs

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/v1/vehicles` | Danh sách xe |
| POST | `/api/v1/vehicles` | Thêm xe |
| GET | `/api/v1/vehicles/:id` | Chi tiết xe (kèm subscriptions + monthlyTotal) |
| PUT | `/api/v1/vehicles/:id` | Cập nhật xe |
| DELETE | `/api/v1/vehicles/:id` | Xóa xe |
| POST | `/api/v1/vehicles/import` | Import từ Excel |
| GET | `/api/v1/vehicles/export` | Xuất Excel |
| GET | `/api/v1/vehicles/:id/cost-summary` | Tổng hợp chi phí: fixed + variable + total |
| GET | `/api/v1/vehicle-services` | Danh mục dịch vụ (master list, lọc theo costType) |
| POST | `/api/v1/vehicle-services` | Tạo dịch vụ mới |
| PUT | `/api/v1/vehicle-services/:id` | Cập nhật dịch vụ |
| DELETE | `/api/v1/vehicle-services/:id` | Xóa dịch vụ |
| GET | `/api/v1/vehicle-subscriptions` | Danh sách subscription (lọc vehicleId, serviceId, isActive) |
| POST | `/api/v1/vehicle-subscriptions` | Gắn dịch vụ cố định vào xe |
| PUT | `/api/v1/vehicle-subscriptions/:id` | Cập nhật subscription |
| PATCH | `/api/v1/vehicle-subscriptions/:id/deactivate` | Hủy subscription (set endDate + isActive=false) |
| DELETE | `/api/v1/vehicle-subscriptions/:id` | Xóa subscription |
| GET | `/api/v1/vehicle-variable-costs` | Danh sách chi phí biến đổi |
| POST | `/api/v1/vehicle-variable-costs` | Thêm chi phí biến đổi |
| PUT | `/api/v1/vehicle-variable-costs/:id` | Cập nhật |
| DELETE | `/api/v1/vehicle-variable-costs/:id` | Xóa |
| POST | `/api/v1/vehicle-variable-costs/import` | Import hàng loạt từ Excel |
| GET | `/api/v1/vehicles/cost-summary` | Tổng hợp chi phí toàn bộ xe/tháng |
| GET | `/api/v1/vehicles/service-matrix` | Bảng ma trận dịch vụ × xe |
| GET | `/api/v1/vehicles/cost-comparison` | So sánh chi phí xe tháng này vs tháng trước |

---

### 4.10 Project Budget APIs

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/v1/projects` | Danh sách dự án |
| POST | `/api/v1/projects` | Tạo dự án |
| GET | `/api/v1/projects/:id` | Chi tiết dự án |
| PUT | `/api/v1/projects/:id` | Cập nhật dự án |
| DELETE | `/api/v1/projects/:id` | Xóa dự án |
| GET | `/api/v1/projects/:id/budget-summary` | Tổng quan ngân sách của 1 dự án |
| GET | `/api/v1/projects/budget-overview` | Tổng quan tất cả dự án (kế hoạch vs thực tế) |
| GET | `/api/v1/projects/export` | Xuất báo cáo ngân sách theo dự án ra Excel/PDF |

---

### 4.11 Activity Log APIs

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/v1/activity-logs` | Danh sách log (lọc: user, action, module, date_from, date_to, ip) |
| GET | `/api/v1/activity-logs/:id` | Chi tiết 1 bản ghi log (kèm before/after diff) |
| GET | `/api/v1/activity-logs/login-history` | Lịch sử đăng nhập (tất cả users – Admin only) |
| GET | `/api/v1/activity-logs/my-login-history` | Lịch sử đăng nhập của chính người dùng đang đăng nhập |
| GET | `/api/v1/activity-logs/export` | Xuất log ra Excel/CSV theo bộ lọc hiện tại |
| GET | `/api/v1/activity-logs/stats` | Thống kê hoạt động: top user, top module, số lần thất bại |
| GET | `/api/v1/activity-logs/retention-config` | Xem cấu hình lưu trữ log |
| PUT | `/api/v1/activity-logs/retention-config` | Cập nhật cấu hình lưu trữ log (Admin only) |

> **Lưu ý bảo mật:** Toàn bộ Activity Log APIs chỉ trả về dữ liệu mà người dùng được phép xem (kiểm tra server-side dựa trên role). Không có endpoint DELETE hay PATCH trên `audit_logs`.

---

### 4.12 Configuration APIs

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/v1/categories` | Danh sách danh mục (lọc theo module, type) |
| POST | `/api/v1/categories` | Tạo danh mục mới |
| PUT | `/api/v1/categories/:id` | Cập nhật danh mục |
| DELETE | `/api/v1/categories/:id` | Xóa danh mục (soft delete) |
| POST | `/api/v1/categories/import` | Import danh mục từ Excel |
| GET | `/api/v1/categories/export` | Xuất Excel |
| GET | `/api/v1/system-settings` | Lấy cài đặt hệ thống |
| PUT | `/api/v1/system-settings` | Cập nhật cài đặt |

---

### 4.13 User Management APIs

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/v1/users` | Danh sách người dùng |
| POST | `/api/v1/users` | Tạo người dùng mới |
| GET | `/api/v1/users/:id` | Chi tiết người dùng |
| PUT | `/api/v1/users/:id` | Cập nhật người dùng |
| DELETE | `/api/v1/users/:id` | Vô hiệu hóa người dùng (soft delete) |
| GET | `/api/v1/users/:id/permissions` | Lấy quyền của người dùng |
| PUT | `/api/v1/users/:id/permissions` | Cập nhật quyền |
| POST | `/api/v1/users/:id/lock` | Khóa tài khoản |
| POST | `/api/v1/users/:id/unlock` | Mở khóa tài khoản |
| POST | `/api/v1/users/:id/reset-password` | Reset mật khẩu |

---

### 4.14 Cost Forecast APIs

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/v1/cost-forecasts` | Danh sách bảng dự chi (lọc: year, month, status) |
| POST | `/api/v1/cost-forecasts` | Tạo bảng dự chi mới |
| GET | `/api/v1/cost-forecasts/:id` | Chi tiết bảng dự chi kèm items |
| PUT | `/api/v1/cost-forecasts/:id` | Cập nhật bảng dự chi |
| DELETE | `/api/v1/cost-forecasts/:id` | Xóa bảng dự chi (chỉ trạng thái draft) |
| POST | `/api/v1/cost-forecasts/:id/submit` | Gửi phê duyệt |
| POST | `/api/v1/cost-forecasts/:id/approve` | Phê duyệt |
| POST | `/api/v1/cost-forecasts/:id/reject` | Từ chối (kèm lý do) |
| POST | `/api/v1/cost-forecasts/:id/clone` | Sao chép sang tháng mới |
| GET | `/api/v1/cost-forecasts/:id/history` | Lịch sử phê duyệt |
| POST | `/api/v1/cost-forecasts/import` | Import từ Excel |
| GET | `/api/v1/cost-forecasts/:id/export` | Xuất Excel/PDF |
| GET | `/api/v1/cost-forecasts/yearly-summary` | Tổng hợp dự chi 12 tháng |
| GET | `/api/v1/cost-forecasts/vs-actual` | So sánh dự chi vs thực tế (lọc: year, month, category) |

---

## 5. ĐẶC TẢ CHỨC NĂNG CHI TIẾT

### 5.1 Hệ thống cảnh báo (Alert Engine)

**Trigger:** Chạy cron job mỗi ngày lúc 7:00 sáng

**Logic:**
```
-- Part 1: Kiểm tra hết hạn tài sản / hợp đồng
FOR each item IN (domains, ssl_certificates, contracts, software_licenses, vps_servers,
                  email_accounts, vehicle_services):
  days_remaining = expire_date - TODAY
  IF days_remaining IN [90, 60, 30, 14, 7, 3, 1, 0]:
    CREATE alert_notification (type = '<entity>_expiry', severity based on days)
    SEND email to responsible persons
    PUSH in-app notification

-- Part 2: Kiểm tra chi phí biến đổi xe vượt ngưỡng
FOR each vehicle IN vehicles WHERE status = 'active':
  FOR each cost_type IN vehicle_variable_cost_types WHERE is_active = true:
    current_month_total = SUM(vehicle_variable_costs WHERE vehicle=vehicle, month=THIS_MONTH)
    threshold = COALESCE(vehicle_cost_thresholds.monthly_threshold, cost_type.alert_threshold)
    IF current_month_total > threshold:
      CREATE alert_notification (type = 'vehicle_cost_exceeded', severity = 'warning')
      SEND email to vehicle pic_contact
      PUSH in-app notification
```

**Bảng thông báo cảnh báo:**
```sql
alert_notifications
  id              UUID PRIMARY KEY
  type            VARCHAR(100)  -- 'domain_expiry','ssl_expiry','contract_expiry','license_expiry',
                                --  'budget_exceeded','vehicle_cost_exceeded','project_budget_exceeded'
  reference_id    UUID
  reference_type  VARCHAR(50)
  title           VARCHAR(255)
  message         TEXT
  severity        ENUM('info','warning','critical')
  is_read         BOOLEAN DEFAULT false
  read_by         UUID REFERENCES users(id)
  read_at         TIMESTAMP
  created_at      TIMESTAMP DEFAULT NOW()
```

> **Note – Activity Log vs alert_notifications:**  
> `audit_logs` (section 3.1) là bảng ghi nhận mọi thao tác của user (append-only, không xóa được).  
> `alert_notifications` là bảng thông báo cảnh báo được tạo bởi Alert Engine.  
> Module Activity Log (section 4.11) chỉ là **UI trên `audit_logs`**, không tạo bảng mới.

---

### 5.2 Chức năng Import/Export

**Import Excel:**
1. User download template Excel từ hệ thống
2. User nhập dữ liệu vào template (không thay đổi cấu trúc cột)
3. User upload file lên hệ thống
4. Backend validate từng dòng:
   - Thiếu trường bắt buộc → báo lỗi kèm số dòng
   - Giá trị không hợp lệ (sai định dạng ngày, âm tiền...) → báo lỗi
   - Trùng lặp dữ liệu → cảnh báo
5. Nếu có lỗi: trả về file báo cáo lỗi (highlight dòng lỗi)
6. Nếu không lỗi: import và trả về số bản ghi đã import

**Export Excel/PDF:**
- Excel: dựa trên bộ lọc hiện tại của màn hình danh sách
- PDF: sử dụng Puppeteer render HTML → PDF
- Tên file: `[module]_[YYYY-MM-DD].xlsx`

---

### 5.3 Phân quyền chi tiết (RBAC)

| Module | Admin | Manager | Staff | Finance | Viewer |
|--------|-------|---------|-------|---------|--------|
| Budget | Full | Full | View+Create | View | View |
| Cost | Full | Full | View+Create | View+Export | View |
| Vendor | Full | Full | View | View | View |
| Contract | Full | Full | View | View | View |
| Inventory | Full | View+Edit | View+Edit | View | View |
| Infrastructure | Full | View+Edit | View | - | View |
| Vehicle Cost | Full | Full | View+Import | View+Export | View |
| Project Budget | Full | Full | View+Create | View+Export | View |
| Cost Forecast | Full | Full (approve) | View+Create | View+Export | View |
| Activity Log | Full (all users) | Own module logs | Own module logs | Own section | Login history only |
| Report | Full | Full | View | View+Export | View |
| Config | Full | View | - | - | - |
| Users | Full | View | - | - | - |

---

### 5.4 Quy trình phê duyệt ngân sách

```
Trạng thái: draft → pending_approval → approved (hoặc rejected → draft)

Điều kiện chuyển trạng thái:
- draft → pending_approval: IT Staff/Manager bấm "Gửi phê duyệt"
- pending_approval → approved: IT Manager/Admin bấm "Phê duyệt"
- pending_approval → rejected: IT Manager/Admin bấm "Từ chối" + nhập lý do
- rejected → draft: tự động, người tạo có thể sửa và gửi lại
- approved → in_progress: khi có chi phí thực tế được ghi nhận với kế hoạch này
```

---

## 6. YÊU CẦU PHI CHỨC NĂNG (ĐẶC TẢ KỸ THUẬT)

### 6.1 Bảo mật

| ID | Yêu cầu | Chi tiết |
|----|---------|---------|
| SEC-01 | HTTPS | Toàn bộ traffic qua TLS 1.2+ |
| SEC-02 | Mật khẩu | bcrypt, cost factor ≥ 12 |
| SEC-03 | JWT | Access token 8h, Refresh token 7 ngày |
| SEC-04 | 2FA | TOTP (RFC 6238), mã 30 giây |
| SEC-05 | Rate limiting | 100 req/min mỗi IP |
| SEC-06 | File upload | Giới hạn 10MB/file, chỉ PDF/Excel/PNG/JPG |
| SEC-07 | SQL Injection | Sử dụng ORM, không raw query |
| SEC-08 | XSS | Sanitize input, Content-Security-Policy header |
| SEC-09 | Audit Log | Mọi create/update/delete đều ghi log |

### 6.2 Hiệu năng

| ID | Chỉ tiêu | Giá trị |
|----|---------|---------|
| PERF-01 | API response time | P95 < 500ms |
| PERF-02 | Tải trang đầu | < 3 giây |
| PERF-03 | Export 10,000 bản ghi | < 30 giây |
| PERF-04 | Import 1,000 bản ghi | < 60 giây |
| PERF-05 | Concurrent users | 50 users mà không giảm hiệu năng |

### 6.3 Độ tin cậy

| ID | Chỉ tiêu | Giá trị |
|----|---------|---------|
| REL-01 | Uptime | ≥ 99.5%/tháng |
| REL-02 | Backup DB | Hàng ngày lúc 2:00 AM, giữ 30 ngày |
| REL-03 | Backup Files | Hàng ngày, đồng bộ offsite |
| REL-04 | RTO | < 4 giờ |
| REL-05 | RPO | < 24 giờ |

### 6.4 Index Recommendations

Các bảng có lượng dữ liệu lớn cần được đánh index để đảm bảo hiệu năng query:

| Bảng | Cột cần index | Lý do |
|-------|--------------|-------|
| `audit_logs` | `user_id, created_at` | Lọc log theo user và khoảng thời gian |
| `audit_logs` | `module, action` | Lọc theo module và loại hành động |
| `audit_logs` | `created_at` | Archive và phân trang theo thời gian |
| `actual_costs` | `budget_item_id, expense_date` | Báo cáo chi phí theo hạng mục và kỳ |
| `actual_costs` | `project_id` | Tổng hợp chi phí theo dự án |
| `vehicle_variable_costs` | `vehicle_id, year, month` | Query chi phí xe theo tháng |
| `vehicle_variable_costs` | `cost_type_id` | Lọc theo loại chi phí biến đổi |
| `vehicle_services` | `vehicle_id, status` | Danh sách dịch vụ active theo xe |
| `budget_items` | `plan_id, project_id` | Tổng hợp ngân sách theo dự án |
| `contracts` | `end_date, status` | Cảnh báo hết hạn hợp đồng |
| `cost_forecasts` | `year, month, status` | Query dự chi theo tháng và trạng thái |
| `cost_forecast_items` | `forecast_id, category_id` | Tổng hợp dự chi theo hạng mục |
| `alert_notifications` | `is_read, created_at` | Danh sách cảnh báo chưa đọc |

---

## 7. KIỂM THỬ (TESTING REQUIREMENTS)

### 7.1 Phân loại kiểm thử

| Loại | Công cụ | Mục tiêu |
|------|---------|---------|
| Unit Test | Jest | Coverage ≥ 80% (backend) |
| Integration Test | Jest + Supertest | Tất cả API endpoints |
| E2E Test | Playwright/Cypress | Luồng nghiệp vụ chính |
| Performance Test | Artillery/k6 | 50 concurrent users |
| Security Test | OWASP ZAP | OWASP Top 10 |

### 7.2 Các test case quan trọng

**TC-01: Đăng nhập và phân quyền**
- Đăng nhập thành công với đúng credential
- Đăng nhập thất bại với sai mật khẩu → cảnh báo
- Khoá tài khoản sau 5 lần thất bại
- User không đủ quyền → HTTP 403

**TC-02: Ngân sách**
- Tạo kế hoạch ngân sách và gửi phê duyệt
- Phê duyệt và từ chối ngân sách
- Import từ file Excel đúng/sai template
- Tổng hạng mục theo quý = tổng năm

**TC-03: Cảnh báo hết hạn**
- Domain hết hạn trong 30 ngày → cảnh báo xuất hiện trong dashboard
- Email cảnh báo được gửi đúng người

**TC-04: Import/Export**
- Import 100 bản ghi trong < 30 giây
- Export 5,000 bản ghi ra Excel không lỗi
- File import sai định dạng → trả về file báo lỗi chi tiết

---

## 8. TRIỂN KHAI & CÀI ĐẶT

### 8.1 Môi trường

| Môi trường | Mục đích | URL |
|-----------|---------|-----|
| Development | Phát triển local | http://localhost:3000 |
| Staging | Kiểm thử UAT | https://itms-staging.company.com |
| Production | Vận hành thực | https://itms.company.com |

### 8.2 Docker Compose (Development)

```yaml
services:
  frontend:
    build: ./frontend
    ports: ["3000:3000"]
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:4000/api/v1

  backend:
    build: ./backend
    ports: ["4000:4000"]
    environment:
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/itms
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=your-secret-key
      - MINIO_ENDPOINT=minio:9000
      - LOG_RETENTION_MONTHS=12

  postgres:
    image: postgres:16-alpine
    environment:
      - POSTGRES_DB=itms
      - POSTGRES_PASSWORD=password
    volumes: ["postgres_data:/var/lib/postgresql/data"]

  redis:
    image: redis:7-alpine

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    ports: ["9000:9000", "9001:9001"]

volumes:
  postgres_data:
```

---

## 7b. YÊU CẦU KỸ THUẬT XUYENSE MODULE (Cross-cutting v1.6)

### 7b.1 Schema Migration — Fix broken FKs

```sql
-- Migration: actual_costs thêm vendor_id FK (GIỮ LẠI vendor string cho backward compatibility)
ALTER TABLE actual_costs ADD COLUMN vendor_id UUID REFERENCES vendors(id);
-- Data migration: match existing vendor text to vendor IDs
UPDATE actual_costs ac SET vendor_id = v.id FROM vendors v WHERE LOWER(ac.vendor) = LOWER(v.name);
-- LƯU Ý: KHÔNG DROP COLUMN vendor — giữ lại cho backward compatibility
-- Frontend hiển thị: vendorRef?.name || vendor || "—" (ưu tiên relation, fallback string cũ)
-- Index cho vendor_id
CREATE INDEX idx_actual_costs_vendor_id ON actual_costs(vendor_id);

-- Migration: actual_costs.category_name VARCHAR → category_id FK (requires categories table)
CREATE TABLE categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(255) NOT NULL UNIQUE,
  module      VARCHAR(50) DEFAULT 'cost',
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMP DEFAULT NOW()
);
ALTER TABLE actual_costs ADD COLUMN category_id UUID REFERENCES categories(id);

-- Migration: cost_forecast_items.vendor VARCHAR → vendor_id FK
ALTER TABLE cost_forecast_items ADD COLUMN vendor_id UUID REFERENCES vendors(id);
UPDATE cost_forecast_items fi SET vendor_id = v.id FROM vendors v WHERE LOWER(fi.vendor) = LOWER(v.name);
ALTER TABLE cost_forecast_items DROP COLUMN vendor;

-- Migration: assigned_to VARCHAR → assigned_to_id FK (hardware_assets, ip_addresses, vehicles, email_accounts)
ALTER TABLE hardware_assets ADD COLUMN assigned_to_id UUID REFERENCES users(id);
ALTER TABLE ip_addresses ADD COLUMN assigned_to_id UUID REFERENCES users(id);
ALTER TABLE vehicles ADD COLUMN assigned_to_id UUID REFERENCES users(id);
ALTER TABLE email_accounts ADD COLUMN assigned_to_id UUID REFERENCES users(id);
```

### 7b.2 Shared Frontend Components

| Component | Props | Data Source | Dùng tại |
|-----------|-------|-------------|----------|
| `<VendorSelect>` | `value`, `onChange`, `required` | `GET /vendors?status=active&limit=100` | Cost, Soft Inv, Hard Inv, Vehicle, Forecast |
| `<ContractSelect>` | `value`, `onChange`, `vendorId` (cascade) | `GET /contracts?vendorId=X&status=active` | Soft Inv, Hard Inv |
| `<ProjectSelect>` | `value`, `onChange` | `GET /projects?status=active` | Budget Item, Cost, Forecast |
| `<CategorySelect>` | `value`, `onChange` | `GET /categories` | Cost create |
| `<UserSelect>` | `value`, `onChange` | `GET /users?status=active` | Hard Inv (assignedTo), IP, Vehicle |
| `<CurrencyInput>` | `value`, `onChange`, `currency` | N/A (local format) | Budget, Cost, Contract, Vehicle, Forecast |
| `<FileUpload>` | `entityType`, `entityId`, `onUpload` | `POST /files/upload` (MinIO) | Vendor, Contract, Cost |
| `<ExportButton>` | `endpoint`, `filename`, `filters` | `GET /{module}/export` | All list pages |

### 7b.3 New/Updated API Endpoints

```
# Category Management (for cost category dropdown)
GET    /api/v1/categories          -- List all categories
POST   /api/v1/categories          -- Create category
PATCH  /api/v1/categories/:id      -- Update category
DELETE /api/v1/categories/:id      -- Delete category

# Contract Status Management
PATCH  /api/v1/contracts/:id/status  -- Change contract status {status: 'active'|'expired'|'terminated'}

# Budget Admin Revert
PATCH  /api/v1/budget-plans/:id/revert  -- Admin revert approved → draft

# File Upload (MinIO)
POST   /api/v1/files/upload        -- Upload file (multipart)
GET    /api/v1/files/:id            -- Download file
DELETE /api/v1/files/:id            -- Delete file

# Export Excel
GET    /api/v1/budget-plans/export   -- Export budget plans
GET    /api/v1/actual-costs/export   -- Export costs
GET    /api/v1/vendors/export        -- Export vendors
GET    /api/v1/contracts/export      -- Export contracts
GET    /api/v1/soft-inventory/{type}/export  -- Export soft assets
GET    /api/v1/hard-inventory/{type}/export  -- Export hard assets
GET    /api/v1/vehicles/export       -- Export vehicles
GET    /api/v1/cost-forecasts/:id/export  -- Export forecast
GET    /api/v1/audit-logs/export     -- Export activity logs
```

### 7b.4 Number Formatting Rules

- **Input:** `<CurrencyInput>` sử dụng `Intl.NumberFormat('vi-VN')` hiển thị `1.000.000`, lưu raw number `1000000`
- **Display:** Tất cả số tiền hiển thị sử dụng `formatCurrency()` utility: `1.000.000 đ`
- **API:** Luôn lưu và trả về raw number (không format)

### 7b.5 Edit/Revert Rules

- Tất cả entity đều có endpoint `PATCH /api/v1/{entity}/:id`
- Form edit reuse create form với pre-fill data
- Budget Plan revert: chỉ Admin, `PATCH /budget-plans/:id/revert`, ghi audit log, status `approved` → `draft`
- Cost Forecast revert: tương tự, `PATCH /cost-forecasts/:id/revert`

---

## 9. PHỤ LỤC

### 9.1 Template Excel Import

Mỗi module có file template Excel riêng đặt tại `templates/`:
- `template_budget_items.xlsx`  *(có cột Dự án)*
- `template_actual_costs.xlsx`  *(có cột Dự án)*
- `template_vendors.xlsx`
- `template_contracts.xlsx`
- `template_email_accounts.xlsx`
- `template_domains.xlsx`
- `template_vps_servers.xlsx`
- `template_software_licenses.xlsx`
- `template_ssl_certificates.xlsx`
- `template_hardware_assets.xlsx`
- `template_infra_resources.xlsx`
- `template_ip_addresses.xlsx`
- `template_vehicles.xlsx`
- `template_vehicle_variable_costs.xlsx`  *(import từ file xuất của nhà cung cấp ZNS/SMS)*
- `template_projects.xlsx`
- `template_cost_forecast_items.xlsx`  *(import dự chi hàng tháng)*

### 9.2 Ma trận nghiệp vụ vs yêu cầu

| Module | BR IDs | User Story IDs |
|--------|--------|----------------|
| Budget Planning | BR-01 đến BR-07 | US-B01 đến US-B06 |
| Cost Management | BR-08 đến BR-14 | US-C01 đến US-C05 |
| Vendor & Contract | BR-15 đến BR-21 | US-V01 đến US-V05 |
| Soft Inventory | BR-22 đến BR-27 | US-S01 đến US-S06 |
| Hard Inventory | BR-28 đến BR-33 | US-H01 đến US-H05 |
| Access Control | BR-34 đến BR-39 | US-A01 đến US-A05 |
| Infrastructure | BR-40 đến BR-46 | US-I01 đến US-I07 |
| Dashboard | BR-51 đến BR-57 | US-D01 đến US-D07 |
| Report | BR-58 đến BR-68 | US-R01 đến US-R08 |
| Vehicle Cost | BR-VCM-01 đến BR-VCM-13 | US-VCM01 đến US-VCM11 |
| Project Budget | BR-PRJ-01 đến BR-PRJ-07 | US-P01 đến US-P06 |
| Activity Log | BR-LOG-01 đến BR-LOG-09 | US-AL01 đến US-AL07 |
| Cost Forecast | BR-FC-01 đến BR-FC-15 | US-FC01 đến US-FC08 |
| **Cross-cutting Enhancement** | **BR-ENH-01 đến BR-ENH-14** | **US-ENH01 đến US-ENH15** |

---

*Tài liệu này phải được cập nhật khi có thay đổi yêu cầu. Mọi thay đổi cần được ghi chú version và người phê duyệt.*
