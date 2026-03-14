# ITMS UI/UX Figma Handoff Specification

## 1) Mục tiêu tài liệu

Tài liệu này bóc tách danh sách màn hình chi tiết cho hệ thống **IT Management System (ITMS)** theo format handoff chuẩn cho Figma, dựa trên BRD, PRD và SRS đã cung cấp. Tài liệu được định hướng theo phong cách thiết kế **professional + lean B2B UI**:

- tối giản nhưng cao cấp
- dễ scan và dễ dùng cho môi trường doanh nghiệp
- nhấn mạnh visual hierarchy, trust cues, trạng thái và dữ liệu
- phù hợp cho web admin nội bộ đa module

---

## 2) Design direction đề xuất

### 2.1 Phong cách tổng thể
Không nên thiết kế theo kiểu ERP cũ nặng biểu mẫu, mà nên theo hướng:

- Lean enterprise UI
- nhiều khoảng trắng vừa đủ
- typography rõ cấp bậc
- card và table sạch
- icon tiết chế
- trạng thái và cảnh báo rõ ràng
- micro-interaction nhẹ, không phô trương

### 2.2 Nguyên tắc visual

- **Minimalism + subtle motion**: dùng hover state, row highlight, loading skeleton, progress animation rất nhẹ.
- **Strong visual hierarchy**: title rõ, filter bar rõ, KPI card rõ số, bảng dữ liệu dễ đọc.
- **Scannable content**: mọi màn list cần scan nhanh trong 5–8 giây.
- **Trust-focused cues**: hiển thị last updated, trạng thái bảo mật, audit trail, expiry warnings.
- **Dùng spacing để phân nhóm** thay vì lạm dụng border.
- **Glass/translucent effect** chỉ dùng rất nhẹ ở dashboard/filter panel nếu cần, không dùng nhiều ở data table.

---

## 3) Foundation cho file Figma

### 3.1 Cấu trúc page trong Figma
Nên chia file thành 8 page:

1. Cover + Index
2. Design Foundations
3. Components
4. App Shell
5. Core Screens
6. Module Screens
7. States & Empty/Error
8. Prototype Flows

### 3.2 Grid và frame

- Desktop frame: **1440 px**
- Content container: **1280–1320 px**
- Sidebar fixed: **240–264 px**
- Topbar: **64–72 px**
- Spacing scale: **8 / 12 / 16 / 24 / 32**
- Border radius: **10–14 px**
- Table row height: **44 / 52 px**
- Card padding: **20–24 px**

### 3.3 Design tokens gợi ý

- Background: neutral xám rất nhạt
- Surface: trắng
- Primary: xanh enterprise / navy / teal trầm
- Success / Warning / Error: rõ nhưng không neon
- Font: Inter / SF Pro / Manrope
- Shadow: nhẹ, chỉ dùng cho card, dropdown, modal

---

## 4) Component set bắt buộc

Designer nên dựng component library trước khi đi vào từng màn hình.

### 4.1 Core components

- App sidebar
- Topbar
- Breadcrumb
- Page header
- KPI card
- Filter bar
- Search input
- Tabs
- Data table
- Status badge
- Alert badge
- Empty state
- Upload area
- Import wizard stepper
- Drawer
- Modal confirm
- Detail section
- Timeline / activity item
- Diff compare block
- Notification item
- Pagination
- Toast / inline validation

---

## 5) Format chuẩn cho từng màn hình trong Figma

Dùng format sau để đặt tên frame/spec:

**[Module] / [Screen Name]**
- Purpose
- User role
- Layout type
- Main sections
- Key components
- Primary actions
- States
- Notes for designer

---

## 6) Danh sách màn hình chi tiết

# A. App Shell & Authentication

## 1. AUTH / Login
- **Purpose:** đăng nhập vào hệ thống
- **User role:** tất cả người dùng
- **Layout type:** centered auth
- **Main sections:** brand block, form block, help text
- **Key components:** email, password, show/hide password, login CTA, forgot password
- **Primary actions:** đăng nhập
- **States:** default, invalid credential, locked after 5 failed attempts
- **Notes for designer:** cần trust cues như tên hệ thống, mô tả ngắn, trạng thái bảo mật

## 2. AUTH / 2FA Verify
- **Purpose:** xác thực mã TOTP
- **User role:** user có bật 2FA
- **Layout type:** centered auth
- **Main sections:** OTP block, instruction text
- **Key components:** OTP input 6 số, resend/help, confirm CTA
- **Primary actions:** xác minh mã
- **States:** success, wrong code, expired code

