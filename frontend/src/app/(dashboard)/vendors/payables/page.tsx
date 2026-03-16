"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";

interface VendorPayable {
  id: string;
  name: string;
  code: string;
  totalCosts: number;
  totalAmount: number;
  totalPaid: number;
  outstanding: number;
}

export default function PayablesSummaryPage() {
  const [data, setData] = useState<VendorPayable[]>([]);
  const [grandTotal, setGrandTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ success: boolean; data: VendorPayable[]; grandTotal: number }>("/vendors/payables/summary");
      setData(res.data);
      setGrandTotal(res.grandTotal);
    } catch { /* skip */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div>
      <nav className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors"><i className="bi bi-house-door" /></Link>
        <span>/</span>
        <span className="text-foreground font-medium">Công nợ NCC</span>
      </nav>

      <PageHeader
        title="Tổng hợp công nợ NCC"
        description="Theo dõi công nợ phải trả từng nhà cung cấp"
      />

      {/* KPI */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Tổng công nợ</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(grandTotal)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Số NCC có công nợ</p>
          <p className="text-2xl font-bold text-foreground mt-1">{data.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Tổng giao dịch chưa TT</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">{data.reduce((s, v) => s + v.totalCosts, 0)}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : data.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center shadow-sm">
          <i className="bi bi-check-circle text-4xl text-emerald-500" />
          <p className="mt-3 text-base font-medium text-card-foreground">Không có công nợ</p>
          <p className="mt-1 text-sm text-muted-foreground">Tất cả chi phí đã được thanh toán</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">MÃ NCC</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">TÊN NCC</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">GD CHƯA TT</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">TỔNG PHẢI TRẢ</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">ĐÃ THANH TOÁN</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">CÔNG NỢ CÒN</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">TIẾN ĐỘ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {data.map((v) => {
                const pct = v.totalAmount > 0 ? Math.round((v.totalPaid / v.totalAmount) * 100) : 0;
                return (
                  <tr key={v.id} className="hover:bg-muted/10">
                    <td className="px-6 py-3 font-medium text-primary">
                      <Link href={`/vendors/${v.id}`} className="hover:underline">{v.code}</Link>
                    </td>
                    <td className="px-4 py-3 text-card-foreground">{v.name}</td>
                    <td className="px-4 py-3 text-right text-card-foreground">{v.totalCosts}</td>
                    <td className="px-4 py-3 text-right font-medium text-card-foreground">{formatCurrency(v.totalAmount)}</td>
                    <td className="px-4 py-3 text-right text-emerald-600">{formatCurrency(v.totalPaid)}</td>
                    <td className="px-4 py-3 text-right font-bold text-red-600">{formatCurrency(v.outstanding)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-center">
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${pct >= 100 ? 'bg-emerald-500' : pct > 0 ? 'bg-blue-500' : 'bg-orange-400'}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
