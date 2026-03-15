"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";

interface VendorOption {
  id: string;
  code: string;
  name: string;
}

interface VendorSelectProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function VendorSelect({
  value,
  onChange,
  required = false,
  disabled = false,
  placeholder = "Chọn nhà cung cấp",
  className = "",
}: VendorSelectProps) {
  const [vendors, setVendors] = useState<VendorOption[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVendors = useCallback(async () => {
    try {
      const res = await api.get<any>("/vendors", { limit: 100, status: "active" });
      setVendors(res.data || []);
    } catch {
      setVendors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      disabled={disabled || loading}
      className={`w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 ${className}`}
    >
      <option value="">
        {loading ? "Đang tải..." : placeholder}
      </option>
      {vendors.map((v) => (
        <option key={v.id} value={v.id}>
          {v.code} — {v.name}
        </option>
      ))}
    </select>
  );
}
