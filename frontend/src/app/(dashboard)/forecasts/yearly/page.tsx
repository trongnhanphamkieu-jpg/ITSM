"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import Link from "next/link";

function fmt(n: number) {
  return new Intl.NumberFormat("vi-VN").format(n) + "₫";
}

function YearlySummaryContent() {
  const searchParams = useSearchParams();
  const [year, setYear] = useState(Number(searchParams.get("year")) || new Date().getFullYear());
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await api.get<any[]>("/cost-forecasts/yearly-summary", { year });
      setData(result);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totals = data.reduce(
    (acc, m) => ({
      forecast: acc.forecast + m.forecastTotal,
      actual: acc.actual + m.actualTotal,
    }),
    { forecast: 0, actual: 0 }
  );

  const maxValue = Math.max(...data.map((m) => Math.max(m.forecastTotal, m.actualTotal)), 1);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="text-sm text-muted-foreground flex items-center gap-2">
        <Link href="/" className="hover:text-foreground">🏠</Link>
        <span>/</span>
        <Link href="/forecasts" className="hover:text-foreground">Dự chi</Link>
        <span>/</span>
        <span className="text-foreground">Tổng hợp năm {year}</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">📊 Tổng hợp dự chi năm {year}</h1>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="px-3 py-2 bg-card border border-border rounded-lg text-sm"
        >
          {[2024, 2025, 2026, 2027].map((y) => (
            <option key={y} value={y}>Năm {y}</option>
          ))}
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground font-semibold uppercase">Tổng dự chi cả năm</p>
          <p className="text-xl font-bold text-amber-400 mt-1">{fmt(totals.forecast)}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground font-semibold uppercase">Tổng thực tế cả năm</p>
          <p className="text-xl font-bold text-red-400 mt-1">{fmt(totals.actual)}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground font-semibold uppercase">Chênh lệch</p>
          <p className={`text-xl font-bold mt-1 ${totals.forecast - totals.actual >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {fmt(totals.forecast - totals.actual)}
          </p>
        </div>
      </div>

      {/* Chart-like display */}
      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <h3 className="font-semibold text-foreground">Biểu đồ dự chi vs thực tế theo tháng</h3>
        <div className="space-y-3">
          {data.map((m) => (
            <div key={m.month} className="space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="w-16">{m.name}</span>
                <span>Dự chi: {fmt(m.forecastTotal)} | Thực tế: {fmt(m.actualTotal)}</span>
              </div>
              <div className="flex gap-1">
                <div className="relative h-4 flex-1 bg-muted/50 rounded-full overflow-hidden">
                  <div
                    className="absolute h-full bg-amber-500/60 rounded-full"
                    style={{ width: `${(m.forecastTotal / maxValue) * 100}%` }}
                  />
                  <div
                    className="absolute h-full bg-red-500/60 rounded-full"
                    style={{ width: `${(m.actualTotal / maxValue) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-4 text-xs text-muted-foreground mt-2">
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-amber-500/60 rounded" /> Dự chi</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500/60 rounded" /> Thực tế</span>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-center text-muted-foreground py-8">Đang tải dữ liệu...</p>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">THÁNG</th>
                <th className="px-4 py-3 text-right font-semibold text-muted-foreground">DỰ CHI</th>
                <th className="px-4 py-3 text-right font-semibold text-muted-foreground">THỰC TẾ</th>
                <th className="px-4 py-3 text-right font-semibold text-muted-foreground">CHÊNH LỆCH</th>
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground">% THỰC HIỆN</th>
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground">TRẠNG THÁI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((m) => (
                <tr key={m.month} className="hover:bg-muted/30 transition">
                  <td className="px-4 py-3 text-foreground font-medium">
                    {m.forecastId ? (
                      <Link href={`/forecasts/${m.forecastId}`} className="text-primary hover:underline">{m.name}</Link>
                    ) : m.name}
                  </td>
                  <td className="px-4 py-3 text-right text-amber-400 font-medium">{m.forecastTotal > 0 ? fmt(m.forecastTotal) : "—"}</td>
                  <td className="px-4 py-3 text-right text-red-400 font-medium">{m.actualTotal > 0 ? fmt(m.actualTotal) : "—"}</td>
                  <td className={`px-4 py-3 text-right font-medium ${m.variance >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {m.forecastTotal > 0 || m.actualTotal > 0 ? fmt(m.variance) : "—"}
                  </td>
                  <td className="px-4 py-3 text-center text-muted-foreground">
                    {m.accuracyPct > 0 ? `${m.accuracyPct}%` : "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {m.status ? (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        m.status === "approved" ? "bg-emerald-500/20 text-emerald-400" :
                        m.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                        m.status === "rejected" ? "bg-red-500/20 text-red-400" :
                        "bg-gray-500/20 text-gray-400"
                      }`}>
                        {m.status === "approved" ? "Đã duyệt" : m.status === "pending" ? "Chờ duyệt" :
                         m.status === "rejected" ? "Từ chối" : m.status === "draft" ? "Nháp" : m.status}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Chưa tạo</span>
                    )}
                  </td>
                </tr>
              ))}
              <tr className="bg-muted/30 font-bold">
                <td className="px-4 py-3 text-foreground">Tổng cộng</td>
                <td className="px-4 py-3 text-right text-amber-400">{fmt(totals.forecast)}</td>
                <td className="px-4 py-3 text-right text-red-400">{fmt(totals.actual)}</td>
                <td className={`px-4 py-3 text-right ${totals.forecast - totals.actual >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {fmt(totals.forecast - totals.actual)}
                </td>
                <td className="px-4 py-3 text-center text-muted-foreground">
                  {totals.forecast > 0 ? `${Math.round((totals.actual / totals.forecast) * 10000) / 100}%` : "—"}
                </td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function YearlySummaryPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-muted-foreground">Đang tải...</div>}>
      <YearlySummaryContent />
    </Suspense>
  );
}