## 3. AUTH / Forgot Password
- **Purpose:** gửi email reset password
- **User role:** tất cả
- **Layout type:** centered auth
- **Main sections:** email input, instruction, confirmation
- **Key components:** email field, submit button
- **Primary actions:** gửi yêu cầu reset
- **States:** success, invalid email, rate limit

## 4. APP / Notification Center
- **Purpose:** xem toàn bộ cảnh báo và thông báo hệ thống
- **User role:** tất cả
- **Layout type:** right drawer hoặc dedicated page
- **Main sections:** unread, all, filters
- **Key components:** notification item, severity badge, timestamp, mark-as-read
- **Primary actions:** mở chi tiết, đánh dấu đã đọc
- **States:** no notifications, high severity, mixed severity

## 5. APP / My Profile & Security
- **Purpose:** quản lý hồ sơ cá nhân và bảo mật
- **User role:** tất cả
- **Layout type:** form/detail page
- **Main sections:** profile info, password, 2FA status, session info
- **Key components:** avatar placeholder, form block, security cards
- **Primary actions:** cập nhật hồ sơ, đổi mật khẩu, bật/tắt 2FA
- **States:** editable, saving, success, validation error

---

# B. Dashboard

## 6. DASHBOARD / Executive Overview
- **Purpose:** trang tổng quan cho BOD và IT Manager
- **User role:** BOD, IT Manager
- **Layout type:** dashboard grid
- **Main sections:**
  - global filter bar
  - KPI row
  - budget vs actual chart
  - asset status cards
  - expiry alerts list
  - vehicle cost widget
  - abnormal vehicles list
- **Key components:** KPI card, chart card, alert list, comparison badge
- **Primary actions:** drill-down sang module chi tiết
- **States:** normal, alert-heavy, no-data

## 7. DASHBOARD / Alert Details
- **Purpose:** xem danh sách tất cả cảnh báo từ dashboard
- **User role:** manager, admin
- **Layout type:** list/detail
- **Main sections:** severity filter, alerts table
- **Key components:** source module, object name, days remaining, status, quick open
- **Primary actions:** lọc, mở bản ghi liên quan
- **States:** no alerts, expiring soon, overdue

## 8. DASHBOARD / KPI Drilldown
- **Purpose:** phân tích sâu từng KPI
- **User role:** manager, BOD
- **Layout type:** chart + detail table
- **Main sections:** summary, trend, breakdown, details
- **Key components:** chart, summary cards, detailed table
- **Primary actions:** đổi mốc thời gian, export
- **States:** default, empty, filtered

---

# C. Budget Planning

## 9. BUDGET / Plan List
- **Purpose:** xem danh sách kế hoạch ngân sách
- **User role:** IT Staff, IT Manager, Finance
- **Layout type:** list
- **Main sections:** page header, filter bar, table
- **Key components:** year filter, status filter, owner filter, search, export/import, create CTA
- **Table columns:** plan code, fiscal year, total budget, project scope, status, owner, updated at
- **Primary actions:** tạo mới, import, export, xem chi tiết
- **States:** empty, draft-heavy, pending approval

## 10. BUDGET / Create Plan
- **Purpose:** tạo mới kế hoạch ngân sách
- **User role:** IT Staff, IT Manager
- **Layout type:** form + spreadsheet section
- **Main sections:** plan header info, budget items grid, quarterly totals, notes
- **Key components:** fiscal year selector, title, currency, project dropdown, budget grid
- **Primary actions:** save draft, submit for approval
- **States:** validation error, autosave, unsaved changes

## 11. BUDGET / Plan Detail
- **Purpose:** xem chi tiết kế hoạch
- **User role:** manager, finance, approver
- **Layout type:** detail page
- **Main sections:** summary header, tab navigation
- **Tabs:** Overview, Budget Items, Approval History, Versions, Attachments
- **Primary actions:** xem version, mở lịch sử phê duyệt, export
- **States:** approved, rejected, archived

## 12. BUDGET / Edit Plan
- **Purpose:** chỉnh sửa kế hoạch draft hoặc rejected
- **User role:** owner, manager
- **Layout type:** form + grid
- **Main sections:** tương tự Create Plan, thêm version compare sidebar
- **Primary actions:** update draft, resubmit approval
- **States:** editable, rejected with reason, dirty form

## 13. BUDGET / Approval Review
- **Purpose:** manager review và approve/reject
- **User role:** approver
- **Layout type:** split view
- **Main sections:** summary left, items right, decision footer
- **Key components:** comment box, approve CTA, reject CTA
- **Primary actions:** approve, reject, request revision
- **States:** pending, approved, rejected

