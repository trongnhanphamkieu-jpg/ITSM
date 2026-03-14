"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

type TabKey = "vehicles" | "services" | "costs";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  active: { label: "Hoạt động", color: "bg-emerald-100 text-emerald-700" },
  maintenance: { label: "Bảo trì", color: "bg-amber-100 text-amber-700" },
  disposed: { label: "Thanh lý", color: "bg-red-100 text-red-700" },
};

const FREQ_MAP: Record<string, string> = {
  monthly: "Hàng tháng", quarterly: "Hàng quý", yearly: "Hàng năm", one_time: "Một lần",
};

const COST_TYPE_MAP: Record<string, { label: string; color: string }> = {
  fixed: { label: "Cố định", color: "bg-blue-100 text-blue-700" },
  variable: { label: "Biến đổi", color: "bg-orange-100 text-orange-700" },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] || { label: status, color: "bg-gray-100 text-gray-600" };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${s.color}`}>{s.label}</span>;
}

function CostTypeBadge({ type }: { type: string }) {
  const c = COST_TYPE_MAP[type] || { label: type, color: "bg-gray-100 text-gray-600" };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${c.color}`}>{c.label}</span>;
}

const TABS = [
  { key: "vehicles" as TabKey, label: "Phương tiện", icon: "bi-truck" },
  { key: "services" as TabKey, label: "Dịch vụ", icon: "bi-wrench-adjustable" },
  { key: "costs" as TabKey, label: "Chi phí biến đổi", icon: "bi-receipt" },
];

