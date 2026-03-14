"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface Subscription {
  id: string;
  monthlyCost: number;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  notes: string | null;
  service: { name: string; costType: string; frequency: string };
}

interface VariableCost {
  id: string;
  amount: number;
  date: string;
  mileageAtService: number | null;
  notes: string | null;
  service: { name: string };
}

interface VehicleDetail {
  id: string;
  licensePlate: string;
  brand: string;
  model: string;
  year: number | null;
  type: string | null;
  fuelType: string | null;
  color: string | null;
  mileage: number | null;
  status: string;
  assignedTo: string | null;
  subscriptions: Subscription[];
  variableCosts: VariableCost[];
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  active: { label: "Hoạt động", color: "bg-emerald-100 text-emerald-700" },
  maintenance: { label: "Bảo trì", color: "bg-amber-100 text-amber-700" },
  disposed: { label: "Thanh lý", color: "bg-red-100 text-red-700" },
};

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const vehicleId = params.id as string;

  const [vehicle, setVehicle] = useState<VehicleDetail | null>(null);
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showSubDrawer, setShowSubDrawer] = useState(false);
  const [showCostDrawer, setShowCostDrawer] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [services, setServices] = useState<any[]>([]);

  const fetchVehicle = useCallback(async () => {
    setLoading(true);
    try {
      const json = await api.get<any>(`/vehicles/${vehicleId}`);
      if (json.success) {
        setVehicle(json.data);
        setMonthlyTotal(json.monthlyTotal || 0);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [vehicleId]);

  useEffect(() => { fetchVehicle(); }, [fetchVehicle]);
  useEffect(() => {
    api.get<any>("/vehicle-services", { limit: 100 }).then((json) => {
      if (json.success) setServices(json.data || []);
    }).catch(() => {});
  }, []);

  const handleAddSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const selectedService = services.find((s) => s.id === formData.serviceId);
      await api.post("/vehicle-subscriptions", {
        vehicleId,
        serviceId: formData.serviceId,
        monthlyCost: formData.monthlyCost || selectedService?.defaultCost || 0,
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        notes: formData.notes || null,
      });
      setShowSubDrawer(false);
      setFormData({});
      fetchVehicle();
    } catch (e) { console.error(e); }
    setSubmitting(false);
  };

  const handleAddVariableCost = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/vehicle-costs", {
        vehicleId,
        serviceId: formData.serviceId,
        amount: formData.amount,
        date: formData.date,
        mileageAtService: formData.mileageAtService || null,
        notes: formData.notes || null,
      });
      setShowCostDrawer(false);
      setFormData({});
      fetchVehicle();
    } catch (e) { console.error(e); }
    setSubmitting(false);
  };

  const handleDeactivate = async (subId: string) => {
    if (!confirm("Hủy dịch vụ này?")) return;
    try {
      await api.patch(`/vehicle-subscriptions/${subId}/deactivate`, {});
      fetchVehicle();
    } catch (e) { console.error(e); }
  };

  const handleServiceSelect = (serviceId: string) => {
    const svc = services.find((s) => s.id === serviceId);
    setFormData({ ...formData, serviceId, monthlyCost: svc?.defaultCost || "" });
  };

  if (loading) return <div className="flex justify-center py-20 text-muted"><i className="bi bi-arrow-clockwise animate-spin text-3xl" /></div>;
  if (!vehicle) return <div className="py-20 text-center text-muted">Không tìm thấy xe</div>;

  const s = STATUS_MAP[vehicle.status] || { label: vehicle.status, color: "bg-gray-100 text-gray-600" };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.push("/vehicles")} className="rounded-lg border border-border p-2 hover:bg-accent transition-colors">
          <i className="bi bi-arrow-left" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{vehicle.licensePlate}</h1>
          <p className="text-muted">{vehicle.brand} {vehicle.model} {vehicle.year ? `(${vehicle.year})` : ""}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-sm font-medium ${s.color}`}>{s.label}</span>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: "bi-speedometer2", label: "Km", value: vehicle.mileage?.toLocaleString("vi-VN") || "—" },
          { icon: "bi-fuel-pump", label: "Nhiên liệu", value: vehicle.fuelType || "—" },
          { icon: "bi-person", label: "Phụ trách", value: vehicle.assignedTo || "—" },
          { icon: "bi-palette", label: "Màu", value: vehicle.color || "—" },
        ].map((c, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2 text-muted text-sm mb-1"><i className={`bi ${c.icon}`} /> {c.label}</div>
            <div className="text-lg font-semibold text-foreground">{c.value}</div>
          </div>
        ))}
      </div>

      {/* Monthly Total Banner */}
      <div className="rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted mb-1">Tổng chi phí cố định / tháng</p>
            <p className="text-3xl font-bold text-primary">{monthlyTotal.toLocaleString("vi-VN")} ₫</p>
          </div>
          <div className="text-right text-sm text-muted">
            <p>{vehicle.subscriptions?.length || 0} dịch vụ đang hoạt động</p>
          </div>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground"><i className="bi bi-pin-angle mr-2" />Dịch vụ cố định</h2>
          <button onClick={() => { setShowSubDrawer(true); setFormData({}); }}
            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
            <i className="bi bi-plus-lg mr-1" /> Gắn dịch vụ
          </button>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-accent/30">
            <th className="px-4 py-3 text-left font-semibold text-foreground/70 text-xs uppercase">Dịch vụ</th>
            <th className="px-4 py-3 text-left font-semibold text-foreground/70 text-xs uppercase">Chi phí/tháng</th>
            <th className="px-4 py-3 text-left font-semibold text-foreground/70 text-xs uppercase">Bắt đầu</th>
            <th className="px-4 py-3 text-left font-semibold text-foreground/70 text-xs uppercase">Kết thúc</th>
            <th className="px-4 py-3 text-left font-semibold text-foreground/70 text-xs uppercase"></th>
          </tr></thead>
          <tbody>
            {(!vehicle.subscriptions || vehicle.subscriptions.length === 0) ? (
              <tr><td colSpan={5} className="py-8 text-center text-muted"><i className="bi bi-inbox text-2xl block mb-1" />Chưa gắn dịch vụ</td></tr>
            ) : vehicle.subscriptions.map((sub) => (
              <tr key={sub.id} className="border-b border-border/50 hover:bg-accent/20 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{sub.service.name}</td>
                <td className="px-4 py-3 text-foreground">{Number(sub.monthlyCost).toLocaleString("vi-VN")} ₫</td>
                <td className="px-4 py-3 text-foreground">{new Date(sub.startDate).toLocaleDateString("vi-VN")}</td>
                <td className="px-4 py-3 text-foreground">{sub.endDate ? new Date(sub.endDate).toLocaleDateString("vi-VN") : <span className="text-emerald-600">Đang hoạt động</span>}</td>
                <td className="px-4 py-3">
                  <button onClick={() => handleDeactivate(sub.id)} className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50 transition-colors">Hủy</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Variable Costs Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground"><i className="bi bi-receipt mr-2" />Chi phí biến đổi</h2>
          <button onClick={() => { setShowCostDrawer(true); setFormData({}); }}
            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
            <i className="bi bi-plus-lg mr-1" /> Thêm chi phí
          </button>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-accent/30">
            <th className="px-4 py-3 text-left font-semibold text-foreground/70 text-xs uppercase">Dịch vụ</th>
            <th className="px-4 py-3 text-left font-semibold text-foreground/70 text-xs uppercase">Số tiền</th>
            <th className="px-4 py-3 text-left font-semibold text-foreground/70 text-xs uppercase">Ngày</th>
            <th className="px-4 py-3 text-left font-semibold text-foreground/70 text-xs uppercase">Km</th>
            <th className="px-4 py-3 text-left font-semibold text-foreground/70 text-xs uppercase">Ghi chú</th>
          </tr></thead>
          <tbody>
            {(!vehicle.variableCosts || vehicle.variableCosts.length === 0) ? (
              <tr><td colSpan={5} className="py-8 text-center text-muted"><i className="bi bi-inbox text-2xl block mb-1" />Chưa có chi phí biến đổi</td></tr>
            ) : vehicle.variableCosts.map((vc) => (
              <tr key={vc.id} className="border-b border-border/50 hover:bg-accent/20 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{vc.service?.name || "—"}</td>
                <td className="px-4 py-3 text-foreground">{Number(vc.amount).toLocaleString("vi-VN")} ₫</td>
                <td className="px-4 py-3 text-foreground">{new Date(vc.date).toLocaleDateString("vi-VN")}</td>
                <td className="px-4 py-3 text-foreground">{vc.mileageAtService?.toLocaleString("vi-VN") || "—"}</td>
                <td className="px-4 py-3 text-foreground">{vc.notes || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Subscription Drawer */}
      {showSubDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowSubDrawer(false)} />
          <div className="relative w-full max-w-md bg-card shadow-2xl overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Gắn dịch vụ cố định</h2>
                <button onClick={() => setShowSubDrawer(false)} className="text-muted hover:text-foreground"><i className="bi bi-x-lg text-xl" /></button>
              </div>
            </div>
            <form onSubmit={handleAddSubscription} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Dịch vụ <span className="text-red-500">*</span></label>
                <select value={formData.serviceId || ""} onChange={(e) => handleServiceSelect(e.target.value)} required
                  className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                  <option value="">Chọn dịch vụ...</option>
                  {services.filter((s) => s.costType === "fixed").map((s: any) => <option key={s.id} value={s.id}>{s.name} {s.defaultCost ? `(${Number(s.defaultCost).toLocaleString("vi-VN")} ₫/tháng)` : ""}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Chi phí/tháng (₫) <span className="text-red-500">*</span></label>
                <input type="number" value={formData.monthlyCost || ""} onChange={(e) => setFormData({ ...formData, monthlyCost: e.target.value })} required
                  className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Ngày bắt đầu <span className="text-red-500">*</span></label>
                <input type="date" value={formData.startDate || ""} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} required
                  className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Ngày kết thúc</label>
                <input type="date" value={formData.endDate || ""} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Ghi chú</label>
                <textarea value={formData.notes || ""} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowSubDrawer(false)} className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent transition-colors">Hủy</button>
                <button type="submit" disabled={submitting} className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">{submitting ? "Đang lưu..." : "Gắn dịch vụ"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Variable Cost Drawer */}
      {showCostDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCostDrawer(false)} />
          <div className="relative w-full max-w-md bg-card shadow-2xl overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Thêm chi phí biến đổi</h2>
                <button onClick={() => setShowCostDrawer(false)} className="text-muted hover:text-foreground"><i className="bi bi-x-lg text-xl" /></button>
              </div>
            </div>
            <form onSubmit={handleAddVariableCost} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Dịch vụ <span className="text-red-500">*</span></label>
                <select value={formData.serviceId || ""} onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })} required
                  className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                  <option value="">Chọn dịch vụ...</option>
                  {services.filter((s) => s.costType === "variable").map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Số tiền (₫) <span className="text-red-500">*</span></label>
                <input type="number" value={formData.amount || ""} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required
                  className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Ngày <span className="text-red-500">*</span></label>
                <input type="date" value={formData.date || ""} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required
                  className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Km lúc bảo dưỡng</label>
                <input type="number" value={formData.mileageAtService || ""} onChange={(e) => setFormData({ ...formData, mileageAtService: e.target.value })}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Ghi chú</label>
                <textarea value={formData.notes || ""} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowCostDrawer(false)} className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent transition-colors">Hủy</button>
                <button type="submit" disabled={submitting} className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">{submitting ? "Đang lưu..." : "Thêm chi phí"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
