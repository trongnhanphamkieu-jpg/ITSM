"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { FileUpload } from "@/components/shared/file-upload";
import { VendorSelect } from "@/components/shared/vendor-select";
import { CurrencyInput } from "@/components/shared/currency-input";

interface Contract {
  id: string;
  code: string;
  name: string;
  vendorId: string;
  vendor: { id: string; code: string; name: string };
  startDate: string;
  endDate: string;
  value: number;
  status: string;
  description?: string;
  terms?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: { fullName: string };
  attachments?: { id: string; fileName: string; fileSize: number; mimeType: string; storageKey: string }[];
}

const STATUS_MAP: Record<string, { label: string; cls: string; icon: string }> = {
  draft: { label: "Nháp", cls: "bg-gray-100 text-gray-600", icon: "bi-pencil" },
  active: { label: "Hiệu lực", cls: "bg-emerald-50 text-emerald-700", icon: "bi-check-circle" },
  expired: { label: "Hết hạn", cls: "bg-red-50 text-red-700", icon: "bi-clock-history" },
  terminated: { label: "Chấm dứt", cls: "bg-orange-50 text-orange-700", icon: "bi-x-circle" },
};

const STATUS_TRANSITIONS: Record<string, string[]> = {
  draft: ["active"],
  active: ["expired", "terminated"],
  expired: [],
  terminated: [],
};

const INPUT_CLS = "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

