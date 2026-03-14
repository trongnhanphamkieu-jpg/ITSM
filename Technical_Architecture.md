# ITMS – KIẾN TRÚC KỸ THUẬT & TECH STACK
## Hệ thống Quản trị Công nghệ Thông tin Nội bộ

**Phiên bản:** 1.0  
**Ngày lập:** 13/03/2026  
**Tham chiếu:** BRD v1.4 | PRD v1.4 | SRS v1.4 | UI_Guideline.md

---

## 1. TỔNG QUAN HỆ THỐNG

### 1.1 Bối cảnh

ITMS là **ứng dụng web nội bộ** (internal B2B SaaS) dành cho bộ phận Công nghệ thông tin của doanh nghiệp. Hệ thống bao gồm **13 module nghiệp vụ**, phục vụ **5 vai trò** (Admin, Manager, Staff, Finance, Viewer), mục tiêu **50 concurrent users**.

### 1.2 Quyết định kiến trúc chính

| Quyết định | Lựa chọn | Lý do |
|-----------|----------|-------|
| Kiến trúc | Monolithic Modular | Đội nhỏ, phát triển nhanh, dễ debug. Tách module rõ ràng để có thể chuyển microservice sau |
| API Style | RESTful + JSON | Đơn giản, tooling tốt (Swagger), đủ cho CRUD-heavy enterprise app |
| Rendering | SSR + CSR hybrid (Next.js) | SEO không quan trọng (internal), nhưng SSR hỗ trợ tải trang nhanh |
| Database | PostgreSQL (single instance) | ACID, JSON support, mature ecosystem, cost-effective cho 50 users |
| Deployment | Docker Compose → Kubernetes | Bắt đầu đơn giản, scale-out khi cần |

---

## 2. KIẾN TRÚC HẠ TẦNG

### 2.1 Sơ đồ kiến trúc tổng quan

```
                    ┌─────────────────────────┐
                    │    INTERNET / INTRANET   │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │    Nginx Reverse Proxy   │
                    │  ▸ SSL Termination       │
                    │  ▸ Rate Limiting         │
                    │  ▸ Gzip Compression      │
                    │  ▸ Static File Serving   │
                    └───┬────────────────┬────┘
                        │                │
           ┌────────────▼──┐    ┌───────▼────────────┐
           │  FRONTEND     │    │  BACKEND API       │
           │  Next.js 14   │    │  NestJS 10         │
           │  Port 3000    │◄──►│  Port 4000         │
           │               │    │  /api/v1/*          │
           └───────────────┘    └───┬──┬──┬──────────┘
                                    │  │  │
                    ┌───────────────┘  │  └───────────────┐
                    │                  │                   │
           ┌───────▼────────┐  ┌─────▼──────┐   ┌───────▼────────┐
           │  PostgreSQL 16 │  │  Redis 7    │   │  MinIO (S3)    │
           │  Port 5432     │  │  Port 6379  │   │  Port 9000     │
           │                │  │             │   │  Console: 9001 │
           │  ▸ Main DB     │  │  ▸ Session  │   │                │
           │  ▸ Audit Logs  │  │  ▸ Cache    │   │  ▸ Uploads     │
           │  ▸ Indexes     │  │  ▸ Queue    │   │  ▸ Templates   │
           └───────┬────────┘  └─────────────┘   │  ▸ Exports     │
                   │                              └────────────────┘
           ┌───────▼────────┐
           │  pg_cron       │
           │  ▸ Daily Backup│
           │  ▸ Alert Check │
           │  ▸ Log Archive │
           └────────────────┘
```

### 2.2 Luồng xử lý request

```
Browser → Nginx (SSL + Rate Limit) → Next.js (UI pages)
                                    → NestJS API (business logic)
                                        ├→ Prisma → PostgreSQL
                                        ├→ Redis (cache/session)
                                        ├→ MinIO (file upload/download)
                                        ├→ Bull Queue (async jobs)
                                        └→ Nodemailer (email alerts)
```

---

## 3. TECH STACK CHI TIẾT

### 3.1 Frontend

