"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";

interface DashboardData {
  totalBudget: number;
  totalSpent: number;
  spentPercentage: number;
  planCount: number;
  pendingApproval: number;
  budgetVsActual: { category: string; budget: number; actual: number }[];
  recentActivity: {
    id: string;
    user: string;
    action: string;
    module: string;
    time: string;
  }[];
}

function formatCurrency(value: number) {
  if (value >= 1_000_000_000) {
    return (value / 1_000_000_000).toFixed(1).replace(".0", "") + " tỷ";
  }
  if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(0) + " tr";
  }
  return new Intl.NumberFormat("vi-VN").format(value) + "₫";
}

function formatFullCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value) + "₫";
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  return `${Math.floor(hours / 24)} ngày trước`;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await api.get<{ success: boolean; data: DashboardData }>(
        "/dashboard/summary"
      );
      setData(res.data);
    } catch {
      // Fallback to static data if API unavailable
      setData({
        totalBudget: 0,
        totalSpent: 0,
        spentPercentage: 0,
        planCount: 0,
        pendingApproval: 0,
        budgetVsActual: [],
        recentActivity: [],
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (isLoading) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tổng quan hệ thống quản trị IT
          </p>
        </div>
        {/* Skeleton KPIs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card p-6 shadow-sm animate-pulse"
            >
              <div className="h-4 w-24 rounded bg-muted mb-3" />
              <div className="h-7 w-32 rounded bg-muted mb-2" />
              <div className="h-3 w-20 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const kpis = [
    {
      label: "Tổng ngân sách",
      value: data ? formatFullCurrency(data.totalBudget) : "—",
      change: data ? `${data.planCount} kế hoạch năm nay` : "",
      icon: "bi-wallet2",
      color: "text-primary",
    },
    {
      label: "Đã chi",
      value: data ? formatFullCurrency(data.totalSpent) : "—",
      change: data ? `${data.spentPercentage}% ngân sách` : "",
      icon: "bi-cash-stack",
      color: "text-success",
    },
    {
      label: "Kế hoạch NS",
      value: data?.planCount?.toString() || "0",
      change: data?.pendingApproval
        ? `${data.pendingApproval} chờ duyệt`
        : "Không có chờ duyệt",
      icon: "bi-clipboard-check",
      color: "text-info",
    },
    {
      label: "Chờ duyệt",
      value: data?.pendingApproval?.toString() || "0",
      change: data?.pendingApproval ? "Cần xử lý" : "Đã clear",
      icon: "bi-hourglass-split",
      color: data?.pendingApproval ? "text-warning" : "text-success",
    },
  ];

  const maxChartValue = data
    ? Math.max(
        ...data.budgetVsActual.flatMap((b) => [b.budget, b.actual]),
        1
      )
    : 1;

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tổng quan hệ thống quản trị IT
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                {kpi.label}
              </p>
              <i className={`bi ${kpi.icon} text-lg ${kpi.color}`} />
            </div>
            <p className="mt-2 text-2xl font-bold text-card-foreground">
              {kpi.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{kpi.change}</p>
          </div>
        ))}
      </div>

      {/* Budget vs Actual + Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Budget vs Actual Chart */}
        <div className="col-span-1 lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-base font-semibold text-card-foreground mb-4">
            Ngân sách vs Thực tế
          </h2>

          {data && data.budgetVsActual.length > 0 ? (
            <div className="space-y-4">
              {data.budgetVsActual.map((item) => (
                <div key={item.category}>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm font-medium text-card-foreground truncate max-w-[180px]">
                      {item.category}
                    </p>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>
                        NS:{" "}
                        <span className="text-card-foreground font-medium">
                          {formatCurrency(item.budget)}
                        </span>
                      </span>
                      <span>
                        TT:{" "}
                        <span className="text-primary font-medium">
                          {formatCurrency(item.actual)}
                        </span>
                      </span>
                    </div>
                  </div>
                  {/* Stacked bar */}
                  <div className="relative h-6 w-full rounded-md bg-muted overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 rounded-md bg-info/30"
                      style={{
                        width: `${(item.budget / maxChartValue) * 100}%`,
                      }}
                    />
                    <div
                      className="absolute inset-y-0 left-0 rounded-md bg-primary"
                      style={{
                        width: `${(item.actual / maxChartValue) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
              {/* Legend */}
              <div className="flex gap-6 pt-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-sm bg-info/30" />
                  Ngân sách
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-sm bg-primary" />
                  Thực tế
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground">
                <i className="bi bi-bar-chart-line mr-2" />
                Chưa có dữ liệu ngân sách và chi phí
              </p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-base font-semibold text-card-foreground mb-4">
            Hoạt động gần đây
          </h2>
          {data && data.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {data.recentActivity.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {item.user.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-card-foreground truncate">
                      <span className="font-medium">{item.user}</span>{" "}
                      {item.action}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {timeAgo(item.time)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-center py-4">
                Chưa có hoạt động nào
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Budget Spent Progress */}
      {data && data.totalBudget > 0 && (
        <div className="mt-6 rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-card-foreground">
              Tiến độ chi tiêu
            </h2>
            <span className="text-sm font-bold text-primary">
              {data.spentPercentage}%
            </span>
          </div>
          <div className="relative h-4 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                data.spentPercentage > 90
                  ? "bg-danger"
                  : data.spentPercentage > 70
                    ? "bg-warning"
                    : "bg-success"
              }`}
              style={{ width: `${Math.min(data.spentPercentage, 100)}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>Đã chi: {formatFullCurrency(data.totalSpent)}</span>
            <span>Ngân sách: {formatFullCurrency(data.totalBudget)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
