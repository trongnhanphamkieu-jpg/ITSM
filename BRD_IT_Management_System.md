# BRD – TÀI LIỆU YÊU CẦU NGHIỆP VỤ
## Hệ thống Quản trị Công nghệ Thông tin Nội bộ (IT Management System – ITMS)

**Phiên bản:** 2.0  
**Ngày lập:** 13/03/2026  
**Cập nhật:** 16/03/2026 – v2.0: Dynamic RBAC, Master Data, Cron Job, Payment Overdue  
**Lịch sử:**  
- 16/03 v2.0 – Dynamic RBAC, Master Data configuration, Overdue payment cron  
- 15/03 v1.6 – Liên kết dữ liệu xuyên module, file upload, HĐ trạng thái, dashboard nâng cao, export  
- 14/03 v1.5 – Redesign Module 10 Vehicle Cost subscription model  
**Người soạn:** Team IT  
**Trạng thái:** Active

---

## 1. GIỚI THIỆU TỔNG QUAN

### 1.1 Bối cảnh & Mục tiêu

Khối Công nghệ Thông tin (IT) hiện đang vận hành một hệ sinh thái gồm nhiều hệ thống, thiết bị, phần mềm, hợp đồng và nhà cung cấp. Việc quản lý phân tán, thiếu công cụ tổng hợp dẫn đến:

- Không kiểm soát được tổng chi phí đầu tư công nghệ
- Khó so sánh giữa kế hoạch ngân sách và chi tiêu thực tế
- Hợp đồng, licence, domain, SSL hết hạn không được cảnh báo kịp thời
- Tài sản phần cứng và phần mềm không được kiểm kê chính xác
- Quản lý hạ tầng hệ thống thiếu tập trung
- Chi phí vận hành thiết bị gắn trên xe (GPS, Camera, SIM) và chi phí biến đổi (ZNS, SMS) không được kiểm soát theo từng đầu xe

**Mục tiêu:** Xây dựng hệ thống ITMS là nền tảng quản trị tập trung toàn bộ hoạt động vận hành IT nội bộ, giúp lãnh đạo và bộ phận IT có tầm nhìn rõ ràng về chi phí, tài sản, hạ tầng và rủi ro.

### 1.2 Phạm vi dự án

Hệ thống ITMS bao phủ các nghiệp vụ:

| STT | Module | Mô tả ngắn |
|-----|--------|------------|
| 1 | Budget Planning | Lập kế hoạch ngân sách IT theo năm/quý |
| 2 | Cost Management | Quản lý chi phí thực tế & so sánh với kế hoạch |
| 3 | Vendor & Contract | Quản lý nhà cung cấp và hợp đồng |
| 4 | Inventory | Quản lý tài sản phần mềm và phần cứng |
| 5 | Access Control | Quản lý tài khoản truy cập hệ thống |
| 6 | Infrastructure | Quản lý hạ tầng và tài nguyên số |
| 7 | Configuration | Cấu hình hệ thống, danh mục |
| 8 | Dashboard | Tổng hợp số liệu trực quan |
| 9 | Report | Báo cáo đa chiều |
| 10 | Vehicle Cost Management | Quản lý chi phí dịch vụ và chi phí biến đổi theo từng xe |
| 11 | Project Budget | Phân bổ ngân sách và chi phí theo từng dự án IT |
| 12 | Activity Log | Nhật ký hoạt động, lịch sử đăng nhập, audit trail |
| 13 | Cost Forecast (Dự chi) | Lập lệnh dự chi hàng tháng cho tháng tiếp theo, kiểm soát chi phí dự kiến theo tháng/năm |

### 1.3 Đối tượng sử dụng

| Vai trò | Mô tả |
|---------|-------|
| IT Admin | Quản trị toàn bộ hệ thống |
| IT Manager | Lập kế hoạch, phê duyệt ngân sách, xem báo cáo |
| IT Staff | Nhập liệu, cập nhật tài sản, chi phí |
| Finance | Xem báo cáo ngân sách, chi phí |
| C-Level / BOD | Xem Dashboard tổng hợp |

---

## 2. YÊU CẦU NGHIỆP VỤ CHI TIẾT

### 2.1 Module 1 – Lập kế hoạch ngân sách (Budget Planning)

