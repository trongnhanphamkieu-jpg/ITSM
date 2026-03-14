"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";

type BudgetStatus = "draft" | "pending" | "approved" | "rejected";

interface BudgetItem {
  id: string;
  name: string;
  description: string | null;
  unit: string | null;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  note: string | null;
}

interface BudgetCategory {
  id: string;
  name: string;
  items: BudgetItem[];
}

interface BudgetPlan {
  id: string;
  code: string;
  name: string;
  year: number;
  quarter: number | null;
  description: string | null;
  totalAmount: string;
  status: BudgetStatus;
  rejectionNote: string | null;
  createdAt: string;
  updatedAt: string;
  approvedAt: string | null;
  createdBy: { id: string; fullName: string; email: string };
  approvedBy: { id: string; fullName: string; email: string } | null;
  categories: BudgetCategory[];
}

const STATUS_MAP: Record<
  BudgetStatus,
  { label: string; variant: "neutral" | "warning" | "success" | "danger" }
> = {
  draft: { label: "Nháp", variant: "neutral" },
  pending: { label: "Chờ duyệt", variant: "warning" },
  approved: { label: "Đã duyệt", variant: "success" },
  rejected: { label: "Từ chối", variant: "danger" },
};

function formatCurrency(value: string | number) {
  return new Intl.NumberFormat("vi-VN").format(Number(value)) + "₫";
}

