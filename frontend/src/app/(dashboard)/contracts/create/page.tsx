"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";

interface VendorOption {
  id: string;
  code: string;
  name: string;
}

export default function CreateContractPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedVendorId = searchParams.get("vendorId") || "";

  const [saving, setSaving] = useState(false);
  const [vendors, setVendors] = useState<VendorOption[]>([]);
  const [form, setForm] = useState({
    name: "",
    vendorId: preselectedVendorId,
    startDate: "",
    endDate: "",
    value: "",
    description: "",
    terms: "",
  });

  useEffect(() => {
    api
      .get<any>("/vendors", { limit: 100, status: "active" })
      .then((res) => setVendors(res.data))
      .catch(() => {});
  }, []);

  const updateField = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.vendorId || !form.startDate || !form.endDate) return;

    setSaving(true);
    try {
      await api.post("/contracts", {
        name: form.name.trim(),
        vendorId: form.vendorId,
        startDate: form.startDate,
        endDate: form.endDate,
        value: form.value ? parseInt(form.value) : 0,
        description: form.description.trim() || undefined,
        terms: form.terms.trim() || undefined,
      });
      if (preselectedVendorId) {
        router.push(`/vendors/${preselectedVendorId}`);
      } else {
        router.push("/vendors");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => router.back()}
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-foreground"
        >
          <i className="bi bi-arrow-left" /> Quay lại
        </button>
        <h1 className="text-2xl font-bold text-foreground">Tạo hợp đồng mới</h1>
        <p className="mt-1 text-sm text-muted">Nhập thông tin hợp đồng với nhà cung cấp</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Contract Info */}
        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-foreground">
            Thông tin hợp đồng
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Tên hợp đồng <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="VD: HĐ bảo trì hệ thống 2026"
                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Nhà cung cấp <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={form.vendorId}
                onChange={(e) => updateField("vendorId", e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Chọn nhà cung cấp</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.code} — {v.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Ngày bắt đầu <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={form.startDate}
                onChange={(e) => updateField("startDate", e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Ngày kết thúc <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={form.endDate}
                onChange={(e) => updateField("endDate", e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Giá trị hợp đồng (VNĐ)
              </label>
              <input
                type="number"
                value={form.value}
                onChange={(e) => updateField("value", e.target.value)}
                placeholder="VD: 500000000"
                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Description & Terms */}
        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-foreground">
            Mô tả & Điều khoản
          </h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Mô tả
              </label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Mô tả nội dung hợp đồng..."
                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Điều khoản
              </label>
              <textarea
                rows={3}
                value={form.terms}
                onChange={(e) => updateField("terms", e.target.value)}
                placeholder="Các điều khoản chính..."
                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 rounded-xl border border-border bg-surface px-6 py-4 shadow-sm">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-surface-secondary"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={saving || !form.name.trim() || !form.vendorId}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-dark disabled:opacity-50"
          >
            {saving ? (
              <>
                <i className="bi bi-arrow-repeat animate-spin" /> Đang lưu...
              </>
            ) : (
              <>
                <i className="bi bi-check-lg" /> Tạo hợp đồng
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