| Thành phần | Công nghệ | Phiên bản | Mục đích |
|-----------|-----------|-----------|----------|
| **Framework** | Next.js | 14.x (App Router) | SSR/CSR hybrid, routing, API proxying |
| **UI Library** | React | 18.x | Component-based UI |
| **Styling** | Tailwind CSS | 4.x | Utility-first CSS, responsive design |
| **Components** | shadcn/ui | Latest | Bộ component headless, accessible, customizable |
| **Icons** | Bootstrap Icons | 1.13.x | 2,000+ icon SVG, icon font |
| **Font** | Inter | Variable | Google Fonts CDN |
| **Form** | React Hook Form | 7.x | Form validation, performance |
| **Validation** | Zod | 3.x | Schema validation (shared với backend) |
| **State** | Zustand | 4.x | Client state đơn giản, minimal boilerplate |
| **Data Fetching** | TanStack Query (React Query) | 5.x | Server state, caching, refetching |
| **Charts** | Recharts | 2.x | Biểu đồ Budget vs Actual, KPI charts |
| **Tables** | TanStack Table | 8.x | Data table sorting, filtering, pagination |
| **Date** | date-fns | 3.x | Xử lý ngày tháng (lightweight) |
| **Currency** | Intl.NumberFormat | Native | Format tiền VNĐ/USD |
| **Toast** | Sonner | Latest | Notification toasts |
| **Drag & Drop** | dnd-kit | 6.x | Sắp xếp danh sách (nếu cần) |

### 3.2 Backend

| Thành phần | Công nghệ | Phiên bản | Mục đích |
|-----------|-----------|-----------|----------|
| **Framework** | NestJS | 10.x | Modular architecture, DI, decorators |
| **Runtime** | Node.js | 20.x LTS | V8 engine, long-term support |
| **ORM** | Prisma | 5.x | Type-safe DB queries, migration, seed |
| **Auth** | Passport.js + JWT | Latest | Strategy-based auth (Local + JWT) |
| **2FA** | otplib | 12.x | TOTP (RFC 6238), QR code generation |
| **Validation** | class-validator + class-transformer | Latest | DTO validation, pipe transformation |
| **API Docs** | @nestjs/swagger | Latest | OpenAPI 3.0 auto-generate |
| **Excel I/O** | ExcelJS | 4.x | Import/Export Excel templates |
| **PDF Export** | Puppeteer | Latest | HTML → PDF rendering |
| **Email** | Nodemailer | 6.x | SMTP email (alerts, 2FA, reports) |
| **Queue** | Bull + Redis | Latest | Async jobs: export, import, alerts |
| **Scheduling** | @nestjs/schedule (cron) | Latest | Daily: backup reminder, expiry check |
| **File Upload** | Multer + MinIO SDK | Latest | Upload validation, S3-compatible storage |
| **Logging** | Winston + nest-winston | Latest | Structured logging, rotation |
| **Rate Limiting** | @nestjs/throttler | Latest | API rate limiting (100 req/min/IP) |
| **Config** | @nestjs/config | Latest | `.env` management, validation |

### 3.3 Database & Infrastructure

| Thành phần | Công nghệ | Phiên bản | Mục đích |
|-----------|-----------|-----------|----------|
| **Database** | PostgreSQL | 16.x Alpine | Main data store, JSONB, full-text search |
| **Cache / Session** | Redis | 7.x Alpine | Session store, API caching, Bull queue backend |
| **File Storage** | MinIO | Latest | S3-compatible object storage (self-hosted) |
| **Reverse Proxy** | Nginx | 1.25+ | SSL, load balancing, static files, rate limit |
| **Container** | Docker + Docker Compose | Latest | Containerized dev/staging/prod |
| **Orchestration** | Kubernetes (prod) | 1.28+ | Auto-scaling, rolling updates |

### 3.4 DevOps & CI/CD

| Thành phần | Công nghệ | Mục đích |
|-----------|-----------|----------|
| **VCS** | Git + GitHub | Source control, PR review |
| **CI/CD** | GitHub Actions | Build, test, deploy pipeline |
| **Registry** | GitHub Container Registry (GHCR) | Docker image storage |
| **Linting** | ESLint + Prettier | Code quality, formatting |
| **Type Check** | TypeScript | 5.x — strict mode toàn project |
| **Commit** | Commitlint + Husky | Conventional commits |
| **Changelog** | Standard Version | Auto changelog từ commits |

### 3.5 Testing

| Loại | Công cụ | Mục tiêu |
|------|---------|----------|
| Unit Test | Jest + ts-jest | Coverage ≥ 80% backend |
| Integration Test | Jest + Supertest | Tất cả API endpoints |
| E2E Test | Playwright | Luồng nghiệp vụ chính |
| Performance Test | k6 | 50 concurrent users |
| Security Test | OWASP ZAP | OWASP Top 10 |
| API Test | Bruno / Insomnia | Manual API testing |