export default function BudgetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [plan, setPlan] = useState<BudgetPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [rejectNote, setRejectNote] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const fetchPlan = useCallback(async () => {
    try {
      const res = await api.get<{ success: boolean; data: BudgetPlan }>(
        `/budget-plans/${id}`
      );
      setPlan(res.data);
    } catch {
      router.push("/budget/plans");
    } finally {
      setIsLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  const handleAction = async (action: string) => {
    setActionLoading(action);
    try {
      if (action === "submit") {
        await api.post(`/budget-plans/${id}/submit`);
      } else if (action === "approve") {
        await api.post(`/budget-plans/${id}/approve`);
      } else if (action === "reject") {
        await api.post(`/budget-plans/${id}/reject`, {
          rejectionNote: rejectNote,
        });
        setShowRejectDialog(false);
      } else if (action === "delete") {
        await api.delete(`/budget-plans/${id}`);
        router.push("/budget/plans");
        return;
      }
      await fetchPlan();
    } catch {
      // handled by api.ts
    } finally {
      setActionLoading("");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!plan) return null;

  const statusInfo = STATUS_MAP[plan.status];
  const totalItems = plan.categories.reduce(
    (sum, c) => sum + c.items.length,
    0
  );

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">
          <i className="bi bi-house-door" />
        </Link>
        <span>/</span>
        <Link
          href="/budget/plans"
          className="hover:text-foreground transition-colors"
        >
          Kế hoạch ngân sách
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">{plan.code}</span>
      </nav>

      <PageHeader
        title={plan.name}
        description={`${plan.code} • ${plan.year}${plan.quarter ? ` / Q${plan.quarter}` : ""}`}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge variant={statusInfo.variant}>
              {statusInfo.label}
            </StatusBadge>

            {plan.status === "draft" && (
              <>
                <button
                  onClick={() => handleAction("submit")}
                  disabled={!!actionLoading}
                  className="rounded-lg bg-warning px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-warning/90 disabled:opacity-50"
                >
                  <i className="bi bi-send mr-1.5" />
                  Gửi duyệt
                </button>
                <button
                  onClick={() => handleAction("delete")}
                  disabled={!!actionLoading}
                  className="rounded-lg border border-danger/20 px-3 py-2 text-sm text-danger hover:bg-danger/5 transition-colors disabled:opacity-50"
                >
                  <i className="bi bi-trash" />
                </button>
              </>
            )}

            {plan.status === "pending" && (
              <>
                <button
                  onClick={() => handleAction("approve")}
                  disabled={!!actionLoading}
                  className="rounded-lg bg-success px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-success/90 disabled:opacity-50"
                >
                  <i className="bi bi-check-lg mr-1.5" />
                  Phê duyệt
                </button>
                <button
                  onClick={() => setShowRejectDialog(true)}
                  disabled={!!actionLoading}
                  className="rounded-lg border border-danger/30 px-4 py-2 text-sm font-medium text-danger hover:bg-danger/5 transition-colors disabled:opacity-50"
                >
                  <i className="bi bi-x-lg mr-1.5" />
                  Từ chối
                </button>
              </>
            )}
          </div>
        }
      />

      {/* Rejection note */}
      {plan.status === "rejected" && plan.rejectionNote && (
        <div className="mb-4 rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
          <i className="bi bi-exclamation-circle mr-2" />
          <strong>Lý do từ chối:</strong> {plan.rejectionNote}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Tổng ngân sách</p>
          <p className="mt-1 text-xl font-bold text-primary">
            {formatCurrency(plan.totalAmount)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Danh mục</p>
          <p className="mt-1 text-xl font-bold text-card-foreground">
            {plan.categories.length}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Hạng mục</p>
          <p className="mt-1 text-xl font-bold text-card-foreground">
            {totalItems}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Người tạo</p>
          <p className="mt-1 text-sm font-medium text-card-foreground">
            {plan.createdBy.fullName}
          </p>
          <p className="text-xs text-muted-foreground">
            {new Date(plan.createdAt).toLocaleDateString("vi-VN")}
          </p>
        </div>
      </div>

      {/* Description */}
      {plan.description && (
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm mb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Mô tả
          </h3>
          <p className="text-sm text-card-foreground">{plan.description}</p>
        </div>
      )}

      {/* Categories + items */}
      {plan.categories.map((cat) => {
        const catTotal = cat.items.reduce(
          (sum, item) => sum + Number(item.totalPrice),
          0
        );
        return (
          <div
            key={cat.id}
            className="rounded-xl border border-border bg-card shadow-sm mb-4 overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-border bg-muted/20 px-6 py-3">
              <h3 className="text-sm font-semibold text-card-foreground">
                {cat.name}
              </h3>
              <span className="text-sm font-bold text-primary">
                {formatCurrency(catTotal)}
              </span>
            </div>

            {/* Desktop */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-6 py-2.5 text-left font-medium text-muted-foreground">
                      Hạng mục
                    </th>
                    <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                      ĐVT
                    </th>
                    <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">
                      SL
                    </th>
                    <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">
                      Đơn giá
                    </th>
                    <th className="px-6 py-2.5 text-right font-medium text-muted-foreground">
                      Thành tiền
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {cat.items.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/10">
                      <td className="px-6 py-3">
                        <p className="font-medium text-card-foreground">
                          {item.name}
                        </p>
                        {item.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {item.description}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {item.unit || "—"}
                      </td>
                      <td className="px-4 py-3 text-right text-card-foreground">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 text-right text-card-foreground">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="px-6 py-3 text-right font-semibold text-card-foreground">
                        {formatCurrency(item.totalPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="sm:hidden divide-y divide-border/50">
              {cat.items.map((item) => (
                <div key={item.id} className="px-4 py-3">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-card-foreground">
                      {item.name}
                    </p>
                    <p className="text-sm font-semibold text-primary">
                      {formatCurrency(item.totalPrice)}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.quantity} × {formatCurrency(item.unitPrice)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Grand Total */}
      <div className="rounded-xl border-2 border-primary/20 bg-primary/5 px-6 py-4 flex items-center justify-between mb-6">
        <span className="text-sm font-semibold text-card-foreground">
          TỔNG CỘNG
        </span>
        <span className="text-2xl font-bold text-primary">
          {formatCurrency(plan.totalAmount)}
        </span>
      </div>

      {/* Approval info */}
      {plan.approvedBy && (
        <div className="rounded-xl border border-border bg-card px-6 py-4 shadow-sm">
          <p className="text-xs text-muted-foreground mb-1">
            {plan.status === "approved" ? "Phê duyệt bởi" : "Xử lý bởi"}
          </p>
          <p className="text-sm font-medium text-card-foreground">
            {plan.approvedBy.fullName}
          </p>
          {plan.approvedAt && (
            <p className="text-xs text-muted-foreground">
              {new Date(plan.approvedAt).toLocaleString("vi-VN")}
            </p>
          )}
        </div>
      )}

      {/* Reject Dialog */}
      {showRejectDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-xl bg-card p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-card-foreground mb-2">
              Từ chối kế hoạch
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Vui lòng nhập lý do từ chối kế hoạch &quot;{plan.name}&quot;
            </p>
            <textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              rows={3}
              placeholder="Lý do từ chối..."
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowRejectDialog(false)}
                className="rounded-lg border border-input px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
              >
                Hủy
              </button>
              <button
                onClick={() => handleAction("reject")}
                disabled={!!actionLoading}
                className="rounded-lg bg-danger px-4 py-2 text-sm font-medium text-white hover:bg-danger/90 disabled:opacity-50"
              >
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
