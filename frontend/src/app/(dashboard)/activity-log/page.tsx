"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { ExportButton } from "@/components/shared/export-button";
import type { ExportColumn } from "@/components/shared/export-button";
import { useI18n } from "@/lib/i18n";

const LOG_COLUMNS: ExportColumn[] = [
  { header: "Thời gian", key: "createdAt", format: (v: string) => v ? new Date(v).toLocaleString("vi-VN") : "" },
  { header: "Người dùng", key: "user", format: (_: any, r: any) => r.user?.fullName || "" },
  { header: "Email", key: "email", format: (_: any, r: any) => r.user?.email || "" },
  { header: "Module", key: "module" },
  { header: "Thao tác", key: "action" },
  { header: "Đối tượng", key: "entityType" },
  { header: "IP", key: "ipAddress" },
];


interface LogEntry {
  id: string;
  userId: string;
  module: string;
  action: string;
  entityType: string;
  entityId: string | null;
  oldData: any;
  newData: any;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user: { id: string; fullName: string; email: string; role: string };
}

// Locale-aware labels defined inside component below

export default function ActivityLogPage() {
  const { t, locale } = useI18n();

  function fmt(d: string) {
    return new Date(d).toLocaleString(locale === "en" ? "en-US" : "vi-VN", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }

  const ACTION_LABELS: Record<string, { label: string; color: string }> = {
    create: { label: locale === "en" ? "Create" : "Tạo mới", color: "bg-emerald-500/20 text-emerald-400" },
    update: { label: locale === "en" ? "Update" : "Cập nhật", color: "bg-amber-500/20 text-amber-400" },
    delete: { label: locale === "en" ? "Delete" : "Xoá", color: "bg-red-500/20 text-red-400" },
    login: { label: locale === "en" ? "Login" : "Đăng nhập", color: "bg-blue-500/20 text-blue-400" },
    approve: { label: locale === "en" ? "Approve" : "Duyệt", color: "bg-emerald-500/20 text-emerald-400" },
    reject: { label: locale === "en" ? "Reject" : "Từ chối", color: "bg-red-500/20 text-red-400" },
    submit: { label: locale === "en" ? "Submit" : "Gửi duyệt", color: "bg-yellow-500/20 text-yellow-400" },
  };

  const MODULE_LABELS: Record<string, string> = {
    budget: locale === "en" ? "Budget" : "Ngân sách",
    cost: locale === "en" ? "Cost" : "Chi phí",
    vendors: locale === "en" ? "Vendors" : "NCC",
    contracts: locale === "en" ? "Contracts" : "Hợp đồng",
    vehicles: locale === "en" ? "Vehicles" : "Phương tiện",
    projects: locale === "en" ? "Projects" : "Dự án",
    cost_forecasts: locale === "en" ? "Forecasts" : "Dự chi",
    users: locale === "en" ? "Users" : "Người dùng",
    auth: locale === "en" ? "Auth" : "Xác thực",
    emails: "Email",
    domains: "Domain",
    vps: "VPS",
    licenses: locale === "en" ? "Software" : "Phần mềm",
    certificates: "SSL",
    hardware: locale === "en" ? "Hardware" : "Phần cứng",
    infra: locale === "en" ? "Infrastructure" : "Hạ tầng",
  };
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState<string[]>([]);

  // Filters
  const [filterModule, setFilterModule] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "my">("all");

  // Stats
  const [stats, setStats] = useState<any>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const endpoint = activeTab === "my" ? "/activity-log/my-history" : "/activity-log";
      const params: any = { page, limit: 15 };
      if (filterModule) params.module = filterModule;
      if (filterAction) params.action = filterAction;
      if (filterFrom) params.from = filterFrom;
      if (filterTo) params.to = filterTo;
      if (search) params.search = search;

      const result = await api.get<any>(endpoint, params);
      setLogs(result.data || []);
      setTotal(result.total || 0);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [page, filterModule, filterAction, filterFrom, filterTo, search, activeTab]);

  const fetchMeta = useCallback(async () => {
    try {
      const [mods, s] = await Promise.all([
        api.get<string[]>("/activity-log/modules"),
        api.get<any>("/activity-log/stats"),
      ]);
      setModules(mods);
      setStats(s);
    } catch { /* silently fail */ }
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);
  useEffect(() => { fetchMeta(); }, [fetchMeta]);

  const totalPages = Math.ceil(total / 15);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">📋 {t("activity.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("activity.desc")}</p>
        </div>
        <ExportButton data={logs} columns={LOG_COLUMNS} filename="nhat_ky" />
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-xs text-muted-foreground font-semibold uppercase">{t("activity.total_logs")}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{stats.totalLogs?.toLocaleString(locale === "en" ? "en-US" : "vi-VN")}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-xs text-muted-foreground font-semibold uppercase">{t("activity.popular_module")}</p>
            <p className="text-lg font-bold text-amber-400 mt-1">{MODULE_LABELS[stats.byModule?.[0]?.module] || stats.byModule?.[0]?.module || "—"}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-xs text-muted-foreground font-semibold uppercase">{t("activity.most_action")}</p>
            <p className="text-lg font-bold text-emerald-400 mt-1">{ACTION_LABELS[stats.byAction?.[0]?.action]?.label || stats.byAction?.[0]?.action || "—"}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-xs text-muted-foreground font-semibold uppercase">{t("activity.recent_user")}</p>
            <p className="text-lg font-bold text-primary mt-1">{stats.recentUsers?.[0]?.fullName || "—"}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-card rounded-lg border border-border p-1 w-fit">
        <button onClick={() => { setActiveTab("all"); setPage(1); }} className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === "all" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
          {t("activity.all_time")}
        </button>
        <button onClick={() => { setActiveTab("my"); setPage(1); }} className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === "my" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
          {t("activity.my_history")}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text" placeholder={t("common.search")} value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-card border border-border rounded-lg text-sm w-48"
        />
        <select value={filterModule} onChange={(e) => { setFilterModule(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-card border border-border rounded-lg text-sm">
          <option value="">{t("activity.all_modules")}</option>
          {modules.map((m) => <option key={m} value={m}>{MODULE_LABELS[m] || m}</option>)}
        </select>
        <select value={filterAction} onChange={(e) => { setFilterAction(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-card border border-border rounded-lg text-sm">
          <option value="">{t("activity.all_actions")}</option>
          <option value="create">{ACTION_LABELS.create.label}</option>
          <option value="update">{ACTION_LABELS.update.label}</option>
          <option value="delete">{ACTION_LABELS.delete.label}</option>
        </select>
        <input type="date" value={filterFrom} onChange={(e) => { setFilterFrom(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-card border border-border rounded-lg text-sm" />
        <input type="date" value={filterTo} onChange={(e) => { setFilterTo(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-card border border-border rounded-lg text-sm" />
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center text-muted-foreground py-12">{t("common.loading")}</div>
      ) : logs.length === 0 ? (
        <div className="text-center text-muted-foreground py-12 bg-card rounded-xl border border-border">
          <p className="text-4xl mb-2">📭</p>
          <p>{t("common.no_data")}</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{t("activity.col_time")}</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{t("activity.col_user")}</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{t("activity.col_module")}</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{t("activity.col_action")}</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{t("activity.col_target")}</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{t("activity.col_ip")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.map((log) => {
                const actionInfo = ACTION_LABELS[log.action] || { label: log.action, color: "bg-gray-500/20 text-gray-400" };
                return (
                  <tr key={log.id} className="hover:bg-muted/30 transition">
                    <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{fmt(log.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{log.user?.fullName}</div>
                      <div className="text-xs text-muted-foreground">{log.user?.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {MODULE_LABELS[log.module] || log.module}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${actionInfo.color}`}>
                        {actionInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {log.entityType}{log.entityId ? ` #${log.entityId.substring(0, 8)}` : ""}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{log.ipAddress || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{locale === "en" ? `Page ${page} / ${totalPages} (${total} records)` : `Trang ${page} / ${totalPages} (${total} bản ghi)`}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg bg-card border border-border text-sm hover:bg-muted/50 disabled:opacity-40">
              {locale === "en" ? "← Prev" : "← Trước"}
            </button>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-lg bg-card border border-border text-sm hover:bg-muted/50 disabled:opacity-40">
              {locale === "en" ? "Next →" : "Sau →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
