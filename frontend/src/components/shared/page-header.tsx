"use client";

import { useI18n } from "@/lib/i18n";

// Auto-translation map: Vietnamese title → i18n key
const TITLE_KEY_MAP: Record<string, string> = {
  "Kế hoạch ngân sách": "budget.title",
  "Chi phí thực tế": "costs.title",
  "Dự chi": "forecasts.title",
  "Ngân sách dự án": "projects.title",
  "NCC & Hợp đồng": "vendors.title",
  "Tài sản phần mềm": "inventory.soft.title",
  "Tài sản phần cứng": "inventory.hard.title",
  "Hạ tầng": "infrastructure.title",
  "Chi phí xe": "vehicles.title",
  "Báo cáo": "reports.title",
  "Nhật ký hoạt động": "activity.title",
  "Cấu hình hệ thống": "config.title",
  "Bảo mật": "security.title",
  "Quản lý người dùng": "users.title",
  "Dashboard": "dashboard.title",
};

const DESC_KEY_MAP: Record<string, string> = {
  "Quản lý kế hoạch ngân sách IT theo năm": "budget.desc",
  "Quản lý chi phí thực tế phát sinh": "costs.desc",
  "Quản lý dự toán chi phí IT": "forecasts.desc",
  "Quản lý ngân sách theo dự án IT": "projects.desc",
  "Quản lý nhà cung cấp và hợp đồng": "vendors.desc",
  "Quản lý phần mềm, license, domain, email, SSL và API key": "inventory.soft.desc",
  "Quản lý thiết bị, IP và tài sản phần cứng": "inventory.hard.desc",
  "Quản lý hạ tầng IT": "infrastructure.desc",
  "Quản lý chi phí vận tải và phương tiện": "vehicles.desc",
  "Báo cáo tổng hợp và phân tích dữ liệu": "reports.desc",
  "Theo dõi lịch sử thao tác và thay đổi dữ liệu": "activity.desc",
  "Quản lý thông tin công ty, cảnh báo và thiết lập chung": "config.desc",
  "Cài đặt thông tin công ty và tham số hệ thống": "config.desc",
  "Quản lý xác thực 2 yếu tố và phiên đăng nhập": "security.desc",
  "Quản lý tài khoản và phân quyền": "users.desc",
  "Tổng quan hệ thống quản trị IT": "dashboard.desc",
};

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  const { t } = useI18n();

  // Auto-translate title and description if a mapping exists
  const translatedTitle = TITLE_KEY_MAP[title] ? t(TITLE_KEY_MAP[title]) : title;
  const translatedDesc = description && DESC_KEY_MAP[description] ? t(DESC_KEY_MAP[description]) : description;

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{translatedTitle}</h1>
        {translatedDesc && (
          <p className="mt-1 text-sm text-muted-foreground">{translatedDesc}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