**Mục tiêu nghiệp vụ:**  
Cho phép bộ phận IT lập kế hoạch ngân sách hàng năm/hàng quý theo từng hạng mục chi tiêu, trình lãnh đạo phê duyệt.

**Yêu cầu nghiệp vụ:**

- BR-01: Hệ thống cho phép lập kế hoạch ngân sách IT theo năm tài chính
- BR-02: Kế hoạch ngân sách được phân loại theo hạng mục (phần cứng, phần mềm, dịch vụ, nhân sự, vận hành...) và theo dự án (xem chi tiết tại Module 11)
- BR-03: Hỗ trợ phân bổ ngân sách theo quý/tháng
- BR-04: Kế hoạch ngân sách có trạng thái (Dự thảo → Đang phê duyệt → Đã phê duyệt → Đang thực hiện)
- BR-05: Cho phép điều chỉnh kế hoạch ngân sách với lý do chỉnh sửa và lịch sử phiên bản
- BR-06: Xuất kế hoạch ngân sách ra file Excel/PDF để trình duyệt
- BR-07: Import kế hoạch ngân sách từ file Excel (có cột Dự án để phân bổ)

**Quy trình nghiệp vụ:**

```
IT Staff lập kế hoạch → IT Manager xem xét → Phê duyệt / Từ chối → Lưu trữ
```

---

### 2.2 Module 2 – Quản lý chi phí thực tế (Cost Management)

**Mục tiêu nghiệp vụ:**  
Ghi nhận và theo dõi toàn bộ chi phí IT phát sinh thực tế, so sánh với ngân sách kế hoạch.

**Yêu cầu nghiệp vụ:**

- BR-08: Ghi nhận các khoản chi phí thực tế phát sinh, liên kết với hạng mục ngân sách
- BR-09: Mỗi khoản chi phí gắn với: hạng mục, nhà cung cấp, ngày phát sinh, hóa đơn/PO, giá trị
- BR-10: Tự động tính toán chênh lệch giữa ngân sách kế hoạch và thực tế
- BR-11: Cảnh báo khi chi tiêu vượt ngân sách theo từng hạng mục (>80%, >100%)
- BR-12: Cho phép gắn file hóa đơn/chứng từ vào từng khoản chi
- BR-13: Hỗ trợ import danh sách chi phí từ file Excel
- BR-14: Báo cáo chi phí theo tháng, quý, năm, hạng mục, nhà cung cấp

---

### 2.3 Module 3 – Quản lý nhà cung cấp & hợp đồng (Vendor & Contract)

**Mục tiêu nghiệp vụ:**  
Tập trung hóa thông tin nhà cung cấp và toàn bộ hợp đồng, theo dõi thời hạn, giá trị.

**Yêu cầu nghiệp vụ:**

- BR-15: Quản lý danh mục nhà cung cấp (tên, mã số thuế, địa chỉ, liên hệ, lĩnh vực cung cấp)
- BR-16: Quản lý hợp đồng: số HĐ, nhà cung cấp, giá trị, ngày ký, ngày hết hạn, điều khoản
- BR-17: Phân loại hợp đồng: bảo trì, dịch vụ, mua sắm thiết bị, thuê bao, hỗ trợ kỹ thuật
- BR-18: Cảnh báo hợp đồng sắp hết hạn (30, 60, 90 ngày)
- BR-19: Lưu trữ file hợp đồng đính kèm (PDF, scan)
- BR-20: Theo dõi lịch sử thanh toán theo hợp đồng
- BR-21: Xuất danh sách hợp đồng theo trạng thái, thời hạn

---

### 2.4 Module 4 – Quản lý Inventory

**Mục tiêu nghiệp vụ:**  
Kiểm soát toàn bộ tài sản phần mềm và phần cứng của bộ phận IT.

#### 4a. Soft Inventory (Tài sản số/phần mềm)

- BR-22: Quản lý email accounts: địa chỉ, người dùng, nhà cung cấp, gói dịch vụ, ngày hết hạn
- BR-23: Quản lý domain: tên miền, nhà đăng ký, ngày đăng ký, ngày hết hạn, trạng thái
- BR-24: Quản lý VPS/Cloud: hostname, IP, provider, cấu hình, mục đích sử dụng, ngày hết hạn
- BR-25: Quản lý license phần mềm: phần mềm, số license, người dùng, ngày hết hạn, chi phí
- BR-26: Quản lý SSL certificates: tên miền, tổ chức cấp, ngày hết hạn, cảnh báo
- BR-27: Cảnh báo sắp hết hạn cho tất cả soft assets (30, 60, 90 ngày)

