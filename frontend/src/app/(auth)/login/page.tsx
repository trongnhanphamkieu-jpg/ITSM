"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuthStore } from "@/lib/auth-store";
import { ApiError } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const login = useAuthStore((s) => s.login);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      router.push("/");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Đã có lỗi xảy ra. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left: Branding */}
      <div className="hidden w-1/2 items-center justify-center bg-sidebar lg:flex">
        <div className="flex flex-col items-center">
          <Image
            src="/logo.png"
            alt="HAI VAN+"
            width={200}
            height={48}
            className="h-12 w-auto brightness-0 invert"
            priority
          />
          <div className="mt-16 text-center">
            <h1 className="text-3xl font-bold text-white">ITMS</h1>
            <p className="mt-2 text-sm text-white/60">
              Hệ thống Quản trị Công nghệ Thông tin
            </p>
          </div>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="flex w-full items-center justify-center px-6 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 flex flex-col items-center gap-4 lg:hidden">
            <Image
              src="/logo.png"
              alt="HAI VAN+"
              width={140}
              height={32}
              className="h-8 w-auto"
              priority
            />
            <span className="text-xl font-bold">ITMS</span>
          </div>

          <h2 className="text-2xl font-bold text-foreground">Đăng nhập</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Nhập thông tin tài khoản để tiếp tục
          </p>

          {error && (
            <div className="mt-4 rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">
              <i className="bi bi-exclamation-circle mr-2" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Email
              </label>
              <div className="relative">
                <i className="bi bi-envelope absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@company.com"
                  className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Mật khẩu
              </label>
              <div className="relative">
                <i className="bi bi-lock absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-10 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <i
                    className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}
                  />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Đang đăng nhập...
                </span>
              ) : (
                "Đăng nhập"
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            © 2026 ITMS — IT Management System
          </p>
        </div>
      </div>
    </div>
  );
}
