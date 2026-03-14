# CHỈ ĐẠO PHÁT TRIỂN SẢN PHẨM ITMS
## Quy trình làm việc & Tiêu chuẩn bắt buộc

**Phiên bản:** 1.0  
**Ngày:** 13/03/2026  
**Áp dụng cho:** Tất cả agent tham gia phát triển ITMS

---

## 1. NGUYÊN TẮC TỔNG QUÁT

> 🔴 **Mọi agent PHẢI đọc file này TRƯỚC KHI bắt đầu bất kỳ công việc nào.**

### 1.1 Tài liệu bắt buộc đọc trước khi code

| Thứ tự | File | Mục đích |
|--------|------|----------|
| 1 | `AGENT_FLOW.md` (file này) | Quy trình, quy tắc bắt buộc |
| 2 | `UI_Guideline.md` | Design tokens, components, patterns |
| 3 | `Technical_Architecture.md` | Tech stack, cấu trúc thư mục, API convention |
| 4 | `SRS_IT_Management_System.md` | Schema DB, API specs |
| 5 | `docs/PLAN-itms-development.md` | Kế hoạch task hiện tại |
| 6 | `DAILYSTANDUP.md` | Nhật ký bàn giao từ agent trước |

---

## 2. QUY TẮC UI — TUÂN THỦ TUYỆT ĐỐI

### 2.1 Bắt buộc

| # | Quy tắc | Tham chiếu |
|---|---------|-----------|
| UI-01 | **Font Inter** — đúng weight theo scale | `UI_Guideline.md` § 2.2 |
| UI-02 | **Primary color #f2d00d** — chỉ dùng cho CTA, active, accent | § 2.1 |
| UI-03 | **Card = `rounded-xl border border-slate-200 shadow-sm`** | § 4.5 |
| UI-04 | **Table header = `text-xs font-bold uppercase tracking-wider`** | § 4.4 |
| UI-05 | **Status badge = dot + pill** theo color scheme chuẩn | § 4.3 |
| UI-06 | **Icons = Bootstrap Icons** (`bi bi-xxx`), luôn kèm label | § 2.6 |
| UI-07 | **Spacing = hệ thống 4px/8px** (`p-6` cards, `gap-6` grid, `p-8` page) | § 2.3 |
| UI-08 | **Dark mode** classes đầy đủ trên mọi element | § 2.1 |
| UI-09 | **Responsive** — mobile-first, breakpoints md → lg → xl | § 6 |
| UI-10 | **Sidebar layout** chuẩn theo App Shell pattern | § 3.1 |

### 2.2 Kiểm tra trước khi bàn giao

```
✅ Chạy browser viewport 375px, 768px, 1024px, 1440px — không lỗi layout
✅ Toggle dark mode — tất cả element phải có dark variant
✅ So sánh với UI reference screenshots — phong cách nhất quán
✅ Không có hardcoded color — chỉ dùng design tokens
```

---

## 3. QUY TRÌNH BÀN GIAO GIỮA CÁC AGENTS

### 3.1 Sau khi hoàn thành task

Agent **PHẢI** ghi vào `DAILYSTANDUP.md` theo format sau:

```markdown
---
## [YYYY-MM-DD HH:mm] — Agent: [tên agent/session ID]

### ✅ Đã hoàn thành
- [ mô tả ngắn gọn từng việc đã làm ]
- Files đã tạo/sửa: `file1.tsx`, `file2.ts`

### ⚠️ Vấn đề phát hiện
- [ vấn đề cần lưu ý, nếu có ]

### 📋 Bàn giao cho agent tiếp theo
- [ việc cần làm tiếp ]
- [ test case cần chạy ]
- [ file cần review ]

### 🧪 Trạng thái Test
- Unit tests: ✅ Pass / ❌ Fail (số pass/total)
- Responsive tests: ✅ Pass / ❌ Fail (viewports đã test)
---
```

### 3.2 Khi bắt đầu session mới

Agent mới **PHẢI** thực hiện:

```
1. Đọc DAILYSTANDUP.md → mục bàn giao gần nhất
2. Đọc PLAN-itms-development.md → task hiện tại
3. Review code agent trước đã viết:
   - Kiểm tra tuân thủ UI_Guideline.md
   - Kiểm tra tuân thủ coding standards
   - Chạy tests hiện có
4. Nếu phát hiện vấn đề → ghi nhận và sửa TRƯỚC KHI làm task mới
5. Nếu OK → đánh dấu [x] task hoàn thành và bắt đầu task tiếp theo
```

### 3.3 Sơ đồ quy trình

