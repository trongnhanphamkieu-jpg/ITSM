# PRD – TÀI LIỆU YÊU CẦU SẢN PHẨM
## Hệ thống Quản trị Công nghệ Thông tin Nội bộ (IT Management System – ITMS)

**Phiên bản:** 1.5  
**Ngày lập:** 13/03/2026  
**Cập nhật:** 14/03/2026 – Redesign Module 10: Vehicle Cost → subscription model (fixed/variable, costType, vehicle detail page)  
**Product Owner:** IT Manager  
**Trạng thái:** Bản nháp

---

## 1. TẦM NHÌN SẢN PHẨM

### 1.1 Tuyên bố định vị

ITMS là nền tảng quản trị IT tập trung, cho phép bộ phận công nghệ thông tin kiểm soát toàn diện ngân sách, tài sản, hạ tầng và vận hành—tất cả trong một ứng dụng web duy nhất, trực quan và dễ sử dụng.

### 1.2 Mục tiêu sản phẩm (OKRs)

| Objective | Key Result |
|-----------|-----------|
| Kiểm soát ngân sách IT chặt chẽ | Giảm chi vượt ngân sách xuống < 5% trong năm đầu |
| Không để tài sản hết hạn không hay | 0 domain/SSL/license bị gián đoạn do hết hạn |
| Tăng hiệu quả vận hành IT | Giảm 70% thời gian tổng hợp báo cáo thủ công |
| Quản lý hạ tầng tập trung | 100% tài sản IT được đăng ký trong hệ thống |
| Kiểm soát chi phí theo xe | 100% chi phí (GPS/Camera/SIM/ZNS/SMS) được hạch toán đúng xe; phát hiện bất thường trong vòng 24h |
| Tuân thủ và kiểm toán | 100% thao tác thay đổi dữ liệu được ghi log; truy vấn được trong < 5 giây |
| Dự chi chính xác | Chênh lệch giữa dự chi và thực tế < 15% sau 3 tháng sử dụng; 100% tháng có bảng dự chi được phê duyệt |

---

## 2. NGƯỜI DÙNG (USER PERSONAS)

### Persona 1 – IT Admin (Quản trị viên hệ thống)
- **Mục tiêu:** Cấu hình, duy trì hệ thống, phân quyền người dùng, tra cứu lịch sử thao tác và xuất log phục vụ kiểm toán
- **Nỗi đau:** Phải quản lý nhiều tool rời rạc, không có cái nhìn tổng thể; không có nhật ký thao tác tập trung để điều tra sự cố
- **Kỳ vọng:** Một nơi duy nhất để xem toàn bộ hạ tầng, tài sản và nhật ký hoạt động

### Persona 2 – IT Manager
- **Mục tiêu:** Lập kế hoạch ngân sách, theo dõi chi phí, báo cáo cho lãnh đạo
- **Nỗi đau:** Tốn nhiều giờ tổng hợp Excel mỗi cuối tháng/quý
- **Kỳ vọng:** Dashboard, báo cáo tự động, so sánh kế hoạch vs thực tế

### Persona 3 – IT Staff
- **Mục tiêu:** Nhập liệu chi phí, cập nhật tài sản
- **Nỗi đau:** Không có form chuẩn, nhập liệu lặp lại nhiều lần
- **Kỳ vọng:** Giao diện đơn giản, import hàng loạt

### Persona 4 – Finance Staff
- **Mục tiêu:** Theo dõi chi tiêu IT, đối chiếu ngân sách
- **Nỗi đau:** Khó đối chiếu dữ liệu chi phí IT với kế toán
- **Kỳ vọng:** Báo cáo chi tiết, xuất Excel dễ dàng

### Persona 5 – C-Level / BOD
- **Mục tiêu:** Nắm tổng quan sức khỏe IT
- **Nỗi đau:** Không có dashboard tổng hợp, phải đợi báo cáo thủ công
- **Kỳ vọng:** Dashboard trực quan, số liệu cập nhật real-time

---

## 3. TÍNH NĂNG VÀ USER STORIES

### 3.1 Module Budget Planning (Lập kế hoạch ngân sách)

