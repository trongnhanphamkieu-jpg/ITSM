"use client";

import { usePermissions } from "@/lib/permission-store";

interface PermissionGateProps {
  module: string;
  action?: string; // defaults to "view"
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * PermissionGate — conditionally render children based on user permissions.
 *
 * Usage:
 *   <PermissionGate module="budget_plan" action="create">
 *     <button>Tạo kế hoạch</button>
 *   </PermissionGate>
 */
export function PermissionGate({
  module,
  action = "view",
  children,
  fallback = null,
}: PermissionGateProps) {
  const { hasPermission, isLoaded } = usePermissions();

  // Not loaded yet → hide
  if (!isLoaded) return null;

  if (hasPermission(module, action)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