## 14. BUDGET / Version Compare
- **Purpose:** so sánh 2 phiên bản kế hoạch
- **User role:** manager, finance
- **Layout type:** two-column compare
- **Key components:** changed rows highlight, before/after values, filter changed only
- **Primary actions:** chọn version, export compare
- **States:** same, changed, partial change

## 15. BUDGET / Import Wizard
- **Purpose:** import kế hoạch từ Excel
- **User role:** IT Staff, Finance
- **Layout type:** stepper page/modal
- **Steps:**
  1. download template
  2. upload file
  3. field validation
  4. preview rows
  5. confirm import
- **States:** success, partial success, error report export

---

# D. Cost Management

## 16. COST / Actual Cost List
- **Purpose:** xem danh sách chi phí thực tế
- **User role:** IT Staff, Finance, Manager
- **Layout type:** list
- **Main sections:** filter bar, table, summary cards
- **Key components:** date range, category, vendor, project, budget item, payment status
- **Table columns:** date, category, vendor, project, amount, linked budget, invoice, status
- **Primary actions:** tạo mới, import, export, xem chi tiết
- **States:** no records, over-budget filter, mixed payment status

## 17. COST / Create Actual Cost
- **Purpose:** ghi nhận chi phí thực tế
- **User role:** IT Staff, Finance
- **Layout type:** form
- **Main sections:** cost info, budget linkage, invoice upload, notes
- **Key components:** amount input, date picker, vendor select, budget item select, project select, attachment upload
- **Primary actions:** lưu chi phí, đính kèm hóa đơn
- **States:** within budget, near threshold, over threshold
- **Notes for designer:** khi chọn budget item phải hiện remaining budget ngay

## 18. COST / Cost Detail
- **Purpose:** xem chi tiết khoản chi
- **User role:** manager, finance
- **Layout type:** detail page
- **Tabs:** Overview, Attachments, Audit Trail
- **Primary actions:** edit, export, open attachments
- **States:** paid, pending, disputed

## 19. COST / Plan vs Actual View
- **Purpose:** so sánh kế hoạch và thực tế
- **User role:** manager, BOD, finance
- **Layout type:** chart + table
- **Main sections:** summary, progress bars, threshold badges, over-budget alerts
- **Primary actions:** filter theo thời gian/dự án, export
- **States:** under budget, near budget, over budget

## 20. COST / Import Wizard
- **Purpose:** import chi phí thực tế từ Excel
- **User role:** finance, IT Staff
- **Layout type:** stepper page/modal
- **States:** mapping lỗi, duplicate detection, file error report

---

# E. Vendor & Contract Management

## 21. VENDOR / Vendor List
- **Purpose:** danh sách nhà cung cấp
- **User role:** IT Staff, Procurement, Finance
- **Layout type:** list
- **Key components:** search, category filter, status filter, create CTA
- **Table columns:** vendor name, tax code, contact, category, contracts count, status
- **Primary actions:** create, edit, open detail
- **States:** active, inactive, no vendor

## 22. VENDOR / Create Vendor
- **Purpose:** thêm nhà cung cấp mới
- **User role:** IT Staff, Procurement
- **Layout type:** form
- **Key components:** vendor info form, MST validation, contact info
- **Primary actions:** save vendor
- **States:** valid, duplicate MST, incomplete

## 23. VENDOR / Vendor Detail
- **Purpose:** xem chi tiết nhà cung cấp
- **User role:** manager, procurement, finance
- **Layout type:** detail page
- **Tabs:** Overview, Contracts, Payment Summary, Activity
- **Primary actions:** edit, create contract, export summary
- **States:** active, inactive

## 24. CONTRACT / Contract List
- **Purpose:** danh sách hợp đồng
- **User role:** manager, procurement, finance
- **Layout type:** list
- **Filters:** status, vendor, type, expiry window
- **Table columns:** contract no, vendor, type, value, signed date, expiry date, remaining days, status
- **Primary actions:** create, renew, open detail
- **States:** active, expiring soon, expired

## 25. CONTRACT / Create Contract
- **Purpose:** tạo hợp đồng mới
- **User role:** procurement, manager
- **Layout type:** form
- **Main sections:** general info, terms, payment info, attachment upload
- **Primary actions:** save, publish, attach file
- **States:** draft, active, invalid fields

## 26. CONTRACT / Contract Detail
- **Purpose:** xem chi tiết hợp đồng
- **User role:** manager, finance, procurement
- **Layout type:** detail page
- **Tabs:** Overview, Payment History, Files, Alerts, Audit Trail
- **Primary actions:** edit, renew, export
- **States:** active, expiring soon, expired, auto-renew