#### 4b. Hard Inventory (Tài sản phần cứng)

- BR-28: Quản lý thiết bị phần cứng: máy tính, laptop, server, switch, router, AP, máy in...
- BR-29: Thông tin thiết bị: mã tài sản, tên, model, serial number, nhà cung cấp, ngày mua, giá trị
- BR-30: Theo dõi người dùng/bộ phận được giao thiết bị
- BR-31: Quản lý vòng đời thiết bị: đang sử dụng, bảo trì, hỏng, thanh lý
- BR-32: Lịch sử bảo trì, sửa chữa theo từng thiết bị
- BR-33: Import/Export danh sách thiết bị từ/ra Excel

---

### 2.5 Module 5 – Quản lý tài khoản truy cập (Access Control)

**Mục tiêu nghiệp vụ:**  
Phân quyền và kiểm soát tài khoản người dùng truy cập vào hệ thống ITMS.

**Yêu cầu nghiệp vụ:**

- BR-34: Quản lý người dùng: họ tên, email, bộ phận, vai trò
- BR-35: Phân quyền theo vai trò (RBAC): Admin, Manager, Staff, Finance, Viewer
- BR-36: Thiết lập quyền truy cập chi tiết theo từng module
- BR-37: Đăng nhập bằng email/mật khẩu, hỗ trợ 2FA
- BR-38: Ghi log hoạt động người dùng
- BR-39: Quản lý trạng thái tài khoản: đang hoạt động, tạm khóa, vô hiệu hóa

---

### 2.6 Module 6 – Quản lý hạ tầng & tài nguyên số (Infrastructure Management)

**Mục tiêu nghiệp vụ:**  
Tổng hợp và theo dõi toàn bộ hạ tầng kỹ thuật số đang vận hành.

**Yêu cầu nghiệp vụ:**

- BR-40: Danh mục tài nguyên: server, VM, database, domain, hosting, firewall, switch, access point
- BR-41: Quản lý địa chỉ IP, VLAN, sơ đồ mạng (topology)
- BR-42: Theo dõi domain, SSL, hosting sắp hết hạn (tích hợp với Soft Inventory)
- BR-43: Quản lý tài khoản admin hệ thống (tên, hệ thống, quyền, trạng thái)
- BR-44: Quản lý môi trường vận hành: Production, Staging, Testing, Development
- BR-45: Danh sách ứng dụng nội bộ đang vận hành theo môi trường
- BR-46: Quản lý danh sách user theo từng hệ thống/ứng dụng

---

### 2.7 Module 7 – Cấu hình hệ thống (Configuration)

- BR-47: Quản lý danh mục dùng chung: loại chi phí, loại tài sản, loại hợp đồng, đơn vị tiền tệ
- BR-48: Cấu hình ngưỡng cảnh báo (hết hạn, vượt ngân sách)
- BR-49: Cấu hình thông tin công ty/tổ chức
- BR-50: Import/Export toàn bộ danh mục cấu hình từ/ra Excel

---

### 2.8 Module 8 – Dashboard

- BR-51: Tổng quan ngân sách: kế hoạch vs thực tế, % thực hiện
- BR-52: Biểu đồ xu hướng chi phí theo thời gian
- BR-53: Thống kê tài sản theo trạng thái
- BR-54: Danh sách cảnh báo hết hạn (hợp đồng, domain, license, SSL...)
- BR-55: KPI vận hành IT theo kỳ
- BR-56: Widget tổng chi phí xe tháng hiện tại (so sánh với tháng trước)
- BR-57: Danh sách xe có chi phí bất thường (vượt ngưỡng cảnh báo)
- BR-58: Widget dự chi tháng tới: tổng dự chi, so sánh với dự chi tháng trước và chi thực tế tháng trước
- BR-59: Biểu đồ dự chi vs thực tế 12 tháng qua

---

### 2.9 Module 9 – Báo cáo (Report)

