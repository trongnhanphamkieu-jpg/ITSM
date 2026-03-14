"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/shared/page-header";

interface ActualCost {
  id: string;
  categoryName: string;
  description: string;
  amount: string;
  costDate: string;
  vendor: string | null;
  invoiceNo: string | null;
  createdBy: { id: string; fullName: string };
  budgetItem: { id: string; name: string; category: { name: string } } | null;
}

interface ApiResponse {
  success: boolean;
  data: ActualCost[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

function formatCurrency(value: string | number) {
  return new Intl.NumberFormat("vi-VN").format(Number(value)) + "₫";
}

export default function CostListPage() {
  const [costs, setCosts] = useState<ActualCost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [categories, setCategories] = useState<string[]>([]);

  const fetchCosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = {
        page: meta.page,
        limit: 20,
      };
      if (search) params.search = search;
      if (categoryFilter) params.categoryName = categoryFilter;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      const res = await api.get<ApiResponse>("/actual-costs", params);
      setCosts(res.data);
      setMeta({
        total: res.meta.total,
        page: res.meta.page,
        totalPages: res.meta.totalPages,
      });
    } catch {
      // handled by api.ts
    } finally {
      setIsLoading(false);
    }
  }, [meta.page, search, categoryFilter, dateFrom, dateTo]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get<{ success: boolean; data: string[] }>(
        "/actual-costs/categories"
      );
      setCategories(res.data);
    } catch {
      /* skip */
    }
  }, []);

  useEffect(() => {
    fetchCosts();
  }, [fetchCosts]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">
          <i className="bi bi-house-door" />
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">Chi phí thực tế</span>
      </nav>

      <PageHeader
        title="Chi phí thực tế"
        description="Quản lý chi phí phát sinh và so sánh với ngân sách"
        actions={
          <Link
            href="/costs/create"
            className="hidden sm:inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <i className="bi bi-plus-lg" />
            Thêm chi phí
          </Link>
        }
      />

      {/* Mobile CTA */}
      <Link
        href="/costs/create"
        className="mb-4 flex sm:hidden items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
      >
        <i className="bi bi-plus-lg" />
        Thêm chi phí
      </Link>

      {/* Filters */}
      <div className="mb-4 space-y-3">
        <div className="relative">
          <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm theo mô tả, nhà cung cấp..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setMeta((p) => ({ ...p, page: 1 }));
            }}
            className="w-full rounded-lg border border-input bg-background py-2.5 pl-9 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setMeta((p) => ({ ...p, page: 1 }));
            }}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setMeta((p) => ({ ...p, page: 1 }));
            }}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            placeholder="Từ ngày"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              setMeta((p) => ({ ...p, page: 1 }));
            }}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            placeholder="Đến ngày"
          />
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex h-32 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && costs.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-12 text-center shadow-sm">
          <i className="bi bi-cash-stack text-4xl text-muted-foreground" />
          <p className="mt-3 text-base font-medium text-card-foreground">
            Chưa có chi phí nào
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Hãy thêm chi phí đầu tiên
          </p>
          <Link
            href="/costs/create"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            <i className="bi bi-plus-lg" />
            Thêm chi phí
          </Link>
        </div>
      )}

      {/* Desktop Table */}
      {!isLoading && costs.length > 0 && (
        <>
          <div className="hidden md:block rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                    NGÀY
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    DANH MỤC
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    MÔ TẢ
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                    SỐ TIỀN
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    NHÀ CUNG CẤP
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                    SỐ HĐ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {costs.map((cost) => (
                  <tr key={cost.id} className="hover:bg-muted/10">
                    <td className="px-6 py-3 text-card-foreground whitespace-nowrap">
                      {new Date(cost.costDate).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-card-foreground">
                        {cost.categoryName}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-card-foreground max-w-xs truncate">
                      {cost.description}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-primary whitespace-nowrap">
                      {formatCurrency(cost.amount)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {cost.vendor || "—"}
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {cost.invoiceNo || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {costs.map((cost) => (
              <div
                key={cost.id}
                className="rounded-xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-card-foreground">
                      {cost.categoryName}
                    </span>
                    <p className="mt-1.5 text-sm font-medium text-card-foreground">
                      {cost.description}
                    </p>
                  </div>
                  <p className="text-base font-bold text-primary">
                    {formatCurrency(cost.amount)}
                  </p>
                </div>
                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>
                    <i className="bi bi-calendar3 mr-1" />
                    {new Date(cost.costDate).toLocaleDateString("vi-VN")}
                  </span>
                  {cost.vendor && (
                    <span>
                      <i className="bi bi-building mr-1" />
                      {cost.vendor}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <p>
              Hiển thị {costs.length} / {meta.total} chi phí
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setMeta((p) => ({ ...p, page: p.page - 1 }))}
                disabled={meta.page <= 1}
                className="rounded-lg border border-input px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-30"
              >
                ‹
              </button>
              <button
                onClick={() => setMeta((p) => ({ ...p, page: p.page + 1 }))}
                disabled={meta.page >= meta.totalPages}
                className="rounded-lg border border-input px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-30"
              >
                ›
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
