"use client";

import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-danger/10">
        <i className="bi bi-shield-lock text-4xl text-danger" />
      </div>
      <h1 className="mb-2 text-3xl font-bold text-foreground">403</h1>
      <h2 className="mb-4 text-lg font-semibold text-muted-foreground">Không có quyền truy cập</h2>
      <p className="mb-8 max-w-md text-sm text-muted-foreground">
        Bạn không có quyền truy cập trang này. Vui lòng liên hệ quản trị viên
        nếu bạn cho rằng đây là lỗi.
      </p>
      <Link
        href="/"
        className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition"
      >
        <i className="bi bi-house" /> Về trang chủ
      </Link>
    </div>
  );
}