## 27. CONTRACT / Payment History Detail
- **Purpose:** xem lịch sử thanh toán theo hợp đồng
- **User role:** finance, manager
- **Layout type:** table + summary cards
- **Primary actions:** filter, export
- **States:** paid enough, partially paid, overdue

## 28. CONTRACT / Expiry Alerts
- **Purpose:** danh sách hợp đồng sắp hết hạn
- **User role:** manager, procurement
- **Layout type:** prioritized alert list
- **Key components:** contract card/table, countdown, severity badge
- **Primary actions:** renew, open contract
- **States:** 90 days, 30 days, expired

---

# F. Inventory – Soft Assets

## 29. SOFT / Email Account List
- **Purpose:** danh sách email account
- **Layout type:** list
- **Table columns:** email, assignee, provider, package, expiry date, status
- **Primary actions:** add, edit, export

## 30. SOFT / Email Account Detail
- **Purpose:** xem chi tiết email account
- **Tabs:** Overview, Owner History, Audit
- **Primary actions:** edit, deactivate

## 31. SOFT / Domain List
- **Purpose:** danh sách domain
- **Table columns:** domain, registrar, registered date, expiry date, countdown, status
- **Primary actions:** add, renew, export
- **Notes for designer:** countdown badge phải nổi bật

## 32. SOFT / Domain Detail
- **Purpose:** xem chi tiết domain
- **Tabs:** Overview, SSL Link, Renewal History, Notes
- **Primary actions:** renew, link SSL

## 33. SOFT / VPS/Cloud List
- **Purpose:** danh sách VPS/Cloud
- **Table columns:** hostname, provider, IP, CPU/RAM, environment, expiry, status
- **Primary actions:** add, edit, export

## 34. SOFT / VPS/Cloud Detail
- **Purpose:** xem chi tiết VPS/Cloud
- **Tabs:** Overview, Config, Linked Apps, Audit
- **Primary actions:** update config, view links

## 35. SOFT / License List
- **Purpose:** danh sách license
- **Table columns:** software, total seats, assigned seats, expiry, cost, status
- **Primary actions:** add, assign, renew

## 36. SOFT / License Detail
- **Purpose:** xem chi tiết license
- **Tabs:** Overview, Assignments, Renewal History
- **Primary actions:** assign seat, renew license

## 37. SOFT / SSL Certificate List
- **Purpose:** danh sách SSL certificate
- **Table columns:** domain, issuer, expiry, countdown, auto-renew, status
- **Primary actions:** add, renew, export

## 38. SOFT / SSL Certificate Detail
- **Purpose:** xem chi tiết SSL certificate
- **Tabs:** Overview, Related Domains, Files/Logs
- **Primary actions:** renew, download file

## 39. SOFT / Soft Asset Import Wizard
- **Purpose:** import từng loại tài sản số
- **Layout type:** stepper wizard
- **Notes for designer:** giữ 1 pattern chung, chỉ đổi cột mẫu

> **Note về Create/Edit forms cho Soft Assets:** Dùng pattern **drawer hoặc modal** để thêm/sửa Email, Domain, VPS, License, SSL. Không cần full page form riêng — form hiển thị dạng right drawer với các trường tương ứng từ bảng schema.

---

# G. Inventory – Hard Assets

## 40. HARD / Asset List
- **Purpose:** danh sách thiết bị phần cứng
- **Layout type:** list
- **Table columns:** asset code, asset name, type, model, serial, assigned to, department, lifecycle status
- **Primary actions:** create, assign, export

## 41. HARD / Create Asset
- **Purpose:** tạo thiết bị mới
- **Layout type:** form
- **Main sections:** asset info, purchase info, assignment info, warranty/vendor
- **Primary actions:** save asset
- **Notes for designer:** mã tài sản auto-generate

## 42. HARD / Asset Detail
- **Purpose:** xem chi tiết tài sản
- **Tabs:** Overview, Assignment History, Maintenance, Documents, Audit Trail
- **Primary actions:** assign, update lifecycle, add maintenance

## 43. HARD / Assign Asset
- **Purpose:** gán thiết bị cho user/bộ phận
- **Layout type:** modal hoặc drawer
- **Key components:** assignee select, department, issue date, note
- **Primary actions:** confirm assignment

## 44. HARD / Maintenance Log
- **Purpose:** ghi nhận bảo trì/sửa chữa
- **Layout type:** modal + historical table
- **Primary actions:** add log, view history

## 45. HARD / Lifecycle Update
- **Purpose:** chuyển trạng thái vòng đời tài sản
- **Layout type:** modal/form
- **Key components:** status selector, reason, effective date
- **Primary actions:** update status

## 46. HARD / Import Wizard
- **Purpose:** import thiết bị phần cứng
- **Layout type:** stepper wizard
- **States:** success, duplicate asset code, invalid serial