| Story ID | User Story | Priority | Điều kiện chấp nhận |
|----------|-----------|----------|---------------------|
| US-B01 | Là IT Manager, tôi muốn tạo kế hoạch ngân sách theo năm, phân theo hạng mục | Must Have | Có form nhập đầy đủ thông tin, lưu được bản nháp |
| US-B02 | Là IT Manager, tôi muốn phân bổ ngân sách theo từng quý/tháng | Must Have | Tổng các quý/tháng = tổng năm |
| US-B03 | Là IT Staff, tôi muốn import kế hoạch từ file Excel | Must Have | Template Excel được cung cấp, import và validate lỗi |
| US-B04 | Là IT Manager, tôi muốn gửi kế hoạch để phê duyệt | Must Have | Email/notification gửi đến người phê duyệt |
| US-B05 | Là IT Manager, tôi muốn xem lịch sử thay đổi của kế hoạch | Should Have | Hiển thị version, người sửa, thời gian sửa |
| US-B06 | Là IT Manager, tôi muốn xuất kế hoạch ra Excel/PDF | Must Have | File xuất đúng template, đầy đủ dữ liệu |

---

### 3.2 Module Cost Management (Quản lý chi phí)

| Story ID | User Story | Priority | Điều kiện chấp nhận |
|----------|-----------|----------|---------------------|
| US-C01 | Là IT Staff, tôi muốn ghi nhận khoản chi phí thực tế và gắn với hạng mục ngân sách | Must Have | Chi phí liên kết đúng hạng mục, lưu được hóa đơn đính kèm |
| US-C02 | Là IT Manager, tôi muốn xem so sánh kế hoạch vs thực tế theo hạng mục | Must Have | Biểu đồ và bảng so sánh chi tiết |
| US-C03 | Là IT Admin, tôi muốn nhận cảnh báo khi chi phí vượt 80% ngân sách | Must Have | Notification hiển thị trong hệ thống và email |
| US-C04 | Là IT Staff, tôi muốn import danh sách chi phí từ Excel | Must Have | Template chuẩn, báo lỗi import chi tiết |
| US-C05 | Là Finance, tôi muốn xuất báo cáo chi phí theo kỳ | Must Have | Xuất Excel/PDF với đầy đủ cột theo yêu cầu |

---

### 3.3 Module Vendor & Contract (Nhà cung cấp & hợp đồng)

| Story ID | User Story | Priority | Điều kiện chấp nhận |
|----------|-----------|----------|---------------------|
| US-V01 | Là IT Admin, tôi muốn thêm/sửa/xóa nhà cung cấp | Must Have | Form đầy đủ thông tin, validate MST không trùng |
| US-V02 | Là IT Admin, tôi muốn quản lý hợp đồng gắn với nhà cung cấp | Must Have | CRUD hợp đồng, đính kèm file PDF |
| US-V03 | Là IT Manager, tôi muốn nhận cảnh báo hợp đồng sắp hết hạn | Must Have | Cảnh báo 30/60/90 ngày trước ngày hết hạn |
| US-V04 | Là IT Admin, tôi muốn xem lịch sử thanh toán theo hợp đồng | Should Have | Danh sách thanh toán, tổng thanh toán so với giá trị HĐ |
| US-V05 | Là IT Manager, tôi muốn xuất danh sách hợp đồng | Must Have | Xuất Excel với lọc theo trạng thái, thời hạn |

---

### 3.4 Module Inventory – Soft Assets

| Story ID | User Story | Priority | Điều kiện chấp nhận |
|----------|-----------|----------|---------------------|
| US-S01 | Là IT Admin, tôi muốn quản lý danh sách email accounts | Must Have | CRUD, lọc theo người dùng, trạng thái |
| US-S02 | Là IT Admin, tôi muốn quản lý domain với cảnh báo hết hạn | Must Have | Hiển thị countdown ngày hết hạn, cảnh báo 30/60/90 ngày |
| US-S03 | Là IT Admin, tôi muốn quản lý VPS/Cloud server | Must Have | CRUD với thông tin cấu hình, IP, môi trường |
| US-S04 | Là IT Admin, tôi muốn quản lý license phần mềm | Must Have | Số lượng license, người được cấp, ngày hết hạn |
| US-S05 | Là IT Admin, tôi muốn quản lý chứng chỉ SSL | Must Have | Tên miền, ngày hết hạn, cảnh báo auto |
| US-S06 | Là IT Admin, tôi muốn import/export danh sách soft assets | Must Have | Template Excel, batch import với validation |

