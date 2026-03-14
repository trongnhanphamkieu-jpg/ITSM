"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";

interface Project {
  id: string;
  code: string;
  name: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  department: string | null;
  status: string;
  notes: string | null;
  createdBy?: { fullName: string };
}

interface BudgetOverview {
  projects: {
    id: string;
    code: string;
    name: string;
    department: string | null;
    status: string;
    startDate: string | null;
    endDate: string | null;
    plannedBudget: number;
    actualCost: number;
    remaining: number;
    usagePercent: number;
  }[];
  totals: {
    plannedBudget: number;
    actualCost: number;
    remaining: number;
    usagePercent: number;
  };
}

function fmt(n: number) {
  return new Intl.NumberFormat("vi-VN").format(n) + "₫";
}

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("vi-VN");
}

function usageColor(pct: number): "danger" | "warning" | "success" {
  if (pct >= 100) return "danger";
  if (pct >= 80) return "warning";
  return "success";
}

const USAGE_BG: Record<string, string> = {
  danger: "bg-danger",
  warning: "bg-warning",
  success: "bg-success",
};

const USAGE_TEXT: Record<string, string> = {
  danger: "text-danger",
  warning: "text-warning",
  success: "text-success",
};

export default function ProjectBudgetPage() {
  const [tab, setTab] = useState<"overview" | "list">("overview");
  const [overview, setOverview] = useState<BudgetOverview | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showDrawer, setShowDrawer] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [form, setForm] = useState({
    code: "", name: "", description: "",
    startDate: "", endDate: "", department: "", status: "active", notes: "",
  });

  const loadOverview = useCallback(async () => {
    try {
      const data = await api.get<BudgetOverview>("/projects/budget-overview");
      setOverview(data);
    } catch {}
  }, []);

  const loadProjects = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const data = await api.get<Project[]>("/projects", params);
      setProjects(Array.isArray(data) ? data : []);
    } catch {}
  }, [search, statusFilter]);

  useEffect(() => {
    setLoading(true);
    Promise.all([loadOverview(), loadProjects()]).finally(() => setLoading(false));
  }, [loadOverview, loadProjects]);

  const openCreate = () => {
    setEditProject(null);
    setForm({ code: "", name: "", description: "", startDate: "", endDate: "", department: "", status: "active", notes: "" });
    setShowDrawer(true);
  };

  const openEdit = (p: Project) => {
    setEditProject(p);
    setForm({
      code: p.code, name: p.name, description: p.description || "",
      startDate: p.startDate ? p.startDate.slice(0, 10) : "",
      endDate: p.endDate ? p.endDate.slice(0, 10) : "",
      department: p.department || "", status: p.status, notes: p.notes || "",
    });
    setShowDrawer(true);
  };

  const handleSubmit = async () => {
    try {
      if (editProject) {
        await api.put(`/projects/${editProject.id}`, form);
      } else {
        await api.post("/projects", form);
      }
      setShowDrawer(false);
      loadOverview();
      loadProjects();
    } catch (e: any) {
      alert(e?.message || "Lỗi");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa dự án này?")) return;
    try {
      await api.delete(`/projects/${id}`);
      loadOverview();
      loadProjects();
    } catch {}
  };

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">
          <i className="bi bi-house-door" />
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">Ngân sách dự án</span>
      </nav>

      <PageHeader
        title="Ngân sách theo dự án"
        description="Quản lý và theo dõi ngân sách theo từng dự án CNTT"
        actions={
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            <i className="bi bi-plus-lg" />
            Thêm dự án
          </button>
        }
      />

      {/* Tabs */}
      <div className="mb-6 flex border-b border-border">
        {[
          { key: "overview" as const, label: "Tổng quan ngân sách", icon: "bi-graph-up" },
          { key: "list" as const, label: "Danh sách dự án", icon: "bi-list-ul" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <i className={`bi ${t.icon} mr-2`} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}

      {/* TAB: Overview */}
      {!loading && tab === "overview" && (
        <>
          {overview ? (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-2 gap-4 mb-6 lg:grid-cols-4">
                {[
                  { label: "Ngân sách KH", value: fmt(overview.totals.plannedBudget), variant: "primary" },
                  { label: "Chi phí thực tế", value: fmt(overview.totals.actualCost), variant: "warning" },
                  { label: "Còn lại", value: fmt(overview.totals.remaining), variant: "success" },
                  { label: "% Thực hiện", value: `${overview.totals.usagePercent}%`, variant: usageColor(overview.totals.usagePercent) },
                ].map((c, i) => (
                  <div key={i} className="rounded-xl border border-border bg-card p-5 shadow-sm text-center">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{c.label}</p>
                    <p className={`text-2xl font-bold text-${c.variant}`}>{c.value}</p>
                  </div>
                ))}
              </div>

              {/* Overview table */}
              <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                {overview.projects.length === 0 ? (
                  <EmptyState
                    title="Chưa có dự án nào"
                    description="Tạo dự án đầu tiên để bắt đầu quản lý ngân sách"
                    action={
                      <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground">
                        <i className="bi bi-plus-lg" /> Thêm dự án
                      </button>
                    }
                  />
                ) : (
                  <>
                    {/* Desktop */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border bg-muted/30">
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mã</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tên dự án</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Bộ phận</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ngân sách KH</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Thực tế</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Còn lại</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">% TH</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {overview.projects.map((p) => {
                            const uc = usageColor(p.usagePercent);
                            return (
                              <tr key={p.id} className="group transition-colors hover:bg-muted/20">
                                <td className="px-4 py-3">
                                  <Link href={`/projects/${p.id}`} className="font-mono text-sm font-medium text-primary hover:underline">{p.code}</Link>
                                </td>
                                <td className="px-4 py-3">
                                  <Link href={`/projects/${p.id}`} className="text-sm font-medium text-card-foreground hover:text-primary transition-colors">{p.name}</Link>
                                  <p className="text-xs text-muted-foreground mt-0.5">{p.department || "—"}</p>
                                </td>
                                <td className="px-4 py-3 text-sm text-muted-foreground">{p.department || "—"}</td>
                                <td className="px-4 py-3 text-right text-sm font-semibold text-card-foreground">{fmt(p.plannedBudget)}</td>
                                <td className="px-4 py-3 text-right text-sm font-semibold text-warning">{fmt(p.actualCost)}</td>
                                <td className={`px-4 py-3 text-right text-sm font-semibold ${p.remaining >= 0 ? "text-success" : "text-danger"}`}>{fmt(p.remaining)}</td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2 justify-center">
                                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                      <div className={`h-full rounded-full ${USAGE_BG[uc]}`} style={{ width: `${Math.min(p.usagePercent, 100)}%` }} />
                                    </div>
                                    <span className={`text-xs font-bold ${USAGE_TEXT[uc]}`}>{p.usagePercent}%</span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    {/* Mobile cards */}
                    <div className="md:hidden divide-y divide-border">
                      {overview.projects.map((p) => {
                        const uc = usageColor(p.usagePercent);
                        return (
                          <Link key={p.id} href={`/projects/${p.id}`} className="block px-4 py-4 hover:bg-muted/20 transition-colors">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <p className="font-mono text-xs text-primary">{p.code}</p>
                                <p className="mt-0.5 text-sm font-medium text-card-foreground truncate">{p.name}</p>
                                <p className="mt-1 text-xs text-muted-foreground">{p.department || "—"}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-muted-foreground">Ngân sách</p>
                                <p className="text-sm font-bold text-primary">{fmt(p.plannedBudget)}</p>
                              </div>
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${USAGE_BG[uc]}`} style={{ width: `${Math.min(p.usagePercent, 100)}%` }} />
                              </div>
                              <span className={`text-xs font-bold ${USAGE_TEXT[uc]}`}>{p.usagePercent}%</span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <EmptyState
              title="Không tải được dữ liệu"
              description="Vui lòng thử lại sau"
            />
          )}
        </>
      )}

      {/* TAB: List */}
      {!loading && tab === "list" && (
        <>
          {/* Filters */}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tên, mã dự án..."
                className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="active">Đang triển khai</option>
              <option value="closed">Đã kết thúc</option>
            </select>
          </div>

          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            {projects.length === 0 ? (
              <EmptyState
                title="Chưa có dự án nào"
                description="Tạo dự án đầu tiên để bắt đầu quản lý"
                action={
                  <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground">
                    <i className="bi bi-plus-lg" /> Thêm dự án
                  </button>
                }
              />
            ) : (
              <>
                {/* Desktop */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mã</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tên dự án</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Bộ phận</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Bắt đầu</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Kết thúc</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Trạng thái</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {projects.map((p) => (
                        <tr key={p.id} className="group transition-colors hover:bg-muted/20">
                          <td className="px-4 py-3">
                            <Link href={`/projects/${p.id}`} className="font-mono text-sm font-medium text-primary hover:underline">{p.code}</Link>
                          </td>
                          <td className="px-4 py-3">
                            <Link href={`/projects/${p.id}`} className="text-sm font-medium text-card-foreground hover:text-primary transition-colors">{p.name}</Link>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{p.department || "—"}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{fmtDate(p.startDate)}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{fmtDate(p.endDate)}</td>
                          <td className="px-4 py-3 text-center">
                            <StatusBadge variant={p.status === "active" ? "success" : "neutral"}>
                              {p.status === "active" ? "Đang triển khai" : "Đã kết thúc"}
                            </StatusBadge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => openEdit(p)} className="rounded-md p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors" title="Sửa">
                                <i className="bi bi-pencil text-sm" />
                              </button>
                              <button onClick={() => handleDelete(p.id)} className="rounded-md p-1.5 text-muted-foreground hover:bg-danger/10 hover:text-danger transition-colors" title="Xóa">
                                <i className="bi bi-trash text-sm" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Mobile cards */}
                <div className="md:hidden divide-y divide-border">
                  {projects.map((p) => (
                    <Link key={p.id} href={`/projects/${p.id}`} className="block px-4 py-4 hover:bg-muted/20 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-mono text-xs text-primary">{p.code}</p>
                          <p className="mt-0.5 text-sm font-medium text-card-foreground truncate">{p.name}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{p.department || "—"} • {fmtDate(p.startDate)} → {fmtDate(p.endDate)}</p>
                        </div>
                        <StatusBadge variant={p.status === "active" ? "success" : "neutral"}>
                          {p.status === "active" ? "Đang triển khai" : "Đã kết thúc"}
                        </StatusBadge>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* Drawer */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div onClick={() => setShowDrawer(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg bg-card shadow-2xl flex flex-col overflow-auto animate-in slide-in-from-right">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-lg font-semibold text-card-foreground">
                {editProject ? "Chỉnh sửa dự án" : "Thêm dự án mới"}
              </h2>
              <button onClick={() => setShowDrawer(false)} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted transition-colors">
                <i className="bi bi-x-lg" />
              </button>
            </div>
            {/* Form */}
            <div className="flex-1 p-6 space-y-5">
              {[
                { key: "code", label: "Mã dự án", type: "text", required: true },
                { key: "name", label: "Tên dự án", type: "text", required: true },
                { key: "department", label: "Bộ phận phụ trách", type: "text" },
                { key: "startDate", label: "Ngày bắt đầu", type: "date" },
                { key: "endDate", label: "Ngày kết thúc", type: "date" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-card-foreground mb-1.5">
                    {f.label} {f.required && <span className="text-danger">*</span>}
                  </label>
                  <input
                    type={f.type}
                    value={(form as any)[f.key]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1.5">Trạng thái</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                >
                  <option value="active">Đang triển khai</option>
                  <option value="closed">Đã kết thúc</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1.5">Mô tả</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1.5">Ghi chú</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>
            </div>
            {/* Footer */}
            <div className="border-t border-border px-6 py-4 flex gap-3">
              <button
                onClick={() => setShowDrawer(false)}
                className="flex-1 rounded-lg border border-input py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
              >
                {editProject ? "Cập nhật" : "Tạo mới"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