---

# H. Access Control

## 47. ACCESS / User List
- **Purpose:** danh sách người dùng hệ thống
- **Layout type:** list
- **Table columns:** full name, email, department, role, 2FA, status, last login
- **Primary actions:** create, edit, lock, unlock

## 48. ACCESS / Create User
- **Purpose:** tạo user mới
- **Layout type:** form
- **Main sections:** basic info, role, security, status
- **Primary actions:** create user

## 49. ACCESS / User Detail
- **Purpose:** xem chi tiết người dùng
- **Tabs:** Profile, Permissions, Login History, Activity
- **Primary actions:** edit, reset password, toggle 2FA

## 50. ACCESS / Role List
- **Purpose:** danh sách vai trò
- **Layout type:** list
- **Table columns:** role name, module scope, users count
- **Primary actions:** create role, edit matrix

## 51. ACCESS / Role Permission Matrix
- **Purpose:** phân quyền theo module × action
- **Layout type:** matrix table
- **Key components:** module rows, permission columns (view/create/edit/delete/export/approve)
- **Primary actions:** save permission set, duplicate role

## 52. ACCESS / Login History
- **Purpose:** xem lịch sử đăng nhập
- **Layout type:** list
- **Table columns:** timestamp, IP, device, location if available, status
- **Primary actions:** filter, export

## 53. ACCESS / Lock / Unlock Confirmation
- **Purpose:** confirm thao tác bảo mật quan trọng
- **Layout type:** confirm modal
- **Primary actions:** confirm, cancel

---

# I. Infrastructure Management

## 54. INFRA / Resource List
- **Purpose:** danh sách tài nguyên hạ tầng
- **Layout type:** list
- **Table columns:** resource type, hostname, IP, OS, environment, status
- **Primary actions:** create, edit, open detail

## 55. INFRA / Resource Detail
- **Purpose:** xem chi tiết resource
- **Layout type:** detail page
- **Tabs:** Overview, Specs, Network, Linked Apps, Audit
- **Primary actions:** edit, link asset/app

## 56. INFRA / IP Address List
- **Purpose:** danh sách IP
- **Layout type:** list
- **Table columns:** IP, subnet, VLAN, assigned resource, status
- **Primary actions:** add, edit, export

## 57. INFRA / VLAN List
- **Purpose:** danh sách VLAN
- **Layout type:** list
- **Table columns:** VLAN ID, name, subnet, purpose, status
- **Primary actions:** add, edit

## 58. INFRA / Network Diagram Viewer
- **Purpose:** xem sơ đồ mạng
- **Layout type:** large canvas viewer
- **Key components:** zoom, layer toggle, asset search, full screen
- **Primary actions:** view, filter, locate asset
- **Notes for designer:** phase đầu chỉ cần viewer sạch, không cần editor phức tạp

## 59. INFRA / Admin Account List
- **Purpose:** quản lý tài khoản admin hệ thống
- **Layout type:** list
- **Table columns:** system, username, owner, privilege level, rotation date, status
- **Primary actions:** add, edit, review rotation

## 60. INFRA / Environment List
- **Purpose:** danh sách môi trường
- **Layout type:** list
- **Table columns:** environment, URL, purpose, status
- **Primary actions:** add, edit

## 61. INFRA / Internal Application List
- **Purpose:** danh sách ứng dụng nội bộ
- **Layout type:** list
- **Table columns:** app name, URL, environment, owner, linked resource count
- **Primary actions:** add, edit, open detail

## 62. INFRA / Internal Application Detail
- **Purpose:** xem chi tiết ứng dụng nội bộ
- **Layout type:** detail page
- **Tabs:** Overview, System Users, Linked Resources, Change History
- **Primary actions:** edit, link users/resources

## 63. INFRA / System User List
- **Purpose:** xem user theo từng ứng dụng nội bộ
- **Layout type:** list
- **Table columns:** system, username, role, status
- **Primary actions:** filter, export

## 64. INFRA / Infra Import Wizard
- **Purpose:** import dữ liệu hạ tầng
- **Layout type:** stepper wizard

> **Note về Create/Edit forms cho Infrastructure:** Dùng pattern **drawer hoặc modal** để thêm/sửa Resource, IP, VLAN, Admin Account, Environment, Application. Giữ consistent với pattern của Soft Assets.

---

# J. Vehicle Cost Management

## 65. VEHICLE / Vehicle List
- **Purpose:** danh sách xe
- **Layout type:** list
- **Table columns:** license plate, vehicle type, brand, department, status
- **Primary actions:** create, edit, open detail