---

### 3.5 Module Inventory – Hard Assets

| Story ID | User Story | Priority | Điều kiện chấp nhận |
|----------|-----------|----------|---------------------|
| US-H01 | Là IT Staff, tôi muốn thêm thiết bị phần cứng vào hệ thống | Must Have | Form đầy đủ, sinh mã tài sản tự động |
| US-H02 | Là IT Staff, tôi muốn gán thiết bị cho người dùng/bộ phận | Must Have | Lịch sử gán thiết bị, cập nhật trạng thái |
| US-H03 | Là IT Asset Manager, tôi muốn theo dõi vòng đời thiết bị | Must Have | Chuyển trạng thái: sử dụng → bảo trì → thanh lý |
| US-H04 | Là IT Admin, tôi muốn ghi lịch sử bảo trì thiết bị | Should Have | Lịch sử theo thiết bị, ngày bảo trì, chi phí |
| US-H05 | Là IT Admin, tôi muốn import/export danh sách phần cứng | Must Have | File Excel chuẩn, import hàng loạt |

---

### 3.6 Module Access Control

| Story ID | User Story | Priority | Điều kiện chấp nhận |
|----------|-----------|----------|---------------------|
| US-A01 | Là IT Admin, tôi muốn tạo tài khoản người dùng trong hệ thống | Must Have | Form tạo user, gửi email mời kích hoạt |
| US-A02 | Là IT Admin, tôi muốn phân quyền người dùng theo vai trò | Must Have | RBAC: Admin/Manager/Staff/Finance/Viewer |
| US-A03 | Là người dùng, tôi muốn đăng nhập bằng email/mật khẩu | Must Have | Đăng nhập an toàn, hỗ trợ 2FA |
| US-A04 | Là IT Admin, tôi muốn xem log hoạt động của người dùng | Should Have | Danh sách hành động theo người dùng và thời gian |
| US-A05 | Là IT Admin, tôi muốn khóa/mở khóa tài khoản | Must Have | Tài khoản bị khóa không thể đăng nhập |

---

### 3.7 Module Infrastructure Management

| Story ID | User Story | Priority | Điều kiện chấp nhận |
|----------|-----------|----------|---------------------|
| US-I01 | Là IT Admin, tôi muốn quản lý danh mục tài nguyên hạ tầng | Must Have | CRUD server/VM/DB/firewall/switch/AP |
| US-I02 | Là IT Admin, tôi muốn quản lý địa chỉ IP và VLAN | Must Have | Danh sách IP, trạng thái (còn trống/đang dùng/dự phòng) |
| US-I03 | Là IT Admin, tôi muốn tải lên sơ đồ mạng (network diagram) | Should Have | Upload file ảnh/PDF, hiển thị và download |
| US-I04 | Là IT Admin, tôi muốn quản lý tài khoản admin cho từng hệ thống | Must Have | Tên hệ thống, username, quyền, trạng thái |
| US-I05 | Là IT Admin, tôi muốn quản lý môi trường (Prod/Staging/Testing) | Must Have | Gán tài nguyên vào môi trường, xem theo môi trường |
| US-I06 | Là IT Admin, tôi muốn danh sách ứng dụng nội bộ đang vận hành | Must Have | Tên app, môi trường, URL, người phụ trách, trạng thái |
| US-I07 | Là IT Admin, tôi muốn quản lý user trên từng hệ thống | Should Have | Map user → hệ thống, quyền, trạng thái |

---

### 3.8 Module Dashboard