- BR-60: Báo cáo ngân sách IT (kế hoạch vs thực tế)
- BR-61: Báo cáo chi phí theo hạng mục, nhà cung cấp, thời gian
- BR-62: Báo cáo inventory phần cứng và phần mềm
- BR-63: Báo cáo hợp đồng theo trạng thái, thời hạn
- BR-64: Báo cáo hạ tầng hệ thống
- BR-65: Báo cáo chi phí theo xe: tổng hợp chi phí cố định + biến đổi theo từng xe, từng tháng
- BR-66: Báo cáo so sánh chi phí xe tháng này vs tháng trước
- BR-67: Báo cáo dự chi: so sánh dự chi vs thực tế theo tháng, theo năm, theo hạng mục
- BR-68: Xuất tất cả báo cáo ra Excel/PDF

---

### 2.10 Module 10 – Quản lý chi phí theo xe (Vehicle Cost Management)

**Mục tiêu nghiệp vụ:**  
Kiểm soát toàn bộ chi phí phát sinh gắn với từng xe theo biển số. Chi phí được chia thành 2 loại:
- **Chi phí cố định (Fixed):** Dịch vụ thuê bao định kỳ (GPS, Camera hành trình, SIM data...) — gắn vào xe dưới dạng subscription có ngày bắt đầu, ngày kết thúc, chi phí/tháng
- **Chi phí biến đổi (Variable):** Chi phí phát sinh một lần (thay dầu, sửa lốp, bảo dưỡng, ZNS, SMS...) — ghi nhận theo sự kiện

**Yêu cầu nghiệp vụ:**

**A. Quản lý danh mục xe:**
- BR-VCM-01: Quản lý danh mục xe theo biển số: biển số, loại xe, nhãn hiệu, model, năm sản xuất, bộ phận sử dụng, người phụ trách, trạng thái (active/maintenance/disposed)
- BR-VCM-02: Import danh sách xe từ Excel; Export danh sách xe
- BR-VCM-03: Mỗi xe có trang chi tiết riêng hiển thị: thông tin xe, danh sách dịch vụ cố định đang gắn, tổng chi phí cố định/tháng, và lịch sử chi phí biến đổi

**B. Quản lý dịch vụ (Master list):**
- BR-VCM-04: Quản lý danh mục dịch vụ với 2 loại: cố định (GPS, Camera, SIM, bảo hiểm, đăng kiểm...) và biến đổi (thay dầu, sửa lốp, bảo dưỡng...)
- BR-VCM-04a: Mỗi dịch vụ có: tên, loại (costType: fixed/variable), tần suất, giá mặc định (defaultCost)

**C. Subscription — Gắn dịch vụ cố định vào xe:**
- BR-VCM-05: Gắn dịch vụ cố định cho xe tạo ra 1 subscription có: chi phí/tháng (có thể khác defaultCost), ngày bắt đầu, ngày kết thúc (null = đang active)
- BR-VCM-06: Cảnh báo khi subscription sắp hết hạn (30, 60 ngày trước)
- BR-VCM-07: Tự động tính tổng chi phí cố định/tháng của xe = SUM(monthlyCost) các subscription đang active
- BR-VCM-07a: Hủy subscription (deactivate) sẽ tự động set endDate = hôm nay + isActive = false

**D. Chi phí biến đổi:**
- BR-VCM-08: Ghi nhận chi phí biến đổi (1 lần) gắn với xe + dịch vụ biến đổi: số tiền, ngày, km lúc bảo dưỡng, ghi chú
- BR-VCM-09: Import chi phí biến đổi hàng tháng từ file Excel

**E. Tổng hợp & phân tích chi phí theo xe:**
- BR-VCM-10: Xem tổng chi phí (cố định + biến đổi) theo từng xe trong tháng/quý/năm
- BR-VCM-11: So sánh chi phí xe tháng này vs tháng trước; phát hiện xe có chi phí tăng đột biến
- BR-VCM-12: Xem bảng ma trận: dịch vụ × xe (xe nào đang dùng dịch vụ nào và chi phí tương ứng)
- BR-VCM-13: Báo cáo top xe chi phí cao nhất, phân tích theo loại chi phí

**Quy trình nghiệp vụ:**

```
Thêm xe → Tạo dịch vụ (fixed/variable) → Gắn dịch vụ cố định vào xe (subscription)
→ Hệ thống tự tính tổng/tháng → Trang chi tiết xe hiển thị subscriptions + biến đổi
→ Import chi phí biến đổi → Dashboard cảnh báo bất thường → Báo cáo
```

---

