"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { VendorSelect } from "@/components/shared/vendor-select";
import { CategorySelect } from "@/components/shared/category-select";
import { CurrencyInput } from "@/components/shared/currency-input";
import { ExportButton } from "@/components/shared/export-button";
import type { ExportColumn } from "@/components/shared/export-button";

const PAYMENT_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "Chưa TT", color: "text-orange-700", bg: "bg-orange-100" },
  partial_paid: { label: "TT 1 phần", color: "text-blue-700", bg: "bg-blue-100" },
  paid: { label: "Đã TT", color: "text-emerald-700", bg: "bg-emerald-100" },
  cancelled: { label: "Đã hủy", color: "text-gray-500", bg: "bg-gray-100" },
};

const COST_EXPORT_COLUMNS: ExportColumn[] = [
  { header: "Ngày", key: "costDate", format: (v: string) => v ? new Date(v).toLocaleDateString("vi-VN") : "" },
  { header: "Danh mục", key: "categoryName" },
  { header: "Mô tả", key: "description" },
  { header: "Số tiền", key: "amount" },
  { header: "Nhà cung cấp", key: "vendor", format: (_v: string, row: Record<string, unknown>) => {
    const ref = row.vendorRef as { name?: string } | null;
    return ref?.name || (row.vendor as string) || "";
  } },
  { header: "Số HĐ", key: "invoiceNo" },
];


interface ActualCost {
  id: string;
  categoryName: string;
  description: string;
  amount: string;
  paidAmount: string | null;
  costDate: string;
  paymentStatus: string;
  paymentDueDate: string | null;
  vendor: string | null;
  vendorId: string | null;
  vendorRef: { id: string; name: string; code: string } | null;
  invoiceNo: string | null;
  createdBy: { id: string; fullName: string };
  budgetItem: { id: string; name: string; category: { name: string } } | null;
  attachments: { id: string; fileName: string }[];
}

