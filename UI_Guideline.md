# ITMS UI Guideline
## Chuẩn thiết kế giao diện – Hệ thống Quản trị CNTT Nội bộ

> Tài liệu này mô tả chi tiết design system được trích xuất từ bộ UI reference. Mọi màn hình mới **PHẢI** tuân theo guideline này để đảm bảo tính nhất quán.

---

## 1. Phong cách thiết kế tổng quan

| Đặc điểm | Mô tả |
|-----------|-------|
| **Phong cách** | Clean B2B Enterprise — tối giản, chuyên nghiệp, tập trung vào dữ liệu |
| **Tone màu** | Warm neutral (vàng gold + slate xám) — không lạnh lẽo như B2B truyền thống |
| **Không gian** | Rộng rãi, nhiều whitespace, grid rõ ràng |
| **Cảm giác** | Premium nhưng thân thiện — phù hợp nội bộ doanh nghiệp Việt Nam |
| **Dark mode** | Hỗ trợ sẵn qua class `dark:` — nền tối ấm (#221f10) thay vì đen thuần |

### Nguyên tắc cốt lõi
1. **Data-first** — Dữ liệu là trung tâm, UI hỗ trợ đọc nhanh
2. **Consistent spacing** — Dùng hệ thống 4px/8px khoảng cách
3. **Minimal decoration** — Không shadow nặng, không gradient phức tạp
4. **Contextual color** — Màu chỉ dùng có ý nghĩa (status, CTA, alert)

---

## 2. Design Tokens

### 2.1 Bảng màu (Color Palette)

#### Brand Colors
```css
--color-primary:          #f2d00d;   /* Gold — CTA, active state, accent */
--color-primary-hover:    #f2d00d/90; /* 90% opacity on hover */
--color-primary-bg:       #f2d00d/10; /* 10% opacity for icon background */
--color-primary-shadow:   #f2d00d/20; /* 20% opacity for button shadow */
```

#### Background
```css
/* Light mode */
--color-bg-page:          #f8f8f5;   /* Warm off-white page background */
--color-bg-card:          #ffffff;   /* Card, sidebar content */
--color-bg-input:         #f1f5f9;   /* slate-100 — input, search */
--color-bg-hover:         #f8fafc;   /* slate-50 — row hover */
--color-bg-table-header:  #f8fafc;   /* slate-50 — table thead */

/* Dark mode */
--color-bg-page-dark:     #221f10;   /* Warm dark background */
--color-bg-card-dark:     #0f172a;   /* slate-900 */
--color-bg-input-dark:    #1e293b;   /* slate-800 */
```

#### Sidebar
```css
--color-sidebar:          #020617;   /* slate-950 — dark sidebar */
--color-sidebar-text:     #94a3b8;   /* slate-400 — inactive items */
--color-sidebar-active:   #f2d00d;   /* primary — active item background */
--color-sidebar-active-text: #020617; /* slate-950 — text on active */
--color-sidebar-hover:    #0f172a;   /* slate-900 — hover background */
```

#### Text
```css
--color-text-primary:     #0f172a;   /* slate-900 — headings, body */
--color-text-secondary:   #64748b;   /* slate-500 — descriptions, labels */
--color-text-tertiary:    #94a3b8;   /* slate-400 — timestamps, hints */
--color-text-on-primary:  #0f172a;   /* Dark text on gold buttons */
```

#### ⚠️ Quy tắc Text Color (BẮT BUỘC)

> **QUAN TRỌNG:** Trong Tailwind v4, class `text-muted` mặc định map sang `--color-muted` (màu nền, gần trắng). File `globals.css` đã override `text-muted` → `muted-foreground` (slate-600) để đọc được. **KHÔNG** cần dùng workaround `text-foreground/60` hay `text-foreground/70`.

| Cấp độ | Tailwind Class | Khi nào dùng | Ví dụ |
|--------|---------------|-------------|-------|
| **Primary** | `text-foreground` | Tiêu đề, data chính, body text | H1, tên NCC, giá trị MST, số tiền |
| **Secondary** | `text-muted` | Labels, descriptions, table headers | "Quản lý danh sách...", "MST", "Email", column headers |
| **Mono codes** | `text-foreground/70` | Mã code, ID, font-mono items | NCC-0001, HD-2026-0001 |
| **Placeholder** | `placeholder:text-muted` | Placeholder trong input | "Tìm theo tên, mã..." |
| **Disabled** | `text-foreground/40` | Text bị disable | Nút disabled, menu inactive |

**KHÔNG được dùng:**
- ❌ `text-muted` cho data chính (tên, số tiền, MST values)
- ❌ `text-foreground` cho labels/headers phụ
- ❌ Hardcode màu như `text-gray-400`, `text-slate-300` cho text cần đọc

#### Status Colors
```css
/* Success: Approved, Active, Stable */
--color-success-bg:       #dcfce7;   /* green-100 */
--color-success-text:     #15803d;   /* green-700 */
--color-success-dot:      #22c55e;   /* green-500 */

/* Warning: Pending, Expiring */
--color-warning-bg:       #fef3c7;   /* amber-100 */
--color-warning-text:     #b45309;   /* amber-700 */
--color-warning-dot:      #f59e0b;   /* amber-500 */

/* Danger: Critical, Rejected, Overdue */
--color-danger-bg:        #fee2e2;   /* red-100 */
--color-danger-text:      #b91c1c;   /* red-700 */
--color-danger-dot:       #ef4444;   /* red-500 */

/* Neutral: Draft, Inactive */
--color-neutral-bg:       #f1f5f9;   /* slate-100 */
--color-neutral-text:     #475569;   /* slate-600 */
--color-neutral-dot:      #94a3b8;   /* slate-400 */
```

#### Border
```css
--color-border:           #e2e8f0;   /* slate-200 */
--color-border-subtle:    #e2e8f0/50; /* 50% opacity */
--color-border-focus:     #f2d00d;   /* primary ring on focus */
```

### 2.2 Typography

#### Font
```css
font-family: 'Inter', system-ui, -apple-system, sans-serif;
```

**Weights sử dụng:**
| Weight | Tên | Sử dụng |
|--------|-----|---------|
| 400 | Regular | Body text, descriptions |
| 500 | Medium | Sidebar items, labels |
| 600 | Semibold | Form labels, nav items, table headers |
| 700 | Bold | Headings, card titles, buttons, table data |
| 900 | Black | Page héros greeting (Dashboard) |

#### Scale
| Element | Size | Weight | Class |
|---------|------|--------|-------|
| Page title (H1) | 30px (text-3xl) | Black/Extrabold | `text-3xl font-black` |
| Card title (H4) | 18px (text-lg) | Bold | `text-lg font-bold` |
| Section title | 16px (text-base) | Bold | `text-base font-bold` |
| KPI value | 24px (text-2xl) | Bold | `text-2xl font-bold` |
| Body text | 14px (text-sm) | Regular | `text-sm` |
| Label | 14px (text-sm) | Semibold | `text-sm font-semibold` |
| Table header | 12px (text-xs) | Bold, uppercase | `text-xs font-bold uppercase tracking-wider` |
| Caption / Timestamp | 12px (text-xs) | Regular | `text-xs text-slate-400` |
| Badge text | 12px (text-xs) | Bold | `text-xs font-bold` |
| Metadata label | 10px (text-[10px]) | Bold, uppercase | `text-[10px] uppercase tracking-wider` |

### 2.3 Spacing System

Dùng hệ thống 4px grid qua Tailwind spacing:

| Token | Pixels | Sử dụng |
|-------|--------|---------|
| `p-2` | 8px | Icon padding, compact elements |
| `p-3` | 12px | Nav items, input internal |
| `p-4` | 16px | Small cards, sidebar sections |
| `p-6` | 24px | Cards, main sections |
| `p-8` | 32px | Page body padding, login card |
| `gap-2` | 8px | Inline elements |
| `gap-3` | 12px | Nav items, button groups |
| `gap-4` | 16px | Grid items (small) |
| `gap-6` | 24px | Grid items (main), section spacing |
| `gap-8` | 32px | Major section spacing |
| `space-y-1` | 4px | Nav menu items |
| `space-y-6` | 24px | Activity list items, form fields |

### 2.4 Border Radius

```css
--radius-default: 0.5rem;  /* 8px — buttons, inputs, badges */
--radius-lg:      1rem;     /* 16px — cards, containers */
--radius-xl:      1.5rem;   /* 24px — sidebar nav active */
--radius-full:    9999px;   /* Avatars, dots, pill badges */
```

### 2.5 Shadows

```css
/* Minimal shadow cho cards */
shadow-sm           /* Cards chính */
shadow-xl           /* Login card, dark feature card (Asset Health) */
shadow-lg shadow-primary/20  /* CTA button glow effect */
```

### 2.6 Iconography — Bootstrap Icons

**Thư viện:** [Bootstrap Icons](https://icons.getbootstrap.com/) — 2,000+ icon SVG miễn phí, hỗ trợ icon font.

#### Cài đặt

**Cách 1: CDN (khuyên dùng cho dev nhanh)**
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.min.css">
```

**Cách 2: npm (cho production build)**
```bash
npm i bootstrap-icons
```

Sau đó import trong CSS:
```css
@import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.min.css");
```

#### Sử dụng Icon Font

```html
<!-- Cơ bản -->
<i class="bi bi-house-door"></i>

<!-- Đổi size và màu bằng CSS -->
<i class="bi bi-alarm" style="font-size: 1.5rem; color: #f2d00d;"></i>

<!-- Với Tailwind -->
<i class="bi bi-bell text-xl text-primary"></i>
<i class="bi bi-gear text-lg text-slate-400"></i>
```

#### Quy tắc sử dụng
- Size mặc định: `text-xl` (20px) cho sidebar/topbar
- Size nhỏ trong badges/table: `text-sm` (14px)
- Size lớn cho KPI cards: `text-2xl` (24px)
- Luôn kèm text label (trừ toolbar icons)
- Dùng `fill` variant khi cần icon filled (ví dụ: `bi-heart-fill`)

#### Tìm icon

Truy cập **[https://icons.getbootstrap.com/](https://icons.getbootstrap.com/)** → tìm theo từ khóa → copy class name.

#### Icon mapping cho ITMS

| Chức năng | Icon class | Mô tả |
|-----------|-----------|--------|
| Dashboard | `bi bi-speedometer2` | Bảng điều khiển |
| Assets | `bi bi-laptop`, `bi bi-pc-display` | Tài sản |
| Contracts | `bi bi-file-earmark-text` | Hợp đồng |
| Budgets | `bi bi-wallet2`, `bi bi-cash-stack` | Ngân sách |
| Cost Forecast | `bi bi-graph-up-arrow` | Dự chi |
| Alerts | `bi bi-bell`, `bi bi-bell-fill` | Cảnh báo |
| Reports | `bi bi-bar-chart-line` | Báo cáo |
| Settings | `bi bi-gear` | Cài đặt |
| Search | `bi bi-search` | Tìm kiếm |
| User | `bi bi-person-circle` | Người dùng |
| Add | `bi bi-plus-lg` | Thêm mới |
| Edit | `bi bi-pencil-square` | Chỉnh sửa |
| Delete | `bi bi-trash3` | Xóa |
| Assign | `bi bi-person-plus` | Gán người |
| Maintenance | `bi bi-tools` | Bảo trì |
| Import | `bi bi-upload` | Import |
| Export | `bi bi-download` | Export |
| Logout | `bi bi-box-arrow-right` | Đăng xuất |
| Warning | `bi bi-exclamation-triangle-fill` | Cảnh báo |
| Success | `bi bi-check-circle-fill` | Thành công |
| Info | `bi bi-info-circle` | Thông tin |
| Timer | `bi bi-clock` | Thời gian |
| Expand | `bi bi-chevron-down` | Mở rộng |
| Navigate | `bi bi-chevron-right` | Điều hướng |
| Shield | `bi bi-shield-check` | Bảo mật |
| Email | `bi bi-envelope` | Email |
| Lock | `bi bi-lock` | Khóa |
| Eye | `bi bi-eye`, `bi bi-eye-slash` | Hiện/Ẩn |
| Filter | `bi bi-funnel` | Lọc |
| Calendar | `bi bi-calendar3` | Lịch |
| Vehicle | `bi bi-truck` | Xe |
| Network | `bi bi-diagram-3` | Mạng |
| Server | `bi bi-hdd-rack` | Máy chủ |
| Activity Log | `bi bi-journal-text` | Nhật ký |
| Approve | `bi bi-check2-circle` | Phê duyệt |
| Reject | `bi bi-x-circle` | Từ chối |
| Copy | `bi bi-copy` | Sao chép |

### 2.7 Logo Usage — HAI VAN+

**File nguồn:** `/public/logo.png` (wordmark xám, nền trong suốt)

#### Kích thước theo context

| Vị trí | Height | Tailwind | Lý do |
|--------|--------|----------|-------|
| **Sidebar header** | 28px | `h-7` | Cân bằng với header 64px, không lấn nav |
| **Login desktop** (left panel) | 48px | `h-12` | Branding focal, dưới heading |
| **Login mobile** (header) | 32px | `h-8` | Compact cho mobile |

#### Quy tắc sử dụng

1. **Dark background** — Dùng `brightness-0 invert` để logo xám → trắng:
```html
<Image src="/logo.png" alt="HAI VAN+" height={28} width={120}
  className="h-7 w-auto brightness-0 invert" />
```

2. **Light background** — Giữ nguyên màu gốc (xám):
```html
<Image src="/logo.png" alt="HAI VAN+" height={32} width={140}
  className="h-8 w-auto" />
```

3. **Spacing** — Luôn giữ khoảng cách tối thiểu `gap-3` (12px) giữa logo và text bên cạnh.
4. **Don'ts:**
   - ❌ Không stretch/resize không tỷ lệ → luôn dùng `w-auto` với fixed height
   - ❌ Không đặt logo trên background có pattern phức tạp
   - ❌ Không dùng logo thay thế cho icon trong nav items

---

## 3. Layout Patterns

### 3.1 Main Layout (App Shell)

```
┌─────────────────────────────────────────────────┐
│  SIDEBAR (w-64)  │  TOPBAR (h-16, sticky)       │
│  bg: slate-950   │  bg: white, border-b          │
│                  │  [Search] ... [Bell] [Avatar]  │
│  Logo + Nav      ├──────────────────────────────│
│                  │  CONTENT (p-8, max-w-[1400px]) │
│  Settings        │  [Breadcrumb]                  │
│  Sign Out        │  [Page Title + Actions]        │
│                  │  [Grid / Table / Detail]       │
└─────────────────────────────────────────────────┘
```

**Sidebar:**
- Width: `w-64` (256px), fixed
- Background: `bg-slate-950` (rất tối)
- Logo area: `p-6`, logo image (`h-7 brightness-0 invert`) + app name "ITMS"
- Nav items: `px-3 py-3 rounded-xl`, gap `space-y-1`
- Active item: `bg-primary text-slate-950 font-semibold`
- Inactive: `text-slate-400 hover:bg-slate-900 hover:text-primary`
- Bottom: Settings + Sign Out, bordered top `border-t border-slate-900`

**Topbar:**
- Height: `h-16`, sticky `top-0 z-10`
- Background: `bg-white`, bottom border
- Left: Search input (w-96, bg-slate-100, rounded-lg)
- Right: Notification bell + avatar
- Avatar: `w-10 h-10 rounded-full bg-primary`, initials text

**Content Area:**
- Padding: `p-8`
- Max width: `max-w-[1400px] mx-auto w-full`
- Gap between sections: `space-y-8`

### 3.2 Auth Layout (Login / 2FA)

- Full page centered: `min-h-screen flex items-center justify-center`
- Background: `bg-background-light` (#f8f8f5)
- Card: `max-w-md`, `bg-white shadow-xl rounded-xl p-8`
- Logo centered on top
- Form inputs: full width, icons left
- CTA button: full width, `bg-primary`, `shadow-lg shadow-primary/20`
- Footer: trust badge + help links

### 3.3 List Page Layout

```
Header section (white bg, border-b):
  Breadcrumb (Home / Section)
  Page Title (text-3xl font-bold) + Action Buttons

Content section (p-6):
  Filter Bar (rounded-xl, border):
    [Search input] ... [Dropdown filters] [Filter icon]
  
  Data Table (rounded-xl, border):
    Table Header (bg-slate-50, uppercase tracking)
    Table Rows (hover:bg-primary/5, cursor-pointer)
    Pagination Footer (bg-slate-50, border-t)
```

### 3.4 Detail Page Layout

```
Breadcrumb
Hero Section (card):
  [Image/Icon] + [Title + Tags + Status] + [Action Buttons]

Tabs Navigation (border-b):
  Active: border-b-2 border-primary, font-bold
  Inactive: text-slate-500, hover:border-slate-300

Content Grid (3-column):
  Left (col-span-2): Specification cards, Info cards
  Right (col-span-1): Assignee card, Summary/Health card

Activity Timeline (full width card)
```

---

## 4. Component Library

### 4.1 Buttons

| Variant | Classes | Khi nào dùng |
|---------|---------|--------------|
| **Primary CTA** | `bg-primary text-slate-900 font-bold rounded-lg shadow-lg shadow-primary/20 hover:shadow-lg` | Tạo mới, Submit, Login |
| **Secondary** | `border-2 border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50` | Import, Cancel, các action phụ |
| **Ghost** | `text-slate-500 hover:text-primary p-2` | Icon-only actions, filter toggle |
| **Inline link** | `text-primary font-bold hover:underline` | "View All", "Forgot password?" |
| **Dark CTA** | `bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-lg` | Actions trong dark card (ví dụ: Run Diagnostics) |

Button sizing: `px-4 py-2` (normal), `px-6 py-2.5` (large), `py-3.5` (full width)

### 4.2 Form Inputs

```html
<!-- Text input with icon -->
<div class="relative">
  <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">icon</span>
  <input class="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 bg-white 
    focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
</div>

<!-- Search input (in topbar/filter bar) -->
<input class="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg 
  focus:ring-2 focus:ring-primary text-sm" />

<!-- Dropdown filter (in filter bar) -->
<button class="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg text-sm font-medium 
  border border-transparent hover:border-slate-300">
  Label: Value
  <span class="material-symbols-outlined text-lg text-slate-400">expand_more</span>
</button>
```

### 4.3 Status Badges

```html
<!-- Badge with dot indicator -->
<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold
  bg-{color}-100 text-{color}-700">
  <span class="size-1.5 rounded-full bg-{color}-500"></span>
  Label
</span>
```

| Status | Color scheme |
|--------|-------------|
| Approved / Active / Stable | `green-100/700/500` |
| Pending / Expiring | `amber-100/700/500` |
| Critical / Rejected / Overdue | `red-100/700/500` |
| Draft / Inactive | `slate-100/600/400` |

### 4.4 Data Table

```
Table container: bg-white rounded-xl border border-slate-200 overflow-hidden

Header row: bg-slate-50
  Text: text-xs font-bold uppercase tracking-wider text-slate-500
  Padding: px-6 py-4

Data row: hover:bg-primary/5 transition-colors cursor-pointer group
  Padding: px-6 py-4
  Divider: divide-y divide-slate-100
  
  Clickable ID: text-sm font-bold text-primary
  Money values: text-sm text-right font-mono
  Timestamps: text-sm text-slate-500
  
  Row action (show on hover): opacity-0 group-hover:opacity-100
    → chevron_right icon

Pagination footer: bg-slate-50 border-t
  Left: "Showing X to Y of Z items"
  Right: Previous | 1 2 3 ... N | Next
  Active page: size-9 bg-primary rounded-lg font-bold
```

### 4.5 KPI Cards

```html
<div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
  <div class="flex items-center justify-between mb-4">
    <!-- Icon with tinted background -->
    <span class="material-symbols-outlined text-primary p-2 bg-primary/10 rounded-lg">icon</span>
    <!-- Status badge -->
    <span class="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">+4.2%</span>
  </div>
  <p class="text-slate-500 text-sm font-medium">Label</p>
  <h3 class="text-2xl font-bold mt-1">Value</h3>
  <p class="text-xs text-slate-500 mt-4">Footnote</p>
</div>
```

### 4.6 Avatar / User Initials

```html
<!-- Circle avatar with initials -->
<div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center 
  text-slate-950 font-bold border-2 border-white shadow-sm">
  AT
</div>

<!-- Small (in table) -->
<div class="size-6 rounded-full bg-slate-200 flex items-center justify-center 
  text-[10px] font-bold">
  JD
</div>
```

### 4.7 Breadcrumb

```html
<nav class="flex items-center gap-2 text-sm text-slate-500">
  <a class="hover:text-primary transition-colors" href="#">Parent</a>
  <span class="material-symbols-outlined text-sm">chevron_right</span>
  <!-- hoặc dùng "/" -->
  <span class="text-slate-900 font-medium">Current Page</span>
</nav>
```

### 4.8 Tabs Navigation

```html
<div class="flex border-b border-slate-200 overflow-x-auto whitespace-nowrap">
  <!-- Active tab -->
  <button class="px-6 py-3 text-sm font-bold border-b-2 border-primary text-slate-900">
    Active Tab
  </button>
  <!-- Inactive tab -->
  <button class="px-6 py-3 text-sm font-medium text-slate-500 
    border-b-2 border-transparent hover:border-slate-300 hover:text-slate-700 transition-all">
    Inactive Tab
  </button>
</div>
```

### 4.9 Alert / Toast Cards

```html
<!-- Critical alert (border-left style) -->
<div class="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
  <div class="flex justify-between items-start">
    <div class="flex gap-3">
      <span class="material-symbols-outlined text-red-500">warning</span>
      <div>
        <p class="text-sm font-bold text-red-700">Title</p>
        <p class="text-xs text-red-600/80 mt-1">Description</p>
      </div>
    </div>
    <button class="text-xs font-bold bg-white px-3 py-1 rounded shadow-sm 
      border border-red-200">Resolve</button>
  </div>
</div>
```

| Severity | Border | Background | Text |
|----------|--------|-----------|------|
| Critical | `border-red-500` | `bg-red-50` | `text-red-700` |
| Warning | `border-amber-500` | `bg-amber-50` | `text-amber-700` |
| Info | `border-slate-400` | `bg-slate-50` | `text-slate-700` |

### 4.10 Activity Timeline

```html
<div class="flex gap-4 relative">
  <!-- Connecting line -->
  <div class="absolute left-3 top-7 bottom-[-24px] w-px bg-slate-200"></div>
  <!-- Dot -->
  <div class="w-6 h-6 rounded-full bg-green-100 text-green-600 
    flex items-center justify-center z-10 shrink-0">
    <span class="material-symbols-outlined text-[14px] font-bold">check</span>
  </div>
  <!-- Content -->
  <div class="flex-1">
    <div class="flex justify-between items-start">
      <p class="text-sm font-bold">Event Title</p>
      <span class="text-slate-400 text-xs">2 hours ago</span>
    </div>
    <p class="text-xs text-slate-500 mt-0.5">Event description</p>
  </div>
</div>
```

### 4.11 Dark Feature Card (Ví dụ: Asset Health)

```html
<section class="bg-slate-900 text-white rounded-xl p-6 shadow-xl relative overflow-hidden">
  <div class="relative z-10">
    <h3 class="text-lg font-bold mb-4">Title</h3>
    <!-- Content -->
    <div class="w-full bg-slate-700 rounded-full h-1.5 mb-6">
      <div class="bg-primary h-1.5 rounded-full" style="width: 98%"></div>
    </div>
    <button class="w-full py-2 bg-slate-800 border border-slate-700 rounded-lg 
      text-xs font-bold">Action</button>
  </div>
  <!-- Background decorative icon -->
  <div class="absolute top-0 right-0 -mr-12 -mt-12 opacity-10">
    <span class="material-symbols-outlined text-[160px]">laptop_mac</span>
  </div>
</section>
```

### 4.12 Progress Bar

```html
<!-- On light bg -->
<div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
  <div class="bg-primary h-full" style="width: 48%"></div>
</div>

<!-- On dark bg -->
<div class="w-full bg-slate-700 rounded-full h-1.5">
  <div class="bg-primary h-1.5 rounded-full" style="width: 98%"></div>
</div>
```

---

## 5. Tailwind Config chuẩn

```javascript
tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#f2d00d",
        "background-light": "#f8f8f5",
        "background-dark": "#221f10",
      },
      fontFamily: {
        "display": ["Inter", "system-ui", "-apple-system", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.5rem",
        "lg": "1rem",
        "xl": "1.5rem",
        "full": "9999px"
      },
    },
  },
}
```

---

## 6. Responsive Breakpoints

| Breakpoint | Width | Behavior |
|-----------|-------|----------|
| Mobile (<768px) | `md:` | Sidebar ẩn, topbar hamburger, stack layout |
| Tablet (768-1024px) | `lg:` | Sidebar thu gọn hoặc overlay |
| Desktop (>1024px) | default | Full sidebar + content |

**Note:** Tailwind sử dụng `sm:`, `md:`, `lg:`, `xl:` breakpoints chuẩn.

---

## 7. Transition & Animation

```css
/* Standard transition cho hầu hết interactions */
transition-all
transition-colors

