"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { ExportButton } from "@/components/shared/export-button";
import type { ExportColumn } from "@/components/shared/export-button";

interface MonthData { total: number; paid: number; }
interface VendorReport {
  id: string; name: string; code: string;
  months: Record<number, MonthData>;
  grandTotal: number; grandPaid: number;
}

const MONTH_LABELS = ["T1","T2","T3","T4","T5","T6","T7","T8","T9","T10","T11","T12"];

export default function VendorCostReportPage() {
  const [data, setData] = useState<VendorReport[]>([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ success: boolean; data: VendorReport[]; year: number }>("/vendors/report/costs", { year });
      setData(res.data);
    } catch { /* skip */ }
    setLoading(false);
  }, [year]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Build flat export data
  const exportData = data.flatMap((v) =>
    Object.entries(v.months).map(([m, d]) => ({
      vendorCode: v.code, vendorName: v.name, month: `Tháng ${m}`,
      total: d.total, paid: d.paid, outstanding: d.total - d.paid,
    }))
  );

  const exportCols: ExportColumn[] = [
    { header: "Mã NCC", key: "vendorCode" },
    { header: "Tên NCC", key: "vendorName" },
    { header: "Tháng", key: "month" },
    { header: "Tổng chi phí", key: "total" },
    { header: "Đã TT", key: "paid" },
    { header: "Công nợ", key: "outstanding" },
  ];

  const grandTotalAll = data.reduce((s, v) => s + v.grandTotal, 0);
  const grandPaidAll = data.reduce((s, v) => s + v.grandPaid, 0);

  return (
    <div>
      <nav className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors"><i className="bi bi-house-door" /></Link>
        <span>/</span>
        <span className="text-foreground font-medium">Báo cáo NCC</span>
      </nav>

      <PageHeader
        title="Báo cáo chi phí theo NCC"
        description={`Tổng hợp chi phí phát sinh theo NCC — Năm ${year}`}
        actions={
          <div className="flex items-center gap-2">
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <ExportButton data={exportData} columns={exportCols} filename={`bao_cao_ncc_${year}`} />
          </div>
        }
      />

      {/* KPI */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Tổng chi phí NCC ({year})</p>
          <p className="text-2xl font-bold text-foreground mt-1">{formatCurrency(grandTotalAll)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Đã thanh toán</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(grandPaidAll)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Chưa thanh toán</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(grandTotalAll - grandPaidAll)}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : data.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center shadow-sm">
          <i className="bi bi-bar-chart text-4xl text-muted-foreground" />
          <p className="mt-3 text-base font-medium text-card-foreground">Không có dữ liệu</p>
          <p className="mt-1 text-sm text-muted-foreground">Chưa có chi phí nào liên kết với NCC trong năm {year}</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground sticky left-0 bg-muted/30 z-10">NCC</th>
                {MONTH_LABELS.map((m, i) => (
                  <th key={i} className="px-3 py-3 text-right font-medium text-muted-foreground">{m}</th>
                ))}
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">TỔNG</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">ĐÃ TT</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">CÔNG NỢ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {data.map((v) => (
                <tr key={v.id} className="hover:bg-muted/10">
                  <td className="px-4 py-3 sticky left-0 bg-card z-10">
                    <Link href={`/vendors/${v.id}`} className="text-primary hover:underline font-medium">{v.code}</Link>
                    <p className="text-xs text-muted-foreground">{v.name}</p>
                  </td>
                  {Array.from({ length: 12 }, (_, i) => {
                    const m = v.months[i + 1];
                    return (
                      <td key={i} className="px-3 py-3 text-right text-card-foreground">
                        {m ? formatCurrency(m.total) : "—"}
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 text-right font-bold text-foreground">{formatCurrency(v.grandTotal)}</td>
                  <td className="px-4 py-3 text-right text-emerald-600">{formatCurrency(v.grandPaid)}</td>
                  <td className="px-4 py-3 text-right font-bold text-red-600">{formatCurrency(v.grandTotal - v.grandPaid)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
