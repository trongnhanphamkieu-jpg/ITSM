"use client";

import { useState, useCallback, useEffect } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { UserAvatar } from "@/components/shared/user-avatar";
import { EmptyState } from "@/components/shared/empty-state";
import { UserFormDialog } from "./user-form-dialog";

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
  department?: string;
  phone?: string;
  lastLoginAt?: string;
  createdAt: string;
}

interface UsersResponse {
  success: boolean;
  data: User[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  manager: "Quản lý",
  staff: "Nhân viên",
  finance: "Kế toán",
  viewer: "Xem",
};

const STATUS_VARIANTS: Record<string, "success" | "danger" | "neutral"> = {
  active: "success",
  locked: "danger",
  inactive: "neutral",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Hoạt động",
  locked: "Bị khóa",
  inactive: "Ngưng",
};

// Mock data for UI development (will be replaced by API calls)
const MOCK_USERS: User[] = [
  {
    id: "1",
    fullName: "Nguyễn Văn Admin",
    email: "admin@haivan.com",
    role: "admin",
    status: "active",
    department: "Phòng CNTT",
    phone: "0901234567",
    lastLoginAt: "2026-03-14T07:00:00Z",
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "2",
    fullName: "Trần Thị Bình",
    email: "binh.tt@haivan.com",
    role: "manager",
    status: "active",
    department: "Phòng Tài chính",
    phone: "0912345678",
    lastLoginAt: "2026-03-13T15:30:00Z",
    createdAt: "2026-01-15T00:00:00Z",
  },
  {
    id: "3",
    fullName: "Lê Minh Cường",
    email: "cuong.lm@haivan.com",
    role: "staff",
    status: "active",
    department: "Phòng CNTT",
    lastLoginAt: "2026-03-12T09:00:00Z",
    createdAt: "2026-02-01T00:00:00Z",
  },
  {
    id: "4",
    fullName: "Phạm Thị Dung",
    email: "dung.pt@haivan.com",
    role: "finance",
    status: "locked",
    department: "Phòng Kế toán",
    createdAt: "2026-02-15T00:00:00Z",
  },
  {
    id: "5",
    fullName: "Hoàng Văn Em",
    email: "em.hv@haivan.com",
    role: "viewer",
    status: "inactive",
    department: "Phòng Hành chính",
    createdAt: "2026-03-01T00:00:00Z",
  },
];

function formatDate(dateStr?: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDateTime(dateStr?: string): string {
  if (!dateStr) return "Chưa đăng nhập";
  const d = new Date(dateStr);
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      !search ||
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = !roleFilter || u.role === roleFilter;
    const matchStatus = !statusFilter || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const handleAdd = () => {
    setEditingUser(null);
    setDialogOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setDialogOpen(true);
  };

  const handleSave = (userData: Partial<User>) => {
    if (editingUser) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id ? { ...u, ...userData } : u
        )
      );
    } else {
      const newUser: User = {
        id: String(Date.now()),
        fullName: userData.fullName || "",
        email: userData.email || "",
        role: userData.role || "staff",
        status: "active",
        department: userData.department,
        phone: userData.phone,
        createdAt: new Date().toISOString(),
      };
      setUsers((prev) => [newUser, ...prev]);
    }
    setDialogOpen(false);
  };

  const handleDisable = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, status: "inactive" } : u
      )
    );
  };

  return (
    <div>
      <PageHeader
        title="Quản lý người dùng"
        description="Danh sách tài khoản hệ thống ITMS"
        actions={
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90"
          >
            <i className="bi bi-plus-lg" />
            Thêm người dùng
          </button>
        }
      />

      {/* Filter Bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary sm:max-w-sm"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="">Tất cả vai trò</option>
            <option value="admin">Admin</option>
            <option value="manager">Quản lý</option>
            <option value="staff">Nhân viên</option>
            <option value="finance">Kế toán</option>
            <option value="viewer">Xem</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="locked">Bị khóa</option>
            <option value="inactive">Ngưng</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <EmptyState
          icon="bi-people"
          title="Không tìm thấy người dùng"
          description="Thay đổi bộ lọc hoặc thêm người dùng mới."
          action={
            <button
              onClick={handleAdd}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Thêm người dùng
            </button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Người dùng
                  </th>
                  <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Vai trò
                  </th>
                  <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Phòng ban
                  </th>
                  <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Đăng nhập cuối
                  </th>
                  <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="group transition-colors hover:bg-primary/5"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar name={user.fullName} />
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {user.fullName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-foreground">
                        {ROLE_LABELS[user.role] || user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-muted-foreground">
                        {user.department || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge
                        variant={STATUS_VARIANTS[user.status] || "neutral"}
                      >
                        {STATUS_LABELS[user.status] || user.status}
                      </StatusBadge>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-muted-foreground">
                        {formatDateTime(user.lastLoginAt)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={() => handleEdit(user)}
                          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          title="Chỉnh sửa"
                        >
                          <i className="bi bi-pencil-square" />
                        </button>
                        {user.status === "active" && (
                          <button
                            onClick={() => handleDisable(user.id)}
                            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger"
                            title="Vô hiệu hóa"
                          >
                            <i className="bi bi-person-dash" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border bg-muted/30 px-6 py-3">
            <p className="text-xs text-muted-foreground">
              Hiển thị {filteredUsers.length} / {users.length} người dùng
            </p>
          </div>
        </div>
      )}

      {/* Form Dialog */}
      <UserFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        user={editingUser}
      />
    </div>
  );
}
