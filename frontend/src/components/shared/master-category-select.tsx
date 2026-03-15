"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";

interface CategoryNode {
  id: string;
  code: string;
  name: string;
  parentId: string | null;
  children?: CategoryNode[];
}

interface MasterCategorySelectProps {
  type: string;
  value: string;
  onChange: (value: string, label?: string) => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function MasterCategorySelect({
  type,
  value,
  onChange,
  required = false,
  disabled = false,
  placeholder = "Chọn danh mục",
  className = "",
}: MasterCategorySelectProps) {
  const [tree, setTree] = useState<CategoryNode[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTree = useCallback(async () => {
    try {
      const res = await api.get<CategoryNode[]>(
        `/master-data/categories/tree/${type}`
      );
      setTree(Array.isArray(res) ? res : (res as any).data || []);
    } catch {
      setTree([]);
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  const renderOptions = (nodes: CategoryNode[], depth = 0): React.ReactNode[] => {
    const options: React.ReactNode[] = [];
    for (const node of nodes) {
      const prefix = depth > 0 ? "─".repeat(depth) + " " : "";
      const isParent = node.children && node.children.length > 0;

      if (isParent) {
        options.push(
          <optgroup key={node.id} label={`${prefix}${node.name}`}>
            {node.children!.map((child) => (
              <option key={child.id} value={child.id}>
                {child.name}
              </option>
            ))}
          </optgroup>
        );
      } else if (depth === 0) {
        options.push(
          <option key={node.id} value={node.id}>
            {prefix}{node.name}
          </option>
        );
      }
    }
    return options;
  };

  return (
    <select
      value={value}
      onChange={(e) => {
        const selectedOption = e.target.options[e.target.selectedIndex];
        onChange(e.target.value, selectedOption?.text || "");
      }}
      required={required}
      disabled={disabled || loading}
      className={`w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 ${className}`}
    >
      <option value="">
        {loading ? "Đang tải..." : placeholder}
      </option>
      {renderOptions(tree)}
    </select>
  );
}
