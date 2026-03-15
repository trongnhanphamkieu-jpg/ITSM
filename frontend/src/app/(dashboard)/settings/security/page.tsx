"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";

export default function SecurityPage() {
  const [twoFaEnabled, setTwoFaEnabled] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");
  const [sessions, setSessions] = useState([
    { device: "Chrome — macOS", ip: "192.168.1.100", time: "Đang hoạt động", current: true },
    { device: "Safari — iOS", ip: "10.0.0.15", time: "2 giờ trước", current: false },
  ]);

  const handleEnable2FA = () => {
    if (verifyCode.length === 6) {
      setTwoFaEnabled(true);
      setShowSetup(false);
      setVerifyCode("");
    }
  };

  const INPUT_CLS = "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary";

  return (
    <div>
      <PageHeader title="Bảo mật" description="Quản lý xác thực 2 yếu tố và phiên đăng nhập" />

      <div className="mt-6 space-y-6">
        {/* 2FA Section */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                <i className="bi bi-shield-lock-fill text-lg text-primary" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">Xác thực 2 yếu tố (2FA)</h3>
                <p className="text-sm text-muted-foreground">Bảo vệ tài khoản với mã OTP từ ứng dụng Authenticator</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${twoFaEnabled ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"}`}>
              {twoFaEnabled ? "✓ Đã bật" : "⚠ Chưa bật"}
            </span>
          </div>

          {!twoFaEnabled && !showSetup && (
            <button onClick={() => setShowSetup(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition">
              <i className="bi bi-qr-code" /> Thiết lập 2FA
            </button>
          )}

          {showSetup && (
            <div className="mt-4 p-4 rounded-lg border border-border bg-muted/30 space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-32 h-32 bg-white rounded-lg border border-border flex items-center justify-center">
                  <div className="text-center text-xs text-muted-foreground">
                    <i className="bi bi-qr-code text-4xl text-foreground mb-1" />
                    <p>QR Code 2FA</p>
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  <p className="text-sm text-foreground">
                    <strong>Bước 1:</strong> Tải ứng dụng <strong>Google Authenticator</strong> hoặc <strong>Authy</strong>
                  </p>
                  <p className="text-sm text-foreground">
                    <strong>Bước 2:</strong> Quét mã QR bằng ứng dụng
                  </p>
                  <p className="text-sm text-foreground">
                    <strong>Bước 3:</strong> Nhập mã 6 chữ số từ ứng dụng
                  </p>
                  <div className="flex gap-2">
                    <input type="text" maxLength={6} value={verifyCode} onChange={e => setVerifyCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="Nhập mã 6 số" className={INPUT_CLS + " max-w-[180px] font-mono tracking-widest text-center"} />
                    <button onClick={handleEnable2FA} disabled={verifyCode.length !== 6}
                      className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition">
                      Xác nhận
                    </button>
                    <button onClick={() => { setShowSetup(false); setVerifyCode(""); }}
                      className="px-4 py-2 rounded-lg border border-border text-sm text-foreground hover:bg-muted transition">
                      Hủy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {twoFaEnabled && (
            <div className="mt-4 flex gap-3">
              <button className="px-4 py-2 rounded-lg border border-border text-sm text-foreground hover:bg-muted transition">
                <i className="bi bi-arrow-clockwise mr-1" /> Đặt lại 2FA
              </button>
              <button onClick={() => setTwoFaEnabled(false)}
                className="px-4 py-2 rounded-lg border border-destructive/30 text-sm text-destructive hover:bg-destructive/10 transition">
                <i className="bi bi-x-lg mr-1" /> Tắt 2FA
              </button>
            </div>
          )}
        </div>

        {/* Password Change */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
            <i className="bi bi-key-fill text-primary" /> Đổi mật khẩu
          </h3>
          <div className="grid gap-4 max-w-md">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Mật khẩu hiện tại</label>
              <input type="password" className={INPUT_CLS} placeholder="••••••••" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Mật khẩu mới</label>
              <input type="password" className={INPUT_CLS} placeholder="••••••••" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Xác nhận mật khẩu mới</label>
              <input type="password" className={INPUT_CLS} placeholder="••••••••" />
            </div>
            <button className="w-fit px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition">
              Cập nhật mật khẩu
            </button>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
            <i className="bi bi-laptop text-primary" /> Phiên đăng nhập
          </h3>
          <div className="space-y-3">
            {sessions.map((s, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="flex items-center gap-3">
                  <i className={`bi ${s.device.includes("Chrome") ? "bi-browser-chrome" : "bi-browser-safari"} text-lg text-muted-foreground`} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{s.device}</p>
                    <p className="text-xs text-muted-foreground">{s.ip} — {s.time}</p>
                  </div>
                </div>
                {s.current ? (
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Hiện tại</span>
                ) : (
                  <button className="text-xs text-destructive hover:underline">Thu hồi</button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