| Story ID | User Story | Priority | Điều kiện chấp nhận |
|----------|-----------|----------|---------------------|
| US-D01 | Là IT Manager, tôi muốn xem tổng quan ngân sách IT theo năm | Must Have | Widget hiển thị: Kế hoạch / Thực tế / Còn lại / % |
| US-D02 | Là C-Level, tôi muốn xem biểu đồ xu hướng chi phí 12 tháng | Must Have | Line chart, có thể chọn kỳ |
| US-D03 | Là IT Manager, tôi muốn xem danh sách cảnh báo hết hạn | Must Have | Table cảnh báo: loại, tên, ngày hết hạn, số ngày còn lại |
| US-D04 | Là IT Admin, tôi muốn xem thống kê tài sản theo trạng thái | Must Have | Pie/bar chart: phần cứng theo trạng thái, phần mềm hết hạn |
| US-D05 | Là C-Level, tôi muốn xem KPI IT theo tháng | Should Have | Dạng scorecard: số HĐ hết hạn, số thiết bị hỏng... |
| US-D06 | Là IT Manager, tôi muốn xem tổng chi phí xe tháng này và cảnh báo bất thường | Must Have | Widget tổng chi phí xe, danh sách xe vượt ngưỡng |
| US-D07 | Là IT Manager, tôi muốn xem widget dự chi tháng tới và biểu đồ dự chi vs thực tế | Must Have | Widget hiển thị tổng dự chi, so sánh với chi thực tế tháng trước; biểu đồ 12 tháng |

---

### 3.9 Module Report

| Story ID | User Story | Priority | Điều kiện chấp nhận |
|----------|-----------|----------|---------------------|
| US-R01 | Tôi muốn xem báo cáo ngân sách IT với bộ lọc linh hoạt | Must Have | Lọc theo năm, quý, hạng mục; xuất Excel/PDF |
| US-R02 | Tôi muốn báo cáo chi phí theo nhà cung cấp | Must Have | Tổng chi theo NCC, top NCC chi tiêu nhiều nhất |
| US-R03 | Tôi muốn báo cáo danh sách tài sản theo trạng thái | Must Have | Lọc, sắp xếp, xuất Excel |
| US-R04 | Tôi muốn báo cáo hợp đồng theo nhà cung cấp và trạng thái | Must Have | Bộ lọc linh hoạt, xuất Excel/PDF |
| US-R05 | Tôi muốn báo cáo tài nguyên hạ tầng theo môi trường | Should Have | Chi tiết từng môi trường, xuất Excel |
| US-R06 | Tôi muốn báo cáo chi phí theo xe: cố định + biến đổi theo tháng | Must Have | Lọc theo biển số, tháng/quý/năm; xuất Excel/PDF |
| US-R07 | Tôi muốn báo cáo ngân sách theo dự án | Must Have | Xem chi phí kế hoạch và thực tế theo dự án; xuất Excel/PDF |
| US-R08 | Tôi muốn báo cáo dự chi: so sánh dự chi vs thực tế theo tháng/năm | Must Have | Lọc theo tháng, hạng mục, dự án; xuất Excel/PDF |

---

### 3.10 Module Vehicle Cost Management (Quản lý chi phí theo xe)

| Story ID | User Story | Priority | Điều kiện chấp nhận |
|----------|-----------|----------|---------------------|
| US-VCM01 | Là IT Staff, tôi muốn thêm xe vào hệ thống theo biển số | Must Have | Form đầy đủ, import từ Excel, xuất danh sách |
| US-VCM02 | Là IT Staff, tôi muốn tạo dịch vụ master (GPS, Camera, SIM, Thay dầu...) với loại cố định hoặc biến đổi | Must Have | Mỗi dịch vụ có: tên, costType (fixed/variable), tần suất, defaultCost |
| US-VCM03 | Là IT Staff, tôi muốn gắn dịch vụ cố định vào xe (subscription) với ngày bắt đầu, kết thúc, chi phí/tháng | Must Have | Subscription tạo đúng, chi phí/tháng auto-fill từ defaultCost |
| US-VCM04 | Là IT Admin, tôi muốn xem tổng chi phí cố định tự động tính theo từng xe/tháng | Must Have | Tổng = SUM(monthlyCost) các subscription active; cập nhật realtime khi gắn/hủy |
| US-VCM05 | Là IT Staff, tôi muốn hủy subscription (deactivate) của xe | Must Have | Set endDate = hôm nay, isActive = false; tổng cập nhật lại |
| US-VCM06 | Là IT Staff, tôi muốn ghi nhận chi phí biến đổi (1 lần) cho xe: thay dầu, sửa lốp... | Must Have | Chọn xe + dịch vụ biến đổi + số tiền + ngày + km |
| US-VCM07 | Là IT Manager, tôi muốn xem trang chi tiết xe: subscriptions đang active + biến đổi + tổng/tháng | Must Have | Click xe → detail page hiển thị đầy đủ + banner tổng cố định/tháng |
| US-VCM08 | Là IT Staff, tôi muốn import chi phí biến đổi từ file Excel | Must Have | Template chuẩn, map cột, báo lỗi nếu biển số không tồn tại |
| US-VCM09 | Là IT Manager, tôi muốn so sánh chi phí xe tháng này vs tháng trước | Must Have | Bảng so sánh, highlight xe tăng > 20% |
| US-VCM10 | Là IT Manager, tôi muốn xem bảng ma trận dịch vụ × xe | Should Have | Bảng rã từng loại dịch vụ, ô xác nhận có/không + chi phí |
| US-VCM11 | Là IT Admin, tôi muốn nhận cảnh báo dịch vụ thuê bao sắp hết hạn | Should Have | Cảnh báo 30/60 ngày trước khi subscription endDate |

