"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { AuthGuard } from "@/components/auth/auth-guard";
import { I18nProvider } from "@/lib/i18n";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthGuard>
      <I18nProvider>
        <div className="min-h-screen bg-background">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          <div className="lg:pl-64 transition-[padding] duration-300">
            <Topbar onMenuClick={() => setSidebarOpen(true)} />

            <main className="p-6 lg:p-8">
              <Breadcrumb />
              {children}
            </main>
          </div>
        </div>
      </I18nProvider>
    </AuthGuard>
  );
}
