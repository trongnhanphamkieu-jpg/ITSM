"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";

interface UserOption {
  id: string;
  fullName: string;
  email: string;
  department?: string;
}

interface UserSelectProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function UserSelect({
  value,
  onChange,
  required = false,
  disabled = false,
  placeholder = "Chọn nhân viên",
  className = "",
}: UserSelectProps) {
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get<any>("/users", { limit: 200, status: "active" });
      setUsers(res.data || []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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
      {users.map((u) => (
        <option key={u.id} value={u.id}>
          {u.fullName}{u.department ? ` (${u.department})` : ""}
        </option>
      ))}
    </select>
  );
}