## 66. VEHICLE / Create Vehicle
- **Purpose:** tạo hồ sơ xe
- **Layout type:** form
- **Main sections:** vehicle info, ownership, operational status
- **Primary actions:** save vehicle

## 67. VEHICLE / Vehicle Detail
- **Purpose:** xem chi tiết xe
- **Layout type:** detail page
- **Tabs:** Overview, Active Services, Variable Costs, Monthly Summary, Alerts
- **Primary actions:** assign service, add cost, view summary

## 68. VEHICLE / Service Assignment List
- **Purpose:** danh sách dịch vụ theo xe
- **Layout type:** list
- **Table columns:** vehicle, service type, vendor, start date, end date, monthly cost, status
- **Primary actions:** assign service, edit term

## 69. VEHICLE / Assign Service to Vehicle
- **Purpose:** gán dịch vụ cho xe
- **Layout type:** form/modal
- **Main sections:** vehicle select, service type, vendor, term, recurring cost
- **Primary actions:** save assignment

## 70. VEHICLE / Variable Cost List
- **Purpose:** danh sách chi phí biến đổi theo xe
- **Layout type:** list
- **Table columns:** vehicle, month, cost type, quantity, unit cost, amount, source file
- **Primary actions:** import, add manually, export

## 71. VEHICLE / Variable Cost Import Wizard
- **Purpose:** import file từ nhà cung cấp ZNS/SMS/data
- **Layout type:** stepper wizard
- **Notes for designer:** bắt buộc có preview mapping và lỗi biển số không tồn tại

## 72. VEHICLE / Service × Vehicle Matrix
- **Purpose:** ma trận dịch vụ × xe
- **Layout type:** matrix table
- **Key components:** sticky top and left, service legend, quick filter
- **Primary actions:** filter, export, open cell detail
- **Notes for designer:** đây là màn signature, cần rất gọn và scan nhanh

## 73. VEHICLE / Vehicle Cost Summary
- **Purpose:** tổng chi phí từng xe theo kỳ
- **Layout type:** chart + summary table
- **Key components:** fixed cost, variable cost, total, MoM delta
- **Primary actions:** filter theo tháng/quý/năm, export

## 74. VEHICLE / Abnormal Cost Alerts
- **Purpose:** phát hiện xe tăng chi phí bất thường
- **Layout type:** ranked anomaly list
- **Key components:** threshold badge, delta %, sparkline
- **Primary actions:** mở detail xe, điều chỉnh ngưỡng

## 75. VEHICLE / Threshold Settings
- **Purpose:** cấu hình ngưỡng chi phí
- **Layout type:** settings form + threshold table
- **Primary actions:** save threshold, apply default, override by vehicle

---

# K. Project Budget

## 76. PROJECT / Project List
- **Purpose:** danh sách dự án
- **Layout type:** list
- **Table columns:** project code, project name, owner, start date, end date, status
- **Primary actions:** create, edit, open detail

## 77. PROJECT / Create Project
- **Purpose:** tạo dự án mới
- **Layout type:** form
- **Main sections:** project info, budget scope, owner
- **Primary actions:** save project

## 78. PROJECT / Project Budget Overview
- **Purpose:** xem ngân sách theo từng dự án
- **Layout type:** KPI + chart + table
- **Key components:** allocated budget, actual spend, remaining, usage %, cost by category
- **Primary actions:** drill-down, export

## 79. PROJECT / Project Cost Detail
- **Purpose:** xem toàn bộ khoản chi gắn với dự án
- **Layout type:** filtered list
- **Primary actions:** filter, export

## 80. PROJECT / Project vs Overall Budget Compare
- **Purpose:** so sánh ngân sách dự án với tổng ngân sách IT
- **Layout type:** compare dashboard
- **Primary actions:** filter, export

---

# L. Report Center

## 81. REPORT / Report Center Home
- **Purpose:** cổng vào báo cáo
- **Layout type:** report cards
- **Main sections:** report categories, recent reports, saved filters
- **Primary actions:** mở báo cáo, chạy lại báo cáo cũ

## 82. REPORT / Budget Report
- **Purpose:** báo cáo ngân sách
- **Layout type:** chart + table + export panel
- **Primary actions:** filter, export Excel/PDF

## 83. REPORT / Cost Report
- **Purpose:** báo cáo chi phí
- **Layout type:** table + charts
- **Filters:** category, vendor, time, project
- **Primary actions:** filter, export

## 84. REPORT / Inventory Report
- **Purpose:** báo cáo tài sản
- **Layout type:** table + summary cards
- **Filters:** asset type, status, expiry window
- **Primary actions:** filter, export

