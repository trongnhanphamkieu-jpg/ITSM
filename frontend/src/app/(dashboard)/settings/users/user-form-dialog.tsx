"use client";

import { useState, useEffect } from "react";
import { MasterDataSelect } from "@/components/shared";

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
  department?: string;
  phone?: string;
}

interface UserFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<User>) => void;
  user: User | null;
}

export function UserFormDialog({
  open,
  onClose,
  onSave,
  user,
}: UserFormDialogProps) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "staff",
    department: "",
    phone: "",
    status: "active",
  });

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName,
        email: user.email,
        password: "",
        role: user.role,
        department: user.department || "",
        phone: user.phone || "",
        status: user.status,
      });
    } else {
      setForm({
        fullName: "",
        email: "",
        password: "",
        role: "staff",
        department: "",
        phone: "",
        status: "active",
      });
    }
  }, [user, open]);

  if (!open) return null;

  const isEdit = !!user;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(form);
  }

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-lg rounded-xl border border-border bg-card shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 className="text-lg font-bold text-foreground">
              {isEdit ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
            </h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <i className="bi bi-x-lg" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Họ và tên <span className="text-danger">*</span>
              </label>
              <input
                required
                value={form.fullName}
                onChange={(e) => update("fullName", e.target.value)}
                placeholder="Nguyễn Văn An"
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Email <span className="text-danger">*</span>
              </label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="an@haivan.com"
                disabled={isEdit}
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
              />
            </div>

            {!isEdit && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Mật khẩu <span className="text-danger">*</span>
                </label>
                <input
                  required={!isEdit}
                  type="password"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  minLength={6}
                  className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Vai trò
                </label>
                <select
                  value={form.role}
                  onChange={(e) => update("role", e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option value="admin">Admin</option>
                  <option value="manager">Quản lý</option>
                  <option value="staff">Nhân viên</option>
                  <option value="finance">Kế toán</option>
                  <option value="viewer">Xem</option>
                </select>
              </div>

              {isEdit && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Trạng thái
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => update("status", e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    <option value="active">Hoạt động</option>
                    <option value="locked">Bị khóa</option>
                    <option value="inactive">Ngưng</option>
                  </select>
                </div>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Phòng ban
              </label>
              <MasterDataSelect
                type="department"
                value={form.department}
                onChange={(v) => update("department", v)}
                placeholder="Chọn phòng ban"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Số điện thoại
              </label>
              <input
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="0901234567"
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {isEdit ? "Cập nhật" : "Tạo mới"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
