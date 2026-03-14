"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface VendorDetail {
  id: string;
  code: string;
  name: string;
  taxCode?: string;
  email?: string;
  phone?: string;
  address?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  bankName?: string;
  bankAccount?: string;
  bankBranch?: string;
  status: string;
  note?: string;
  createdBy: { fullName: string };
  createdAt: string;
  contracts: {
    id: string;
    code: string;
    name: string;
    startDate: string;
    endDate: string;
    value: number;
    status: string;
  }[];
}

function formatCurrency(n: number) {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(0)}M`;
  return new Intl.NumberFormat("vi-VN").format(n);
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("vi-VN");
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  draft: { label: "Nháp", cls: "bg-gray-100 text-gray-600" },
  active: { label: "Hiệu lực", cls: "bg-emerald-50 text-emerald-700" },
  expired: { label: "Hết hạn", cls: "bg-red-50 text-red-700" },
  terminated: { label: "Chấm dứt", cls: "bg-orange-50 text-orange-700" },
};

export default function VendorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [vendor, setVendor] = useState<VendorDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchVendor = useCallback(async () => {
    try {
      const res = await api.get<any>(`/vendors/${params.id}`);
      setVendor(res.data);
    } catch {
      /* err */
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchVendor();
  }, [fetchVendor]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <i className="bi bi-arrow-repeat animate-spin text-2xl text-muted" />
      </div>
    );
  }
  if (!vendor) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <i className="bi bi-exclamation-circle text-4xl text-muted" />
        <p className="text-muted">Không tìm thấy nhà cung cấp</p>
        <button onClick={() => router.back()} className="text-sm text-primary hover:underline">
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            onClick={() => router.back()}
            className="mb-2 inline-flex items-center gap-1 text-sm text-muted hover:text-foreground"
          >
            <i className="bi bi-arrow-left" /> Danh sách NCC
          </button>
          <h1 className="text-2xl font-bold text-foreground">{vendor.name}</h1>
          <p className="mt-0.5 text-sm text-foreground/70">
            Mã: {vendor.code} ·{" "}
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                vendor.status === "active"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {vendor.status === "active" ? "Hoạt động" : "Ngừng"}
            </span>
          </p>
        </div>
        <Link
          href={`/contracts/create?vendorId=${vendor.id}`}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary-dark"
        >
          <i className="bi bi-plus-lg" /> Thêm hợp đồng
        </Link>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Basic */}
        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-foreground/70 uppercase tracking-wider">
            Thông tin chung
          </h3>
          <div className="space-y-2 text-sm">
            {vendor.taxCode && (
              <div className="flex justify-between">
                <span className="text-foreground/60">MST</span>
                <span className="font-medium text-foreground">{vendor.taxCode}</span>
              </div>
            )}
            {vendor.email && (
              <div className="flex justify-between">
                <span className="text-foreground/60">Email</span>
                <span className="font-medium text-foreground">{vendor.email}</span>
              </div>
            )}
            {vendor.phone && (
              <div className="flex justify-between">
                <span className="text-foreground/60">ĐT</span>
                <span className="font-medium text-foreground">{vendor.phone}</span>
              </div>
            )}
            {vendor.address && (
              <div className="flex justify-between gap-4">
                <span className="text-foreground/60 shrink-0">Địa chỉ</span>
                <span className="font-medium text-foreground text-right">{vendor.address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Contact */}
        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-foreground/70 uppercase tracking-wider">
            Người liên hệ
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-foreground/60">Họ tên</span>
              <span className="font-medium text-foreground">{vendor.contactName || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">ĐT</span>
              <span className="font-medium text-foreground">{vendor.contactPhone || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">Email</span>
              <span className="font-medium text-foreground">{vendor.contactEmail || "—"}</span>
            </div>
          </div>
        </div>

        {/* Bank */}
        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-foreground/70 uppercase tracking-wider">
            Ngân hàng
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-foreground/60">Ngân hàng</span>
              <span className="font-medium text-foreground">{vendor.bankName || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">STK</span>
              <span className="font-medium font-mono text-foreground">{vendor.bankAccount || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">Chi nhánh</span>
              <span className="font-medium text-foreground">{vendor.bankBranch || "—"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contracts */}
      <div className="rounded-xl border border-border bg-surface shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h3 className="text-base font-semibold text-foreground">
            Hợp đồng ({vendor.contracts.length})
          </h3>
        </div>
        {vendor.contracts.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12">
            <i className="bi bi-file-earmark-text text-4xl text-muted" />
            <p className="text-muted">Chưa có hợp đồng nào</p>
            <Link
              href={`/contracts/create?vendorId=${vendor.id}`}
              className="text-sm font-medium text-primary hover:underline"
            >
              Tạo hợp đồng đầu tiên
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-surface-secondary">
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-foreground/60">Mã HĐ</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-foreground/60">Tên</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-foreground/60">Thời hạn</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-foreground/60">Giá trị</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-foreground/60">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {vendor.contracts.map((c) => {
                    const st = STATUS_MAP[c.status] || STATUS_MAP.draft;
                    return (
                      <tr key={c.id} className="hover:bg-surface-secondary/50">
                        <td className="px-6 py-3 text-sm font-mono text-foreground/70">{c.code}</td>
                        <td className="px-6 py-3 text-sm font-medium text-foreground">
                          <Link href={`/contracts/${c.id}`} className="hover:text-primary">{c.name}</Link>
                        </td>
                        <td className="px-6 py-3 text-center text-sm text-foreground">
                          {formatDate(c.startDate)} – {formatDate(c.endDate)}
                        </td>
                        <td className="px-6 py-3 text-right text-sm font-medium text-foreground">
                          {formatCurrency(c.value)} ₫
                        </td>
                        <td className="px-6 py-3 text-center">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${st.cls}`}>
                            {st.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Mobile */}
            <div className="space-y-3 p-4 md:hidden">
              {vendor.contracts.map((c) => {
                const st = STATUS_MAP[c.status] || STATUS_MAP.draft;
                return (
                  <Link
                    key={c.id}
                    href={`/contracts/${c.id}`}
                    className="block rounded-lg border border-border p-3 hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">{c.name}</p>
                        <p className="text-xs font-mono text-foreground/70">{c.code}</p>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${st.cls}`}>
                        {st.label}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-foreground/70">
                      <span>{formatDate(c.startDate)} – {formatDate(c.endDate)}</span>
                      <span className="font-medium text-foreground">{formatCurrency(c.value)} ₫</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Note */}
      {vendor.note && (
        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <h3 className="mb-2 text-sm font-semibold text-foreground/70 uppercase">Ghi chú</h3>
          <p className="text-sm text-foreground whitespace-pre-wrap">{vendor.note}</p>
        </div>
      )}
    </div>
  );
}
