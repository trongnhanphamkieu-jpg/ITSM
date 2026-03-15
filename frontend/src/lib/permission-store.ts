"use client";

import { create } from "zustand";
import { api } from "@/lib/api";

interface ModulePermission {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canExport: boolean;
  canImport: boolean;
  canApprove: boolean;
}

interface PermissionData {
  roleCode: string;
  roleName: string;
  isSystem: boolean;
  modules: Record<string, ModulePermission>;
}

interface PermissionState {
  permissions: PermissionData | null;
  isLoaded: boolean;
  fetchPermissions: () => Promise<void>;
  hasPermission: (module: string, action: string) => boolean;
  canView: (module: string) => boolean;
  canCreate: (module: string) => boolean;
  canEdit: (module: string) => boolean;
  canDelete: (module: string) => boolean;
  canExport: (module: string) => boolean;
  canApprove: (module: string) => boolean;
  clear: () => void;
}

export const usePermissionStore = create<PermissionState>((set, get) => ({
  permissions: null,
  isLoaded: false,

  fetchPermissions: async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        set({ isLoaded: true });
        return;
      }
      const res = await api.get<{ success: boolean; data: PermissionData }>("/auth/me/permissions");
      set({ permissions: res.data, isLoaded: true });
    } catch {
      set({ isLoaded: true });
    }
  },

  hasPermission: (module: string, action: string): boolean => {
    const { permissions } = get();
    if (!permissions) return false;
    // Admin always has all permissions
    if (permissions.roleCode === "admin") return true;
    const mod = permissions.modules[module];
    if (!mod) return false;
    const key = `can${action.charAt(0).toUpperCase()}${action.slice(1)}` as keyof ModulePermission;
    return mod[key] ?? false;
  },

  canView: (module) => get().hasPermission(module, "view"),
  canCreate: (module) => get().hasPermission(module, "create"),
  canEdit: (module) => get().hasPermission(module, "edit"),
  canDelete: (module) => get().hasPermission(module, "delete"),
  canExport: (module) => get().hasPermission(module, "export"),
  canApprove: (module) => get().hasPermission(module, "approve"),

  clear: () => set({ permissions: null, isLoaded: false }),
}));

/**
 * Hook: usePermissions()
 * Usage: const { canView, canCreate, hasPermission } = usePermissions();
 */
export function usePermissions() {
  return usePermissionStore();
}