## 85. REPORT / Contract Report
- **Purpose:** báo cáo hợp đồng
- **Layout type:** table + charts
- **Filters:** status, vendor, expiry
- **Primary actions:** filter, export

## 86. REPORT / Infrastructure Report
- **Purpose:** báo cáo hạ tầng
- **Layout type:** table + charts
- **Filters:** resource type, environment
- **Primary actions:** filter, export

## 87. REPORT / Vehicle Cost Report
- **Purpose:** báo cáo chi phí xe
- **Layout type:** table + charts
- **Filters:** vehicle, month, cost type
- **Key components:** compare with previous month
- **Primary actions:** filter, export

## 87b. REPORT / Project Budget Report
- **Purpose:** báo cáo ngân sách theo dự án
- **Layout type:** chart + table
- **Key components:** pie chart dự án × chi phí, bảng tổng hợp kế hoạch vs thực tế
- **Filters:** year, project, status
- **Primary actions:** filter, drill-down, export Excel/PDF

## 87c. REPORT / Forecast vs Actual Report
- **Purpose:** báo cáo so sánh dự chi vs thực tế
- **Layout type:** chart + comparison table
- **Key components:** bar chart 12 tháng (dự chi vs thực tế), bảng chênh lệch theo hạng mục
- **Filters:** year, month, category, project
- **Primary actions:** filter, export Excel/PDF
- **Notes for designer:** highlight hạng mục chênh lệch > 20%

## 88. REPORT / Export Builder
- **Purpose:** cấu hình xuất Excel/PDF
- **Layout type:** form drawer/modal
- **Key components:** columns selector, format selector, filter summary
- **Primary actions:** export

---

# M. Activity Log

## 89. LOG / Activity Log List
- **Purpose:** xem log toàn hệ thống
- **Layout type:** list
- **Table columns:** timestamp, user, action, module, target object, IP
- **Primary actions:** filter, export, open detail

## 90. LOG / Activity Log Detail
- **Purpose:** xem chi tiết 1 log
- **Layout type:** side drawer hoặc detail page
- **Main sections:** metadata, before/after compare, related actions
- **Key components:** 2-column diff
- **Primary actions:** inspect, export record

## 91. LOG / Login Log
- **Purpose:** lịch sử đăng nhập toàn hệ thống
- **Layout type:** list
- **Table columns:** timestamp, user, IP, device, result
- **Primary actions:** filter, export

## 92. LOG / My History
- **Purpose:** mỗi user xem lịch sử của chính mình
- **Layout type:** list
- **Primary actions:** filter, review

## 93. LOG / Log Export
- **Purpose:** xuất log theo filter hiện tại
- **Layout type:** export modal
- **Primary actions:** export CSV/Excel

---

# O. Cost Forecast (Dự chi)

## 99. FORECAST / Forecast List
- **Purpose:** danh sách bảng dự chi
- **User role:** IT Staff, IT Manager, Finance
- **Layout type:** list
- **Table columns:** tháng/năm, tên bảng dự chi, tổng dự chi, trạng thái, người tạo, ngày cập nhật
- **Key components:** year filter, status filter, create CTA
- **Primary actions:** tạo mới, xem chi tiết, clone từ tháng trước
- **States:** empty, draft, pending approval, approved

## 100. FORECAST / Create Forecast
- **Purpose:** tạo bảng dự chi cho tháng tiếp theo
- **User role:** IT Staff, IT Manager
- **Layout type:** form + spreadsheet section
- **Main sections:** chọn tháng/năm, danh sách khoản dự chi, tổng cộng
- **Key components:** month/year selector, item grid (hạng mục, NCC, dự án, số tiền, ưu tiên), clone button
- **Primary actions:** lưu draft, gửi phê duyệt
- **States:** trống, có dữ liệu, cảnh báo vượt ngân sách
- **Notes for designer:** hiện remaining budget của quý/năm khi tổng dự chi thay đổi

## 101. FORECAST / Forecast Detail
- **Purpose:** xem chi tiết bảng dự chi
- **User role:** manager, finance, approver
- **Layout type:** detail page
- **Tabs:** Overview, Items, Approval History
- **Primary actions:** edit (nếu draft), approve/reject, export

## 102. FORECAST / Approval Review
- **Purpose:** phê duyệt bảng dự chi
- **User role:** IT Manager
- **Layout type:** split view
- **Main sections:** summary left, items right, budget comparison, decision footer
- **Key components:** budget remaining indicator, approve/reject CTA, comment box
- **Primary actions:** approve, reject với lý do
- **States:** pending, approved, rejected

