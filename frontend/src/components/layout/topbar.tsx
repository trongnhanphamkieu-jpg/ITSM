"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { api } from "@/lib/api";

interface TopbarProps {
  onMenuClick: () => void;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

function timeAgo(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return "Vừa xong";
  if (s < 3600) return `${Math.floor(s / 60)} phút trước`;
  if (s < 86400) return `${Math.floor(s / 3600)} giờ trước`;
  return `${Math.floor(s / 86400)} ngày trước`;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchUnread = useCallback(async () => {
    try {
      const res = await api.get<any>("/notifications/unread-count");
      setUnreadCount(res.data.unreadCount);
    } catch {
      /* ignore if not logged in */
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get<any>("/notifications", { limit: 10 });
      setNotifications(res.data);
    } catch {
      /* */
    }
  }, []);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [fetchUnread]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = async () => {
    if (!showDropdown) {
      await fetchNotifications();
    }
    setShowDropdown(!showDropdown);
  };

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      /* */
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      /* */
    }
  };

  const ICON_MAP: Record<string, string> = {
    contract_expiry: "bi-calendar-x text-orange-500",
    budget_approval: "bi-check-circle text-emerald-500",
    system: "bi-info-circle text-blue-500",
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card px-6">
      {/* Left: Menu toggle + Search */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden"
          aria-label="Toggle sidebar"
        >
          <i className="bi bi-list text-xl" />
        </button>

        <div className="hidden items-center gap-2 rounded-lg bg-muted px-3 py-2 sm:flex">
          <i className="bi bi-search text-sm text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="w-48 bg-transparent text-sm outline-none placeholder:text-muted-foreground lg:w-64"
          />
          <kbd className="hidden rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground md:inline-block">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={toggleDropdown}
            className="relative rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <i className="bi bi-bell text-lg" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-border bg-card shadow-lg sm:w-96">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <h3 className="text-sm font-semibold text-foreground">
                  Thông báo
                  {unreadCount > 0 && (
                    <span className="ml-1.5 inline-flex items-center rounded-full bg-danger/10 px-1.5 py-0.5 text-xs font-medium text-danger">
                      {unreadCount}
                    </span>
                  )}
                </h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Đọc tất cả
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-8">
                    <i className="bi bi-bell-slash text-2xl text-muted" />
                    <p className="text-sm text-muted">Không có thông báo</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => !n.isRead && markAsRead(n.id)}
                      className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/50 ${
                        !n.isRead ? "bg-primary/5" : ""
                      }`}
                    >
                      <i
                        className={`bi mt-0.5 text-base ${
                          ICON_MAP[n.type] || ICON_MAP.system
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm ${
                            !n.isRead ? "font-semibold text-foreground" : "text-foreground/80"
                          }`}
                        >
                          {n.title}
                        </p>
                        <p className="mt-0.5 text-xs text-muted line-clamp-2">
                          {n.message}
                        </p>
                        <p className="mt-1 text-xs text-muted">
                          {timeAgo(n.createdAt)}
                        </p>
                      </div>
                      {!n.isRead && (
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User avatar */}
        <button className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-accent">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            AD
          </div>
          <div className="hidden text-left md:block">
            <p className="text-sm font-medium">Admin</p>
            <p className="text-xs text-muted-foreground">IT Manager</p>
          </div>
          <i className="bi bi-chevron-down hidden text-xs text-muted-foreground md:block" />
        </button>
      </div>
    </header>
  );
}