export default function ContractDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusChanging, setStatusChanging] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "", vendorId: "", startDate: "", endDate: "", value: 0, description: "", terms: "",
  });

  const fetchContract = useCallback(async () => {
    try {
      const res = await api.get<any>(`/contracts/${id}`);
      setContract(res.data);
    } catch {
      router.push("/vendors");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => { fetchContract(); }, [fetchContract]);

  const startEditing = () => {
    if (!contract) return;
    setEditForm({
      name: contract.name,
      vendorId: contract.vendorId,
      startDate: contract.startDate?.split("T")[0] || "",
      endDate: contract.endDate?.split("T")[0] || "",
      value: contract.value,
      description: contract.description || "",
      terms: contract.terms || "",
    });
    setEditing(true);
  };

  const cancelEditing = () => setEditing(false);

  const saveEditing = async () => {
    if (!contract) return;
    setSaving(true);
    try {
      await api.patch(`/contracts/${contract.id}`, {
        name: editForm.name.trim(),
        vendorId: editForm.vendorId,
        startDate: editForm.startDate,
        endDate: editForm.endDate,
        value: editForm.value,
        description: editForm.description.trim() || undefined,
        terms: editForm.terms.trim() || undefined,
      });
      await fetchContract();
      setEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!contract) return;
    setStatusChanging(true);
    try {
      await api.patch(`/contracts/${contract.id}`, { status: newStatus });
      await fetchContract();
    } catch (err) {
      console.error(err);
    } finally {
      setStatusChanging(false);
    }
  };

  const daysRemaining = contract
    ? Math.ceil((new Date(contract.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }
  if (!contract) return null;

  const st = STATUS_MAP[contract.status] || STATUS_MAP.draft;
  const nextStatuses = STATUS_TRANSITIONS[contract.status] || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button onClick={() => router.back()} className="mb-2 inline-flex items-center gap-1 text-sm text-muted hover:text-foreground">
            <i className="bi bi-arrow-left" /> Quay lại
          </button>
          <h1 className="text-2xl font-bold text-foreground">{contract.name}</h1>
          <p className="mt-0.5 text-sm text-foreground/70">
            Mã: {contract.code} ·{" "}
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${st.cls}`}>
              <i className={`bi ${st.icon}`} /> {st.label}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {!editing && (
            <button onClick={startEditing} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors">
              <i className="bi bi-pencil-square" /> Chỉnh sửa
            </button>
          )}
          {nextStatuses.map((ns) => {
            const target = STATUS_MAP[ns];
            return (
              <button key={ns} onClick={() => handleStatusChange(ns)} disabled={statusChanging || editing}
                className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
                  ns === "active" ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : ns === "terminated" ? "border border-red-200 text-red-600 hover:bg-red-50"
                    : "border border-border text-foreground hover:bg-accent"
                }`}>
                <i className={`bi ${target.icon}`} /> {target.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Warning: expiring soon */}
      {contract.status === "active" && daysRemaining > 0 && daysRemaining <= 30 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          <i className="bi bi-exclamation-triangle mr-2" /><strong>Cảnh báo:</strong> Hợp đồng sắp hết hạn trong {daysRemaining} ngày
        </div>
      )}
      {contract.status === "active" && daysRemaining <= 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <i className="bi bi-exclamation-circle mr-2" /><strong>Hợp đồng đã quá hạn!</strong> Vui lòng cập nhật trạng thái.
        </div>
      )}

      {/* Edit Mode */}
      {editing ? (
        <div className="rounded-xl border-2 border-primary/30 bg-card p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Chỉnh sửa hợp đồng</h2>
            <div className="flex items-center gap-2">
              <button onClick={cancelEditing} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent">Hủy</button>
              <button onClick={saveEditing} disabled={saving || !editForm.name.trim()} className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50">
                {saving ? <><i className="bi bi-arrow-repeat animate-spin mr-1" /> Đang lưu...</> : <><i className="bi bi-check-lg mr-1" /> Lưu</>}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-foreground">Tên hợp đồng</label>
              <input type="text" value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} className={INPUT_CLS} />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-foreground">Nhà cung cấp</label>
              <VendorSelect value={editForm.vendorId} onChange={(v) => setEditForm((f) => ({ ...f, vendorId: v }))} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Ngày bắt đầu</label>
              <input type="date" value={editForm.startDate} onChange={(e) => setEditForm((f) => ({ ...f, startDate: e.target.value }))} className={INPUT_CLS} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Ngày kết thúc</label>
              <input type="date" value={editForm.endDate} onChange={(e) => setEditForm((f) => ({ ...f, endDate: e.target.value }))} className={INPUT_CLS} />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-foreground">Giá trị hợp đồng</label>
              <CurrencyInput value={editForm.value} onChange={(raw) => setEditForm((f) => ({ ...f, value: raw }))} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Mô tả</label>
              <textarea rows={3} value={editForm.description} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} className={INPUT_CLS} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Điều khoản</label>
              <textarea rows={3} value={editForm.terms} onChange={(e) => setEditForm((f) => ({ ...f, terms: e.target.value }))} className={INPUT_CLS} />
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <p className="text-xs text-muted-foreground">Giá trị hợp đồng</p>
              <p className="mt-1 text-xl font-bold text-primary">{formatCurrency(contract.value)}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <p className="text-xs text-muted-foreground">Nhà cung cấp</p>
              <Link href={`/vendors/${contract.vendor.id}`} className="mt-1 text-sm font-medium text-primary hover:underline block">{contract.vendor.name}</Link>
              <p className="text-xs text-muted">{contract.vendor.code}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <p className="text-xs text-muted-foreground">Thời hạn</p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {new Date(contract.startDate).toLocaleDateString("vi-VN")} – {new Date(contract.endDate).toLocaleDateString("vi-VN")}
              </p>
              <p className={`text-xs ${daysRemaining > 30 ? "text-emerald-600" : daysRemaining > 0 ? "text-amber-600" : "text-red-600"}`}>
                {daysRemaining > 0 ? `Còn ${daysRemaining} ngày` : "Đã hết hạn"}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <p className="text-xs text-muted-foreground">Ngày tạo</p>
              <p className="mt-1 text-sm font-medium text-foreground">{new Date(contract.createdAt).toLocaleDateString("vi-VN")}</p>
              {contract.createdBy && <p className="text-xs text-muted">{contract.createdBy.fullName}</p>}
            </div>
          </div>

          {/* Description & Terms */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {contract.description && (
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <h3 className="mb-2 text-sm font-semibold text-foreground/70 uppercase tracking-wider">Mô tả</h3>
                <p className="text-sm text-foreground whitespace-pre-wrap">{contract.description}</p>
              </div>
            )}
            {contract.terms && (
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <h3 className="mb-2 text-sm font-semibold text-foreground/70 uppercase tracking-wider">Điều khoản</h3>
                <p className="text-sm text-foreground whitespace-pre-wrap">{contract.terms}</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Attachments */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-foreground/70 uppercase tracking-wider">
          Tệp đính kèm ({contract.attachments?.length || 0})
        </h3>
        <FileUpload
          entityType="contract"
          entityId={contract.id}
          onUpload={() => fetchContract()}
          existingFiles={contract.attachments || []}
          onRemove={async (fileId) => {
            try { await api.delete(`/files/${fileId}`); await fetchContract(); } catch (err) { console.error(err); }
          }}
        />
      </div>
    </div>
  );
}
