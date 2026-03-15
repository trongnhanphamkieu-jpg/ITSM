"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";

interface MasterDataOption {
  id: string;
  code: string;
  name: string;
}

interface MasterDataSelectProps {
  type: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function MasterDataSelect({
  type,
  value,
  onChange,
  required = false,
  disabled = false,
  placeholder,
  className = "",
}: MasterDataSelectProps) {
  const [items, setItems] = useState<MasterDataOption[]>([]);
  const [loading, setLoading] = useState(true);

  const typeLabels: Record<string, string> = {
    department: "Chọn phòng ban",
    contract_type: "Chọn loại hợp đồng",
    environment: "Chọn môi trường",
    location: "Chọn vị trí",
    vehicle_type: "Chọn loại xe",
    fuel_type: "Chọn loại nhiên liệu",
    maintenance_type: "Chọn loại bảo trì",
    payment_method: "Chọn phương thức TT",
    unit_of_measure: "Chọn đơn vị tính",
    asset_category: "Chọn loại tài sản",
  };

  const fetchItems = useCallback(async () => {
    try {
      const res = await api.get<MasterDataOption[]>(
        `/master-data/items/by-type/${type}`
      );
      setItems(Array.isArray(res) ? res : (res as any).data || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const defaultPlaceholder = placeholder || typeLabels[type] || `Chọn ${type}`;

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      disabled={disabled || loading}
      className={`w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 ${className}`}
    >
      <option value="">
        {loading ? "Đang tải..." : defaultPlaceholder}
      </option>
      {items.map((item) => (
        <option key={item.id} value={item.id}>
          {item.name}
        </option>
      ))}
    </select>
  );
}
