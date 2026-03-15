"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import Link from "next/link";

function fmt(n: number) {
  return new Intl.NumberFormat("vi-VN").format(n) + "₫";
}

type ReportTab = "budget" | "cost" | "asset" | "project" | "vehicle" | "contract";

export default function ReportsPage() {
  const [tab, setTab] = useState<ReportTab>("budget");
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      let result: any;
      switch (tab) {
        case "budget":
          result = await api.get("/reports/budget-summary", { year });
          break;
        case "cost":
          result = await api.get("/reports/cost-comparison", { year });
          break;
        case "asset":
          result = await api.get("/reports/asset-overview");
          break;
        case "project":
          result = await api.get("/reports/project-budget", { year });
          break;
        case "vehicle":
          try { result = await api.get("/vehicles", { limit: 100 }); } catch { result = { data: [] }; }
          break;
        case "contract":
          try { result = await api.get("/contracts", { limit: 100 }); } catch { result = { data: [] }; }
          break;
      }
      setData(result);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [tab, year]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const tabs: { key: ReportTab; label: string; icon: string }[] = [
    { key: "budget", label: "Ngân sách", icon: "💰" },
    { key: "cost", label: "Chi phí so sánh", icon: "📊" },
    { key: "asset", label: "Tổng quan tài sản", icon: "🏢" },
    { key: "project", label: "Ngân sách dự án", icon: "📁" },
    { key: "vehicle", label: "Phương tiện", icon: "🚗" },
    { key: "contract", label: "Hợp đồng", icon: "📝" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">📈 Báo cáo tổng hợp</h1>
          <p className="text-sm text-muted-foreground mt-1">Phân tích ngân sách, chi phí, tài sản và dự án</p>
        </div>
        {tab !== "asset" && tab !== "vehicle" && tab !== "contract" && (
          <select value={year} onChange={(e) => setYear(Number(e.target.value))}
            className="px-3 py-2 bg-card border border-border rounded-lg text-sm">
            {[2024, 2025, 2026, 2027].map((y) => <option key={y} value={y}>Năm {y}</option>)}
          </select>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-card rounded-lg border border-border p-1 overflow-x-auto">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition whitespace-nowrap ${tab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground py-12">Đang tải báo cáo...</div>
      ) : !data ? (
        <div className="text-center text-muted-foreground py-12 bg-card rounded-xl border border-border">
          <p className="text-4xl mb-2">📭</p>
          <p>Không có dữ liệu</p>
        </div>
      ) : (
        <>
          {/* === BUDGET SUMMARY === */}
          {tab === "budget" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-card rounded-xl border border-border p-4">
                  <p className="text-xs text-muted-foreground font-semibold uppercase">Tổng ngân sách</p>
                  <p className="text-xl font-bold text-amber-400 mt-1">{fmt(data.totalBudget)}</p>
                </div>
                <div className="bg-card rounded-xl border border-border p-4">
                  <p className="text-xs text-muted-foreground font-semibold uppercase">Thực chi</p>
                  <p className="text-xl font-bold text-red-400 mt-1">{fmt(data.totalActual)}</p>
                </div>
                <div className="bg-card rounded-xl border border-border p-4">
                  <p className="text-xs text-muted-foreground font-semibold uppercase">Chênh lệch</p>
                  <p className={`text-xl font-bold mt-1 ${data.variance >= 0 ? "text-emerald-400" : "text-red-400"}`}>{fmt(data.variance)}</p>
                </div>
                <div className="bg-card rounded-xl border border-border p-4">
                  <p className="text-xs text-muted-foreground font-semibold uppercase">% Sử dụng</p>
                  <p className="text-xl font-bold text-primary mt-1">{data.utilizationPct}%</p>
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-4 py-3 text-left font-semibold text-muted-foreground">KẾ HOẠCH</th>
                      <th className="px-4 py-3 text-right font-semibold text-muted-foreground">TỔNG TIỀN</th>
                      <th className="px-4 py-3 text-center font-semibold text-muted-foreground">HẠNG MỤC</th>
                      <th className="px-4 py-3 text-center font-semibold text-muted-foreground">TRẠNG THÁI</th>
                      <th className="px-4 py-3 text-left font-semibold text-muted-foreground">NGƯỜI TẠO</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data.plans?.map((p: any) => (
                      <tr key={p.id} className="hover:bg-muted/30 transition">
                        <td className="px-4 py-3 font-medium text-foreground">
                          <Link href={`/budget/plans`} className="hover:text-primary">{p.name}</Link>
                        </td>
                        <td className="px-4 py-3 text-right text-amber-400 font-medium">{fmt(p.totalAmount)}</td>
                        <td className="px-4 py-3 text-center text-muted-foreground">{p.itemCount}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            p.status === "approved" ? "bg-emerald-500/20 text-emerald-400" :
                            p.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                            p.status === "rejected" ? "bg-red-500/20 text-red-400" :
                            "bg-gray-500/20 text-gray-400"
                          }`}>
                            {p.status === "approved" ? "Đã duyệt" : p.status === "pending" ? "Chờ duyệt" :
                             p.status === "rejected" ? "Từ chối" : "Nháp"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{p.createdBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* === COST COMPARISON === */}
          {tab === "cost" && (
            <div className="space-y-4">
              <div className="bg-card rounded-xl border border-border p-4 space-y-3">
                <h3 className="font-semibold text-foreground">So sánh chi phí theo tháng — {year}</h3>
                {data.months?.map((m: any) => (
                  <div key={m.month} className="flex items-center gap-3">
                    <span className="w-16 text-sm text-muted-foreground">{m.name}</span>
                    <div className="flex-1 flex gap-1">
                      <div className="h-3 bg-amber-500/50 rounded-full" style={{ width: `${Math.min(100, (m.forecastAmount / (Math.max(...data.months.map((x: any) => Math.max(x.forecastAmount, x.actualCost))) || 1)) * 100)}%` }} />
                    </div>
                    <span className="text-xs text-amber-400 w-28 text-right">{fmt(m.forecastAmount)}</span>
                    <div className="flex-1 flex gap-1">
                      <div className="h-3 bg-red-500/50 rounded-full" style={{ width: `${Math.min(100, (m.actualCost / (Math.max(...data.months.map((x: any) => Math.max(x.forecastAmount, x.actualCost))) || 1)) * 100)}%` }} />
                    </div>
                    <span className="text-xs text-red-400 w-28 text-right">{fmt(m.actualCost)}</span>
                  </div>
                ))}
                <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 bg-amber-500/50 rounded" /> Dự chi</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500/50 rounded" /> Thực chi</span>
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-4 py-3 text-left font-semibold text-muted-foreground">THÁNG</th>
                      <th className="px-4 py-3 text-right font-semibold text-muted-foreground">DỰ CHI</th>
                      <th className="px-4 py-3 text-right font-semibold text-muted-foreground">THỰC CHI</th>
                      <th className="px-4 py-3 text-right font-semibold text-muted-foreground">CHÊNH LỆCH</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data.months?.map((m: any) => (
                      <tr key={m.month} className="hover:bg-muted/30 transition">
                        <td className="px-4 py-3 text-foreground font-medium">{m.name}</td>
                        <td className="px-4 py-3 text-right text-amber-400">{m.forecastAmount > 0 ? fmt(m.forecastAmount) : "—"}</td>
                        <td className="px-4 py-3 text-right text-red-400">{m.actualCost > 0 ? fmt(m.actualCost) : "—"}</td>
                        <td className={`px-4 py-3 text-right ${m.variance >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                          {m.forecastAmount > 0 || m.actualCost > 0 ? fmt(m.variance) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* === ASSET OVERVIEW === */}
          {tab === "asset" && (
            <div className="space-y-4">
              <div className="bg-card rounded-xl border border-border p-6">
                <p className="text-xs text-muted-foreground font-semibold uppercase">Tổng tài sản IT</p>
                <p className="text-3xl font-bold text-foreground mt-1">{data.totalAssets}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {data.breakdown?.map((b: any) => (
                  <div key={b.category} className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
                    <span className="text-3xl">{b.icon}</span>
                    <div>
                      <p className="text-sm text-muted-foreground">{b.category}</p>
                      <p className="text-xl font-bold text-foreground">{b.count}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* === PROJECT BUDGET === */}
          {tab === "project" && (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">MÃ</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">DỰ ÁN</th>
                    <th className="px-4 py-3 text-right font-semibold text-muted-foreground">NGÂN SÁCH</th>
                    <th className="px-4 py-3 text-right font-semibold text-muted-foreground">THỰC CHI</th>
                    <th className="px-4 py-3 text-right font-semibold text-muted-foreground">CHÊNH LỆCH</th>
                    <th className="px-4 py-3 text-center font-semibold text-muted-foreground">% SỬ DỤNG</th>
                    <th className="px-4 py-3 text-center font-semibold text-muted-foreground">TRẠNG THÁI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {Array.isArray(data) && data.map((p: any) => (
                    <tr key={p.id} className="hover:bg-muted/30 transition">
                      <td className="px-4 py-3 text-primary font-medium">{p.code}</td>
                      <td className="px-4 py-3 text-foreground font-medium">{p.name}</td>
                      <td className="px-4 py-3 text-right text-amber-400">{fmt(p.totalBudget)}</td>
                      <td className="px-4 py-3 text-right text-red-400">{fmt(p.totalActual)}</td>
                      <td className={`px-4 py-3 text-right ${p.variance >= 0 ? "text-emerald-400" : "text-red-400"}`}>{fmt(p.variance)}</td>
                      <td className="px-4 py-3 text-center text-muted-foreground">{p.utilizationPct}%</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.status === "active" ? "bg-emerald-500/20 text-emerald-400" : "bg-gray-500/20 text-gray-400"}`}>
                          {p.status === "active" ? "Đang hoạt động" : "Đã đóng"}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {Array.isArray(data) && data.length === 0 && (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Chưa có dự án nào</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* === VEHICLE REPORT === */}
          {tab === "vehicle" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {["active", "maintenance", "inactive"].map(st => {
                  const count = (data?.data || data || []).filter?.((v: any) => v.status === st)?.length || 0;
                  return (
                    <div key={st} className="bg-card rounded-xl border border-border p-4">
                      <p className="text-xs text-muted-foreground font-semibold uppercase">{st === "active" ? "Đang SD" : st === "maintenance" ? "Bảo dưỡng" : "Ngưng"}</p>
                      <p className="text-2xl font-bold text-foreground mt-1">{count}</p>
                    </div>
                  );
                })}
                <div className="bg-card rounded-xl border border-border p-4">
                  <p className="text-xs text-muted-foreground font-semibold uppercase">Tổng</p>
                  <p className="text-2xl font-bold text-primary mt-1">{(data?.data || data || []).length}</p>
                </div>
              </div>
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">BIỂN SỐ</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">HÃNG / MODEL</th>
                    <th className="px-4 py-3 text-center font-semibold text-muted-foreground">LOẠI</th>
                    <th className="px-4 py-3 text-center font-semibold text-muted-foreground">TRẠNG THÁI</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">NGƯỜI DÙNG</th>
                  </tr></thead>
                  <tbody className="divide-y divide-border">
                    {(data?.data || data || []).map?.((v: any) => (
                      <tr key={v.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3 font-mono text-primary">{v.licensePlate}</td>
                        <td className="px-4 py-3 text-foreground">{v.brand} {v.model}</td>
                        <td className="px-4 py-3 text-center text-muted-foreground">{v.vehicleType}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${v.status === "active" ? "bg-emerald-500/20 text-emerald-400" : "bg-gray-500/20 text-gray-400"}`}>
                            {v.status === "active" ? "Đang SD" : v.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{v.assignedTo || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* === CONTRACT REPORT === */}
          {tab === "contract" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {["active", "draft", "expired", "terminated"].map(st => {
                  const count = (data?.data || data || []).filter?.((c: any) => c.status === st)?.length || 0;
                  return (
                    <div key={st} className="bg-card rounded-xl border border-border p-4">
                      <p className="text-xs text-muted-foreground font-semibold uppercase">{st === "active" ? "Hiệu lực" : st === "draft" ? "Nháp" : st === "expired" ? "Hết hạn" : "Chấm dứt"}</p>
                      <p className="text-2xl font-bold text-foreground mt-1">{count}</p>
                    </div>
                  );
                })}
              </div>
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">MÃ HĐ</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">TÊN</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">NHÀ CUNG CẤP</th>
                    <th className="px-4 py-3 text-right font-semibold text-muted-foreground">GIÁ TRỊ</th>
                    <th className="px-4 py-3 text-center font-semibold text-muted-foreground">THỜI HẠN</th>
                    <th className="px-4 py-3 text-center font-semibold text-muted-foreground">TRẠNG THÁI</th>
                  </tr></thead>
                  <tbody className="divide-y divide-border">
                    {(data?.data || data || []).map?.((c: any) => (
                      <tr key={c.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3 font-mono text-primary">{c.code || c.contractNumber}</td>
                        <td className="px-4 py-3 text-foreground font-medium">{c.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{c.vendor?.name || "—"}</td>
                        <td className="px-4 py-3 text-right text-amber-400 font-medium">{fmt(Number(c.value || c.totalValue || 0))}</td>
                        <td className="px-4 py-3 text-center text-sm text-muted-foreground">
                          {c.startDate ? new Date(c.startDate).toLocaleDateString("vi-VN") : "—"} — {c.endDate ? new Date(c.endDate).toLocaleDateString("vi-VN") : "—"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.status === "active" ? "bg-emerald-500/20 text-emerald-400" : c.status === "expired" ? "bg-red-500/20 text-red-400" : "bg-gray-500/20 text-gray-400"}`}>
                            {c.status === "active" ? "Hiệu lực" : c.status === "expired" ? "Hết hạn" : c.status === "terminated" ? "Chấm dứt" : "Nháp"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