### 2.11 Module 11 – Quản lý ngân sách theo dự án (Project Budget)

**Mục tiêu nghiệp vụ:**  
Cho phép phân bổ ngân sách IT về từng dự án cụ thể, theo dõi chi phí thực tế gắn với từng dự án, từ đó kiểm soát ngân sách ở cả hai cấp: tổng quan IT và từng dự án.

**Yêu cầu nghiệp vụ:**

- BR-PRJ-01: Quản lý danh mục dự án IT: mã dự án, tên, mô tả, ngày bắt đầu, ngày kết thúc, bộ phận phụ trách, trạng thái (active/closed)
- BR-PRJ-02: Mỗi hạng mục ngân sách (budget_item) có thể gắn với một dự án cụ thể hoặc để "Chung" nếu không thuộc dự án nào
- BR-PRJ-03: Tự động tổng hợp ngân sách kế hoạch đã phân bổ theo dự án (SUM các budget_item gắn với dự án đó)
- BR-PRJ-04: Mỗi khoản chi phí thực tế có thể gắn với một dự án; cột Dự án có mặt trong form nhập và template import
- BR-PRJ-05: Hiển thị bảng tổng hợp ngân sách theo dự án: kế hoạch – thực tế – còn lại – % thực hiện
- BR-PRJ-06: Cảnh báo khi chi phí một dự án vượt ngân sách được phân bổ
- BR-PRJ-07: Xuất báo cáo ngân sách 2 cấp (tổng IT + chi tiết theo dự án) ra Excel/PDF; import cấu hình dự án từ Excel

**Quy trình nghiệp vụ:**

```
Tạo dự án → Gắn hạng mục ngân sách vào dự án → Ghi nhận chi phí thực tế theo dự án
→ Hệ thống tổng hợp ngân sách từng dự án → Dashboard → Báo cáo
```

---

### 2.12 Module 12 – Activity Log (Nhật ký hoạt động)

**Mục tiêu nghiệp vụ:**  
Ghi lại toàn bộ lịch sử đăng nhập, đăng xuất và các thao tác thay đổi dữ liệu của từng người dùng trên toàn hệ thống. Cung cấp khả năng tra cứu, lọc và xuất log phục vụ kiểm toán, điều tra sự cố và kiểm soát tuân thủ.

**Yêu cầu nghiệp vụ:**

**A. Ghi nhận log tự động:**
- BR-LOG-01: Hệ thống tự động ghi lại mọi sự kiện đăng nhập / đăng xuất của người dùng (thời gian, địa chỉ IP, trình duyệt, kết quả: thành công / thất bại)
- BR-LOG-02: Hệ thống tự động ghi lại mọi thao tác thay đổi dữ liệu: tạo mới (CREATE), chỉnh sửa (UPDATE), xóa (DELETE), import, export trên toàn bộ module
- BR-LOG-03: Mỗi bản ghi log phải chứa đầy đủ: thời gian, người dùng, hành động, module, đối tượng bị tác động, giá trị trước và sau thay đổi (before/after diff)
- BR-LOG-04: Log là dữ liệu append-only – không được phép chỉnh sửa hoặc xóa bởi bất kỳ người dùng nào

**B. Tra cứu và hiển thị log:**
- BR-LOG-05: Cung cấp giao diện tra cứu log với bộ lọc: người dùng, loại hành động, module, khoảng thời gian, địa chỉ IP
- BR-LOG-06: Xem chi tiết từng bản ghi log: hiển thị diff dữ liệu trước/sau ở dạng dễ đọc (key-value so sánh)
- BR-LOG-07: Phân quyền xem log theo vai trò: Admin thấy toàn bộ; Manager thấy log của Staff trong module mình phụ trách; người dùng thường chỉ xem lịch sử đăng nhập của chính mình

**C. Xuất và chính sách lưu trữ:**
- BR-LOG-08: Xuất log ra file Excel/CSV theo bộ lọc hiện tại
- BR-LOG-09: Chính sách lưu trữ: giữ toàn bộ log trong 12 tháng; tự động archive sang cold storage sau đó (có thể cấu hình)

**Quy trình nghiệp vụ:**

```
Người dùng thực hiện thao tác → Hệ thống ghi log tự động (background, không ảnh hưởng UX)
→ Admin / Manager mở màn Activity Log → Lọc, xem chi tiết, xuất file
```

---