### 3.6 Monitoring & Observability (Production)

| Thành phần | Công nghệ | Mục đích |
|-----------|-----------|----------|
| **APM** | PM2 | Process management, auto-restart |
| **Metrics** | Prometheus + Grafana | CPU, memory, request latency |
| **Logging** | Loki + Grafana | Centralized log aggregation |
| **Uptime** | UptimeRobot / Healthcheck | Uptime monitoring ≥ 99.5% |
| **Error Tracking** | Sentry | Frontend + Backend error tracking |

---

## 4. CẤU TRÚC THƯ MỤC DỰ ÁN

```
itms/
├── frontend/                    # Next.js 14 App
│   ├── public/
│   │   └── fonts/               # Inter font files (self-hosted optional)
│   ├── src/
│   │   ├── app/                 # App Router pages
│   │   │   ├── (auth)/          # Route group: Login, 2FA
│   │   │   │   ├── login/
│   │   │   │   └── two-factor/
│   │   │   ├── (dashboard)/     # Route group: Main layout (sidebar)
│   │   │   │   ├── layout.tsx   # Sidebar + Topbar shell
│   │   │   │   ├── page.tsx     # Dashboard Overview
│   │   │   │   ├── budgets/
│   │   │   │   │   ├── page.tsx          # Budget Plans List
│   │   │   │   │   ├── [id]/page.tsx     # Budget Detail
│   │   │   │   │   └── create/page.tsx   # Create Budget
│   │   │   │   ├── costs/
│   │   │   │   ├── vendors/
│   │   │   │   ├── contracts/
│   │   │   │   ├── inventory/
│   │   │   │   │   ├── soft/
│   │   │   │   │   └── hard/
│   │   │   │   ├── infrastructure/
│   │   │   │   ├── vehicles/
│   │   │   │   ├── projects/
│   │   │   │   ├── forecasts/    # Cost Forecast (Dự chi)
│   │   │   │   ├── reports/
│   │   │   │   ├── activity-log/
│   │   │   │   └── settings/
│   │   │   │       ├── config/
│   │   │   │       └── users/
│   │   │   └── layout.tsx        # Root layout
│   │   ├── components/
│   │   │   ├── ui/               # shadcn/ui components
│   │   │   ├── layout/           # Sidebar, Topbar, Breadcrumb
│   │   │   ├── data-table/       # Table, Filters, Pagination
│   │   │   ├── charts/           # KPI Card, BarChart, DonutChart
│   │   │   ├── forms/            # Form fields, Drawer forms
│   │   │   └── shared/           # Badge, Avatar, Timeline, Alert
│   │   ├── hooks/                # Custom hooks (useAuth, useDebounce...)
│   │   ├── lib/
│   │   │   ├── api.ts            # Axios/fetch config, interceptors
│   │   │   ├── utils.ts          # Helper functions
│   │   │   └── validations/      # Zod schemas (shared types)
│   │   ├── stores/               # Zustand stores
│   │   └── types/                # TypeScript type definitions
│   ├── tailwind.config.ts        # ITMS design tokens
│   ├── next.config.mjs
│   ├── tsconfig.json
│   └── package.json
│
├── backend/                      # NestJS 10 API
│   ├── src/
│   │   ├── main.ts               # Bootstrap, Swagger setup
│   │   ├── app.module.ts         # Root module
│   │   ├── common/               # Shared utilities
│   │   │   ├── decorators/       # @Roles, @CurrentUser
│   │   │   ├── filters/          # HttpException filter
│   │   │   ├── guards/           # JwtGuard, RolesGuard
│   │   │   ├── interceptors/     # Logging, Transform
│   │   │   ├── pipes/            # Validation pipe
│   │   │   └── dto/              # Pagination, Response wrapper
│   │   ├── modules/
│   │   │   ├── auth/             # Login, JWT, 2FA, Refresh
│   │   │   ├── users/            # CRUD users, RBAC
│   │   │   ├── budgets/          # Budget Planning
│   │   │   ├── costs/            # Cost Management
│   │   │   ├── vendors/          # Vendor Management
│   │   │   ├── contracts/        # Contract Management
│   │   │   ├── inventory/
│   │   │   │   ├── soft/         # Software assets
│   │   │   │   └── hard/         # Hardware assets
│   │   │   ├── infrastructure/   # IP, VLAN, DC
│   │   │   ├── vehicles/         # Vehicle Cost Management
│   │   │   ├── projects/         # Project Budget
│   │   │   ├── forecasts/        # Cost Forecast (Dự chi)
│   │   │   ├── dashboard/        # Aggregate KPIs
│   │   │   ├── reports/          # Export reports
│   │   │   ├── activity-log/     # Audit log queries
│   │   │   ├── alerts/           # Alert engine + notifications
│   │   │   ├── config/           # System configuration
│   │   │   └── files/            # Upload/Download via MinIO
│   │   └── prisma/
│   │       ├── schema.prisma     # Database schema
│   │       ├── migrations/       # Prisma migrations
│   │       └── seed.ts           # Initial data seeding
│   ├── templates/                # Excel import templates
│   ├── test/                     # E2E tests
│   ├── tsconfig.json
│   └── package.json
│
├── shared/                       # Shared types/constants (optional)
│   ├── types/
│   └── constants/
│
├── infra/                        # Infrastructure configs
│   ├── docker/
│   │   ├── frontend.Dockerfile
│   │   ├── backend.Dockerfile
│   │   └── nginx.conf
│   ├── k8s/                      # Kubernetes manifests
│   │   ├── namespace.yaml
│   │   ├── frontend-deploy.yaml
│   │   ├── backend-deploy.yaml
│   │   ├── postgres-statefulset.yaml
│   │   ├── redis-deploy.yaml
│   │   ├── minio-deploy.yaml
│   │   ├── nginx-ingress.yaml
│   │   └── secrets.yaml
│   └── scripts/
│       ├── backup-db.sh
│       ├── restore-db.sh
│       └── init-minio-buckets.sh
│
├── docker-compose.yml            # Development environment
├── docker-compose.prod.yml       # Production override
├── .github/
│   └── workflows/
│       ├── ci.yml                # Lint + Test + Build
│       └── deploy.yml            # Deploy to staging/prod
├── .env.example                  # Environment template
├── .gitignore
└── README.md
```