interface ApiResponse {
  success: boolean;
  data: ActualCost[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}



export default function CostListPage() {
  const [costs, setCosts] = useState<ActualCost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ categoryName: "", description: "", amount: 0, costDate: "", vendorId: "", invoiceNo: "", note: "" });
  const [editSaving, setEditSaving] = useState(false);
  // Payment modal
  const [payingCost, setPayingCost] = useState<ActualCost | null>(null);
  const [payAmount, setPayAmount] = useState(0);
  const [payNote, setPayNote] = useState("");
  const [paySaving, setPaySaving] = useState(false);

  const fetchCosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = {
        page: meta.page,
        limit: 20,
      };
      if (search) params.search = search;
      if (categoryFilter) params.categoryName = categoryFilter;
      if (paymentFilter) params.paymentStatus = paymentFilter;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      const res = await api.get<ApiResponse>("/actual-costs", params);
      setCosts(res.data);
      setMeta({
        total: res.meta.total,
        page: res.meta.page,
        totalPages: res.meta.totalPages,
      });
    } catch {
      // handled by api.ts
    } finally {
      setIsLoading(false);
    }
  }, [meta.page, search, categoryFilter, paymentFilter, dateFrom, dateTo]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get<{ success: boolean; data: string[] }>(
        "/actual-costs/categories"
      );
      setCategories(res.data);
    } catch {
      /* skip */
    }
  }, []);

  useEffect(() => {
    fetchCosts();
  }, [fetchCosts]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">
          <i className="bi bi-house-door" />
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">Chi phí thực tế</span>
      </nav>

      <PageHeader
        title="Chi phí thực tế"
        description="Quản lý chi phí phát sinh và so sánh với ngân sách"
        actions={
          <div className="flex items-center gap-2">
            <ExportButton data={costs} columns={COST_EXPORT_COLUMNS} filename="chi_phi_thuc_te" />
            <Link
              href="/costs/create"
              className="hidden sm:inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <i className="bi bi-plus-lg" />
              Thêm chi phí
            </Link>
          </div>
        }
      />

      {/* Mobile CTA */}
      <Link
        href="/costs/create"
        className="mb-4 flex sm:hidden items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
      >
        <i className="bi bi-plus-lg" />
        Thêm chi phí
      </Link>

      {/* Filters */}
      <div className="mb-4 space-y-3">
        <div className="relative">
          <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm theo mô tả, nhà cung cấp..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setMeta((p) => ({ ...p, page: 1 }));
            }}
            className="w-full rounded-lg border border-input bg-background py-2.5 pl-9 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setMeta((p) => ({ ...p, page: 1 }));
            }}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value);
              setMeta((p) => ({ ...p, page: 1 }));
            }}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="">Tất cả trạng thái TT</option>
            <option value="pending">Chưa thanh toán</option>
            <option value="partial_paid">TT một phần</option>
            <option value="paid">Đã thanh toán</option>
            <option value="cancelled">Đã hủy</option>
          </select>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setMeta((p) => ({ ...p, page: 1 }));
            }}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            placeholder="Từ ngày"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              setMeta((p) => ({ ...p, page: 1 }));
            }}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            placeholder="Đến ngày"
          />
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex h-32 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && costs.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-12 text-center shadow-sm">
          <i className="bi bi-cash-stack text-4xl text-muted-foreground" />
          <p className="mt-3 text-base font-medium text-card-foreground">
            Chưa có chi phí nào
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Hãy thêm chi phí đầu tiên
          </p>
          <Link
            href="/costs/create"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            <i className="bi bi-plus-lg" />
            Thêm chi phí
          </Link>
        </div>
      )}

      {/* Desktop Table */}
      {!isLoading && costs.length > 0 && (
        <>
          <div className="hidden md:block rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                    NGÀY
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    DANH MỤC
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    MÔ TẢ
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                    SỐ TIỀN
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    NHÀ CUNG CẤP
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                    SỐ HĐ
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                    THANH TOÁN
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                    THAO TÁC
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {costs.map((cost) => (
                  <tr key={cost.id} className={`hover:bg-muted/10 ${editingId === cost.id ? 'bg-primary/5' : ''}`}>
                    <td className="px-6 py-3 text-card-foreground whitespace-nowrap">
                      {editingId === cost.id ? (
                        <input
                          type="date"
                          value={editForm.costDate}
                          onChange={(e) => setEditForm(f => ({ ...f, costDate: e.target.value }))}
                          className="w-full rounded border border-input bg-background px-2 py-1 text-sm outline-none focus:border-primary"
                        />
                      ) : (
                        new Date(cost.costDate).toLocaleDateString("vi-VN")
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingId === cost.id ? (
                        <CategorySelect
                          value={editForm.categoryName}
                          onChange={(v) => setEditForm(f => ({ ...f, categoryName: v }))}
                        />
                      ) : (
                        <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-card-foreground">
                          {cost.categoryName}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-card-foreground max-w-xs">
                      {editingId === cost.id ? (
                        <input
                          type="text"
                          value={editForm.description}
                          onChange={(e) => setEditForm(f => ({ ...f, description: e.target.value }))}
                          className="w-full rounded border border-input bg-background px-2 py-1 text-sm outline-none focus:border-primary"
                          placeholder="Mô tả"
                        />
                      ) : (
                        <span className="truncate block">{cost.description}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-primary whitespace-nowrap">
                      {editingId === cost.id ? (
                        <input
                          type="number"
                          value={editForm.amount}
                          onChange={(e) => setEditForm(f => ({ ...f, amount: Number(e.target.value) }))}
                          className="w-full rounded border border-input bg-background px-2 py-1 text-sm text-right outline-none focus:border-primary"
                          placeholder="Số tiền"
                        />
                      ) : (
                        formatCurrency(cost.amount)
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {editingId === cost.id ? (
                        <VendorSelect
                          value={editForm.vendorId}
                          onChange={(v) => setEditForm(f => ({ ...f, vendorId: v }))}
                          className="w-full rounded border border-input bg-background px-2 py-1 text-sm outline-none focus:border-primary"
                        />
                      ) : (
                        cost.vendorRef?.name || cost.vendor || "—"
                      )}
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {editingId === cost.id ? (
                        <input
                          type="text"
                          value={editForm.invoiceNo}
                          onChange={(e) => setEditForm(f => ({ ...f, invoiceNo: e.target.value }))}
                          className="w-full rounded border border-input bg-background px-2 py-1 text-sm outline-none focus:border-primary"
                          placeholder="Số HĐ"
                        />
                      ) : (
                        cost.invoiceNo || "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {(() => {
                        const ps = PAYMENT_LABELS[cost.paymentStatus] || PAYMENT_LABELS.pending;
                        const paid = Number(cost.paidAmount || 0);
                        const total = Number(cost.amount);
                        const pct = total > 0 ? Math.min(Math.round((paid / total) * 100), 100) : 0;
                        return (
                          <div className="flex flex-col items-center gap-1">
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${ps.color} ${ps.bg}`}>
                              {ps.label}
                            </span>
                            {cost.paymentStatus !== 'cancelled' && (
                              <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    pct >= 100 ? 'bg-emerald-500' : pct > 0 ? 'bg-blue-500' : 'bg-orange-400'
                                  }`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {editingId === cost.id ? (
                        <div className="flex items-center gap-1 justify-center">
                          <button onClick={async () => {
                            setEditSaving(true);
                            try {
                              const payload: Record<string, unknown> = {
                                categoryName: editForm.categoryName,
                                description: editForm.description,
                                amount: editForm.amount,
                                costDate: editForm.costDate,
                                invoiceNo: editForm.invoiceNo || undefined,
                                note: editForm.note || undefined,
                                vendorId: editForm.vendorId || undefined,
                              };
                              // Remove undefined values to avoid sending empty optional fields
                              Object.keys(payload).forEach(key => {
                                if (payload[key] === undefined) delete payload[key];
                              });
                              await api.patch(`/actual-costs/${cost.id}`, payload);
                              setEditingId(null);
                              fetchCosts();
                            } catch (err) {
                              alert(err instanceof Error ? err.message : "Lỗi khi lưu chi phí");
                            } finally { setEditSaving(false); }
                          }} disabled={editSaving} className="rounded p-1 text-emerald-600 hover:bg-emerald-50"><i className="bi bi-check-lg" /></button>
                          <button onClick={() => setEditingId(null)} className="rounded p-1 text-gray-400 hover:bg-gray-50"><i className="bi bi-x-lg" /></button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 justify-center">
                          <button onClick={() => {
                            setEditingId(cost.id);
                            setEditForm({
                              categoryName: cost.categoryName, description: cost.description,
                              amount: Number(cost.amount), costDate: cost.costDate?.split("T")[0] || "",
                              vendorId: cost.vendorId || "", invoiceNo: cost.invoiceNo || "", note: "",
                            });
                          }} className="rounded p-1 text-gray-400 hover:text-primary hover:bg-primary/5" title="Chỉnh sửa">
                            <i className="bi bi-pencil" />
                          </button>
                          <button onClick={async () => {
                            if (!confirm("Xóa chi phí này?")) return;
                            try { await api.delete(`/actual-costs/${cost.id}`); fetchCosts(); } catch {}
                          }} className="rounded p-1 text-gray-400 hover:text-red-600 hover:bg-red-50" title="Xóa">
                            <i className="bi bi-trash" />
                          </button>
                          {cost.paymentStatus !== 'paid' && cost.paymentStatus !== 'cancelled' && (
                            <button onClick={() => {
                              setPayingCost(cost);
                              setPayAmount(Number(cost.paidAmount || 0));
                              setPayNote("");
                            }} className="rounded p-1 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50" title="Thanh toán">
                              <i className="bi bi-credit-card" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {costs.map((cost) => (
              <div
                key={cost.id}
                className="rounded-xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-card-foreground">
                      {cost.categoryName}
                    </span>
                    <p className="mt-1.5 text-sm font-medium text-card-foreground">
                      {cost.description}
                    </p>
                  </div>
                  <p className="text-base font-bold text-primary">
                    {formatCurrency(cost.amount)}
                  </p>
                </div>
                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>
                    <i className="bi bi-calendar3 mr-1" />
                    {new Date(cost.costDate).toLocaleDateString("vi-VN")}
                  </span>
                  {(cost.vendorRef?.name || cost.vendor) && (
                    <span>
                      <i className="bi bi-building mr-1" />
                      {cost.vendorRef?.name || cost.vendor}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <p>
              Hiển thị {costs.length} / {meta.total} chi phí
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setMeta((p) => ({ ...p, page: p.page - 1 }))}
                disabled={meta.page <= 1}
                className="rounded-lg border border-input px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-30"
              >
                ‹
              </button>
              <button
                onClick={() => setMeta((p) => ({ ...p, page: p.page + 1 }))}
                disabled={meta.page >= meta.totalPages}
                className="rounded-lg border border-input px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-30"
              >
                ›
              </button>
            </div>
          </div>
        </>
      )}
      {/* Payment Modal */}
      {payingCost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div onClick={() => setPayingCost(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative w-full max-w-md mx-4 rounded-xl bg-card border border-border shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-card-foreground">Thanh toán chi phí</h3>
              <button onClick={() => setPayingCost(null)} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted">
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="rounded-lg bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Chi phí</p>
                <p className="text-sm font-medium text-card-foreground">{payingCost.description}</p>
                <p className="text-lg font-bold text-primary mt-1">{formatCurrency(payingCost.amount)}</p>
                {Number(payingCost.paidAmount || 0) > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Đã TT: {formatCurrency(payingCost.paidAmount || "0")}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-card-foreground">
                  Số tiền thanh toán <span className="text-danger">*</span>
                </label>
                <CurrencyInput
                  value={payAmount}
                  onChange={(raw) => setPayAmount(raw)}
                  required
                />
                {payAmount > 0 && payAmount < Number(payingCost.amount) && (
                  <p className="mt-1 text-xs text-blue-600">
                    → Thanh toán một phần ({Math.round((payAmount / Number(payingCost.amount)) * 100)}%)
                  </p>
                )}
                {payAmount >= Number(payingCost.amount) && (
                  <p className="mt-1 text-xs text-emerald-600">→ Đã thanh toán đủ</p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-card-foreground">Ghi chú</label>
                <input
                  type="text"
                  value={payNote}
                  onChange={(e) => setPayNote(e.target.value)}
                  placeholder="VD: Đợt 1, chuyển khoản..."
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setPayingCost(null)}
                className="flex-1 rounded-lg border border-input py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={async () => {
                  setPaySaving(true);
                  try {
                    await api.patch(`/actual-costs/${payingCost.id}/payment`, {
                      paidAmount: payAmount,
                      note: payNote || undefined,
                    });
                    setPayingCost(null);
                    fetchCosts();
                  } catch (err) {
                    alert(err instanceof Error ? err.message : "Lỗi thanh toán");
                  } finally {
                    setPaySaving(false);
                  }
                }}
                disabled={paySaving || payAmount <= 0}
                className="flex-1 rounded-lg bg-emerald-600 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                {paySaving ? "Đang xử lý..." : "Xác nhận thanh toán"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