### 2.13 Module 13 – Dự chi (Cost Forecast)

**Mục tiêu nghiệp vụ:**  
Cho phép bộ phận IT lập lệnh dự chi hàng tháng cho tháng tiếp theo, quản lý và kiểm soát chi phí dự kiến trước khi phát sinh thực tế. So sánh dự chi với chi phí thực tế để đánh giá độ chính xác của dự báo và cải thiện quy trình lập kế hoạch.

**Yêu cầu nghiệp vụ:**

**A. Lập lệnh dự chi hàng tháng:**
- BR-FC-01: Mỗi tháng, IT Staff/Manager lập 1 bảng dự chi cho tháng tiếp theo, bao gồm các khoản chi dự kiến
- BR-FC-02: Mỗi khoản dự chi gắn với: hạng mục chi phí (category), mô tả, số tiền dự kiến, nhà cung cấp dự kiến, dự án (nếu có), ghi chú
- BR-FC-03: Bảng dự chi có trạng thái: Dự thảo → Đang phê duyệt → Đã phê duyệt → Đã kết thúc (khi tháng đó đã qua)
- BR-FC-04: Hỗ trợ import danh sách dự chi từ file Excel
- BR-FC-05: Cho phép sao chép bảng dự chi từ tháng trước để tạo nhanh cho tháng mới

**B. Phê duyệt dự chi:**
- BR-FC-06: IT Manager xem xét và phê duyệt / từ chối bảng dự chi
- BR-FC-07: Khi từ chối, bắt buộc nhập lý do; người tạo có thể chỉnh sửa và gửi lại
- BR-FC-08: Cảnh báo nếu tổng dự chi vượt ngân sách kế hoạch còn lại trong quý/năm

**C. Kiểm soát theo tháng và theo năm:**
- BR-FC-09: Xem tổng hợp dự chi theo từng tháng trong năm (12 tháng)
- BR-FC-10: So sánh dự chi vs chi thực tế tháng đã qua: tính chênh lệch, tỷ lệ thực hiện
- BR-FC-11: Tổng hợp dự chi cả năm: tổng dự chi 12 tháng so với ngân sách kế hoạch năm
- BR-FC-12: Phát hiện hạng mục có chênh lệch lớn giữa dự chi và thực tế (ví dụ > 20%)

**D. Báo cáo và Dashboard:**
- BR-FC-13: Biểu đồ dự chi vs thực tế theo tháng (12 tháng)
- BR-FC-14: Báo cáo chi tiết dự chi theo hạng mục, nhà cung cấp, dự án
- BR-FC-15: Xuất báo cáo dự chi ra Excel/PDF

**Quy trình nghiệp vụ:**

```
IT Staff lập bảng dự chi tháng M+1 → IT Manager phê duyệt → Tháng M+1 bắt đầu
→ IT Staff nhập chi phí thực tế → Hệ thống so sánh dự chi vs thực tế
→ Dashboard + Báo cáo hiển thị chênh lệch → Rút kinh nghiệm cho dự chi tháng tiếp theo
```

---

### 2.14 Yêu cầu xuyên module (Cross-cutting Enhancement v1.6)

**Mục tiêu nghiệp vụ:**  
Đảm bảo dữ liệu giữa các module được liên kết chặt chẽ, nhất quán; nâng cao trải nghiệm nhập liệu và quản trị.

**A. Liên kết dữ liệu xuyên module (Data Linking):**
- BR-ENH-01: Tất cả các trường "Nhà cung cấp" trên mọi module (Chi phí, Tài sản, Xe, Dự chi) phải là dropdown chọn từ danh mục NCC đã tạo — KHÔNG cho phép nhập text tự do
- BR-ENH-02: Tất cả tài sản (phần mềm + phần cứng) phải liên kết được với NCC và Hợp đồng tương ứng
- BR-ENH-03: Hạng mục ngân sách (budget item) phải cho phép chọn Dự án từ danh mục dự án đã tạo
- BR-ENH-04: Chi phí thực tế phải chọn từ danh mục hạng mục (category dropdown) thay vì nhập text
- BR-ENH-05: Trường "Gán cho" (assigned to) thiết bị/IP phải chọn từ danh sách nhân viên hệ thống

**B. Tệp đính kèm (File Upload):**
- BR-ENH-06: Cho phép tải lên tệp đính kèm tại: Nhà cung cấp, Hợp đồng, Chi phí thực tế (PDF, Excel, hình ảnh hóa đơn)

