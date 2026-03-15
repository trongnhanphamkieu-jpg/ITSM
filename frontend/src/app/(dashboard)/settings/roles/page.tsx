"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/shared/page-header";

const MODULE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  budget_plan: "Kế hoạch NS",
  actual_cost: "Chi phí",
  vendor: "Nhà cung cấp",
  contract: "Hợp đồng",
  soft_inventory: "Phần mềm",
  hard_inventory: "Phần cứng",
  infrastructure: "Hạ tầng",
  vehicle: "Phương tiện",
  cost_forecast: "Dự báo CP",
  project: "Dự án",
  report: "Báo cáo",
  activity_log: "Nhật ký",
  master_data: "Danh mục",
  user_management: "Người dùng",
};

const ACTIONS = [
  { key: "canView", label: "Xem", icon: "bi-eye" },
  { key: "canCreate", label: "Tạo", icon: "bi-plus-circle" },
  { key: "canEdit", label: "Sửa", icon: "bi-pencil" },
  { key: "canDelete", label: "Xóa", icon: "bi-trash" },
  { key: "canExport", label: "Xuất", icon: "bi-download" },
  { key: "canImport", label: "Nhập", icon: "bi-upload" },
  { key: "canApprove", label: "Duyệt", icon: "bi-check-circle" },
];

interface Permission {
  module: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canExport: boolean;
  canImport: boolean;
  canApprove: boolean;
}

interface DynamicRole {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  isActive: boolean;
  permissions: Permission[];
  _count: { users: number };
}

const defaultPermissions = (modules: string[]): Permission[] =>
  modules.map((m) => ({
    module: m,
    canView: false,
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canExport: false,
    canImport: false,
    canApprove: false,
  }));