```
Agent A hoàn thành task
    │
    ├─→ Ghi DAILYSTANDUP.md
    ├─→ Cập nhật PLAN (đánh dấu [x])
    └─→ Chạy tests → Ghi kết quả
         │
         ▼
Agent B bắt đầu
    │
    ├─→ Đọc DAILYSTANDUP.md
    ├─→ Review code Agent A
    │     ├─ OK → Tiếp tục task mới
    │     └─ Có lỗi → Sửa + ghi nhận
    ├─→ Viết code task mới
    ├─→ Viết tests
    └─→ Ghi DAILYSTANDUP.md → Bàn giao
```

---

## 4. QUY TẮC TESTING — BẮT BUỘC

### 4.1 Mỗi tính năng PHẢI có

| Loại test | Công cụ | Yêu cầu |
|-----------|---------|---------|
| **Unit Test** | Jest / Vitest | Mỗi function/component mới phải có test |
| **API Test** | Jest + Supertest | Mỗi endpoint phải test success + error case |
| **Component Test** | Testing Library | Mỗi component phải test render + interaction |
| **Responsive Test** | Playwright / Vitest | Test 4 breakpoints: mobile, tablet, laptop, desktop |

### 4.2 Responsive Test — Viewports bắt buộc

```typescript
const REQUIRED_VIEWPORTS = [
  { name: 'mobile',  width: 375,  height: 812 },  // iPhone SE
  { name: 'tablet',  width: 768,  height: 1024 },  // iPad
  { name: 'laptop',  width: 1024, height: 768 },   // Laptop
  { name: 'desktop', width: 1440, height: 900 },   // Desktop
];
```

### 4.3 Checklist test trước bàn giao

```
□ Unit tests pass (coverage ≥ 80%)
□ Component render test pass
□ Responsive test — 4 viewports pass
□ No console errors
□ No TypeScript errors (tsc --noEmit)
□ ESLint pass (0 errors, warnings OK)
□ API endpoint tests pass (nếu có thay đổi backend)
```

### 4.4 Naming convention cho test files

```
src/
├── components/
│   ├── KPICard.tsx
│   └── __tests__/
│       ├── KPICard.test.tsx          # Unit test
│       └── KPICard.responsive.test.tsx # Responsive test
├── modules/
│   └── budgets/
│       ├── budgets.service.ts
│       └── __tests__/
│           └── budgets.service.test.ts
```

---

## 5. QUY TẮC CODE

### 5.1 Conventions bắt buộc

| Quy tắc | Chi tiết |
|---------|---------|
| **TypeScript strict** | `strict: true` — không dùng `any` |
| **Naming** | camelCase (biến), PascalCase (component/class), UPPER_SNAKE (constants) |
| **Import** | Absolute paths: `@/components/...`, `@/lib/...` |
| **API response** | Luôn wrap trong `{ success, data, meta?, error? }` |
| **Error handling** | Try-catch + NestJS Exception Filters |
| **Comments** | Chỉ khi logic phức tạp. Code phải tự giải thích |
| **Commit** | Conventional Commits: `feat:`, `fix:`, `refactor:`, `test:` |

### 5.2 File mới phải có

```
Mỗi component/module mới tạo PHẢI có:
  ✅ File code chính (.tsx / .ts)
  ✅ File test (__tests__/*.test.ts)
  ✅ File responsive test (nếu là UI component)
  ✅ Types/interfaces riêng (nếu cần)
```

---

## 6. PRIORITY & ESCALATION

### 6.1 Thứ tự ưu tiên khi phát hiện vấn đề

```
P0 — BLOCKING:   Security vulnerability, data loss → Sửa ngay
P1 — CRITICAL:   Build fails, test fails, UI broken → Sửa trong session
P2 — IMPORTANT:  UI inconsistency, missing test → Sửa trước khi bàn giao
P3 — NICE-TO-HAVE: Refactor, optimization → Ghi nhận, sửa sau
```

### 6.2 Khi không chắc chắn

```
1. Đọc lại tài liệu (SRS/PRD/BRD)
2. Kiểm tra UI_Guideline.md
3. Nếu vẫn không rõ → GHI VÀO DAILYSTANDUP phần "Vấn đề" → để user quyết định
4. KHÔNG tự ý thay đổi kiến trúc hoặc tech stack
```

---

## 7. TÓM TẮT CHECKLIST

> Mỗi agent PHẢI hoàn thành tất cả mục dưới đây trước khi kết thúc session:

- [ ] Code tuân thủ UI_Guideline.md
- [ ] TypeScript không lỗi (`tsc --noEmit`)
- [ ] ESLint pass
- [ ] Unit tests viết đầy đủ và pass
- [ ] Responsive tests (4 viewports) pass
- [ ] Ghi DAILYSTANDUP.md
- [ ] Cập nhật PLAN (đánh dấu task xong)
- [ ] Review code session trước (nếu là agent mới)

---

*Tài liệu này có hiệu lực áp dụng cho toàn bộ quá trình phát triển ITMS. Mọi vi phạm sẽ dẫn đến bàn giao không hợp lệ.*
