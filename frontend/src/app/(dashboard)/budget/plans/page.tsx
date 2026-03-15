"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { ExportButton } from "@/components/shared/export-button";
import type { ExportColumn } from "@/components/shared/export-button";

const PLAN_EXPORT_COLUMNS: ExportColumn[] = [
  { header: "Mã", key: "code" },
  { header: "Tên kế hoạch", key: "name" },
  { header: "Năm", key: "year" },
  { header: "Tổng ngân sách", key: "totalAmount" },
  { header: "Trạng thái", key: "status" },
  { header: "Ngày tạo", key: "createdAt", format: (v: string) => v ? new Date(v).toLocaleDateString("vi-VN") : "" },
];


type BudgetStatus = "draft" | "pending" | "approved" | "rejected";

interface BudgetPlan {
  id: string;
  code: string;
  name: string;
  year: number;
  quarter: number | null;
  totalAmount: string;
  status: BudgetStatus;
  createdAt: string;
  createdBy: { id: string; fullName: string };
  categories: { id: string; _count: { items: number } }[];
}

interface ApiResponse {
  success: boolean;
  data: BudgetPlan[];
  meta: { total: number; page: number; limit: number; totalPages: number };
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

export default function BudgetPlansPage() {
  const [plans, setPlans] = useState<BudgetPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [filterYear, setFilterYear] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");

  const fetchPlans = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get<ApiResponse>("/budget-plans", {
        page: meta.page,
        limit: 20,
        ...(search && { search }),
        ...(filterYear && { year: filterYear }),
        ...(filterStatus && { status: filterStatus }),
      });
      setPlans(res.data);
      setMeta(res.meta);
    } catch {
      // API error handled by api.ts
    } finally {
      setIsLoading(false);
    }
  }, [meta.page, search, filterYear, filterStatus]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">
          <i className="bi bi-house-door" />
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">Kế hoạch ngân sách</span>
      </nav>

      <PageHeader
        title="Kế hoạch ngân sách"
        description="Quản lý và theo dõi các kế hoạch ngân sách CNTT"
        actions={
          <div className="flex items-center gap-2">
            <ExportButton data={plans} columns={PLAN_EXPORT_COLUMNS} filename="ke_hoach_ngan_sach" />
            <Link
              href="/budget/plans/create"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              <i className="bi bi-plus-lg" />
              Tạo kế hoạch
            </Link>
          </div>
        }
      />

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc mã..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
        >
          <option value="">Tất cả năm</option>
          {years.map((y) => (
            <option key={y} value={y}>
              Năm {y}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="draft">Nháp</option>
          <option value="pending">Chờ duyệt</option>
          <option value="approved">Đã duyệt</option>
          <option value="rejected">Từ chối</option>
        </select>
      </div>

      {/* Data Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : plans.length === 0 ? (
          <EmptyState
            title="Chưa có kế hoạch ngân sách"
            description="Tạo kế hoạch ngân sách đầu tiên để bắt đầu quản lý chi phí CNTT"
            action={
              <Link
                href="/budget/plans/create"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
              >
                <i className="bi bi-plus-lg" />
                Tạo kế hoạch
              </Link>
            }
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Mã
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Tên kế hoạch
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Năm / Quý
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Tổng ngân sách
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Người tạo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Ngày tạo
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {plans.map((plan) => {
                    const statusInfo = STATUS_MAP[plan.status];
                    const itemCount = plan.categories.reduce(
                      (sum, c) => sum + c._count.items,
                      0
                    );
                    return (
                      <tr
                        key={plan.id}
                        className="group transition-colors hover:bg-muted/20"
                      >
                        <td className="px-4 py-3">
                          <Link
                            href={`/budget/plans/${plan.id}`}
                            className="font-mono text-sm font-medium text-primary hover:underline"
                          >
                            {plan.code}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/budget/plans/${plan.id}`}
                            className="text-sm font-medium text-card-foreground hover:text-primary transition-colors"
                          >
                            {plan.name}
                          </Link>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {itemCount} hạng mục
                          </p>
                        </td>
                        <td className="px-4 py-3 text-sm text-card-foreground">
                          {plan.year}
                          {plan.quarter ? ` / Q${plan.quarter}` : ""}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-sm font-semibold text-card-foreground">
                            {formatCurrency(plan.totalAmount)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <StatusBadge variant={statusInfo.variant}>
                            {statusInfo.label}
                          </StatusBadge>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {plan.createdBy.fullName}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {new Date(plan.createdAt).toLocaleDateString("vi-VN")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-border">
              {plans.map((plan) => {
                const statusInfo = STATUS_MAP[plan.status];
                return (
                  <Link
                    key={plan.id}
                    href={`/budget/plans/${plan.id}`}
                    className="block px-4 py-4 transition-colors hover:bg-muted/20"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-xs text-primary">
                          {plan.code}
                        </p>
                        <p className="mt-0.5 text-sm font-medium text-card-foreground truncate">
                          {plan.name}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {plan.year}
                          {plan.quarter ? ` / Q${plan.quarter}` : ""} •{" "}
                          {plan.createdBy.fullName}
                        </p>
                      </div>
                      <StatusBadge variant={statusInfo.variant}>
                        {statusInfo.label}
                      </StatusBadge>
                    </div>
                    <p className="mt-2 text-lg font-bold text-primary">
                      {formatCurrency(plan.totalAmount)}
                    </p>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            {meta.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border px-4 py-3">
                <p className="text-xs text-muted-foreground">
                  Hiển thị {plans.length} / {meta.total} kế hoạch
                </p>
                <div className="flex gap-1">
                  <button
                    disabled={meta.page <= 1}
                    onClick={() =>
                      setMeta((m) => ({ ...m, page: m.page - 1 }))
                    }
                    className="rounded-md border border-input px-3 py-1.5 text-xs disabled:opacity-40"
                  >
                    Trước
                  </button>
                  <button
                    disabled={meta.page >= meta.totalPages}
                    onClick={() =>
                      setMeta((m) => ({ ...m, page: m.page + 1 }))
                    }
                    className="rounded-md border border-input px-3 py-1.5 text-xs disabled:opacity-40"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer summary */}
      {!isLoading && plans.length > 0 && (
        <p className="mt-3 text-xs text-muted-foreground text-right">
          Hiển thị {plans.length} / {meta.total} kế hoạch
        </p>
      )}
    </div>
  );
}
