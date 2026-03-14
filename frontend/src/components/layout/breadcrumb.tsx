"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ROUTE_LABELS: Record<string, string> = {
  "/": "Dashboard",
  "/budgets": "Kế hoạch ngân sách",
  "/costs": "Chi phí thực tế",
  "/forecasts": "Dự chi",
  "/projects": "Ngân sách dự án",
  "/vendors": "NCC & Hợp đồng",
  "/inventory/soft": "Phần mềm",
  "/inventory/hard": "Phần cứng",
  "/infrastructure": "Hạ tầng",
  "/vehicles": "Chi phí xe",
  "/reports": "Báo cáo",
  "/activity-log": "Nhật ký hoạt động",
  "/settings/config": "Cấu hình",
  "/settings/users": "Người dùng",
};

function getBreadcrumbs(pathname: string) {
  if (pathname === "/") return [];

  const segments = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; href: string }[] = [];

  let currentPath = "";
  for (const segment of segments) {
    currentPath += `/${segment}`;
    const label =
      ROUTE_LABELS[currentPath] ||
      segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
    crumbs.push({ label, href: currentPath });
  }

  return crumbs;
}

export function Breadcrumb() {
  const pathname = usePathname();
  const crumbs = getBreadcrumbs(pathname);

  if (crumbs.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center gap-1.5 text-sm">
        <li>
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <i className="bi bi-house text-xs" />
          </Link>
        </li>
        {crumbs.map((crumb, index) => (
          <li key={crumb.href} className="flex items-center gap-1.5">
            <i className="bi bi-chevron-right text-[10px] text-muted-foreground/50" />
            {index === crumbs.length - 1 ? (
              <span className="font-medium text-foreground">{crumb.label}</span>
            ) : (
              <Link
                href={crumb.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