---

### 3.11 Module Project Budget (Phân bổ ngân sách theo dự án)

| Story ID | User Story | Priority | Điều kiện chấp nhận |
|----------|-----------|----------|---------------------|
| US-P01 | Là IT Manager, tôi muốn tạo danh mục dự án IT để phân loại ngân sách | Must Have | CRUD dự án: tên, mã, mô tả, ngày bắt đầu, ngày kết thúc, trạng thái |
| US-P02 | Là IT Manager, tôi muốn gắn từng hạng mục ngân sách với một dự án cụ thể | Must Have | Mỗi budget_item có thể thuộc về 1 dự án hoặc để "Chung" nếu không thuộc dự án nào |
| US-P03 | Là IT Manager, tôi muốn xem tổng ngân sách được phân bổ theo từng dự án | Must Have | Bảng tổng hợp: dự án – ngân sách kế hoạch – chi thực tế – còn lại |
| US-P04 | Là IT Staff, tôi muốn gắn từng khoản chi phí thực tế với một dự án | Must Have | Dropdown chọn dự án khi nhập chi phí; import Excel cũng có cột dự án |
| US-P05 | Là Finance, tôi muốn xuất báo cáo ngân sách tổng hợp + phân bổ theo dự án | Must Have | Báo cáo 2 cấp: tổng quan + chi tiết theo dự án; xuất Excel/PDF |
| US-P06 | Là C-Level, tôi muốn xem dashboard tổng chi phí chia theo dự án trong năm | Must Have | Pie chart hoặc bar chart dự án × chi phí thực tế |

---

### 3.12 Module Activity Log (Nhật ký hoạt động)

| Story ID | User Story | Priority | Điều kiện chấp nhận |
|----------|-----------|----------|-----------------------|
| US-AL01 | Là Admin, tôi muốn xem toàn bộ lịch sử hoạt động của tất cả người dùng | Must Have | Danh sách log với phân trang, có đủ thông tin: thời gian, user, hành động, module |
| US-AL02 | Là Admin, tôi muốn lọc log theo người dùng, loại hành động, module, khoảng thời gian | Must Have | Bộ lọc linh hoạt, kết quả cập nhật realtime khi lọc |
| US-AL03 | Là Admin, tôi muốn xem chi tiết 1 bản ghi log với dữ liệu trước/sau thay đổi | Must Have | Hiển thị dạng diff hai cột: Trước thay đổi vs Sau thay đổi |
| US-AL04 | Là người dùng, tôi muốn xem lịch sử đăng nhập của chính mình | Must Have | Danh sách: thời gian đăng nhập, IP, thiết bị, trạng thái (thành công/thất bại) |
| US-AL05 | Là Manager, tôi muốn xem log của Staff trong các module mình quản lý | Must Have | Chỉ hiển thị log thuộc module Manager có quyền; không thấy log module khác |
| US-AL06 | Là Admin, tôi muốn xuất log ra file Excel/CSV | Must Have | Xuất theo bộ lọc hiện tại; tên file có timestamp |
| US-AL07 | Là Admin, tôi muốn cấu hình chính sách lưu trữ log (số tháng giữ, archive) | Should Have | Cài được trong Configuration; hiển thị cảnh báo khi tỷ lệ log đầy |

---

### 3.13 Module Cost Forecast (Dự chi hàng tháng)