export default function RolesPage() {
  const [roles, setRoles] = useState<DynamicRole[]>([]);
  const [modules, setModules] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingRole, setEditingRole] = useState<DynamicRole | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  // Create form state
  const [formCode, setFormCode] = useState("");
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formPermissions, setFormPermissions] = useState<Permission[]>([]);

  const fetchRoles = useCallback(async () => {
    setIsLoading(true);
    try {
      const [rolesRes, modsRes] = await Promise.all([
        api.get<DynamicRole[]>("/rbac/roles"),
        api.get<string[]>("/rbac/modules"),
      ]);
      setRoles(Array.isArray(rolesRes) ? rolesRes : []);
      setModules(Array.isArray(modsRes) ? modsRes : []);
    } catch {
      setRoles([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchRoles(); }, [fetchRoles]);

  function openCreate() {
    setFormCode("");
    setFormName("");
    setFormDesc("");
    setFormPermissions(defaultPermissions(modules));
    setEditingRole(null);
    setIsCreating(true);
  }

  function openEdit(role: DynamicRole) {
    setFormCode(role.code);
    setFormName(role.name);
    setFormDesc(role.description || "");
    // Ensure all modules have permissions
    const permMap = new Map(role.permissions.map((p) => [p.module, p]));
    setFormPermissions(
      modules.map((m) => permMap.get(m) || { module: m, canView: false, canCreate: false, canEdit: false, canDelete: false, canExport: false, canImport: false, canApprove: false })
    );
    setEditingRole(role);
    setIsCreating(true);
  }

  function togglePerm(moduleIdx: number, action: string) {
    setFormPermissions((prev) =>
      prev.map((p, i) =>
        i === moduleIdx ? { ...p, [action]: !(p as any)[action] } : p
      )
    );
  }

  function toggleAllModule(moduleIdx: number, value: boolean) {
    setFormPermissions((prev) =>
      prev.map((p, i) =>
        i === moduleIdx
          ? { ...p, canView: value, canCreate: value, canEdit: value, canDelete: value, canExport: value, canImport: value, canApprove: value }
          : p
      )
    );
  }

  function toggleAllAction(action: string, value: boolean) {
    setFormPermissions((prev) =>
      prev.map((p) => ({ ...p, [action]: value }))
    );
  }

  async function handleSave() {
    if (!formCode || !formName) return;
    setSaving(true);
    try {
      if (editingRole) {
        await api.patch(`/rbac/roles/${editingRole.id}`, {
          name: formName,
          description: formDesc || undefined,
          permissions: formPermissions,
        });
      } else {
        await api.post("/rbac/roles", {
          code: formCode,
          name: formName,
          description: formDesc || undefined,
          permissions: formPermissions,
        });
      }
      setIsCreating(false);
      setEditingRole(null);
      fetchRoles();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Lỗi lưu role");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(role: DynamicRole) {
    if (!confirm(`Xóa role "${role.name}"?`)) return;
    try {
      await api.delete(`/rbac/roles/${role.id}`);
      fetchRoles();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Không thể xóa");
    }
  }

  async function handleToggleActive(role: DynamicRole) {
    try {
      await api.patch(`/rbac/roles/${role.id}`, {
        isActive: !role.isActive,
      });
      fetchRoles();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Lỗi");
    }
  }

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Quản lý vai trò" description="Phân quyền động theo module" />
        <div className="animate-pulse space-y-4 mt-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <PageHeader title="Quản lý vai trò" description="Phân quyền động theo module" />
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
        >
          <i className="bi bi-plus-lg" /> Tạo vai trò
        </button>
      </div>

      {/* Roles list */}
      <div className="space-y-3">
        {roles.map((role) => (
          <div
            key={role.id}
            className={`rounded-xl border ${role.isActive ? "border-border" : "border-orange-500/30"} bg-card p-5 shadow-sm transition-shadow hover:shadow-md`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${role.isSystem ? "bg-primary/10 text-primary" : "bg-muted text-foreground"}`}>
                  <i className={`bi ${role.isSystem ? "bi-shield-lock-fill" : "bi-person-gear"} text-lg`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-card-foreground">{role.name}</h3>
                    <span className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{role.code}</span>
                    {role.isSystem && <span className="text-[10px] font-semibold bg-primary/10 text-primary px-1.5 py-0.5 rounded">System</span>}
                    {!role.isActive && <span className="text-[10px] font-semibold bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">Vô hiệu</span>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {role.description || "—"} · {role._count.users} người dùng
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {!role.isSystem && (
                  <button
                    onClick={() => handleToggleActive(role)}
                    className={`rounded-lg p-2 text-sm transition ${role.isActive ? "text-orange-500 hover:bg-orange-50" : "text-emerald-600 hover:bg-emerald-50"}`}
                    title={role.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                  >
                    <i className={`bi ${role.isActive ? "bi-pause-circle" : "bi-play-circle"}`} />
                  </button>
                )}
                <button
                  onClick={() => openEdit(role)}
                  className="rounded-lg p-2 text-sm text-muted-foreground hover:bg-muted transition"
                  title="Chỉnh sửa"
                >
                  <i className="bi bi-pencil" />
                </button>
                {!role.isSystem && (
                  <button
                    onClick={() => handleDelete(role)}
                    className="rounded-lg p-2 text-sm text-danger hover:bg-red-50 transition"
                    title="Xóa"
                  >
                    <i className="bi bi-trash" />
                  </button>
                )}
              </div>
            </div>

            {/* Mini permission summary */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {role.permissions.slice(0, 8).map((p) => {
                const activeCount = ACTIONS.filter((a) => (p as any)[a.key]).length;
                return (
                  <span
                    key={p.module}
                    className={`text-[10px] px-2 py-0.5 rounded-full ${activeCount >= 5 ? "bg-emerald-100 text-emerald-700" : activeCount > 0 ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-400"}`}
                  >
                    {MODULE_LABELS[p.module] || p.module} ({activeCount}/{ACTIONS.length})
                  </span>
                );
              })}
              {role.permissions.length > 8 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  +{role.permissions.length - 8}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal with Permission Matrix */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl bg-card shadow-2xl border border-border">
            <div className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-card-foreground">
                {editingRole ? `Chỉnh sửa: ${editingRole.name}` : "Tạo vai trò mới"}
              </h2>
              <button onClick={() => { setIsCreating(false); setEditingRole(null); }} className="text-muted-foreground hover:text-foreground">
                <i className="bi bi-x-lg text-lg" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-card-foreground">
                    Mã code <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                    disabled={!!editingRole}
                    placeholder="VD: senior_staff"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-card-foreground">
                    Tên hiển thị <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="VD: Nhân viên cấp cao"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-card-foreground">Mô tả</label>
                  <input
                    type="text"
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Mô tả ngắn..."
                    className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Permission Matrix */}
              {editingRole?.isSystem ? (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <p className="text-sm text-blue-700 flex items-center gap-2">
                    <i className="bi bi-info-circle" />
                    System role — không thể thay đổi phân quyền
                  </p>
                </div>
              ) : (
                <div>
                  <h3 className="text-sm font-semibold text-card-foreground mb-3 flex items-center gap-2">
                    <i className="bi bi-grid-3x3-gap text-primary" /> Ma trận phân quyền
                  </h3>
                  <div className="overflow-x-auto rounded-lg border border-border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="px-3 py-2.5 text-left font-semibold text-card-foreground w-40">Module</th>
                          {ACTIONS.map((a) => (
                            <th key={a.key} className="px-2 py-2.5 text-center font-medium text-muted-foreground w-16">
                              <div className="flex flex-col items-center gap-0.5">
                                <i className={`bi ${a.icon} text-xs`} />
                                <span className="text-[10px]">{a.label}</span>
                                <input
                                  type="checkbox"
                                  checked={formPermissions.every((p) => (p as any)[a.key])}
                                  onChange={(e) => toggleAllAction(a.key, e.target.checked)}
                                  className="mt-0.5 h-3.5 w-3.5 rounded border-input accent-primary cursor-pointer"
                                  title={`Tất cả ${a.label}`}
                                />
                              </div>
                            </th>
                          ))}
                          <th className="px-2 py-2.5 text-center font-medium text-muted-foreground w-12">All</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formPermissions.map((perm, idx) => {
                          const allChecked = ACTIONS.every((a) => (perm as any)[a.key]);
                          return (
                            <tr key={perm.module} className="border-t border-border hover:bg-muted/30 transition">
                              <td className="px-3 py-2 font-medium text-card-foreground text-xs">
                                {MODULE_LABELS[perm.module] || perm.module}
                              </td>
                              {ACTIONS.map((a) => (
                                <td key={a.key} className="px-2 py-2 text-center">
                                  <input
                                    type="checkbox"
                                    checked={(perm as any)[a.key]}
                                    onChange={() => togglePerm(idx, a.key)}
                                    className="h-4 w-4 rounded border-input accent-primary cursor-pointer"
                                  />
                                </td>
                              ))}
                              <td className="px-2 py-2 text-center">
                                <input
                                  type="checkbox"
                                  checked={allChecked}
                                  onChange={(e) => toggleAllModule(idx, e.target.checked)}
                                  className="h-4 w-4 rounded border-input accent-primary cursor-pointer"
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={() => { setIsCreating(false); setEditingRole(null); }}
                  className="rounded-lg border border-input px-5 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !formCode || !formName}
                  className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50 transition"
                >
                  {saving ? "Đang lưu..." : editingRole ? "Cập nhật" : "Tạo"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
