"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type Locale = "vi" | "en";

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const translations: Record<Locale, Record<string, string>> = {
  vi: {
    // Sidebar groups
    "nav.group.overview": "TỔNG QUAN",
    "nav.group.budget": "NGÂN SÁCH",
    "nav.group.assets": "TÀI SẢN",
    "nav.group.operations": "VẬN HÀNH",
    "nav.group.system": "HỆ THỐNG",
    // Sidebar items
    "nav.dashboard": "Dashboard",
    "nav.budget_plans": "Kế hoạch ngân sách",
    "nav.costs": "Chi phí thực tế",
    "nav.forecasts": "Dự chi",
    "nav.projects": "Ngân sách dự án",
    "nav.vendors": "NCC & Hợp đồng",
    "nav.soft_inventory": "Phần mềm",
    "nav.hard_inventory": "Phần cứng",
    "nav.infrastructure": "Hạ tầng",
    "nav.vehicles": "Chi phí xe",
    "nav.reports": "Báo cáo",
    "nav.activity_log": "Nhật ký",
    "nav.config": "Cấu hình",
    "nav.security": "Bảo mật",
    "nav.users": "Người dùng",

    // Dashboard
    "dashboard.title": "Dashboard",
    "dashboard.desc": "Tổng quan hệ thống quản trị IT",
    "dashboard.total_budget": "Tổng ngân sách",
    "dashboard.spent": "Đã chi",
    "dashboard.plan_count": "Kế hoạch NS",
    "dashboard.pending": "Chờ duyệt",
    "dashboard.plans_this_year": "{count} kế hoạch năm nay",
    "dashboard.pct_budget": "{pct}% ngân sách",
    "dashboard.pending_count": "{count} chờ duyệt",
    "dashboard.no_pending": "Không có chờ duyệt",
    "dashboard.need_action": "Cần xử lý",
    "dashboard.cleared": "Đã clear",
    "dashboard.budget_vs_actual": "Ngân sách vs Thực tế",
    "dashboard.recent_activity": "Hoạt động gần đây",
    "dashboard.no_activity": "Chưa có hoạt động nào",
    "dashboard.spending_progress": "Tiến độ chi tiêu",
    "dashboard.spent_label": "Đã chi: {amount}",
    "dashboard.budget_label": "Ngân sách: {amount}",
    "dashboard.top5_vendor": "Top 5 NCC theo chi phí",
    "dashboard.no_budget_data": "Chưa có dữ liệu ngân sách và chi phí",
    "dashboard.alerts": "Cảnh báo",
    "dashboard.today": "Hôm nay",
    "dashboard.days": "{count} ngày",
    "dashboard.budget_alert": "Cảnh báo ngân sách",
    "dashboard.budget_overspend": "Đã chi {pct}% ngân sách",
    "dashboard.legend_budget": "Ngân sách",
    "dashboard.legend_actual": "Thực tế",
    "dashboard.ns": "NS",
    "dashboard.tt": "TT",

    // Filters
    "filter.year": "Năm",
    "filter.quarter": "Quý",
    "filter.month": "Tháng",
    "filter.year_label": "Năm {year}",
    "filter.month_label": "Tháng {month}",
    "filter.expires": "Hết hạn {date}",
    "filter.contract_prefix": "HĐ",

    // Time
    "time.just_now": "vừa xong",
    "time.minutes_ago": "{count} phút trước",
    "time.hours_ago": "{count} giờ trước",
    "time.days_ago": "{count} ngày trước",

    // Number format
    "number.billion": "tỷ",
    "number.million": "tr",

    // Common
    "common.save": "Lưu",
    "common.cancel": "Hủy",
    "common.delete": "Xóa",
    "common.edit": "Sửa",
    "common.create": "Tạo mới",
    "common.search": "Tìm kiếm...",
    "common.filter": "Bộ lọc",
    "common.loading": "Đang tải...",
    "common.no_data": "Chưa có dữ liệu",
    "common.status": "Trạng thái",
    "common.vendor": "Nhà cung cấp",
    "common.active": "Hoạt động",
    "common.inactive": "Ngưng",
    "common.actions": "Thao tác",
    "common.name": "Tên",
    "common.description": "Mô tả",
    "common.amount": "Số tiền",
    "common.date": "Ngày",
    "common.type": "Loại",
    "common.category": "Danh mục",
    "common.notes": "Ghi chú",
    "common.all": "Tất cả",
    "common.add": "Thêm",
    "common.update": "Cập nhật",
    "common.back": "Quay lại",
    "common.confirm": "Xác nhận",
    "common.close": "Đóng",
    "common.view": "Xem",
    "common.download": "Tải xuống",
    "common.upload": "Tải lên",
    "common.total": "Tổng",
    "common.detail": "Chi tiết",
    "common.start_date": "Ngày bắt đầu",
    "common.end_date": "Ngày kết thúc",
    "common.created_at": "Ngày tạo",

    // Budget Plans page
    "budget.title": "Kế hoạch ngân sách",
    "budget.desc": "Quản lý kế hoạch ngân sách IT theo năm",
    "budget.create": "Tạo kế hoạch",
    "budget.plan_name": "Tên kế hoạch",
    "budget.fiscal_year": "Năm tài chính",
    "budget.total_amount": "Tổng ngân sách",
    "budget.approved": "Đã duyệt",
    "budget.draft": "Nháp",
    "budget.pending_approval": "Chờ duyệt",

    // Costs page
    "costs.title": "Chi phí thực tế",
    "costs.desc": "Quản lý chi phí thực tế phát sinh",
    "costs.create": "Thêm chi phí",

    // Forecasts page
    "forecasts.title": "Dự chi",
    "forecasts.desc": "Quản lý dự toán chi phí IT",
    "forecasts.yearly": "Dự chi theo năm",

    // Projects page
    "projects.title": "Ngân sách dự án",
    "projects.desc": "Quản lý ngân sách theo dự án IT",

    // Vendors page
    "vendors.title": "NCC & Hợp đồng",
    "vendors.desc": "Quản lý nhà cung cấp và hợp đồng",
    "vendors.create": "Thêm NCC",
    "vendors.contracts": "Hợp đồng",
    "vendors.contract_create": "Tạo hợp đồng",

    // Inventory pages
    "inventory.soft.title": "Tài sản phần mềm",
    "inventory.soft.desc": "Quản lý phần mềm, license, domain, email, SSL và API key",
    "inventory.hard.title": "Tài sản phần cứng",
    "inventory.hard.desc": "Quản lý thiết bị, IP và tài sản phần cứng",

    // Infrastructure
    "infrastructure.title": "Hạ tầng",
    "infrastructure.desc": "Quản lý hạ tầng IT",

    // Vehicles page
    "vehicles.title": "Chi phí xe",
    "vehicles.desc": "Quản lý chi phí vận tải và phương tiện",

    // Reports page
    "reports.title": "Báo cáo",
    "reports.desc": "Báo cáo tổng hợp và phân tích dữ liệu",

    // Activity log page
    "activity.title": "Nhật ký hoạt động",
    "activity.desc": "Theo dõi lịch sử thao tác và thay đổi dữ liệu",
    "activity.all_time": "Tất cả",
    "activity.my_history": "Lịch sử tôi",
    "activity.all_modules": "Tất cả module",
    "activity.all_actions": "Tất cả thao tác",
    "activity.col_time": "THỜI GIAN",
    "activity.col_user": "NGƯỜI DÙNG",
    "activity.col_module": "MODULE",
    "activity.col_action": "THAO TÁC",
    "activity.col_target": "ĐỐI TƯỢNG",
    "activity.col_ip": "IP",
    "activity.total_logs": "TỔNG LOGS",
    "activity.popular_module": "MODULE PHỔ BIẾN",
    "activity.most_action": "THAO TÁC NHIỀU NHẤT",
    "activity.recent_user": "NGƯỜI DÙNG GẦN ĐÂY",

    // Config page
    "config.title": "Cấu hình hệ thống",
    "config.desc": "Cài đặt thông tin công ty và tham số hệ thống",

    // Security page
    "security.title": "Bảo mật",
    "security.desc": "Quản lý xác thực 2 yếu tố và phiên đăng nhập",
    "security.2fa_title": "Xác thực 2 yếu tố (2FA)",
    "security.2fa_desc": "Bảo vệ tài khoản với mã OTP từ ứng dụng Authenticator",
    "security.2fa_enabled": "✓ Đã bật",
    "security.2fa_disabled": "⚠ Chưa bật",
    "security.setup_2fa": "Thiết lập 2FA",
    "security.reset_2fa": "Đặt lại 2FA",
    "security.disable_2fa": "Tắt 2FA",
    "security.change_password": "Đổi mật khẩu",
    "security.current_password": "Mật khẩu hiện tại",
    "security.new_password": "Mật khẩu mới",
    "security.confirm_password": "Xác nhận mật khẩu mới",
    "security.update_password": "Cập nhật mật khẩu",
    "security.sessions": "Phiên đăng nhập",
    "security.current_session": "Hiện tại",
    "security.revoke": "Thu hồi",

    // Users page
    "users.title": "Quản lý người dùng",
    "users.desc": "Quản lý tài khoản và phân quyền",

    // Topbar
    "topbar.search": "Tìm kiếm...",
  },
  en: {
    // Sidebar groups
    "nav.group.overview": "OVERVIEW",
    "nav.group.budget": "BUDGET",
    "nav.group.assets": "ASSETS",
    "nav.group.operations": "OPERATIONS",
    "nav.group.system": "SYSTEM",
    // Sidebar items
    "nav.dashboard": "Dashboard",
    "nav.budget_plans": "Budget Plans",
    "nav.costs": "Actual Costs",
    "nav.forecasts": "Forecasts",
    "nav.projects": "Projects",
    "nav.vendors": "Vendors & Contracts",
    "nav.soft_inventory": "Software",
    "nav.hard_inventory": "Hardware",
    "nav.infrastructure": "Infrastructure",
    "nav.vehicles": "Vehicles",
    "nav.reports": "Reports",
    "nav.activity_log": "Activity Log",
    "nav.config": "Configuration",
    "nav.security": "Security",
    "nav.users": "Users",

    // Dashboard
    "dashboard.title": "Dashboard",
    "dashboard.desc": "IT Management System Overview",
    "dashboard.total_budget": "Total Budget",
    "dashboard.spent": "Spent",
    "dashboard.plan_count": "Budget Plans",
    "dashboard.pending": "Pending Approval",
    "dashboard.plans_this_year": "{count} plans this year",
    "dashboard.pct_budget": "{pct}% of budget",
    "dashboard.pending_count": "{count} pending",
    "dashboard.no_pending": "No pending items",
    "dashboard.need_action": "Needs action",
    "dashboard.cleared": "All clear",
    "dashboard.budget_vs_actual": "Budget vs Actual",
    "dashboard.recent_activity": "Recent Activity",
    "dashboard.no_activity": "No recent activity",
    "dashboard.spending_progress": "Spending Progress",
    "dashboard.spent_label": "Spent: {amount}",
    "dashboard.budget_label": "Budget: {amount}",
    "dashboard.top5_vendor": "Top 5 Vendors by Cost",
    "dashboard.no_budget_data": "No budget or cost data available",
    "dashboard.alerts": "Alerts",
    "dashboard.today": "Today",
    "dashboard.days": "{count} days",
    "dashboard.budget_alert": "Budget Alert",
    "dashboard.budget_overspend": "Spent {pct}% of budget",
    "dashboard.legend_budget": "Budget",
    "dashboard.legend_actual": "Actual",
    "dashboard.ns": "B",
    "dashboard.tt": "A",

    // Filters
    "filter.year": "Year",
    "filter.quarter": "Quarter",
    "filter.month": "Month",
    "filter.year_label": "Year {year}",
    "filter.month_label": "Month {month}",
    "filter.expires": "Expires {date}",
    "filter.contract_prefix": "Contract",

    // Time
    "time.just_now": "just now",
    "time.minutes_ago": "{count} min ago",
    "time.hours_ago": "{count}h ago",
    "time.days_ago": "{count}d ago",

    // Number format
    "number.billion": "B",
    "number.million": "M",

    // Common
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.create": "Create",
    "common.search": "Search...",
    "common.filter": "Filter",
    "common.loading": "Loading...",
    "common.no_data": "No data",
    "common.status": "Status",
    "common.vendor": "Vendor",
    "common.active": "Active",
    "common.inactive": "Inactive",
    "common.actions": "Actions",
    "common.name": "Name",
    "common.description": "Description",
    "common.amount": "Amount",
    "common.date": "Date",
    "common.type": "Type",
    "common.category": "Category",
    "common.notes": "Notes",
    "common.all": "All",
    "common.add": "Add",
    "common.update": "Update",
    "common.back": "Back",
    "common.confirm": "Confirm",
    "common.close": "Close",
    "common.view": "View",
    "common.download": "Download",
    "common.upload": "Upload",
    "common.total": "Total",
    "common.detail": "Detail",
    "common.start_date": "Start Date",
    "common.end_date": "End Date",
    "common.created_at": "Created At",

    // Budget Plans page
    "budget.title": "Budget Plans",
    "budget.desc": "Manage annual IT budget plans",
    "budget.create": "Create Plan",
    "budget.plan_name": "Plan Name",
    "budget.fiscal_year": "Fiscal Year",
    "budget.total_amount": "Total Budget",
    "budget.approved": "Approved",
    "budget.draft": "Draft",
    "budget.pending_approval": "Pending Approval",

    // Costs page
    "costs.title": "Actual Costs",
    "costs.desc": "Manage actual incurred costs",
    "costs.create": "Add Cost",

    // Forecasts page
    "forecasts.title": "Forecasts",
    "forecasts.desc": "Manage IT cost forecasts",
    "forecasts.yearly": "Yearly Forecasts",

    // Projects page
    "projects.title": "Project Budgets",
    "projects.desc": "Manage budgets by IT project",

    // Vendors page
    "vendors.title": "Vendors & Contracts",
    "vendors.desc": "Manage vendors and contracts",
    "vendors.create": "Add Vendor",
    "vendors.contracts": "Contracts",
    "vendors.contract_create": "Create Contract",

    // Inventory pages
    "inventory.soft.title": "Software Assets",
    "inventory.soft.desc": "Manage software, licenses, domains, emails, SSL and API keys",
    "inventory.hard.title": "Hardware Assets",
    "inventory.hard.desc": "Manage devices, IPs and hardware assets",

    // Infrastructure
    "infrastructure.title": "Infrastructure",
    "infrastructure.desc": "Manage IT infrastructure",

    // Vehicles page
    "vehicles.title": "Vehicle Costs",
    "vehicles.desc": "Manage transport and vehicle expenses",

    // Reports page
    "reports.title": "Reports",
    "reports.desc": "Comprehensive analytics and data reports",

    // Activity log page
    "activity.title": "Activity Log",
    "activity.desc": "Track history of actions and data changes",
    "activity.all_time": "All",
    "activity.my_history": "My History",
    "activity.all_modules": "All modules",
    "activity.all_actions": "All actions",
    "activity.col_time": "TIME",
    "activity.col_user": "USER",
    "activity.col_module": "MODULE",
    "activity.col_action": "ACTION",
    "activity.col_target": "TARGET",
    "activity.col_ip": "IP",
    "activity.total_logs": "TOTAL LOGS",
    "activity.popular_module": "POPULAR MODULE",
    "activity.most_action": "MOST ACTION",
    "activity.recent_user": "RECENT USER",

    // Config page
    "config.title": "System Configuration",
    "config.desc": "Company settings and system parameters",

    // Security page
    "security.title": "Security",
    "security.desc": "Manage two-factor authentication and login sessions",
    "security.2fa_title": "Two-Factor Authentication (2FA)",
    "security.2fa_desc": "Protect your account with OTP from Authenticator app",
    "security.2fa_enabled": "✓ Enabled",
    "security.2fa_disabled": "⚠ Not enabled",
    "security.setup_2fa": "Setup 2FA",
    "security.reset_2fa": "Reset 2FA",
    "security.disable_2fa": "Disable 2FA",
    "security.change_password": "Change Password",
    "security.current_password": "Current Password",
    "security.new_password": "New Password",
    "security.confirm_password": "Confirm New Password",
    "security.update_password": "Update Password",
    "security.sessions": "Login Sessions",
    "security.current_session": "Current",
    "security.revoke": "Revoke",

    // Users page
    "users.title": "User Management",
    "users.desc": "Manage accounts and permissions",

    // Topbar
    "topbar.search": "Search...",
  },
};

const I18nContext = createContext<I18nContextType>({
  locale: "vi",
  setLocale: () => {},
  t: (key: string) => key,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("vi");

  useEffect(() => {
    const stored = localStorage.getItem("itms_locale") as Locale;
    if (stored && (stored === "vi" || stored === "en")) {
      setLocaleState(stored);
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("itms_locale", newLocale);
  }, []);

  const t = useCallback((key: string, params?: Record<string, string | number>) => {
    let text = translations[locale]?.[key] || translations.vi[key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    return text;
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

export function LanguageSwitch() {
  const { locale, setLocale } = useI18n();
  return (
    <button
      id="lang-switch"
      onClick={() => setLocale(locale === "vi" ? "en" : "vi")}
      className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors hover:bg-sidebar-accent text-sidebar-foreground/70 hover:text-sidebar-foreground text-xs font-bold"
      title={locale === "vi" ? "Switch to English" : "Chuyển sang Tiếng Việt"}
    >
      {locale === "vi" ? "EN" : "VI"}
    </button>
  );
}