export default function VehiclePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("vehicles");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [costTypeFilter, setCostTypeFilter] = useState("");
  const [showDrawer, setShowDrawer] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [meta, setMeta] = useState<any>(null);

  const endpoint = activeTab === "vehicles" ? "/vehicles" : activeTab === "services" ? "/vehicle-services" : "/vehicle-costs";

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { search: search || undefined };
      if (activeTab === "vehicles" && statusFilter) params.status = statusFilter;
      if (activeTab === "services" && costTypeFilter) params.costType = costTypeFilter;
      const json = await api.get<any>(endpoint, params);
      if (json.success) { setData(json.data); setMeta(json.meta); }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [endpoint, search, statusFilter, costTypeFilter, activeTab]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(endpoint, formData);
      setShowDrawer(false); setFormData({}); fetchData();
    } catch (e) { console.error(e); }
    setSubmitting(false);
  };

  const renderVehiclesTable = () => (
    <table className="w-full text-sm">
      <thead><tr className="border-b border-border bg-accent/30">
        <th className="px-4 py-3 text-left font-semibold text-foreground/70 text-xs uppercase">Biển số</th>
        <th className="px-4 py-3 text-left font-semibold text-foreground/70 text-xs uppercase">Hãng/Model</th>
        <th className="px-4 py-3 text-left font-semibold text-foreground/70 text-xs uppercase">Đời</th>
        <th className="px-4 py-3 text-left font-semibold text-foreground/70 text-xs uppercase">Loại</th>
        <th className="px-4 py-3 text-left font-semibold text-foreground/70 text-xs uppercase">Phụ trách</th>
        <th className="px-4 py-3 text-left font-semibold text-foreground/70 text-xs uppercase">DV gắn</th>
        <th className="px-4 py-3 text-left font-semibold text-foreground/70 text-xs uppercase">Trạng thái</th>
      </tr></thead>
      <tbody>
        {data.length === 0 ? (
          <tr><td colSpan={7} className="py-12 text-center text-muted"><i className="bi bi-inbox text-3xl block mb-2" />Chưa có dữ liệu</td></tr>
        ) : data.map((item: any) => (
          <tr key={item.id} onClick={() => router.push(`/vehicles/${item.id}`)}
            className="border-b border-border/50 hover:bg-accent/20 transition-colors cursor-pointer">
            <td className="px-4 py-3 font-medium text-primary">{item.licensePlate}</td>
            <td className="px-4 py-3 text-foreground">{item.brand} {item.model}</td>
            <td className="px-4 py-3 text-foreground">{item.year || "—"}</td>
            <td className="px-4 py-3 text-foreground">{item.type || "—"}</td>
            <td className="px-4 py-3 text-foreground">{item.assignedTo || "—"}</td>
            <td className="px-4 py-3 text-foreground">{item._count?.subscriptions || 0}</td>
            <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderServicesTable = () => (
    <table className="w-full text-sm">
      <thead><tr className="border-b border-border bg-accent/30">
        <th className="px-4 py-3 text-left font-semibold text-foreground/70 text-xs uppercase">Tên dịch vụ</th>
        <th className="px-4 py-3 text-left font-semibold text-foreground/70 text-xs uppercase">Loại</th>
        <th className="px-4 py-3 text-left font-semibold text-foreground/70 text-xs uppercase">Tần suất</th>
        <th className="px-4 py-3 text-left font-semibold text-foreground/70 text-xs uppercase">Giá mặc định</th>
        <th className="px-4 py-3 text-left font-semibold text-foreground/70 text-xs uppercase">Trạng thái</th>
      </tr></thead>
      <tbody>
        {data.length === 0 ? (
          <tr><td colSpan={5} className="py-12 text-center text-muted"><i className="bi bi-inbox text-3xl block mb-2" />Chưa có dữ liệu</td></tr>
        ) : data.map((item: any) => (
          <tr key={item.id} className="border-b border-border/50 hover:bg-accent/20 transition-colors">
            <td className="px-4 py-3 font-medium text-foreground">{item.name}</td>
            <td className="px-4 py-3"><CostTypeBadge type={item.costType} /></td>
            <td className="px-4 py-3 text-foreground">{FREQ_MAP[item.frequency] || item.frequency}</td>
            <td className="px-4 py-3 text-foreground">{item.defaultCost ? Number(item.defaultCost).toLocaleString("vi-VN") + " ₫" : "—"}</td>
            <td className="px-4 py-3 text-foreground">{item.isActive ? "✅ Active" : "❌ Inactive"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderCostsTable = () => (
    <table className="w-full text-sm">
      <thead><tr className="border-b border-border bg-accent/30">
        <th className="px-4 py-3 text-left font-semibold text-foreground/70 text-xs uppercase">Xe</th>
        <th className="px-4 py-3 text-left font-semibold text-foreground/70 text-xs uppercase">Dịch vụ</th>
        <th className="px-4 py-3 text-left font-semibold text-foreground/70 text-xs uppercase">Số tiền</th>
        <th className="px-4 py-3 text-left font-semibold text-foreground/70 text-xs uppercase">Ngày</th>
        <th className="px-4 py-3 text-left font-semibold text-foreground/70 text-xs uppercase">Ghi chú</th>
      </tr></thead>
      <tbody>
        {data.length === 0 ? (
          <tr><td colSpan={5} className="py-12 text-center text-muted"><i className="bi bi-inbox text-3xl block mb-2" />Chưa có dữ liệu</td></tr>
        ) : data.map((item: any) => (
          <tr key={item.id} className="border-b border-border/50 hover:bg-accent/20 transition-colors">
            <td className="px-4 py-3 text-foreground">{item.vehicle ? `${item.vehicle.licensePlate} (${item.vehicle.brand})` : "—"}</td>
            <td className="px-4 py-3 text-foreground">{item.service?.name || "—"}</td>
            <td className="px-4 py-3 text-foreground">{Number(item.amount).toLocaleString("vi-VN")} ₫</td>
            <td className="px-4 py-3 text-foreground">{new Date(item.date).toLocaleDateString("vi-VN")}</td>
            <td className="px-4 py-3 text-foreground">{item.notes || "—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderCreateFields = () => {
    if (activeTab === "vehicles") return (
      <>
        {[
          { key: "licensePlate", label: "Biển số xe", required: true },
          { key: "brand", label: "Hãng xe", required: true },
          { key: "model", label: "Dòng xe", required: true },
        ].map((f) => (
          <div key={f.key}>
            <label className="block text-sm font-medium text-foreground mb-1">{f.label} {f.required && <span className="text-red-500">*</span>}</label>
            <input type="text" value={formData[f.key] || ""} onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })} required={f.required}
              className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
        ))}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Năm SX</label>
          <input type="number" value={formData.year || ""} onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || undefined })}
            className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Loại xe</label>
          <select value={formData.type || ""} onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
            <option value="">Chọn...</option>
            {[{ v: "sedan", l: "Sedan" }, { v: "suv", l: "SUV" }, { v: "truck", l: "Xe tải" }, { v: "van", l: "Xe van" }, { v: "motorcycle", l: "Xe máy" }].map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Người phụ trách</label>
          <input type="text" value={formData.assignedTo || ""} onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
            className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
      </>
    );
    if (activeTab === "services") return (
      <>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Tên dịch vụ <span className="text-red-500">*</span></label>
          <input type="text" value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required
            className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Loại chi phí <span className="text-red-500">*</span></label>
          <select value={formData.costType || "fixed"} onChange={(e) => setFormData({ ...formData, costType: e.target.value })} required
            className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
            <option value="fixed">Cố định (hàng tháng)</option>
            <option value="variable">Biến đổi (phát sinh)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Tần suất</label>
          <select value={formData.frequency || "monthly"} onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
            className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
            <option value="monthly">Hàng tháng</option><option value="quarterly">Hàng quý</option><option value="yearly">Hàng năm</option><option value="one_time">Một lần</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Giá mặc định (₫)</label>
          <input type="number" value={formData.defaultCost || ""} onChange={(e) => setFormData({ ...formData, defaultCost: e.target.value })}
            className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Mô tả</label>
          <textarea value={formData.description || ""} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2}
            className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
      </>
    );
    return null;
  };

  const tabLabels: Record<TabKey, string> = { vehicles: "phương tiện", services: "dịch vụ", costs: "chi phí" };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Chi phí xe</h1>
          <p className="text-muted mt-1">Quản lý phương tiện, dịch vụ cố định & biến đổi</p>
        </div>
        {activeTab !== "costs" && (
          <button onClick={() => { setShowDrawer(true); setFormData(activeTab === "services" ? { costType: "fixed", frequency: "monthly" } : {}); }}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors">
            <i className="bi bi-plus-lg" /> Thêm mới
          </button>
        )}
      </div>

      <div className="flex gap-1 overflow-x-auto rounded-xl bg-card p-1 shadow-sm border border-border">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => { setActiveTab(t.key); setSearch(""); setStatusFilter(""); setCostTypeFilter(""); }}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === t.key ? "bg-primary text-primary-foreground shadow-sm" : "text-muted hover:bg-accent hover:text-foreground"}`}>
            <i className={`bi ${t.icon}`} /> {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input type="text" placeholder={`Tìm kiếm ${tabLabels[activeTab]}...`} value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-4 text-sm placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        {activeTab === "vehicles" && (
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
            <option value="">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option><option value="maintenance">Bảo trì</option><option value="disposed">Thanh lý</option>
          </select>
        )}
        {activeTab === "services" && (
          <select value={costTypeFilter} onChange={(e) => setCostTypeFilter(e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
            <option value="">Tất cả loại</option>
            <option value="fixed">Cố định</option><option value="variable">Biến đổi</option>
          </select>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        {loading ? (
          <div className="py-12 text-center text-muted">Đang tải...</div>
        ) : activeTab === "vehicles" ? renderVehiclesTable() : activeTab === "services" ? renderServicesTable() : renderCostsTable()}
        {meta && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border text-sm text-muted">
            <span>Hiển thị {data.length} / {meta.total} bản ghi</span>
            <span>Trang {meta.page} / {meta.totalPages}</span>
          </div>
        )}
      </div>

      {showDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowDrawer(false)} />
          <div className="relative w-full max-w-md bg-card shadow-2xl overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Thêm {tabLabels[activeTab]}</h2>
                <button onClick={() => setShowDrawer(false)} className="text-muted hover:text-foreground"><i className="bi bi-x-lg text-xl" /></button>
              </div>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {renderCreateFields()}
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowDrawer(false)} className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent transition-colors">Hủy</button>
                <button type="submit" disabled={submitting} className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">{submitting ? "Đang lưu..." : "Tạo mới"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
