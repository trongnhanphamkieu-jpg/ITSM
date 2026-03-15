"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/shared/page-header";
import { VendorSelect } from "@/components/shared/vendor-select";
import { CategorySelect } from "@/components/shared/category-select";
import { CurrencyInput } from "@/components/shared/currency-input";
import { FileUpload } from "@/components/shared/file-upload";

interface BudgetItemOption {
  id: string;
  name: string;
  categoryName: string;
  planCode: string;
}

export default function CostCreatePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [budgetItems, setBudgetItems] = useState<BudgetItemOption[]>([]);
  const [attachments, setAttachments] = useState<{ id: string; name: string; url: string }[]>([]);

  const [form, setForm] = useState({
    categoryName: "",
    description: "",
    amount: 0,
    costDate: new Date().toISOString().split("T")[0],
    paymentDueDate: "",
    vendorId: "",
    invoiceNo: "",
    note: "",
    budgetItemId: "",
  });

  const fetchBudgetItems = useCallback(async () => {
    try {
      const res = await api.get<{
        success: boolean;
        data: Array<{
          id: string;
          categories: Array<{
            name: string;
            items: Array<{ id: string; name: string }>;
            plan?: { code: string };
          }>;
          code: string;
        }>;
      }>("/budget-plans", { status: "approved", limit: 100 });
      const items: BudgetItemOption[] = [];
      for (const plan of res.data) {
        for (const cat of plan.categories || []) {
          for (const item of cat.items || []) {
            items.push({
              id: item.id,
              name: item.name,
              categoryName: cat.name,
              planCode: plan.code,
            });
          }
        }
      }
      setBudgetItems(items);
    } catch {
      /* skip */
    }
  }, []);

  useEffect(() => {
    fetchBudgetItems();
  }, [fetchBudgetItems]);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.categoryName || !form.description || !form.amount || !form.costDate) return;

    setIsSubmitting(true);
    try {
      await api.post("/actual-costs", {
        categoryName: form.categoryName,
        description: form.description,
        amount: Number(form.amount),
        costDate: form.costDate,
        vendorId: form.vendorId || undefined,
        invoiceNo: form.invoiceNo || undefined,
        paymentDueDate: form.paymentDueDate || undefined,
        note: form.note || undefined,
        budgetItemId: form.budgetItemId || undefined,
        attachmentIds: attachments.map((f) => f.id),
      });
      router.push("/costs");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Lỗi khi tạo chi phí");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">
          <i className="bi bi-house-door" />
        </Link>
        <span>/</span>
        <Link href="/costs" className="hover:text-foreground transition-colors">
          Chi phí thực tế
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">Thêm mới</span>
      </nav>

      <PageHeader
        title="Thêm chi phí mới"
        description="Ghi nhận chi phí phát sinh"
      />

      <div className="max-w-2xl">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">
          {/* Danh mục — CategorySelect */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-card-foreground">
              Danh mục <span className="text-danger">*</span>
            </label>
            <CategorySelect
              value={form.categoryName}
              onChange={(v) => updateField("categoryName", v)}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-card-foreground">
              Mô tả chi phí <span className="text-danger">*</span>
            </label>
            <textarea
              rows={2}
              placeholder="Mô tả chi tiết chi phí"
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          {/* Amount + Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-card-foreground">
                Số tiền <span className="text-danger">*</span>
              </label>
              <CurrencyInput
                value={form.amount}
                onChange={(raw) => setForm((prev) => ({ ...prev, amount: raw }))}
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-card-foreground">
                Ngày chi <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                value={form.costDate}
                onChange={(e) => updateField("costDate", e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Hạn thanh toán */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-card-foreground">
              Hạn thanh toán
            </label>
            <input
              type="date"
              value={form.paymentDueDate}
              onChange={(e) => updateField("paymentDueDate", e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Hệ thống sẽ cảnh báo khi quá hạn (tùy chọn)
            </p>
          </div>

          {/* Vendor + Invoice */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-card-foreground">
                Nhà cung cấp
              </label>
              <VendorSelect
                value={form.vendorId}
                onChange={(v) => updateField("vendorId", v)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-card-foreground">
                Số hóa đơn
              </label>
              <input
                type="text"
                placeholder="Số HĐ"
                value={form.invoiceNo}
                onChange={(e) => updateField("invoiceNo", e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Budget Item Link */}
          {budgetItems.length > 0 && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-card-foreground">
                Liên kết hạng mục ngân sách
              </label>
              <select
                value={form.budgetItemId}
                onChange={(e) => updateField("budgetItemId", e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              >
                <option value="">Không liên kết</option>
                {budgetItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    [{item.planCode}] {item.categoryName} / {item.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-muted-foreground">
                Liên kết với hạng mục trong kế hoạch ngân sách đã duyệt
              </p>
            </div>
          )}

          {/* Attachments */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-card-foreground">
              Hóa đơn / Chứng từ
            </label>
            <FileUpload
              entityType="actual-cost"
              onUpload={(file) => setAttachments((prev) => [...prev, { id: file.id, name: file.fileName, url: file.storageKey }])}
              accept=".pdf,.jpg,.jpeg,.png"
              maxSizeMb={5}
            />
            {attachments.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {attachments.map((file) => (
                  <div key={file.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                    <div className="flex items-center gap-2">
                      <i className="bi bi-file-earmark text-muted" />
                      <span className="text-foreground">{file.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAttachments((prev) => prev.filter((f) => f.id !== file.id))}
                      className="text-muted hover:text-danger transition-colors"
                    >
                      <i className="bi bi-x-lg" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Note */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-card-foreground">
              Ghi chú
            </label>
            <textarea
              rows={2}
              placeholder="Ghi chú thêm (tùy chọn)"
              value={form.note}
              onChange={(e) => updateField("note", e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center justify-end gap-3">
          <Link
            href="/costs"
            className="rounded-lg border border-input px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted"
          >
            Hủy
          </Link>
          <button
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              !form.categoryName ||
              !form.description ||
              !form.amount
            }
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Đang lưu...
              </span>
            ) : (
              <>
                <i className="bi bi-check-lg mr-1.5" />
                Lưu chi phí
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
