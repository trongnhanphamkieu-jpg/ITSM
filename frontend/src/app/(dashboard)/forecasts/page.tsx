"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import Link from "next/link";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  draft: { label: "Nháp", color: "bg-gray-500/20 text-gray-400" },
  pending: { label: "Chờ duyệt", color: "bg-yellow-500/20 text-yellow-400" },
  approved: { label: "Đã duyệt", color: "bg-emerald-500/20 text-emerald-400" },
  rejected: { label: "Từ chối", color: "bg-red-500/20 text-red-400" },
  closed: { label: "Đã đóng", color: "bg-slate-500/20 text-slate-400" },
};

const PRIORITY_MAP: Record<string, { label: string; color: string }> = {
  critical: { label: "Khẩn cấp", color: "bg-red-500/20 text-red-400" },
  high: { label: "Cao", color: "bg-orange-500/20 text-orange-400" },
  medium: { label: "Trung bình", color: "bg-blue-500/20 text-blue-400" },
  low: { label: "Thấp", color: "bg-gray-500/20 text-gray-400" },
};

function fmt(n: number) {
  return new Intl.NumberFormat("vi-VN").format(n) + "₫";
}

export default function ForecastsPage() {
  const [forecasts, setForecasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [statusFilter, setStatusFilter] = useState("");

  // Create drawer
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    notes: "",
  });

  const fetchForecasts = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = { year: yearFilter };
      if (statusFilter) params.status = statusFilter;
      const data = await api.get<any[]>("/cost-forecasts", params);
      setForecasts(data);
    } catch {
      setForecasts([]);
    } finally {
      setLoading(false);
    }
  }, [yearFilter, statusFilter]);

  useEffect(() => {
    fetchForecasts();
  }, [fetchForecasts]);

  const handleCreate = async () => {
    try {
      await api.post("/cost-forecasts", createForm);
      setShowCreate(false);
      setCreateForm({ month: new Date().getMonth() + 1, year: new Date().getFullYear(), notes: "" });
      fetchForecasts();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa bảng dự chi này?")) return;
    try {
      await api.delete(`/cost-forecasts/${id}`);
      fetchForecasts();
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dự chi hàng tháng</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Lập bảng dự chi, phê duyệt và so sánh vs thực tế
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition whitespace-nowrap"
        >
          + Tạo dự chi mới
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={yearFilter}
          onChange={(e) => setYearFilter(Number(e.target.value))}
          className="px-3 py-2 bg-card border border-border rounded-lg text-sm"
        >
          {[2024, 2025, 2026, 2027].map((y) => (
            <option key={y} value={y}>Năm {y}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-card border border-border rounded-lg text-sm"
        >
          <option value="">Tất cả trạng thái</option>
          {Object.entries(STATUS_MAP).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">THÁNG</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">TÊN</th>
                <th className="px-4 py-3 text-right font-semibold text-muted-foreground">TỔNG DỰ CHI</th>
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground">HẠNG MỤC</th>
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground">TRẠNG THÁI</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">NGƯỜI TẠO</th>
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Đang tải...</td></tr>
              ) : forecasts.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <i className="bi bi-graph-up-arrow text-3xl opacity-50" />
                    <p>Chưa có bảng dự chi nào</p>
                    <button onClick={() => setShowCreate(true)} className="text-primary hover:underline text-sm">
                      Tạo bảng dự chi đầu tiên
                    </button>
                  </div>
                </td></tr>
              ) : (
                forecasts.map((f) => {
                  const st = STATUS_MAP[f.status] || STATUS_MAP.draft;
                  return (
                    <tr key={f.id} className="hover:bg-muted/30 transition">
                      <td className="px-4 py-3 text-foreground font-medium">
                        T{f.month}/{f.year}
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/forecasts/${f.id}`} className="text-primary hover:underline font-medium">
                          {f.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-amber-400">
                        {fmt(Number(f.totalAmount))}
                      </td>
                      <td className="px-4 py-3 text-center text-muted-foreground">{f._count?.items || 0}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${st.color}`}>{st.label}</span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{f.createdBy?.fullName}</td>
                      <td className="px-4 py-3 text-center">
                        <Link href={`/forecasts/${f.id}`} className="text-primary hover:underline text-xs mr-3">
                          Chi tiết
                        </Link>
                        {f.status === "draft" && (
                          <button onClick={() => handleDelete(f.id)} className="text-red-400 hover:text-red-300 text-xs">
                            Xóa
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Yearly Summary Link */}
      <div className="text-center">
        <Link href={`/forecasts/yearly?year=${yearFilter}`} className="text-primary hover:underline text-sm">
          📊 Xem tổng hợp dự chi năm {yearFilter} →
        </Link>
      </div>

      {/* Create Drawer */}
      {showCreate && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowCreate(false)} />
          <div className="fixed right-0 top-0 h-full w-[440px] max-w-full bg-card border-l border-border z-50 shadow-2xl overflow-y-auto">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">Tạo bảng dự chi mới</h2>
                <button onClick={() => setShowCreate(false)} className="text-muted-foreground hover:text-foreground text-xl">✕</button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Tháng *</label>
                    <select
                      value={createForm.month}
                      onChange={(e) => setCreateForm({ ...createForm, month: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Năm *</label>
                    <select
                      value={createForm.year}
                      onChange={(e) => setCreateForm({ ...createForm, year: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                    >
                      {[2024, 2025, 2026, 2027].map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Ghi chú</label>
                  <textarea
                    value={createForm.notes}
                    onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm h-20 resize-none"
                    placeholder="Ghi chú (tùy chọn)"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowCreate(false)} className="flex-1 px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted transition">
                  Hủy
                </button>
                <button onClick={handleCreate} className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition">
                  Tạo mới
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