---

## 5. MÔI TRƯỜNG & TRIỂN KHAI

### 5.1 Ma trận môi trường

| Môi trường | Mục đích | Triển khai | URL | Database |
|-----------|----------|-----------|-----|----------|
| **Local** | Dev cá nhân | Docker Compose | localhost:3000 | postgres:5432 (local) |
| **Staging** | UAT & Demo | Docker Compose trên VPS | itms-staging.company.com | PostgreSQL riêng |
| **Production** | Vận hành thực | Kubernetes / Docker Compose | itms.company.com | PostgreSQL + daily backup |

### 5.2 Docker Compose (Development)

```yaml
services:
  # ── Frontend ──────────────────────────────────
  frontend:
    build:
      context: ./frontend
      dockerfile: ../infra/docker/frontend.Dockerfile
    ports: ["3000:3000"]
    volumes:
      - ./frontend/src:/app/src    # Hot reload
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
      - NEXT_PUBLIC_APP_NAME=ITMS
    depends_on: [backend]

  # ── Backend ───────────────────────────────────
  backend:
    build:
      context: ./backend
      dockerfile: ../infra/docker/backend.Dockerfile
    ports: ["4000:4000"]
    volumes:
      - ./backend/src:/app/src     # Hot reload
    environment:
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/itms
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
      - JWT_ACCESS_TTL=8h
      - JWT_REFRESH_TTL=7d
      - MINIO_ENDPOINT=minio
      - MINIO_PORT=9000
      - MINIO_ACCESS_KEY=minioadmin
      - MINIO_SECRET_KEY=minioadmin
      - MINIO_BUCKET=itms-files
      - SMTP_HOST=${SMTP_HOST}
      - SMTP_PORT=587
      - SMTP_USER=${SMTP_USER}
      - SMTP_PASS=${SMTP_PASS}
      - LOG_RETENTION_MONTHS=12
    depends_on: [postgres, redis, minio]

  # ── Database ──────────────────────────────────
  postgres:
    image: postgres:16-alpine
    ports: ["5432:5432"]
    environment:
      POSTGRES_DB: itms
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  # ── Cache & Queue ─────────────────────────────
  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
    command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru

  # ── File Storage ──────────────────────────────
  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    ports: ["9000:9000", "9001:9001"]
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - minio_data:/data

volumes:
  postgres_data:
  minio_data:
```

### 5.3 CI/CD Pipeline (GitHub Actions)