| Story ID | User Story | Priority | Điều kiện chấp nhận |
|----------|-----------|----------|-----------------------|
| US-FC01 | Là IT Staff, tôi muốn tạo bảng dự chi cho tháng tiếp theo | Must Have | Form nhập: chọn tháng/năm, thêm các khoản dự chi với hạng mục, số tiền, NCC, dự án |
| US-FC02 | Là IT Staff, tôi muốn sao chép bảng dự chi từ tháng trước để tạo nhanh | Must Have | Chọn tháng nguồn, hệ thống clone toàn bộ items sang tháng mới |
| US-FC03 | Là IT Manager, tôi muốn phê duyệt / từ chối bảng dự chi | Must Have | Xem toàn bộ items, approve/reject với lý do; notification cho người tạo |
| US-FC04 | Là IT Manager, tôi muốn xem cảnh báo khi dự chi vượt ngân sách còn lại | Must Have | Warning nổi bật khi tổng dự chi > ngân sách còn lại của quý/năm |
| US-FC05 | Là IT Manager, tôi muốn xem tổng hợp dự chi 12 tháng trong năm | Must Have | Bảng 12 cột tháng, tổng cả năm, so với ngân sách kế hoạch |
| US-FC06 | Là IT Manager, tôi muốn so sánh dự chi vs chi thực tế tháng đã qua | Must Have | Bảng so sánh: dự chi – thực tế – chênh lệch – % chính xác; highlight chênh lệch > 20% |
| US-FC07 | Là IT Staff, tôi muốn import danh sách dự chi từ Excel | Should Have | Template chuẩn, validate hạng mục, NCC, dự án |
| US-FC08 | Là Finance, tôi muốn xuất báo cáo dự chi vs thực tế | Must Have | Xuất Excel/PDF theo tháng, quý, năm |

---

### 3.14 Module Configuration

| Story ID | User Story | Priority | Điều kiện chấp nhận |
|----------|-----------|----------|-----------------------|
| US-CFG01 | Là IT Admin, tôi muốn quản lý danh mục dùng chung (loại chi phí, loại tài sản, loại hợp đồng) | Must Have | CRUD danh mục, phân theo module, sắp xếp thứ tự |
| US-CFG02 | Là IT Admin, tôi muốn cấu hình ngưỡng cảnh báo | Must Have | Cài được ngưỡng hết hạn, vượt ngân sách, chi phí xe; tác động ngay |
| US-CFG03 | Là IT Admin, tôi muốn cấu hình thông tin công ty | Must Have | Form thông tin tổ chức, logo, đơn vị tiền tệ |
| US-CFG04 | Là IT Admin, tôi muốn import/export danh mục cấu hình | Should Have | File Excel chuẩn, import với validation |

---

## 4. LUỒNG MÀN HÌNH (SCREEN FLOWS)

### 4.1 Navigation Structure

```
ITMS
├── Dashboard (Trang chủ)
├── Ngân sách
│   ├── Kế hoạch ngân sách
│   ├── Chi phí thực tế
│   └── Ngân sách theo dự án
├── Nhà cung cấp & Hợp đồng
│   ├── Nhà cung cấp
│   └── Hợp đồng
├── Inventory
│   ├── Soft Inventory
│   │   ├── Email Accounts
│   │   ├── Domain
│   │   ├── VPS / Cloud
│   │   ├── License
│   │   └── SSL Certificates
│   └── Hard Inventory
│       └── Thiết bị phần cứng
├── Hạ tầng
│   ├── Tài nguyên hạ tầng
│   ├── Quản lý IP / VLAN
│   ├── Sơ đồ mạng
│   ├── Tài khoản admin
│   ├── Môi trường
│   ├── Ứng dụng nội bộ
│   └── Users theo hệ thống
├── Quản lý chi phí xe
│   ├── Phương tiện (danh sách xe → click → chi tiết xe)
│   │   └── Chi tiết xe: thông tin + subscriptions + variable costs + tổng/tháng
│   ├── Dịch vụ (master list: fixed/variable + defaultCost)
│   └── Chi phí biến đổi (ghi nhận 1 lần)
├── Dự chi (Cost Forecast)
│   ├── Danh sách bảng dự chi
│   ├── Tạo / Sửa bảng dự chi
│   ├── Phê duyệt dự chi
│   ├── Tổng hợp dự chi theo năm
│   └── So sánh dự chi vs thực tế
├── Báo cáo
├── Activity Log
│   ├── Nhật ký đăng nhập
│   ├── Nhật ký thay đổi dữ liệu
│   └── Lịch sử của tôi
├── Cấu hình
│   ├── Danh mục
│   └── Cài đặt chung (bao gồm ngưỡng cảnh báo chi phí xe, chính sách lưu log, ngưỡng dự chi)
└── Quản lý tài khoản
    ├── Người dùng
    └── Phân quyền
```

