"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";

interface ProjectOption {
  id: string;
  code: string;
  name: string;
}

interface ProjectSelectProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function ProjectSelect({
  value,
  onChange,
  required = false,
  disabled = false,
  placeholder = "Chọn dự án",
  className = "",
}: ProjectSelectProps) {
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await api.get<any>("/projects", { limit: 100, status: "active" });
      setProjects(res.data || []);
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

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
      {projects.map((p) => (
        <option key={p.id} value={p.id}>
          {p.code} — {p.name}
        </option>
      ))}
    </select>
  );
}
