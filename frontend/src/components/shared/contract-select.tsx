"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";

interface ContractOption {
  id: string;
  code: string;
  name: string;
}

interface ContractSelectProps {
  value: string;
  onChange: (value: string) => void;
  vendorId?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function ContractSelect({
  value,
  onChange,
  vendorId,
  required = false,
  disabled = false,
  placeholder = "Chọn hợp đồng",
  className = "",
}: ContractSelectProps) {
  const [contracts, setContracts] = useState<ContractOption[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { limit: 100 };
      if (vendorId) params.vendorId = vendorId;
      const res = await api.get<any>("/contracts", params);
      setContracts(res.data || []);
    } catch {
      setContracts([]);
    } finally {
      setLoading(false);
    }
  }, [vendorId]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  useEffect(() => {
    if (vendorId && value) {
      const exists = contracts.find((c) => c.id === value);
      if (!exists && contracts.length > 0) onChange("");
    }
  }, [vendorId, contracts, value, onChange]);

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
      {contracts.map((c) => (
        <option key={c.id} value={c.id}>
          {c.code} — {c.name}
        </option>
      ))}
    </select>
  );
}
