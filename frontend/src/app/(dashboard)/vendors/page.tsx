"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { ExportButton } from "@/components/shared/export-button";
import type { ExportColumn } from "@/components/shared/export-button";
import { useI18n } from "@/lib/i18n";

const VENDOR_EXPORT_COLUMNS: ExportColumn[] = [
  { header: "Mã NCC", key: "code" },
  { header: "Tên NCC", key: "name" },
  { header: "MST", key: "taxCode" },
  { header: "Email", key: "email" },
  { header: "Điện thoại", key: "phone" },
  { header: "Địa chỉ", key: "address" },
  { header: "Trạng thái", key: "status" },
  { header: "Số HĐ", key: "_count", format: (_: any, r: any) => String(r._count?.contracts || 0) },
];


interface Vendor {
  id: string;
  code: string;
  name: string;
  taxCode?: string;
  email?: string;
  phone?: string;
  address?: string;
  status: string;
  _count: { contracts: number };
  createdBy: { fullName: string };
  createdAt: string;
}

export default function VendorsPage() {
  const { t, locale } = useI18n();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 0 });

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<any>("/vendors", {
        search: search || undefined,
        status: status || undefined,
        page,
        limit: 20,
      });
      setVendors(res.data);
      setMeta(res.meta);
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  }, [search, status, page]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("vendors.title")}</h1>
          <p className="mt-1 text-sm text-muted">
            {t("vendors.desc")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton data={vendors} columns={VENDOR_EXPORT_COLUMNS} filename="nha_cung_cap" />
          <Link
            href="/vendors/create"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-dark"
          >
            <i className="bi bi-plus-lg" />
            {t("vendors.create")}
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder={locale === "en" ? "Search by name, code, tax..." : "Tìm theo tên, mã, MST..."}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">{locale === "en" ? "All statuses" : "Tất cả trạng thái"}</option>
          <option value="active">{t("common.active")}</option>
          <option value="inactive">{t("common.inactive")}</option>
        </select>
      </div>

      {/* Desktop Table */}
      <div className="hidden overflow-hidden rounded-xl border border-border bg-surface shadow-sm md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-surface-secondary">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground/60">
                Mã
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground/60">
                Tên NCC
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground/60">
                MST
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground/60">
                Liên hệ
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-foreground/60">
                Hợp đồng
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-foreground/60">
                Trạng thái
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-foreground/60">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-muted">
                  <i className="bi bi-arrow-repeat animate-spin text-xl" />{" "}
                  Đang tải...
                </td>
              </tr>
            ) : vendors.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <i className="bi bi-building text-4xl text-muted" />
                    <p className="text-muted">Chưa có nhà cung cấp nào</p>
                    <Link
                      href="/vendors/create"
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Thêm NCC đầu tiên
                    </Link>
                  </div>
                </td>
              </tr>
            ) : (
              vendors.map((v) => (
                <tr
                  key={v.id}
                  className="transition-colors hover:bg-surface-secondary/50"
                >
                  <td className="px-4 py-3 text-sm font-mono text-foreground/70">
                    {v.code}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/vendors/${v.id}`}
                      className="text-sm font-medium text-foreground hover:text-primary"
                    >
                      {v.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {v.taxCode || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {v.email || v.phone || "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                      <i className="bi bi-file-earmark-text" />
                      {v._count.contracts}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        v.status === "active"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {v.status === "active"
                        ? "Hoạt động"
                        : "Ngừng"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/vendors/${v.id}`}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-primary hover:bg-primary/5"
                    >
                      <i className="bi bi-eye" />
                      Xem
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="space-y-3 md:hidden">
        {loading ? (
          <div className="py-12 text-center text-muted">
            <i className="bi bi-arrow-repeat animate-spin text-xl" /> Đang
            tải...
          </div>
        ) : vendors.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12">
            <i className="bi bi-building text-4xl text-muted" />
            <p className="text-muted">Chưa có nhà cung cấp nào</p>
          </div>
        ) : (
          vendors.map((v) => (
            <Link
              key={v.id}
              href={`/vendors/${v.id}`}
              className="block rounded-xl border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {v.name}
                  </p>
                  <p className="mt-0.5 text-xs font-mono text-foreground/70">{v.code}</p>
                </div>
                <span
                  className={`ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    v.status === "active"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {v.status === "active" ? "Hoạt động" : "Ngừng"}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-4 text-xs text-foreground/70">
                {v.taxCode && (
                  <span>
                    <i className="bi bi-hash" /> {v.taxCode}
                  </span>
                )}
                <span>
                  <i className="bi bi-file-earmark-text" /> {v._count.contracts}{" "}
                  HĐ
                </span>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
          <p className="text-sm text-muted">
            Tổng: <span className="font-medium text-foreground">{meta.total}</span> NCC
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-md px-3 py-1 text-sm text-muted hover:bg-surface-secondary disabled:opacity-50"
            >
              ‹ Trước
            </button>
            <span className="flex items-center px-3 text-sm font-medium">
              {page} / {meta.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              disabled={page === meta.totalPages}
              className="rounded-md px-3 py-1 text-sm text-muted hover:bg-surface-secondary disabled:opacity-50"
            >
              Sau ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
