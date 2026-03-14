"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    group: "TỔNG QUAN",
    items: [
      { label: "Dashboard", href: "/", icon: "bi-speedometer2" },
    ],
  },
  {
    group: "NGÂN SÁCH",
    items: [
      { label: "Kế hoạch ngân sách", href: "/budget/plans", icon: "bi-wallet2" },
      { label: "Chi phí thực tế", href: "/costs", icon: "bi-cash-stack" },
      { label: "Dự chi", href: "/forecasts", icon: "bi-graph-up-arrow" },
      { label: "Ngân sách dự án", href: "/projects", icon: "bi-folder" },
    ],
  },
  {
    group: "TÀI SẢN",
    items: [
      { label: "NCC & Hợp đồng", href: "/vendors", icon: "bi-building" },
      { label: "Phần mềm", href: "/inventory/soft", icon: "bi-laptop" },
      { label: "Phần cứng", href: "/inventory/hard", icon: "bi-pc-display" },
      { label: "Hạ tầng", href: "/infrastructure", icon: "bi-diagram-3" },
    ],
  },
  {
    group: "VẬN HÀNH",
    items: [
      { label: "Chi phí xe", href: "/vehicles", icon: "bi-truck" },
      { label: "Báo cáo", href: "/reports", icon: "bi-bar-chart-line" },
      { label: "Nhật ký", href: "/activity-log", icon: "bi-journal-text" },
    ],
  },
  {
    group: "HỆ THỐNG",
    items: [
      { label: "Cấu hình", href: "/settings/config", icon: "bi-gear" },
      { label: "Người dùng", href: "/settings/users", icon: "bi-people" },
    ],
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
          <Image
            src="/logo.png"
            alt="HAI VAN+"
            width={120}
            height={28}
            className="h-7 w-auto brightness-0 invert"
            priority
          />
          <span className="text-lg font-semibold tracking-tight">ITMS</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map((group) => (
            <div key={group.group} className="mb-6">
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                {group.group}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(item.href));

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-sidebar-accent text-sidebar-primary"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                        )}
                      >
                        <i
                          className={cn(
                            "bi text-base",
                            item.icon,
                            isActive && "text-sidebar-primary"
                          )}
                        />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-4">
          <p className="text-xs text-sidebar-foreground/40">ITMS v1.0 — 2026</p>
        </div>
      </aside>
    </>
  );
}
