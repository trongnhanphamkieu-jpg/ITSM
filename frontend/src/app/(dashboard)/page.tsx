"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

interface DashboardData {
  totalBudget: number;
  totalSpent: number;
  spentPercentage: number;
  planCount: number;
  pendingApproval: number;
  filterLabel?: string;
  budgetVsActual: { category: string; budget: number; actual: number }[];
  recentActivity: {
    id: string;
    user: string;
    action: string;
    module: string;
    time: string;
  }[];
}

interface AlertItem {
  id: string;
  type: "contract" | "domain" | "ssl" | "license" | "budget";
  title: string;
  detail: string;
  daysLeft: number;
  severity: "critical" | "warning" | "info";
  href: string;
}

const SEVERITY_COLORS = {
  critical: "border-red-500/30 bg-red-500/5",
  warning: "border-amber-500/30 bg-amber-500/5",
  info: "border-blue-500/30 bg-blue-500/5",
};

const SEVERITY_ICON = {
  critical: "bi-exclamation-triangle-fill text-red-400",
  warning: "bi-exclamation-circle-fill text-amber-400",
  info: "bi-info-circle-fill text-blue-400",
};

export default function DashboardPage() {
  const { t, locale } = useI18n();
  const [data, setData] = useState<DashboardData | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [vendorStats, setVendorStats] = useState<{name: string; total: number}[]>([]);

  // Filter state
  const currentYear = new Date().getFullYear();
  const [filterYear, setFilterYear] = useState(currentYear);
  const [filterType, setFilterType] = useState<"year" | "quarter" | "month">("year");
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterQuarter, setFilterQuarter] = useState(Math.ceil((new Date().getMonth() + 1) / 3));

  function formatShort(value: number) {
    if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1).replace(".0", "") + " " + t("number.billion");
    if (value >= 1_000_000) return (value / 1_000_000).toFixed(0) + " " + t("number.million");
    return formatCurrency(value);
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return t("time.just_now");
    if (mins < 60) return t("time.minutes_ago", { count: mins });
    const hours = Math.floor(mins / 60);
    if (hours < 24) return t("time.hours_ago", { count: hours });
    return t("time.days_ago", { count: Math.floor(hours / 24) });
  }

  const fetchDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      const params: any = { year: filterYear };
      if (filterType === "month") params.month = filterMonth;
      if (filterType === "quarter") params.quarter = filterQuarter;

      const res = await api.get<{ success: boolean; data: DashboardData }>("/dashboard/summary", params);
      setData(res.data);
    } catch {
      setData({
        totalBudget: 0, totalSpent: 0, spentPercentage: 0,
        planCount: 0, pendingApproval: 0, budgetVsActual: [], recentActivity: [],
      });
    } finally {
      setIsLoading(false);
    }
  }, [filterYear, filterType, filterMonth, filterQuarter]);

  const fetchAlerts = useCallback(async () => {
    try {
      const now = new Date();
      const alertItems: AlertItem[] = [];
      const dateFmt = locale === "en" ? "en-US" : "vi-VN";

      // Check contracts expiring within 30 days
      try {
        const contracts = await api.get<{ data: any[] }>("/contracts", { limit: 100 });
        for (const c of contracts.data || []) {
          if (c.endDate) {
            const days = Math.ceil((new Date(c.endDate).getTime() - now.getTime()) / 86400000);
            if (days >= 0 && days <= 30) {
              alertItems.push({
                id: `contract-${c.id}`,
                type: "contract",
                title: `${t("filter.contract_prefix")} ${c.contractNumber || c.name}`,
                detail: t("filter.expires", { date: new Date(c.endDate).toLocaleDateString(dateFmt) }),
                daysLeft: days,
                severity: days <= 7 ? "critical" : days <= 14 ? "warning" : "info",
                href: `/contracts/${c.id}`,
              });
            }
          }
        }
      } catch {}

      // Check domains expiring within 30 days
      try {
        const domains = await api.get<{ data: any[] }>("/soft-inventory/domains", { limit: 100 });
        for (const d of domains.data || []) {
          if (d.expiryDate) {
            const days = Math.ceil((new Date(d.expiryDate).getTime() - now.getTime()) / 86400000);
            if (days >= 0 && days <= 30) {
              alertItems.push({
                id: `domain-${d.id}`,
                type: "domain",
                title: `Domain ${d.domainName}`,
                detail: t("filter.expires", { date: new Date(d.expiryDate).toLocaleDateString(dateFmt) }),
                daysLeft: days,
                severity: days <= 7 ? "critical" : days <= 14 ? "warning" : "info",
                href: "/inventory/soft",
              });
            }
          }
        }
      } catch {}

      // Check SSL certificates expiring within 30 days
      try {
        const ssls = await api.get<{ data: any[] }>("/soft-inventory/ssl-certificates", { limit: 100 });
        for (const s of ssls.data || []) {
          if (s.expiryDate) {
            const days = Math.ceil((new Date(s.expiryDate).getTime() - now.getTime()) / 86400000);
            if (days >= 0 && days <= 30) {
              alertItems.push({
                id: `ssl-${s.id}`,
                type: "ssl",
                title: `SSL ${s.domain || s.commonName}`,
                detail: t("filter.expires", { date: new Date(s.expiryDate).toLocaleDateString(dateFmt) }),
                daysLeft: days,
                severity: days <= 7 ? "critical" : days <= 14 ? "warning" : "info",
                href: "/inventory/soft",
              });
            }
          }
        }
      } catch {}

      // Check budget overspend
      if (data && data.spentPercentage > 80) {
        alertItems.push({
          id: "budget-overspend",
          type: "budget",
          title: t("dashboard.budget_alert"),
          detail: t("dashboard.budget_overspend", { pct: data.spentPercentage }),
          daysLeft: -1,
          severity: data.spentPercentage > 95 ? "critical" : "warning",
          href: "/budget/plans",
        });
      }

      setAlerts(alertItems.sort((a, b) => a.daysLeft - b.daysLeft));
    } catch {
      setAlerts([]);
    }
  }, [data, t, locale]);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);
  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  // B7: Fetch vendor cost aggregation
  useEffect(() => {
    api.get<any>("/actual-costs", { limit: 200 })
      .then(res => {
        const vendorMap = new Map<string, number>();
        for (const c of res.data || []) {
          const vName = c.vendorRef?.name || c.vendor || "—";
          vendorMap.set(vName, (vendorMap.get(vName) || 0) + Number(c.amount || 0));
        }
        const sorted = Array.from(vendorMap.entries())
          .map(([name, total]) => ({ name, total }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 5);
        setVendorStats(sorted);
      })
      .catch(() => {});
  }, []);

  if (isLoading) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">{t("dashboard.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("dashboard.desc")}</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-6 shadow-sm animate-pulse">
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
    { label: t("dashboard.total_budget"), value: data ? formatCurrency(data.totalBudget) : "—", change: data ? t("dashboard.plans_this_year", { count: data.planCount }) : "", icon: "bi-wallet2", color: "text-primary" },
    { label: t("dashboard.spent"), value: data ? formatCurrency(data.totalSpent) : "—", change: data ? t("dashboard.pct_budget", { pct: data.spentPercentage }) : "", icon: "bi-cash-stack", color: "text-success" },
    { label: t("dashboard.plan_count"), value: data?.planCount?.toString() || "0", change: data?.pendingApproval ? t("dashboard.pending_count", { count: data.pendingApproval }) : t("dashboard.no_pending"), icon: "bi-clipboard-check", color: "text-info" },
    { label: t("dashboard.pending"), value: data?.pendingApproval?.toString() || "0", change: data?.pendingApproval ? t("dashboard.need_action") : t("dashboard.cleared"), icon: "bi-hourglass-split", color: data?.pendingApproval ? "text-warning" : "text-success" },
  ];

  const maxChartValue = data ? Math.max(...data.budgetVsActual.flatMap((b) => [b.budget, b.actual]), 1) : 1;

  return (
    <div>
      {/* Page Header + Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("dashboard.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("dashboard.desc")} {data?.filterLabel ? `— ${data.filterLabel}` : ""}
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <select value={filterYear} onChange={(e) => setFilterYear(Number(e.target.value))}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm">
            {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map((y) => (
              <option key={y} value={y}>{t("filter.year_label", { year: y })}</option>
            ))}
          </select>

          <div className="flex gap-0.5 rounded-lg border border-border bg-card p-0.5">
            {(["year", "quarter", "month"] as const).map((ft) => (
              <button key={ft} onClick={() => setFilterType(ft)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${filterType === ft ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {t(`filter.${ft}`)}
              </button>
            ))}
          </div>

          {filterType === "quarter" && (
            <select value={filterQuarter} onChange={(e) => setFilterQuarter(Number(e.target.value))}
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm">
              {[1, 2, 3, 4].map((q) => <option key={q} value={q}>Q{q}</option>)}
            </select>
          )}

          {filterType === "month" && (
            <select value={filterMonth} onChange={(e) => setFilterMonth(Number(e.target.value))}
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm">
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{t("filter.month_label", { month: i + 1 })}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="mb-6 rounded-xl border border-border bg-card p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <i className="bi bi-bell-fill text-amber-400" />
            {t("dashboard.alerts")} ({alerts.length})
          </h2>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {alerts.map((alert) => (
              <Link key={alert.id} href={alert.href}
                className={`flex items-center gap-3 rounded-lg border p-3 transition hover:shadow-sm ${SEVERITY_COLORS[alert.severity]}`}>
                <i className={`bi ${SEVERITY_ICON[alert.severity]} text-base`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{alert.title}</p>
                  <p className="text-xs text-muted-foreground">{alert.detail}</p>
                </div>
                {alert.daysLeft >= 0 && (
                  <span className={`text-xs font-bold whitespace-nowrap ${alert.daysLeft <= 7 ? "text-red-400" : "text-amber-400"}`}>
                    {alert.daysLeft === 0 ? t("dashboard.today") : t("dashboard.days", { count: alert.daysLeft })}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
              <i className={`bi ${kpi.icon} text-lg ${kpi.color}`} />
            </div>
            <p className="mt-2 text-2xl font-bold text-card-foreground">{kpi.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{kpi.change}</p>
          </div>
        ))}
      </div>

      {/* Budget vs Actual + Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="col-span-1 lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-base font-semibold text-card-foreground mb-4">{t("dashboard.budget_vs_actual")}</h2>
          {data && data.budgetVsActual.length > 0 ? (
            <div className="space-y-4">
              {data.budgetVsActual.map((item) => (
                <div key={item.category}>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm font-medium text-card-foreground truncate max-w-[180px]">{item.category}</p>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>{t("dashboard.ns")}: <span className="text-card-foreground font-medium">{formatShort(item.budget)}</span></span>
                      <span>{t("dashboard.tt")}: <span className="text-primary font-medium">{formatShort(item.actual)}</span></span>
                    </div>
                  </div>
                  <div className="relative h-6 w-full rounded-md bg-muted overflow-hidden">
                    <div className="absolute inset-y-0 left-0 rounded-md bg-info/30" style={{ width: `${(item.budget / maxChartValue) * 100}%` }} />
                    <div className="absolute inset-y-0 left-0 rounded-md bg-primary" style={{ width: `${(item.actual / maxChartValue) * 100}%` }} />
                  </div>
                </div>
              ))}
              <div className="flex gap-6 pt-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-sm bg-info/30" /> {t("dashboard.legend_budget")}</div>
                <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-sm bg-primary" /> {t("dashboard.legend_actual")}</div>
              </div>
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground"><i className="bi bi-bar-chart-line mr-2" />{t("dashboard.no_budget_data")}</p>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-base font-semibold text-card-foreground mb-4">{t("dashboard.recent_activity")}</h2>
          {data && data.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {data.recentActivity.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {item.user.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-card-foreground truncate">
                      <span className="font-medium">{item.user}</span> {item.action}
                    </p>
                    <p className="text-xs text-muted-foreground">{timeAgo(item.time)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-center py-4">{t("dashboard.no_activity")}</p>
            </div>
          )}
        </div>
      </div>

      {/* Budget Spent Progress */}
      {data && data.totalBudget > 0 && (
        <div className="mt-6 rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-card-foreground">{t("dashboard.spending_progress")}</h2>
            <span className="text-sm font-bold text-primary">{data.spentPercentage}%</span>
          </div>
          <div className="relative h-4 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                data.spentPercentage > 90 ? "bg-danger" : data.spentPercentage > 70 ? "bg-warning" : "bg-success"
              }`}
              style={{ width: `${Math.min(data.spentPercentage, 100)}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>{t("dashboard.spent_label", { amount: formatCurrency(data.totalSpent) })}</span>
            <span>{t("dashboard.budget_label", { amount: formatCurrency(data.totalBudget) })}</span>
          </div>
        </div>
      )}

      {/* B7: Top NCC by Cost */}
      {vendorStats.length > 0 && (
        <div className="mt-6 rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-base font-semibold text-card-foreground mb-4 flex items-center gap-2">
            <i className="bi bi-building text-primary" /> {t("dashboard.top5_vendor")}
          </h2>
          <div className="space-y-3">
            {vendorStats.map((v, i) => {
              const maxTotal = vendorStats[0]?.total || 1;
              return (
                <div key={v.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-card-foreground">
                      <span className="text-muted-foreground mr-2">#{i+1}</span>{v.name}
                    </span>
                    <span className="text-sm font-bold text-primary">{formatShort(v.total)}</span>
                  </div>
                  <div className="h-4 w-full rounded-md bg-muted overflow-hidden">
                    <div className="h-full rounded-md bg-primary/60 transition-all" style={{ width: `${(v.total / maxTotal) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
