"use client";

import { useState, useCallback } from "react";
import * as XLSX from "xlsx";

export interface ExportColumn {
  header: string;
  key: string;
  format?: (value: any, row: any) => string;
}

interface ExportButtonProps {
  data: any[];
  columns: ExportColumn[];
  filename?: string;
  sheetName?: string;
}

export function ExportButton({
  data,
  columns,
  filename = "export",
  sheetName = "Sheet1",
}: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = useCallback(() => {
    if (!data || data.length === 0) return;
    setExporting(true);

    try {
      const rows = data.map((row) => {
        const obj: Record<string, any> = {};
        columns.forEach((col) => {
          const raw = row[col.key];
          obj[col.header] = col.format ? col.format(raw, row) : (raw ?? "");
        });
        return obj;
      });

      const ws = XLSX.utils.json_to_sheet(rows);

      // Auto-width columns
      const colWidths = columns.map((col) => {
        const headerLen = col.header.length;
        const maxDataLen = rows.reduce((max, r) => {
          const val = String(r[col.header] ?? "");
          return Math.max(max, val.length);
        }, 0);
        return { wch: Math.min(Math.max(headerLen, maxDataLen) + 2, 50) };
      });
      ws["!cols"] = colWidths;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, sheetName);

      const dateStr = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(wb, `${filename}_${dateStr}.xlsx`);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
    }
  }, [data, columns, filename, sheetName]);

  return (
    <button
      onClick={handleExport}
      disabled={exporting || !data || data.length === 0}
      className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed"
      title="Xuất Excel"
    >
      {exporting ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        <i className="bi bi-file-earmark-spreadsheet" />
      )}
      {exporting ? "Đang xuất..." : "Excel"}
    </button>
  );
}