/* Button press effect */
active:scale-[0.98]

/* Fade-in on hover (table row actions) */
opacity-0 group-hover:opacity-100 transition-opacity

/* Focus ring */
focus:ring-2 focus:ring-primary focus:border-primary
```

---

## 8. UI Reference Screenshots

### Login page
![Login page](/Users/mac/.gemini/antigravity/brain/5ce6db11-85cf-41e6-8151-005f2f6c517f/ui_login.png)

### Executive Dashboard
![Executive Dashboard](/Users/mac/.gemini/antigravity/brain/5ce6db11-85cf-41e6-8151-005f2f6c517f/ui_dashboard.png)

### Budget Plan List
![Budget Plan List](/Users/mac/.gemini/antigravity/brain/5ce6db11-85cf-41e6-8151-005f2f6c517f/ui_budget_list.png)

### Asset Detail
![Asset Detail](/Users/mac/.gemini/antigravity/brain/5ce6db11-85cf-41e6-8151-005f2f6c517f/ui_asset_detail.png)

---

## 9. Checklist khi tạo màn hình mới

- [ ] Dùng đúng font Inter, weight phù hợp
- [ ] Primary color chỉ dùng cho CTA, active state, accent — KHÔNG dùng làm text thường
- [ ] Cards dùng `rounded-xl border border-slate-200 shadow-sm`
- [ ] Table header uppercase tracking-wider, rows có hover state
- [ ] Status badges dùng đúng color scheme theo nghĩa
- [ ] Icons dùng Bootstrap Icons (`bi bi-xxx`), có label text kèm theo
- [ ] Dark mode classes đầy đủ (`dark:bg-xxx dark:text-xxx dark:border-xxx`)
- [ ] Spacing consistent với hệ thống (p-6 cho cards, gap-6 cho grid, p-8 cho page body)
- [ ] Breadcrumb trên mỗi trang (trừ Dashboard và Login)
- [ ] Page title text-3xl font-bold, có action buttons phải
- [ ] Logo dùng đúng kích thước theo context (sidebar 28px, login 48/32px), `w-auto` giữ tỷ lệ