```
Push to branch
  ├── Lint (ESLint + Prettier)
  ├── Type Check (tsc --noEmit)
  ├── Unit Tests (Jest)
  ├── Build Frontend (next build)
  ├── Build Backend (nest build)
  └── Build Docker Images

Push to main
  └── All above + Deploy to Staging

Git Tag v*
  └── All above + Deploy to Production
```

### 5.4 Production Deployment

```
VPS / Cloud Server (khuyến nghị)
├── OS: Ubuntu 22.04 LTS
├── CPU: 4 vCPU
├── RAM: 8 GB (tối thiểu cho 50 users)
├── Disk: 100 GB SSD (DB + files)
├── Bandwidth: Nội bộ (LAN/VPN)
└── Backup: Daily → off-site storage
```

**Option A — Docker Compose (đơn giản nhất):**
```
Nginx (host) → Docker Compose (frontend + backend + postgres + redis + minio)
```

**Option B — Kubernetes (scale lớn):**
```
Nginx Ingress → K8s Pods (frontend×2 + backend×3 + postgres-statefulset + redis + minio)
```

> **Khuyến nghị:** Bắt đầu với **Option A** cho 50 users. Chuyển Option B khi > 200 users.

---

## 6. BẢO MẬT

### 6.1 Network Layer

| Biện pháp | Chi tiết |
|----------|---------|
| HTTPS | TLS 1.2+ bắt buộc (Let's Encrypt / cert riêng) |
| Firewall | Chỉ mở port 80, 443; DB/Redis/MinIO KHÔNG expose ra ngoài |
| Rate Limiting | 100 req/min/IP (Nginx + NestJS Throttler) |
| CORS | Whitelist domain frontend |

### 6.2 Application Layer

| Biện pháp | Chi tiết |
|----------|---------|
| Authentication | JWT (Access 8h + Refresh 7d) + Optional 2FA (TOTP) |
| Password | bcrypt, cost factor ≥ 12 |
| Authorization | RBAC — Guard decorator trên mỗi endpoint |
| Input Validation | class-validator (backend) + Zod (frontend) |
| SQL Injection | Prisma ORM only, không raw query |
| XSS | Content-Security-Policy header, sanitize output |
| CSRF | SameSite cookie + CSRF token |
| File Upload | Max 10MB, whitelist: PDF, Excel, PNG, JPG |
| Audit | Mọi create/update/delete → `audit_logs` table |
| Account Lock | Khoá sau 5 lần đăng nhập thất bại |

### 6.3 Data Layer

| Biện pháp | Chi tiết |
|----------|---------|
| Encryption at rest | PostgreSQL TDE hoặc disk encryption |
| Backup | Daily 2:00 AM, giữ 30 ngày, off-site sync |
| RTO / RPO | < 4 giờ / < 24 giờ |
| Secrets | `.env` not committed. Prod: K8s Secrets / Vault |

---

## 7. HIỆU NĂNG & CACHING

### 7.1 Chỉ tiêu hiệu năng

| Metric | Target |
|--------|--------|
| API Response (P95) | < 500ms |
| Page Load (initial) | < 3 giây |
| Export 10,000 records | < 30 giây |
| Import 1,000 records | < 60 giây |
| Concurrent Users | 50 users (không giảm hiệu năng) |

### 7.2 Chiến lược Cache (Redis)

```
Cache Layer Strategy:
├── Session: Redis (TTL = refresh token lifetime)
├── Dashboard KPIs: Redis (TTL = 5 min, invalidate on data change)
├── User Profile: Redis (TTL = 1 hour)
├── Config/Dropdown: Redis (TTL = 24 hours, invalidate on update)
├── Report Data: Redis (TTL = 15 min)
└── List Counts: Redis (TTL = 2 min)
```

### 7.3 Database Optimization

- **Indexes** theo SRS section 6.4 (14 composite indexes)
- **Connection Pool** qua Prisma: `connection_limit=10` (dev), `=25` (prod)
- **Query Optimization**: pagination (cursor-based cho large sets), select fields only
- **Audit Log Archive**: > 12 tháng chuyển sang partitioned table hoặc cold storage

---

## 8. BIẾN MÔI TRƯỜNG (.env)

```bash
# ── App ─────────────────────────────
NODE_ENV=development
APP_PORT=4000
FRONTEND_URL=http://localhost:3000

# ── Database ────────────────────────
DATABASE_URL=postgresql://postgres:password@localhost:5432/itms

# ── Redis ───────────────────────────
REDIS_URL=redis://localhost:6379

# ── JWT ─────────────────────────────
JWT_SECRET=your-256-bit-secret
JWT_ACCESS_TTL=8h
JWT_REFRESH_TTL=7d

# ── MinIO / S3 ──────────────────────
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=itms-files
MINIO_USE_SSL=false

# ── SMTP (Email) ────────────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=itms@company.com
SMTP_PASS=app-password
SMTP_FROM="ITMS System <itms@company.com>"

# ── Misc ────────────────────────────
LOG_RETENTION_MONTHS=12
RATE_LIMIT_PER_MINUTE=100
MAX_FILE_SIZE_MB=10
```

---

## 9. API DESIGN CONVENTION

### 9.1 URL Pattern

```
Base URL: /api/v1

GET    /api/v1/{module}              → List (paginated)
GET    /api/v1/{module}/:id          → Get detail
POST   /api/v1/{module}              → Create
PATCH  /api/v1/{module}/:id          → Update
DELETE /api/v1/{module}/:id          → Soft delete

POST   /api/v1/{module}/import       → Import Excel
GET    /api/v1/{module}/export       → Export Excel/PDF
POST   /api/v1/{module}/:id/approve  → Workflow action
```

### 9.2 Response Format

```json
// Success
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "perPage": 20,
    "total": 245,
    "totalPages": 13
  }
}

// Error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email đã tồn tại",
    "details": [
      { "field": "email", "message": "Email must be unique" }
    ]
  }
}
```

### 9.3 Pagination & Filtering

```
GET /api/v1/budgets?page=1&perPage=20&sort=created_at&order=desc
GET /api/v1/budgets?search=BP-2024&status=approved&year=2024
GET /api/v1/costs?date_from=2024-01-01&date_to=2024-12-31
```

---

## 10. PHÂN CHIA GIAI ĐOẠN PHÁT TRIỂN

> Theo roadmap PRD v1.4

### Phase 1 – Foundation (Tuần 1-8)
- [ ] Setup project structure, Docker Compose, CI/CD
- [ ] Auth module (Login, JWT, 2FA, RBAC)
- [ ] User Management module
- [ ] Configuration module
- [ ] Budget Planning (CRUD + Approval workflow)
- [ ] Cost Management (CRUD + Import/Export)
- [ ] Dashboard (basic KPIs)

### Phase 2 – Asset Management (Tuần 9-14)
- [ ] Vendor & Contract Management
- [ ] Soft Inventory (email, domain, VPS, license, SSL)
- [ ] Hard Inventory (hardware assets)
- [ ] Alert Engine (expiry notifications)
- [ ] Infrastructure Management (IP, VLAN, DC)

### Phase 3 – Extended Modules (Tuần 15-20)
- [ ] Vehicle Cost Management
- [ ] Project Budget
- [ ] Cost Forecast (Dự chi)
- [ ] Activity Log (Audit log UI)
- [ ] Advanced Reports & Export

### Phase 4 – Polish & Production (Tuần 21-24)
- [ ] E2E Testing (Playwright)
- [ ] Performance testing (k6)
- [ ] Security audit (OWASP ZAP)
- [ ] Monitoring setup (Prometheus + Grafana + Sentry)
- [ ] Production deployment
- [ ] User documentation

---

## 11. TỔNG KẾT DEPENDENCY MAP

```mermaid
graph LR
    subgraph Frontend
        A[Next.js 14] --> B[React 18]
        A --> C[Tailwind CSS 4]
        A --> D[shadcn/ui]
        A --> E[TanStack Query]
        A --> F[Zustand]
        A --> G[Bootstrap Icons]
        A --> H[Recharts]
        A --> I[React Hook Form + Zod]
    end
    
    subgraph Backend
        J[NestJS 10] --> K[Prisma 5]
        J --> L[Passport + JWT]
        J --> M[Bull Queue]
        J --> N[ExcelJS]
        J --> O[Puppeteer]
        J --> P[Nodemailer]
        J --> Q[Winston Logger]
    end
    
    subgraph Infrastructure
        R[(PostgreSQL 16)]
        S[(Redis 7)]
        T[(MinIO S3)]
        U[Nginx]
        V[Docker]
    end
    
    A -->|REST API| J
    K --> R
    M --> S
    J --> T
    U --> A
    U --> J
```

---

*Tài liệu này là cơ sở kỹ thuật để xây dựng ITMS. Mọi thay đổi tech stack cần được đánh giá tác động và cập nhật tại đây.*
