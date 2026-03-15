"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/shared/page-header";

interface SystemConfig {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  budgetAlertThreshold: number;
  contractExpiryDays: number;
  domainExpiryDays: number;
  sslExpiryDays: number;
  defaultCurrency: string;
  fiscalYearStart: number;
}

const DEFAULT_CONFIG: SystemConfig = {
  companyName: "Hải Vân Group",
  companyAddress: "Đà Nẵng, Việt Nam",
  companyPhone: "+84 236 3888 888",
  companyEmail: "admin@haivan.com",
  budgetAlertThreshold: 80,
  contractExpiryDays: 30,
  domainExpiryDays: 30,
  sslExpiryDays: 30,
  defaultCurrency: "VND",
  fiscalYearStart: 1,
};

const INPUT_CLS = "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary";

function ConfigSection({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
        <i className={`bi ${icon} text-primary`} />
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-muted-foreground mb-1">{label}</label>
      {children}
    </div>
  );
}

export default function ConfigPage() {
  const [config, setConfig] = useState<SystemConfig>(DEFAULT_CONFIG);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("itms_config");
    if (stored) {
      try { setConfig({ ...DEFAULT_CONFIG, ...JSON.parse(stored) }); } catch {}
    }
  }, []);

  const handleSave = () => {
    setSaving(true);
    localStorage.setItem("itms_config", JSON.stringify(config));
    setTimeout(() => { setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000); }, 300);
  };

  const update = (key: keyof SystemConfig, value: any) => setConfig(prev => ({ ...prev, [key]: value }));

  return (
    <div>
      <PageHeader title="Cấu hình hệ thống" description="Quản lý thông tin công ty, cảnh báo và thiết lập chung"
        actions={
          <button onClick={handleSave} disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition disabled:opacity-50">
            {saving ? <><i className="bi bi-arrow-repeat animate-spin" /> Đang lưu...</> : saved ? <><i className="bi bi-check-lg" /> Đã lưu</> : <><i className="bi bi-floppy" /> Lưu cấu hình</>}
          </button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2 mt-6">
        <ConfigSection title="Thông tin công ty" icon="bi-building">
          <Field label="Tên công ty">
            <input type="text" value={config.companyName} onChange={e => update("companyName", e.target.value)} className={INPUT_CLS} />
          </Field>
          <Field label="Địa chỉ">
            <input type="text" value={config.companyAddress} onChange={e => update("companyAddress", e.target.value)} className={INPUT_CLS} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Điện thoại">
              <input type="text" value={config.companyPhone} onChange={e => update("companyPhone", e.target.value)} className={INPUT_CLS} />
            </Field>
            <Field label="Email">
              <input type="email" value={config.companyEmail} onChange={e => update("companyEmail", e.target.value)} className={INPUT_CLS} />
            </Field>
          </div>
        </ConfigSection>

        <ConfigSection title="Ngưỡng cảnh báo" icon="bi-bell">
          <Field label="Ngưỡng cảnh báo ngân sách (%)">
            <div className="flex items-center gap-3">
              <input type="range" min="50" max="100" value={config.budgetAlertThreshold}
                onChange={e => update("budgetAlertThreshold", Number(e.target.value))} className="flex-1" />
              <span className="text-sm font-bold text-primary w-12 text-right">{config.budgetAlertThreshold}%</span>
            </div>
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="HĐ sắp hết hạn (ngày)">
              <input type="number" min="1" max="90" value={config.contractExpiryDays}
                onChange={e => update("contractExpiryDays", Number(e.target.value))} className={INPUT_CLS} />
            </Field>
            <Field label="Domain sắp hết hạn">
              <input type="number" min="1" max="90" value={config.domainExpiryDays}
                onChange={e => update("domainExpiryDays", Number(e.target.value))} className={INPUT_CLS} />
            </Field>
            <Field label="SSL sắp hết hạn">
              <input type="number" min="1" max="90" value={config.sslExpiryDays}
                onChange={e => update("sslExpiryDays", Number(e.target.value))} className={INPUT_CLS} />
            </Field>
          </div>
        </ConfigSection>

        <ConfigSection title="Thiết lập chung" icon="bi-gear">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Đơn vị tiền tệ">
              <select value={config.defaultCurrency} onChange={e => update("defaultCurrency", e.target.value)} className={INPUT_CLS}>
                <option value="VND">VND - Việt Nam Đồng</option>
                <option value="USD">USD - US Dollar</option>
              </select>
            </Field>
            <Field label="Tháng bắt đầu năm tài chính">
              <select value={config.fiscalYearStart} onChange={e => update("fiscalYearStart", Number(e.target.value))} className={INPUT_CLS}>
                {Array.from({length: 12}, (_, i) => (
                  <option key={i+1} value={i+1}>Tháng {i+1}</option>
                ))}
              </select>
            </Field>
          </div>
        </ConfigSection>

        <ConfigSection title="Thông tin hệ thống" icon="bi-info-circle">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Phiên bản</span><span className="font-medium text-foreground">ITMS v1.0</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Framework</span><span className="font-medium text-foreground">Next.js 15 + NestJS</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Database</span><span className="font-medium text-foreground">PostgreSQL + Prisma</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Môi trường</span><span className="font-medium text-foreground">Development</span></div>
          </div>
        </ConfigSection>
      </div>
    </div>
  );
}
