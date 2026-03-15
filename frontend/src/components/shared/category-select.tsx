"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";

interface CategoryOption {
  id: string;
  name: string;
}

interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function CategorySelect({
  value,
  onChange,
  required = false,
  disabled = false,
  placeholder = "Chọn hạng mục",
  className = "",
}: CategorySelectProps) {
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get<{ success: boolean; data: string[] }>("/actual-costs/categories");
      const items = (res.data || []).map((name: string) => ({ id: name, name }));
      setCategories(items);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

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
      {categories.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </select>
  );
}
