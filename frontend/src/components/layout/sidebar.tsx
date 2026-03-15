"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { LanguageSwitch, useI18n } from "@/lib/i18n";

interface NavItem {
  labelKey: string;
  href: string;
  icon: string;
}

interface NavGroup {
  groupKey: string;
  items: NavItem[];
}

const NAV_ITEMS: NavGroup[] = [
  {
    groupKey: "nav.group.overview",
    items: [
      { labelKey: "nav.dashboard", href: "/", icon: "bi-speedometer2" },
    ],
  },
  {
    groupKey: "nav.group.budget",
    items: [
      { labelKey: "nav.budget_plans", href: "/budget/plans", icon: "bi-wallet2" },
      { labelKey: "nav.costs", href: "/costs", icon: "bi-cash-stack" },
      { labelKey: "nav.forecasts", href: "/forecasts", icon: "bi-graph-up-arrow" },
      { labelKey: "nav.projects", href: "/projects", icon: "bi-folder" },
    ],
  },
  {
    groupKey: "nav.group.assets",
    items: [
      { labelKey: "nav.vendors", href: "/vendors", icon: "bi-building" },
      { labelKey: "nav.soft_inventory", href: "/inventory/soft", icon: "bi-laptop" },
      { labelKey: "nav.hard_inventory", href: "/inventory/hard", icon: "bi-pc-display" },
      { labelKey: "nav.infrastructure", href: "/infrastructure", icon: "bi-diagram-3" },
    ],
  },
  {
    groupKey: "nav.group.operations",
    items: [
      { labelKey: "nav.vehicles", href: "/vehicles", icon: "bi-truck" },
      { labelKey: "nav.reports", href: "/reports", icon: "bi-bar-chart-line" },
      { labelKey: "nav.activity_log", href: "/activity-log", icon: "bi-journal-text" },
    ],
  },
  {
    groupKey: "nav.group.system",
    items: [
      { labelKey: "nav.config", href: "/settings/config", icon: "bi-gear" },
      { labelKey: "nav.security", href: "/settings/security", icon: "bi-shield-lock" },
      { labelKey: "nav.users", href: "/settings/users", icon: "bi-people" },
    ],
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useI18n();

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
            <div key={group.groupKey} className="mb-6">
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                {t(group.groupKey)}
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
                        {t(item.labelKey)}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-sidebar-border p-4">
          <p className="text-xs text-sidebar-foreground/40">ITMS v1.0</p>
          <div className="flex items-center gap-1">
            <LanguageSwitch />
            <ThemeToggle />
          </div>
        </div>
      </aside>
    </>
  );
}
