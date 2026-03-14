"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function CreateVendorPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    taxCode: "",
    email: "",
    phone: "",
    address: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    bankName: "",
    bankAccount: "",
    bankBranch: "",
    note: "",
  });

  const updateField = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    setSaving(true);
    try {
      const payload: any = {};
      Object.entries(form).forEach(([k, v]) => {
        if (v.trim()) payload[k] = v.trim();
      });
      await api.post("/vendors", payload);
      router.push("/vendors");
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
          <i className="bi bi-arrow-left" />
          Quay lại
        </button>
        <h1 className="text-2xl font-bold text-foreground">Thêm nhà cung cấp</h1>
        <p className="mt-1 text-sm text-muted">
          Nhập thông tin nhà cung cấp mới
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-foreground">
            Thông tin cơ bản
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Tên nhà cung cấp <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="VD: Công ty TNHH ABC"
                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Mã số thuế
              </label>
              <input
                type="text"
                value={form.taxCode}
                onChange={(e) => updateField("taxCode", e.target.value)}
                placeholder="VD: 0123456789"
                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="VD: info@abc.com"
                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Số điện thoại
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="VD: 028-1234-5678"
                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Địa chỉ
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
                placeholder="VD: 123 Nguyễn Huệ, Q.1, TP.HCM"
                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Contact Person */}
        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-foreground">
            Người liên hệ
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Họ tên
              </label>
              <input
                type="text"
                value={form.contactName}
                onChange={(e) => updateField("contactName", e.target.value)}
                placeholder="VD: Nguyễn Văn A"
                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Số điện thoại
              </label>
              <input
                type="text"
                value={form.contactPhone}
                onChange={(e) => updateField("contactPhone", e.target.value)}
                placeholder="VD: 0901234567"
                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Email
              </label>
              <input
                type="email"
                value={form.contactEmail}
                onChange={(e) => updateField("contactEmail", e.target.value)}
                placeholder="VD: contact@abc.com"
                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Bank Info */}
        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-foreground">
            Thông tin ngân hàng
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Tên ngân hàng
              </label>
              <input
                type="text"
                value={form.bankName}
                onChange={(e) => updateField("bankName", e.target.value)}
                placeholder="VD: Vietcombank"
                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Số tài khoản
              </label>
              <input
                type="text"
                value={form.bankAccount}
                onChange={(e) => updateField("bankAccount", e.target.value)}
                placeholder="VD: 0071001234567"
                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Chi nhánh
              </label>
              <input
                type="text"
                value={form.bankBranch}
                onChange={(e) => updateField("bankBranch", e.target.value)}
                placeholder="VD: CN Hồ Chí Minh"
                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Ghi chú
          </label>
          <textarea
            value={form.note}
            onChange={(e) => updateField("note", e.target.value)}
            rows={3}
            placeholder="Ghi chú thêm..."
            className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
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
            disabled={saving || !form.name.trim()}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-dark disabled:opacity-50"
          >
            {saving ? (
              <>
                <i className="bi bi-arrow-repeat animate-spin" /> Đang lưu...
              </>
            ) : (
              <>
                <i className="bi bi-check-lg" /> Lưu NCC
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