**C. Quản lý trạng thái hợp đồng:**
- BR-ENH-07: Hợp đồng có trạng thái quản lý: Nháp → Đang thực hiện → Hết hạn → Chấm dứt. Cho phép chuyển trạng thái có kiểm soát.

**D. Định dạng số tiền:**
- BR-ENH-08: Khi nhập số tiền tại mọi module, hệ thống tự động ngăn cách hàng nghìn bằng dấu chấm (1.000.000)

**E. Dashboard nâng cao:**
- BR-ENH-09: Dashboard cho phép lọc dữ liệu theo tháng, theo quý
- BR-ENH-10: Dashboard hiển thị cảnh báo: hợp đồng/domain/license sắp hết hạn, chi phí bất thường

**F. Liên kết chi phí – ngân sách:**
- BR-ENH-11: Chi phí thực tế phải cho phép chọn từ kế hoạch ngân sách nào (Budget Plan → Category → Item) theo 2 bước cascade

**G. Chỉnh sửa toàn hệ thống:**
- BR-ENH-12: Tất cả dữ liệu đều cho phép chỉnh sửa (update/edit). Đối với ngân sách đã phê duyệt, Admin có quyền đổi trạng thái thành "Nháp" để chỉnh sửa lại.

**H. Xuất file:**
- BR-ENH-13: Module Ngân sách, Tài sản, Vận hành bổ sung chức năng xuất file Excel

**I. Lọc tài sản nâng cao:**
- BR-ENH-14: Tại module Quản lý tài sản (phần mềm + phần cứng), bổ sung bộ lọc theo NCC và trạng thái

---

## 3. YÊU CẦU PHI CHỨC NĂNG

| STT | Yêu cầu | Mô tả |
|-----|---------|-------|
| NF-01 | Hiệu năng | Thời gian tải trang < 3 giây; hỗ trợ 50+ người dùng đồng thời |
| NF-02 | Bảo mật | Mã hóa dữ liệu, HTTPS, kiểm soát phân quyền, ghi log |
| NF-03 | Khả dụng | Uptime ≥ 99.5%, backup dữ liệu hàng ngày |
| NF-04 | Tương thích | Chạy trên Chrome, Edge, Firefox (phiên bản mới nhất) |
| NF-05 | Responsive | Giao diện tương thích desktop và tablet |
| NF-06 | Import/Export | Hỗ trợ định dạng Excel (.xlsx) và PDF tại mọi màn hình |
| NF-07 | Ngôn ngữ | Giao diện Tiếng Việt, hỗ trợ thêm Tiếng Anh |
| NF-08 | Audit Trail | Ghi lại mọi thao tác thêm, sửa, xóa dữ liệu |

---

## 4. GIẢ ĐỊNH & RÀNG BUỘC

- Hệ thống được triển khai nội bộ (on-premise hoặc private cloud)
- Dữ liệu lịch sử ban đầu sẽ được import qua file Excel
- Số lượng người dùng dự kiến: 10–50 tài khoản
- Đơn vị tiền tệ: VND (có thể cấu hình thêm USD)

---

## 5. TIÊU CHÍ THÀNH CÔNG

- 100% module được phát triển và hoàn thành kiểm thử
- Người dùng cuối có thể thực hiện đầy đủ nghiệp vụ mà không cần hỗ trợ kỹ thuật
- Báo cáo ngân sách IT chính xác, khớp với dữ liệu tài chính
- Cảnh báo hết hạn hoạt động chính xác và kịp thời
- Import/Export hoạt động đúng với template Excel được cung cấp
- Chi phí từng xe được tổng hợp đúng theo tháng, không sai lệch; cảnh báo chi phí bất thường hoạt động chính xác
- Dự chi được lập và phê duyệt đúng quy trình; so sánh dự chi vs thực tế chính xác theo tháng và năm
- Tất cả trường NCC trên mọi module đều là dropdown liên kết với danh mục NCC — không có text input tự do
- Tài sản phần mềm/phần cứng đều liên kết được với NCC và Hợp đồng tương ứng
- Số tiền hiển thị và nhập liệu đúng định dạng ngăn cách hàng nghìn

---

*Tài liệu này là cơ sở để xây dựng PRD và SRS.*
