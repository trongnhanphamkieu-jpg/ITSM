"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
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

export default function ForecastDetailPage() {
  const params = useParams();
  const router = useRouter();
  const forecastId = params.id as string;

  const [forecast, setForecast] = useState<any>(null);
  const [vsActual, setVsActual] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"items" | "compare" | "history">("items");

  // Item drawer
  const [showItemDrawer, setShowItemDrawer] = useState(false);
  const [itemForm, setItemForm] = useState({
    itemName: "", description: "", estimatedAmount: 0,
    vendor: "", priority: "medium", notes: "",
  });

  // Reject modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const fetchForecast = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get<any>(`/cost-forecasts/${forecastId}`);
      setForecast(data);
      const va = await api.get<any>(`/cost-forecasts/${forecastId}/vs-actual`);
      setVsActual(va);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [forecastId]);

  useEffect(() => {
    fetchForecast();
  }, [fetchForecast]);

  const handleAddItem = async () => {
    try {
      await api.post(`/cost-forecasts/${forecastId}/items`, itemForm);
      setShowItemDrawer(false);
      setItemForm({ itemName: "", description: "", estimatedAmount: 0, vendor: "", priority: "medium", notes: "" });
      fetchForecast();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Xóa hạng mục này?")) return;
    try {
      await api.delete(`/cost-forecasts/${forecastId}/items/${itemId}`);
      fetchForecast();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleAction = async (action: string, body?: any) => {
    try {
      setActionLoading(true);
      await api.post(`/cost-forecasts/${forecastId}/${action}`, body);
      fetchForecast();
      if (action === "clone") router.push("/forecasts");
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    );
  }

  if (!forecast) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Không tìm thấy bảng dự chi</p>
        <Link href="/forecasts" className="text-primary mt-2 inline-block">← Quay lại</Link>
      </div>
    );
  }

  const st = STATUS_MAP[forecast.status] || STATUS_MAP.draft;
  const totalEstimated = forecast.items?.reduce((s: number, i: any) => s + Number(i.estimatedAmount), 0) || 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground flex items-center gap-2">
        <Link href="/" className="hover:text-foreground">🏠</Link>
        <span>/</span>
        <Link href="/forecasts" className="hover:text-foreground">Dự chi</Link>
        <span>/</span>
        <span className="text-foreground">{forecast.name}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-foreground">{forecast.name}</h1>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${st.color}`}>{st.label}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Tháng {forecast.month}/{forecast.year} • Người tạo: {forecast.createdBy?.fullName}
          </p>
          {forecast.notes && <p className="text-sm text-muted-foreground mt-1">{forecast.notes}</p>}
          {forecast.rejectReason && (
            <p className="text-sm text-red-400 mt-1">❌ Lý do từ chối: {forecast.rejectReason}</p>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link href="/forecasts" className="px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition">
            ← Quay lại
          </Link>
          {forecast.status === "draft" && (
            <button
              onClick={() => handleAction("submit")}
              disabled={actionLoading || forecast.items?.length === 0}
              className="px-3 py-2 text-sm bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition disabled:opacity-50"
            >
              📤 Gửi phê duyệt
            </button>
          )}
          {forecast.status === "pending" && (
            <>
              <button
                onClick={() => handleAction("approve")}
                disabled={actionLoading}
                className="px-3 py-2 text-sm bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition"
              >
                ✅ Phê duyệt
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={actionLoading}
                className="px-3 py-2 text-sm bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition"
              >
                ❌ Từ chối
              </button>
            </>
          )}
          <button
            onClick={() => handleAction("clone")}
            disabled={actionLoading}
            className="px-3 py-2 text-sm bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition"
          >
            📋 Clone tháng sau
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground font-semibold uppercase">Tổng dự chi</p>
          <p className="text-xl font-bold text-amber-400 mt-1">{fmt(totalEstimated)}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground font-semibold uppercase">Chi phí thực tế</p>
          <p className="text-xl font-bold text-red-400 mt-1">{fmt(vsActual?.actualTotal || 0)}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground font-semibold uppercase">Chênh lệch</p>
          <p className={`text-xl font-bold mt-1 ${(vsActual?.variance || 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {fmt(vsActual?.variance || 0)}
          </p>
          {vsActual?.accuracyPct > 0 && (
            <p className="text-xs text-muted-foreground mt-1">Thực hiện: {vsActual.accuracyPct}%</p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {[
          { key: "items", label: `📋 Hạng mục (${forecast.items?.length || 0})` },
          { key: "compare", label: "📊 So sánh vs thực tế" },
          { key: "history", label: `📜 Lịch sử (${forecast.history?.length || 0})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 text-sm font-medium transition border-b-2 -mb-px ${
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Items */}
      {activeTab === "items" && (
        <div className="space-y-4">
          {forecast.status === "draft" && (
            <div className="flex justify-end">
              <button
                onClick={() => setShowItemDrawer(true)}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition"
              >
                + Thêm hạng mục
              </button>
            </div>
          )}

          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">HẠNG MỤC</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">MÔ TẢ</th>
                  <th className="px-4 py-3 text-right font-semibold text-muted-foreground">SỐ TIỀN</th>
                  <th className="px-4 py-3 text-center font-semibold text-muted-foreground">ƯU TIÊN</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">NCC</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">DỰ ÁN</th>
                  {forecast.status === "draft" && (
                    <th className="px-4 py-3 text-center font-semibold text-muted-foreground">XÓA</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {forecast.items?.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Chưa có hạng mục</td></tr>
                ) : (
                  forecast.items?.map((item: any) => {
                    const pr = PRIORITY_MAP[item.priority] || PRIORITY_MAP.medium;
                    return (
                      <tr key={item.id} className="hover:bg-muted/30 transition">
                        <td className="px-4 py-3 text-foreground font-medium">{item.itemName}</td>
                        <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">{item.description || "—"}</td>
                        <td className="px-4 py-3 text-right font-semibold text-amber-400">{fmt(Number(item.estimatedAmount))}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${pr.color}`}>{pr.label}</span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{item.vendor || "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {item.project ? `${item.project.code}` : "—"}
                        </td>
                        {forecast.status === "draft" && (
                          <td className="px-4 py-3 text-center">
                            <button onClick={() => handleDeleteItem(item.id)} className="text-red-400 hover:text-red-300">
                              <i className="bi bi-trash" />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
                {forecast.items?.length > 0 && (
                  <tr className="bg-muted/30">
                    <td className="px-4 py-3 font-bold text-foreground" colSpan={2}>Tổng cộng</td>
                    <td className="px-4 py-3 text-right font-bold text-amber-400">{fmt(totalEstimated)}</td>
                    <td colSpan={4} />
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Compare vs Actual */}
      {activeTab === "compare" && vsActual && (
        <div className="space-y-4">
          {/* Progress bar */}
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Tiến độ thực hiện</span>
              <span className="text-sm font-semibold text-primary">{vsActual.accuracyPct}%</span>
            </div>
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${vsActual.accuracyPct > 100 ? "bg-red-500" : "bg-emerald-500"}`}
                style={{ width: `${Math.min(vsActual.accuracyPct, 100)}%` }}
              />
            </div>
          </div>

          {/* Comparison Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card rounded-xl border border-border p-4">
              <h3 className="font-semibold text-foreground mb-3">📋 Dự chi ({vsActual.items?.length || 0} hạng mục)</h3>
              <div className="space-y-2">
                {vsActual.items?.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.itemName}</span>
                    <span className="text-amber-400 font-medium">{fmt(item.estimatedAmount)}</span>
                  </div>
                ))}
                <div className="border-t border-border pt-2 flex justify-between font-bold">
                  <span>Tổng dự chi</span>
                  <span className="text-amber-400">{fmt(vsActual.forecastTotal)}</span>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-4">
              <h3 className="font-semibold text-foreground mb-3">💰 Chi thực tế ({vsActual.actualCosts?.length || 0} khoản)</h3>
              <div className="space-y-2">
                {vsActual.actualCosts?.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Chưa có chi phí thực tế trong tháng này</p>
                ) : (
                  vsActual.actualCosts?.map((cost: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{cost.description || cost.categoryName}</span>
                      <span className="text-red-400 font-medium">{fmt(cost.amount)}</span>
                    </div>
                  ))
                )}
                <div className="border-t border-border pt-2 flex justify-between font-bold">
                  <span>Tổng thực tế</span>
                  <span className="text-red-400">{fmt(vsActual.actualTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: History */}
      {activeTab === "history" && (
        <div className="bg-card rounded-xl border border-border p-4">
          {forecast.history?.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">Chưa có lịch sử</p>
          ) : (
            <div className="space-y-4">
              {forecast.history?.map((h: any, i: number) => (
                <div key={h.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${
                      h.action === "approve" ? "bg-emerald-400" :
                      h.action === "reject" ? "bg-red-400" :
                      h.action === "submit" ? "bg-yellow-400" : "bg-blue-400"
                    }`} />
                    {i < forecast.history.length - 1 && <div className="w-px h-full bg-border mt-1" />}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm text-foreground font-medium">
                      {h.action === "create" && "📝 Tạo mới"}
                      {h.action === "submit" && "📤 Gửi phê duyệt"}
                      {h.action === "approve" && "✅ Phê duyệt"}
                      {h.action === "reject" && "❌ Từ chối"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {h.performedBy?.fullName} • {new Date(h.performedAt).toLocaleString("vi-VN")}
                    </p>
                    {h.comment && <p className="text-sm text-muted-foreground mt-1">{h.comment}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Item Drawer */}
      {showItemDrawer && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowItemDrawer(false)} />
          <div className="fixed right-0 top-0 h-full w-[440px] max-w-full bg-card border-l border-border z-50 shadow-2xl overflow-y-auto">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">Thêm hạng mục dự chi</h2>
                <button onClick={() => setShowItemDrawer(false)} className="text-muted-foreground hover:text-foreground text-xl">✕</button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Tên hạng mục *</label>
                  <input
                    value={itemForm.itemName}
                    onChange={(e) => setItemForm({ ...itemForm, itemName: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                    placeholder="VD: Server Dell R740"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Mô tả</label>
                  <textarea
                    value={itemForm.description}
                    onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm h-16 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Số tiền dự kiến *</label>
                  <input
                    type="number"
                    value={itemForm.estimatedAmount || ""}
                    onChange={(e) => setItemForm({ ...itemForm, estimatedAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                    placeholder="0"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Mức ưu tiên</label>
                    <select
                      value={itemForm.priority}
                      onChange={(e) => setItemForm({ ...itemForm, priority: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                    >
                      {Object.entries(PRIORITY_MAP).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">NCC / Vendor</label>
                    <input
                      value={itemForm.vendor}
                      onChange={(e) => setItemForm({ ...itemForm, vendor: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Ghi chú</label>
                  <textarea
                    value={itemForm.notes}
                    onChange={(e) => setItemForm({ ...itemForm, notes: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm h-16 resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowItemDrawer(false)} className="flex-1 px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted transition">
                  Hủy
                </button>
                <button
                  onClick={handleAddItem}
                  disabled={!itemForm.itemName || !itemForm.estimatedAmount}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition disabled:opacity-50"
                >
                  Thêm hạng mục
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowRejectModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-xl border border-border p-6 max-w-md w-full shadow-2xl space-y-4">
              <h3 className="text-lg font-bold text-foreground">Từ chối bảng dự chi</h3>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Lý do từ chối *</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm h-24 resize-none"
                  placeholder="Nhập lý do từ chối..."
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowRejectModal(false)} className="flex-1 px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted transition">
                  Hủy
                </button>
                <button
                  onClick={() => {
                    handleAction("reject", { reason: rejectReason });
                    setShowRejectModal(false);
                    setRejectReason("");
                  }}
                  disabled={!rejectReason.trim()}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition disabled:opacity-50"
                >
                  Xác nhận từ chối
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
