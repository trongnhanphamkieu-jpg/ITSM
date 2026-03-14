"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";

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

interface BudgetSummary {
  project: Project;
  plannedBudget: number;
  actualCost: number;
  remaining: number;
  usagePercent: number;
}

interface BudgetItemData {
  id: string;
  name: string;
  description: string | null;
  unit: string | null;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  note: string | null;
  category: { name: string };
}

interface ActualCostData {
  id: string;
  categoryName: string;
  description: string;
  amount: string;
  costDate: string;
  vendor: string | null;
  invoiceNo: string | null;
  note: string | null;
  createdBy: { fullName: string };
  budgetItem: { id: string; name: string } | null;
}

function fmt(n: number | string) {
  return new Intl.NumberFormat("vi-VN").format(Number(n)) + "₫";
}

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("vi-VN");
}

function usageVariant(pct: number): "danger" | "warning" | "success" {
  if (pct >= 100) return "danger";
  if (pct >= 80) return "warning";
  return "success";
}

const USAGE_BG: Record<string, string> = { danger: "bg-danger", warning: "bg-warning", success: "bg-success" };
const USAGE_TEXT: Record<string, string> = { danger: "text-danger", warning: "text-warning", success: "text-success" };

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [budgetItems, setBudgetItems] = useState<BudgetItemData[]>([]);
  const [actualCosts, setActualCosts] = useState<ActualCostData[]>([]);
  const [loading, setLoading] = useState(true);

  // Drawers
  const [showBudgetDrawer, setShowBudgetDrawer] = useState(false);
  const [showCostDrawer, setShowCostDrawer] = useState(false);

  // Budget item form
  const [budgetForm, setBudgetForm] = useState({
    name: "", description: "", unit: "Cái", quantity: 1, unitPrice: 0, categoryName: "", note: "",
  });

  // Cost form
  const [costForm, setCostForm] = useState({
    description: "", amount: 0, costDate: "", categoryName: "", vendor: "", invoiceNo: "", note: "", budgetItemId: "",
  });

  const loadSummary = useCallback(async () => {
    try {
      const data = await api.get<BudgetSummary>(`/projects/${projectId}/budget-summary`);
      setSummary(data);
    } catch {}
  }, [projectId]);

  const loadBudgetItems = useCallback(async () => {
    try {
      const data = await api.get<BudgetItemData[]>(`/projects/${projectId}/budget-items`);
      setBudgetItems(Array.isArray(data) ? data : []);
    } catch {}
  }, [projectId]);

  const loadActualCosts = useCallback(async () => {
    try {
      const data = await api.get<ActualCostData[]>(`/projects/${projectId}/actual-costs`);
      setActualCosts(Array.isArray(data) ? data : []);
    } catch {}
  }, [projectId]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadSummary(), loadBudgetItems(), loadActualCosts()]);
    setLoading(false);
  }, [loadSummary, loadBudgetItems, loadActualCosts]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleAddBudgetItem = async () => {
    try {
      await api.post(`/projects/${projectId}/budget-items`, {
        ...budgetForm,
        quantity: Number(budgetForm.quantity),
        unitPrice: Number(budgetForm.unitPrice),
      });
      setShowBudgetDrawer(false);
      setBudgetForm({ name: "", description: "", unit: "Cái", quantity: 1, unitPrice: 0, categoryName: "", note: "" });
      loadSummary();
      loadBudgetItems();
    } catch (e: any) {
      alert(e?.message || "Lỗi");
    }
  };

  const handleAddCost = async () => {
    try {
      await api.post(`/projects/${projectId}/actual-costs`, {
        ...costForm,
        amount: Number(costForm.amount),
        budgetItemId: costForm.budgetItemId || undefined,
      });
      setShowCostDrawer(false);
      setCostForm({ description: "", amount: 0, costDate: "", categoryName: "", vendor: "", invoiceNo: "", note: "", budgetItemId: "" });
      loadSummary();
      loadActualCosts();
    } catch (e: any) {
      alert(e?.message || "Lỗi");
    }
  };

  const handleDeleteBudgetItem = async (itemId: string) => {
    if (!confirm("Xóa hạng mục ngân sách này?")) return;
    try {
      await api.delete(`/projects/${projectId}/budget-items/${itemId}`);
      loadSummary();
      loadBudgetItems();
    } catch {}
  };

  const handleDeleteCost = async (costId: string) => {
    if (!confirm("Xóa chi phí này?")) return;
    try {
      await api.delete(`/projects/${projectId}/actual-costs/${costId}`);
      loadSummary();
      loadActualCosts();
    } catch {}
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Không tìm thấy dự án</p>
        <Link href="/projects" className="text-primary hover:underline mt-2 inline-block">← Quay lại</Link>
      </div>
    );
  }

  const project = summary.project;
  const uc = usageVariant(summary.usagePercent);

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">
          <i className="bi bi-house-door" />
        </Link>
        <span>/</span>
        <Link href="/projects" className="hover:text-foreground transition-colors">Ngân sách dự án</Link>
        <span>/</span>
        <span className="text-foreground font-medium">{project.code}</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-card-foreground">{project.name}</h1>
              <StatusBadge variant={project.status === "active" ? "success" : "neutral"}>
                {project.status === "active" ? "Đang triển khai" : "Đã kết thúc"}
              </StatusBadge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              <span className="font-mono text-primary">{project.code}</span>
              {project.department && <> • {project.department}</>}
              {project.startDate && <> • {fmtDate(project.startDate)} → {fmtDate(project.endDate)}</>}
            </p>
            {project.description && <p className="mt-2 text-sm text-muted-foreground">{project.description}</p>}
          </div>
          <Link href="/projects" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            <i className="bi bi-arrow-left mr-1" />Quay lại
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8 lg:grid-cols-4">
        {[
          { label: "Ngân sách KH", value: fmt(summary.plannedBudget), color: "text-primary" },
          { label: "Chi phí thực tế", value: fmt(summary.actualCost), color: "text-warning" },
          { label: "Còn lại", value: fmt(summary.remaining), color: summary.remaining >= 0 ? "text-success" : "text-danger" },
          { label: "% Thực hiện", value: `${summary.usagePercent}%`, color: USAGE_TEXT[uc] },
        ].map((c, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5 shadow-sm text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{c.label}</p>
            <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Usage bar */}
      <div className="mb-8 rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-card-foreground">Tiến độ sử dụng ngân sách</p>
          <span className={`text-sm font-bold ${USAGE_TEXT[uc]}`}>{summary.usagePercent}%</span>
        </div>
        <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${USAGE_BG[uc]}`} style={{ width: `${Math.min(summary.usagePercent, 100)}%` }} />
        </div>
      </div>

      {/* Section: Budget Items */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-card-foreground">
            <i className="bi bi-journal-text mr-2 text-primary" />
            Kế hoạch ngân sách
          </h2>
          <button
            onClick={() => setShowBudgetDrawer(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
          >
            <i className="bi bi-plus-lg" /> Thêm hạng mục
          </button>
        </div>
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          {budgetItems.length === 0 ? (
            <div className="py-12 text-center">
              <i className="bi bi-journal-text text-3xl text-muted-foreground" />
              <p className="mt-2 text-sm font-medium text-card-foreground">Chưa có hạng mục nào</p>
              <p className="text-xs text-muted-foreground mt-1">Thêm hạng mục ngân sách cho dự án</p>
              <button onClick={() => setShowBudgetDrawer(true)} className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground">
                <i className="bi bi-plus-lg" /> Thêm hạng mục
              </button>
            </div>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Hạng mục</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Danh mục</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">ĐVT</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">SL</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Đơn giá</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Thành tiền</th>
                      <th className="px-4 py-3 w-12" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {budgetItems.map((item) => (
                      <tr key={item.id} className="group hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-card-foreground">{item.name}</p>
                          {item.description && <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-card-foreground">{item.category.name}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{item.unit || "—"}</td>
                        <td className="px-4 py-3 text-right text-sm text-card-foreground">{item.quantity}</td>
                        <td className="px-4 py-3 text-right text-sm text-card-foreground">{fmt(item.unitPrice)}</td>
                        <td className="px-4 py-3 text-right text-sm font-semibold text-primary">{fmt(item.totalPrice)}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => handleDeleteBudgetItem(item.id)} className="rounded-md p-1.5 text-muted-foreground hover:bg-danger/10 hover:text-danger opacity-0 group-hover:opacity-100 transition-all" title="Xóa">
                            <i className="bi bi-trash text-sm" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-border bg-muted/20">
                      <td colSpan={5} className="px-4 py-3 text-right text-sm font-semibold text-card-foreground">Tổng kế hoạch</td>
                      <td className="px-4 py-3 text-right text-base font-bold text-primary">{fmt(summary.plannedBudget)}</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
              {/* Mobile */}
              <div className="md:hidden divide-y divide-border">
                {budgetItems.map((item) => (
                  <div key={item.id} className="px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-card-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.quantity} x {fmt(item.unitPrice)}</p>
                    </div>
                    <p className="text-sm font-bold text-primary">{fmt(item.totalPrice)}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Section: Actual Costs */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-card-foreground">
            <i className="bi bi-cash-stack mr-2 text-warning" />
            Chi phí thực tế
          </h2>
          <button
            onClick={() => setShowCostDrawer(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-warning px-3 py-2 text-xs font-medium text-white shadow-sm hover:bg-warning/90 transition-colors"
          >
            <i className="bi bi-plus-lg" /> Ghi nhận chi phí
          </button>
        </div>
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          {actualCosts.length === 0 ? (
            <div className="py-12 text-center">
              <i className="bi bi-cash-stack text-3xl text-muted-foreground" />
              <p className="mt-2 text-sm font-medium text-card-foreground">Chưa có chi phí nào</p>
              <p className="text-xs text-muted-foreground mt-1">Ghi nhận chi phí thực tế cho dự án</p>
              <button onClick={() => setShowCostDrawer(true)} className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-warning px-3 py-2 text-xs font-medium text-white">
                <i className="bi bi-plus-lg" /> Ghi nhận chi phí
              </button>
            </div>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ngày</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Danh mục</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mô tả</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Số tiền</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">NCC</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Số HĐ</th>
                      <th className="px-4 py-3 w-12" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {actualCosts.map((cost) => (
                      <tr key={cost.id} className="group hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 text-sm text-card-foreground whitespace-nowrap">{fmtDate(cost.costDate)}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-card-foreground">{cost.categoryName}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-card-foreground max-w-xs truncate">{cost.description}</td>
                        <td className="px-4 py-3 text-right text-sm font-semibold text-warning whitespace-nowrap">{fmt(cost.amount)}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{cost.vendor || "—"}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{cost.invoiceNo || "—"}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => handleDeleteCost(cost.id)} className="rounded-md p-1.5 text-muted-foreground hover:bg-danger/10 hover:text-danger opacity-0 group-hover:opacity-100 transition-all" title="Xóa">
                            <i className="bi bi-trash text-sm" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-border bg-muted/20">
                      <td colSpan={3} className="px-4 py-3 text-right text-sm font-semibold text-card-foreground">Tổng chi phí</td>
                      <td className="px-4 py-3 text-right text-base font-bold text-warning">{fmt(summary.actualCost)}</td>
                      <td colSpan={3} />
                    </tr>
                  </tfoot>
                </table>
              </div>
              {/* Mobile */}
              <div className="md:hidden divide-y divide-border">
                {actualCosts.map((cost) => (
                  <div key={cost.id} className="px-4 py-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-card-foreground">{cost.categoryName}</span>
                        <p className="mt-1 text-sm font-medium text-card-foreground">{cost.description}</p>
                      </div>
                      <p className="text-sm font-bold text-warning">{fmt(cost.amount)}</p>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      <i className="bi bi-calendar3 mr-1" />{fmtDate(cost.costDate)}
                      {cost.vendor && <> • {cost.vendor}</>}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Drawer: Add Budget Item */}
      {showBudgetDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div onClick={() => setShowBudgetDrawer(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg bg-card shadow-2xl flex flex-col overflow-auto">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-lg font-semibold text-card-foreground">Thêm hạng mục ngân sách</h2>
              <button onClick={() => setShowBudgetDrawer(false)} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted transition-colors"><i className="bi bi-x-lg" /></button>
            </div>
            <div className="flex-1 p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1.5">Tên hạng mục <span className="text-danger">*</span></label>
                <input type="text" value={budgetForm.name} onChange={(e) => setBudgetForm({ ...budgetForm, name: e.target.value })}
                  placeholder="VD: Máy chủ Dell R740" className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1.5">Danh mục</label>
                <input type="text" value={budgetForm.categoryName} onChange={(e) => setBudgetForm({ ...budgetForm, categoryName: e.target.value })}
                  placeholder="VD: Phần cứng" className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1.5">ĐVT</label>
                  <input type="text" value={budgetForm.unit} onChange={(e) => setBudgetForm({ ...budgetForm, unit: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1.5">Số lượng</label>
                  <input type="number" value={budgetForm.quantity} onChange={(e) => setBudgetForm({ ...budgetForm, quantity: +e.target.value })} min={1}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary text-right" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1.5">Đơn giá</label>
                  <input type="number" value={budgetForm.unitPrice} onChange={(e) => setBudgetForm({ ...budgetForm, unitPrice: +e.target.value })} min={0}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary text-right" />
                </div>
              </div>
              <div className="rounded-lg bg-muted/30 p-3 text-right">
                <p className="text-xs text-muted-foreground">Thành tiền</p>
                <p className="text-lg font-bold text-primary">{fmt(budgetForm.quantity * budgetForm.unitPrice)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1.5">Mô tả</label>
                <textarea value={budgetForm.description} onChange={(e) => setBudgetForm({ ...budgetForm, description: e.target.value })} rows={2}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1.5">Ghi chú</label>
                <textarea value={budgetForm.note} onChange={(e) => setBudgetForm({ ...budgetForm, note: e.target.value })} rows={2}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary resize-none" />
              </div>
            </div>
            <div className="border-t border-border px-6 py-4 flex gap-3">
              <button onClick={() => setShowBudgetDrawer(false)} className="flex-1 rounded-lg border border-input py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">Hủy</button>
              <button onClick={handleAddBudgetItem} className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors">Thêm hạng mục</button>
            </div>
          </div>
        </div>
      )}

      {/* Drawer: Add Actual Cost */}
      {showCostDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div onClick={() => setShowCostDrawer(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg bg-card shadow-2xl flex flex-col overflow-auto">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-lg font-semibold text-card-foreground">Ghi nhận chi phí thực tế</h2>
              <button onClick={() => setShowCostDrawer(false)} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted transition-colors"><i className="bi bi-x-lg" /></button>
            </div>
            <div className="flex-1 p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1.5">Mô tả <span className="text-danger">*</span></label>
                <input type="text" value={costForm.description} onChange={(e) => setCostForm({ ...costForm, description: e.target.value })}
                  placeholder="VD: Mua máy chủ Dell R740" className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1.5">Số tiền <span className="text-danger">*</span></label>
                  <input type="number" value={costForm.amount} onChange={(e) => setCostForm({ ...costForm, amount: +e.target.value })} min={0}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary text-right" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1.5">Ngày chi <span className="text-danger">*</span></label>
                  <input type="date" value={costForm.costDate} onChange={(e) => setCostForm({ ...costForm, costDate: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1.5">Danh mục</label>
                <input type="text" value={costForm.categoryName} onChange={(e) => setCostForm({ ...costForm, categoryName: e.target.value })}
                  placeholder="VD: Phần cứng" className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
              </div>
              {budgetItems.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1.5">Liên kết hạng mục KH</label>
                  <select value={costForm.budgetItemId} onChange={(e) => setCostForm({ ...costForm, budgetItemId: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary">
                    <option value="">Không liên kết</option>
                    {budgetItems.map((item) => (
                      <option key={item.id} value={item.id}>{item.name} ({fmt(item.totalPrice)})</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1.5">Nhà cung cấp</label>
                  <input type="text" value={costForm.vendor} onChange={(e) => setCostForm({ ...costForm, vendor: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1.5">Số hóa đơn</label>
                  <input type="text" value={costForm.invoiceNo} onChange={(e) => setCostForm({ ...costForm, invoiceNo: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1.5">Ghi chú</label>
                <textarea value={costForm.note} onChange={(e) => setCostForm({ ...costForm, note: e.target.value })} rows={2}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary resize-none" />
              </div>
            </div>
            <div className="border-t border-border px-6 py-4 flex gap-3">
              <button onClick={() => setShowCostDrawer(false)} className="flex-1 rounded-lg border border-input py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">Hủy</button>
              <button onClick={handleAddCost} className="flex-1 rounded-lg bg-warning py-2.5 text-sm font-medium text-white shadow-sm hover:bg-warning/90 transition-colors">Ghi nhận chi phí</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