## 103. FORECAST / Yearly Summary
- **Purpose:** tổng hợp dự chi 12 tháng trong năm
- **User role:** IT Manager, BOD, Finance
- **Layout type:** matrix table + chart
- **Key components:** 12 cột tháng, tổng cả năm, so với ngân sách kế hoạch
- **Primary actions:** filter theo năm, export

## 104. FORECAST / Forecast vs Actual Compare
- **Purpose:** so sánh dự chi vs chi thực tế
- **User role:** IT Manager, Finance
- **Layout type:** comparison table + chart
- **Key components:** dự chi – thực tế – chênh lệch – % chính xác, bar chart 12 tháng
- **Primary actions:** filter theo tháng/quý/năm, export
- **States:** chính xác (đẹp), chênh lệch vừa, chênh lệch lớn (> 20%)
- **Notes for designer:** highlight hàng có chênh lệch > 20%, dùng màu đỏ/xanh cho over/under

## 105. FORECAST / Import Wizard
- **Purpose:** import danh sách dự chi từ Excel
- **User role:** IT Staff
- **Layout type:** stepper wizard
- **States:** success, partial success, validation errors

---

# N. Configuration

## 94. CONFIG / Master Data
- **Purpose:** cấu hình danh mục dùng chung
- **Layout type:** tabbed settings
- **Tabs:** cost types, asset types, contract types, currency, vehicle cost types
- **Primary actions:** create, edit, archive

## 95. CONFIG / Alert Settings
- **Purpose:** cấu hình ngưỡng cảnh báo
- **Layout type:** settings form
- **Sections:** expiry alerts, budget threshold, vehicle cost threshold
- **Primary actions:** save settings

## 96. CONFIG / Organization Info
- **Purpose:** cấu hình thông tin công ty
- **Layout type:** form
- **Primary actions:** update info

## 97. CONFIG / Log Retention Policy
- **Purpose:** cấu hình thời gian lưu log / archive
- **Layout type:** settings form
- **Primary actions:** save policy
- **Notes for designer:** hiển thị warning capacity và trust cues

## 98. CONFIG / Import-Export Config
- **Purpose:** import/export danh mục cấu hình
- **Layout type:** tools/settings page
- **Primary actions:** import config, export config

---

## 7) Màn hình state bắt buộc trong Figma

Designer nên làm riêng 1 page cho state library:

### Global states
- Empty state
- No search result
- Permission denied
- Session expired
- Loading skeleton
- Inline validation error
- Upload success
- Import failed with downloadable error file
- Archived/deleted state

---

## 8) Prototype flows nên dựng trong Figma

Nên có ít nhất 8 flow prototype:

1. Login → 2FA → Dashboard
2. Budget List → Create Plan → Submit Approval → Review
3. Cost List → Add Cost → Upload Invoice → Over-budget Warning
4. Vendor List → Contract Detail → Expiry Alert
5. Soft Asset List → Expiry Detail
6. Hard Asset List → Assign Asset → Maintenance Log
7. Vehicle List → Assign Service → Import Variable Cost → Summary
8. Activity Log List → Log Detail Diff
9. Forecast List → Create Forecast → Submit Approval → Approve → Vs Actual Compare

---

## 9) Naming convention frame trong Figma

Ví dụ naming:

- AUTH / Login
- DASH / Executive Overview
- BUDGET / Plan List
- BUDGET / Create Plan
- COST / Actual Cost List
- VENDOR / Contract Detail
- SOFT / Domain List
- HARD / Asset Detail
- ACCESS / Role Permission Matrix
- INFRA / Network Diagram Viewer
- VEHICLE / Service x Vehicle Matrix
- PROJECT / Budget Overview
- REPORT / Vehicle Cost Report
- LOG / Activity Log Detail
- CONFIG / Alert Settings

---

## 10) Ưu tiên thiết kế trước

Nên chia theo 3 đợt:

### Đợt 1
- Auth
- Dashboard
- Budget
- Cost
- Access

### Đợt 2
- Vendor
- Inventory
- Alerts
- Activity Log

### Đợt 3
- Infrastructure
- Vehicle Cost
- Project Budget
- Reports
- Configuration

---

## 11) Kết luận

Nếu triển khai đầy đủ theo chuẩn lean/professional, file Figma của hệ thống này nên có:

- **105 màn hình chức năng** (bao gồm 7 màn Cost Forecast)
- **1 bộ design foundation**
- **1 thư viện component**
- **1 bộ state / error / empty**
- **9 prototype flows chính**

Tài liệu này có thể dùng trực tiếp cho:
- UI Designer dựng wireframe/high-fidelity
- BA viết screen spec
- PM lên phạm vi thiết kế theo phase
- Front-end team chuẩn bị component architecture