### 4.2 Nguyên tắc CRUD chung cho mọi màn hình

Mỗi màn hình danh sách (list view) đều có:
- **Tìm kiếm** và **lọc** theo các trường chính
- Nút **Thêm mới** (Create)
- **Bảng dữ liệu** có phân trang, sắp xếp cột
- Nút **Xuất Excel / PDF** cho từng màn hình
- Nút **Import** với template Excel và hướng dẫn
- **Chỉnh sửa** (Edit) tương ứng trên từng dòng
- **Xóa** với xác nhận (soft delete, không xóa vĩnh viễn ngay)

---

## 5. YÊU CẦU KỸ THUẬT SẢN PHẨM

### 5.1 Tech Stack Đề xuất

| Layer | Công nghệ |
|-------|-----------|
| Frontend | Next.js / React + TailwindCSS |
| Backend | Node.js (NestJS) hoặc Python (FastAPI) |
| Database | PostgreSQL |
| Auth | JWT + bcrypt, hỗ trợ 2FA (TOTP) |
| File Storage | MinIO (on-premise) hoặc S3 |
| Cache | Redis |
| Export | Apache POI (Excel) / Puppeteer (PDF) |

### 5.2 Non-functional Requirements

| ID | Chỉ tiêu | Giá trị |
|----|---------|---------|
| NFR-01 | Thời gian tải trang | < 3 giây |
| NFR-02 | Uptime | ≥ 99.5% |
| NFR-03 | Số user đồng thời | 50 users |
| NFR-04 | Backup | Hàng ngày, giữ 30 ngày |
| NFR-05 | Bảo mật | HTTPS, mã hóa mật khẩu, token hết hạn 8h |

---

## 6. ROADMAP PHÁT TRIỂN

### Phase 1 – Core (Tháng 1–2)
- [ ] Authentication & User Management
- [ ] Budget Planning
- [ ] Cost Management
- [ ] Dashboard cơ bản

### Phase 2 – Asset & Vendor (Tháng 3–4)
- [ ] Vendor & Contract Management
- [ ] Inventory (Soft + Hard)
- [ ] Alert Engine (cảnh báo hết hạn)
- [ ] **Activity Log** (nhật ký hoạt động, audit trail)
- [ ] **Cost Forecast (Dự chi)** (lập dự chi hàng tháng, phê duyệt, so sánh)

### Phase 3 – Infrastructure, Vehicle & Report (Tháng 5–6)
- [ ] Infrastructure Management
- [ ] **Vehicle Cost Management** (danh mục xe, dịch vụ theo xe, chi phí biến đổi ZNS/SMS)
- [ ] **Project Budget** (phân bổ ngân sách theo dự án)
- [ ] Alert Engine v2 (cảnh báo chi phí xe bất thường, cảnh báo vượt ngân sách dự án)
- [ ] Report Module
- [ ] Configuration Module
- [ ] Import/Export nâng cao

### Phase 4 – Polish & Launch
- [ ] Performance optimization
- [ ] UI/UX refinement
- [ ] User Acceptance Testing
- [ ] Go-live

---

## 7. TIÊU CHÍ CHẤP NHẬN SẢN PHẨM (ACCEPTANCE CRITERIA)

- Tất cả User Stories "Must Have" đã được phát triển và kiểm thử
- Phân quyền hoạt động đúng: user chỉ thấy và làm được việc theo vai trò
- Import/Export hoạt động đúng với file mẫu
- Cảnh báo hết hạn kích hoạt đúng thời điểm
- Không có lỗi nghiêm trọng (P0, P1) khi go-live
- Hiệu năng đạt tiêu chí NFR
- Dự chi được lập và phê duyệt hàng tháng; so sánh dự chi vs thực tế chính xác

---

*Tài liệu này là cơ sở để team phát triển xây dựng SRS và bắt đầu sprint planning.*
