"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { FileUpload } from "@/components/shared/file-upload";

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
  attachments?: { id: string; fileName: string; fileSize: number; mimeType: string; storageKey: string }[];
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

const INPUT_CLS = "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

export default function VendorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [vendor, setVendor] = useState<VendorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "", taxCode: "", email: "", phone: "", address: "",
    contactName: "", contactPhone: "", contactEmail: "",
    bankName: "", bankAccount: "", bankBranch: "",
    note: "", status: "active",
  });
  const [vendorCosts, setVendorCosts] = useState<any[]>([]);
  const [vendorAssets, setVendorAssets] = useState<{soft: any[], hard: any[]}>({soft: [], hard: []});

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

  useEffect(() => {
    if (!vendor) return;
    // Fetch related costs
    api.get<any>("/actual-costs", { vendor: vendor.name, limit: 50 })
      .then(res => setVendorCosts(res.data || []))
      .catch(() => {});
    // Fetch linked software assets (domains, VPS, etc.)
    Promise.all([
      api.get<any>("/soft-inventory/domains", { vendorId: vendor.id, limit: 50 }).catch(() => ({data: []})),
      api.get<any>("/soft-inventory/vps-servers", { vendorId: vendor.id, limit: 50 }).catch(() => ({data: []})),
      api.get<any>("/soft-inventory/software-licenses", { vendorId: vendor.id, limit: 50 }).catch(() => ({data: []})),
      api.get<any>("/hard-inventory/hardware-assets", { vendorId: vendor.id, limit: 50 }).catch(() => ({data: []})),
    ]).then(([domains, vps, licenses, hardware]) => {
      setVendorAssets({
        soft: [...(domains.data || []).map((d: any) => ({...d, _type: 'Domain'})),
               ...(vps.data || []).map((v: any) => ({...v, _type: 'VPS'})),
               ...(licenses.data || []).map((l: any) => ({...l, _type: 'License'}))],
        hard: (hardware.data || []).map((h: any) => ({...h, _type: 'Phần cứng'})),
      });
    });
  }, [vendor]);

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
        <div className="flex items-center gap-2">
          {!editing && (
            <button onClick={() => {
              if (!vendor) return;
              setEditForm({
                name: vendor.name, taxCode: vendor.taxCode || "", email: vendor.email || "",
                phone: vendor.phone || "", address: vendor.address || "",
                contactName: vendor.contactName || "", contactPhone: vendor.contactPhone || "",
                contactEmail: vendor.contactEmail || "",
                bankName: vendor.bankName || "", bankAccount: vendor.bankAccount || "",
                bankBranch: vendor.bankBranch || "", note: vendor.note || "", status: vendor.status,
              });
              setEditing(true);
            }} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent transition-colors">
              <i className="bi bi-pencil-square" /> Chỉnh sửa
            </button>
          )}
          <Link href={`/contracts/create?vendorId=${vendor.id}`} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary-dark">
            <i className="bi bi-plus-lg" /> Thêm hợp đồng
          </Link>
        </div>
      </div>

      {/* Inline Edit */}
      {editing && (
        <div className="rounded-xl border-2 border-primary/30 bg-surface p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Chỉnh sửa nhà cung cấp</h2>
            <div className="flex items-center gap-2">
              <button onClick={() => setEditing(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent">Hủy</button>
              <button onClick={async () => {
                setSaving(true);
                try {
                  await api.patch(`/vendors/${vendor.id}`, editForm);
                  await fetchVendor();
                  setEditing(false);
                } catch (err) { console.error(err); } finally { setSaving(false); }
              }} disabled={saving || !editForm.name.trim()} className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50">
                {saving ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="mb-1.5 block text-sm font-medium">Tên NCC *</label>
              <input value={editForm.name} onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))} className={INPUT_CLS} />
            </div>
            <div><label className="mb-1.5 block text-sm font-medium">MST</label><input value={editForm.taxCode} onChange={(e) => setEditForm(f => ({ ...f, taxCode: e.target.value }))} className={INPUT_CLS} /></div>
            <div><label className="mb-1.5 block text-sm font-medium">Email</label><input value={editForm.email} onChange={(e) => setEditForm(f => ({ ...f, email: e.target.value }))} className={INPUT_CLS} /></div>
            <div><label className="mb-1.5 block text-sm font-medium">ĐT</label><input value={editForm.phone} onChange={(e) => setEditForm(f => ({ ...f, phone: e.target.value }))} className={INPUT_CLS} /></div>
            <div className="sm:col-span-2 lg:col-span-3"><label className="mb-1.5 block text-sm font-medium">Địa chỉ</label><input value={editForm.address} onChange={(e) => setEditForm(f => ({ ...f, address: e.target.value }))} className={INPUT_CLS} /></div>
            <div><label className="mb-1.5 block text-sm font-medium">Người LH</label><input value={editForm.contactName} onChange={(e) => setEditForm(f => ({ ...f, contactName: e.target.value }))} className={INPUT_CLS} /></div>
            <div><label className="mb-1.5 block text-sm font-medium">ĐT liên hệ</label><input value={editForm.contactPhone} onChange={(e) => setEditForm(f => ({ ...f, contactPhone: e.target.value }))} className={INPUT_CLS} /></div>
            <div><label className="mb-1.5 block text-sm font-medium">Email LH</label><input value={editForm.contactEmail} onChange={(e) => setEditForm(f => ({ ...f, contactEmail: e.target.value }))} className={INPUT_CLS} /></div>
            <div><label className="mb-1.5 block text-sm font-medium">Ngân hàng</label><input value={editForm.bankName} onChange={(e) => setEditForm(f => ({ ...f, bankName: e.target.value }))} className={INPUT_CLS} /></div>
            <div><label className="mb-1.5 block text-sm font-medium">STK</label><input value={editForm.bankAccount} onChange={(e) => setEditForm(f => ({ ...f, bankAccount: e.target.value }))} className={INPUT_CLS} /></div>
            <div><label className="mb-1.5 block text-sm font-medium">Chi nhánh</label><input value={editForm.bankBranch} onChange={(e) => setEditForm(f => ({ ...f, bankBranch: e.target.value }))} className={INPUT_CLS} /></div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Trạng thái</label>
              <select value={editForm.status} onChange={(e) => setEditForm(f => ({ ...f, status: e.target.value }))} className={INPUT_CLS}>
                <option value="active">Hoạt động</option>
                <option value="inactive">Ngừng</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium">Ghi chú</label>
              <textarea rows={3} value={editForm.note} onChange={(e) => setEditForm(f => ({ ...f, note: e.target.value }))} className={INPUT_CLS} />
            </div>
          </div>
        </div>
      )}

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
                          {formatCurrency(c.value)}
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
                      <span className="font-medium text-foreground">{formatCurrency(c.value)}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Related Costs - B3 */}
      <div className="rounded-xl border border-border bg-surface shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h3 className="text-base font-semibold text-foreground">
            Chi phí liên quan ({vendorCosts.length})
          </h3>
        </div>
        {vendorCosts.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8">
            <i className="bi bi-cash-stack text-3xl text-muted" />
            <p className="text-sm text-muted">Chưa có chi phí nào từ NCC này</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-surface-secondary">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-foreground/60">Ngày</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-foreground/60">Danh mục</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-foreground/60">Mô tả</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-foreground/60">Số tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {vendorCosts.slice(0, 10).map((c: any) => (
                  <tr key={c.id} className="hover:bg-surface-secondary/50">
                    <td className="px-6 py-3 text-sm text-foreground/70">{c.costDate ? formatDate(c.costDate) : '—'}</td>
                    <td className="px-6 py-3 text-sm text-foreground">{c.categoryName || '—'}</td>
                    <td className="px-6 py-3 text-sm text-foreground truncate max-w-[200px]">{c.description || '—'}</td>
                    <td className="px-6 py-3 text-sm text-right font-medium text-foreground">{formatCurrency(Number(c.amount))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {vendorCosts.length > 10 && (
              <div className="px-6 py-3 text-center text-xs text-muted-foreground">
                ...và {vendorCosts.length - 10} chi phí khác
              </div>
            )}
          </div>
        )}
      </div>

      {/* Linked Assets - B3 */}
      {(vendorAssets.soft.length > 0 || vendorAssets.hard.length > 0) && (
        <div className="rounded-xl border border-border bg-surface shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h3 className="text-base font-semibold text-foreground">
              Tài sản liên kết ({vendorAssets.soft.length + vendorAssets.hard.length})
            </h3>
          </div>
          <div className="p-4 space-y-2">
            {[...vendorAssets.soft, ...vendorAssets.hard].map((a: any, i: number) => (
              <div key={`asset-${i}`} className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-surface-secondary/50">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">{a._type}</span>
                  <span className="text-sm font-medium text-foreground">{a.name || a.domainName || a.email || a.assetTag || '—'}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${a.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                  {a.status || '—'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attachments */}
      <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-foreground/70 uppercase tracking-wider">
          Tài liệu đính kèm ({vendor.attachments?.length || 0})
        </h3>
        <FileUpload
          entityType="vendor"
          entityId={vendor.id}
          onUpload={() => fetchVendor()}
          existingFiles={vendor.attachments || []}
          onRemove={async (fileId) => {
            try {
              await api.delete(`/files/${fileId}`);
              await fetchVendor();
            } catch (err) {
              console.error(err);
            }
          }}
        />
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
