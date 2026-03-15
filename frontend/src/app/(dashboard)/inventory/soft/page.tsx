"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { VendorSelect } from "@/components/shared/vendor-select";
import { ContractSelect } from "@/components/shared/contract-select";
import { ExportButton } from "@/components/shared/export-button";

type TabKey = "email" | "domain" | "vps" | "license" | "ssl" | "apikey";

interface TabConfig {
  key: TabKey;
  label: string;
  icon: string;
  endpoint: string;
  columns: { key: string; label: string; render?: (item: any) => string }[];
  createFields: { key: string; label: string; type: string; required?: boolean; options?: { value: string; label: string }[] }[];
}

const TABS: TabConfig[] = [
  {
    key: "email",
    label: "Email",
    icon: "bi-envelope",
    endpoint: "/soft-inventory/email-accounts",
    columns: [
      { key: "email", label: "Email" },
      { key: "provider", label: "Nhà cung cấp" },
      { key: "assignedTo", label: "Gán cho" },
      { key: "quotaMb", label: "Dung lượng", render: (i: any) => `${i.usedMb || 0}/${i.quotaMb || 0} MB` },
      { key: "status", label: "Trạng thái" },
    ],
    createFields: [
      { key: "email", label: "Email", type: "text", required: true },
      { key: "vendorId", label: "Nhà cung cấp", type: "vendor-select" },
      { key: "contractId", label: "Hợp đồng", type: "contract-select" },
      { key: "provider", label: "Provider (tham khảo)", type: "text" },
      { key: "quotaMb", label: "Dung lượng (MB)", type: "number" },
      { key: "assignedTo", label: "Gán cho", type: "text" },
      { key: "notes", label: "Ghi chú", type: "textarea" },
    ],
  },
  {
    key: "domain",
    label: "Tên miền",
    icon: "bi-globe",
    endpoint: "/soft-inventory/domains",
    columns: [
      { key: "domain", label: "Tên miền" },
      { key: "registrar", label: "Nhà đăng ký" },
      { key: "expiryDate", label: "Hết hạn", render: (i: any) => i.expiryDate ? new Date(i.expiryDate).toLocaleDateString("vi-VN") : "—" },
      { key: "autoRenew", label: "Tự động gia hạn", render: (i: any) => i.autoRenew ? "Có" : "Không" },
      { key: "status", label: "Trạng thái" },
    ],
    createFields: [
      { key: "domain", label: "Tên miền", type: "text", required: true },
      { key: "vendorId", label: "Nhà cung cấp", type: "vendor-select" },
      { key: "contractId", label: "Hợp đồng", type: "contract-select" },
      { key: "registrar", label: "Nhà đăng ký (tham khảo)", type: "text" },
      { key: "nameservers", label: "Nameservers", type: "text" },
      { key: "registrationDate", label: "Ngày đăng ký", type: "date" },
      { key: "expiryDate", label: "Ngày hết hạn", type: "date" },
      { key: "autoRenew", label: "Tự động gia hạn", type: "checkbox" },
      { key: "notes", label: "Ghi chú", type: "textarea" },
    ],
  },
  {
    key: "vps",
    label: "VPS",
    icon: "bi-hdd-rack",
    endpoint: "/soft-inventory/vps-servers",
    columns: [
      { key: "hostname", label: "Hostname" },
      { key: "ipAddress", label: "IP" },
      { key: "provider", label: "Nhà cung cấp" },
      { key: "specs", label: "Cấu hình", render: (i: any) => `${i.cpu || "—"} / ${i.ramGb || 0}GB / ${i.storageGb || 0}GB` },
      { key: "expiryDate", label: "Hết hạn", render: (i: any) => i.expiryDate ? new Date(i.expiryDate).toLocaleDateString("vi-VN") : "—" },
      { key: "status", label: "Trạng thái" },
    ],
    createFields: [
      { key: "hostname", label: "Hostname", type: "text", required: true },
      { key: "ipAddress", label: "Địa chỉ IP", type: "text" },
      { key: "vendorId", label: "Nhà cung cấp", type: "vendor-select" },
      { key: "contractId", label: "Hợp đồng", type: "contract-select" },
      { key: "provider", label: "Provider (tham khảo)", type: "text" },
      { key: "os", label: "Hệ điều hành", type: "text" },
      { key: "cpu", label: "CPU", type: "text" },
      { key: "ramGb", label: "RAM (GB)", type: "number" },
      { key: "storageGb", label: "Storage (GB)", type: "number" },
      { key: "location", label: "Vị trí", type: "text" },
      { key: "expiryDate", label: "Ngày hết hạn", type: "date" },
      { key: "notes", label: "Ghi chú", type: "textarea" },
    ],
  },
  {
    key: "license",
    label: "Bản quyền",
    icon: "bi-key",
    endpoint: "/soft-inventory/software-licenses",
    columns: [
      { key: "name", label: "Phần mềm" },
      { key: "publisher", label: "Nhà phát hành" },
      { key: "licenseType", label: "Loại", render: (i: any) => ({ perpetual: "Vĩnh viễn", subscription: "Đăng ký", trial: "Dùng thử", oem: "OEM" }[i.licenseType as string] || i.licenseType) },
      { key: "seats", label: "Seats", render: (i: any) => `${i.usedSeats || 0}/${i.seats || 0}` },
      { key: "expiryDate", label: "Hết hạn", render: (i: any) => i.expiryDate ? new Date(i.expiryDate).toLocaleDateString("vi-VN") : "—" },
      { key: "status", label: "Trạng thái" },
    ],
    createFields: [
      { key: "name", label: "Tên phần mềm", type: "text", required: true },
      { key: "vendorId", label: "Nhà cung cấp", type: "vendor-select" },
      { key: "contractId", label: "Hợp đồng", type: "contract-select" },
      { key: "publisher", label: "Nhà phát hành (tham khảo)", type: "text" },
      { key: "licenseKey", label: "License Key", type: "text" },
      { key: "licenseType", label: "Loại license", type: "select", options: [
        { value: "subscription", label: "Đăng ký" },
        { value: "perpetual", label: "Vĩnh viễn" },
        { value: "trial", label: "Dùng thử" },
        { value: "oem", label: "OEM" },
      ]},
      { key: "seats", label: "Số seats", type: "number" },
      { key: "purchaseDate", label: "Ngày mua", type: "date" },
      { key: "expiryDate", label: "Ngày hết hạn", type: "date" },
      { key: "cost", label: "Chi phí", type: "number" },
      { key: "notes", label: "Ghi chú", type: "textarea" },
    ],
  },
  {
    key: "ssl",
    label: "SSL",
    icon: "bi-shield-lock",
    endpoint: "/soft-inventory/ssl-certificates",
    columns: [
      { key: "domain", label: "Domain" },
      { key: "issuer", label: "Nhà cung cấp" },
      { key: "sslType", label: "Loại" },
      { key: "expiryDate", label: "Hết hạn", render: (i: any) => i.expiryDate ? new Date(i.expiryDate).toLocaleDateString("vi-VN") : "—" },
      { key: "autoRenew", label: "Tự gia hạn", render: (i: any) => i.autoRenew ? "Có" : "Không" },
      { key: "status", label: "Trạng thái" },
    ],
    createFields: [
      { key: "domain", label: "Domain", type: "text", required: true },
      { key: "vendorId", label: "Nhà cung cấp", type: "vendor-select" },
      { key: "contractId", label: "Hợp đồng", type: "contract-select" },
      { key: "issuer", label: "Nhà cung cấp SSL (tham khảo)", type: "text" },
      { key: "sslType", label: "Loại SSL", type: "select", options: [
        { value: "DV", label: "DV (Domain)" },
        { value: "OV", label: "OV (Organization)" },
        { value: "EV", label: "EV (Extended)" },
        { value: "wildcard", label: "Wildcard" },
      ]},
      { key: "serialNumber", label: "Serial Number", type: "text" },
      { key: "issuedDate", label: "Ngày cấp", type: "date" },
      { key: "expiryDate", label: "Ngày hết hạn", type: "date" },
      { key: "autoRenew", label: "Tự động gia hạn", type: "checkbox" },
      { key: "notes", label: "Ghi chú", type: "textarea" },
    ],
  },
  {
    key: "apikey",
    label: "API Keys",
    icon: "bi-key",
    endpoint: "/soft-inventory/software-licenses",
    columns: [
      { key: "name", label: "Tên API/Service" },
      { key: "publisher", label: "Provider" },
      { key: "licenseKey", label: "API Key", render: (i: any) => i.licenseKey ? `${i.licenseKey.substring(0, 8)}${'*'.repeat(16)}` : "—" },
      { key: "licenseType", label: "Loại", render: (i: any) => ({ subscription: "Đăng ký", perpetual: "Vĩnh viễn", trial: "Dùng thử", oem: "OEM" }[i.licenseType as string] || i.licenseType) },
      { key: "expiryDate", label: "Hết hạn", render: (i: any) => i.expiryDate ? new Date(i.expiryDate).toLocaleDateString("vi-VN") : "—" },
      { key: "status", label: "Trạng thái" },
    ],
    createFields: [
      { key: "name", label: "Tên API/Service", type: "text", required: true },
      { key: "vendorId", label: "Nhà cung cấp", type: "vendor-select" },
      { key: "publisher", label: "Provider (tham khảo)", type: "text" },
      { key: "licenseKey", label: "API Key / Token", type: "text", required: true },
      { key: "licenseType", label: "Loại", type: "select", options: [
        { value: "subscription", label: "Đăng ký" },
        { value: "perpetual", label: "Vĩnh viễn" },
        { value: "trial", label: "Dùng thử" },
      ]},
      { key: "seats", label: "Rate limit/quota", type: "number" },
      { key: "expiryDate", label: "Ngày hết hạn", type: "date" },
      { key: "notes", label: "Ghi chú (scope, env...)", type: "textarea" },
    ],
  },
];

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  active: { label: "Hoạt động", color: "bg-emerald-100 text-emerald-700" },
  inactive: { label: "Ngưng", color: "bg-gray-100 text-gray-600" },
  expired: { label: "Hết hạn", color: "bg-red-100 text-red-700" },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] || { label: status, color: "bg-gray-100 text-gray-600" };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${s.color}`}>{s.label}</span>;
}

function isExpiringSoon(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;
  const diff = (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= 30;
}

export default function SoftInventoryPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("email");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [vendorFilter, setVendorFilter] = useState("");
  const [vendors, setVendors] = useState<any[]>([]);
  const [showDrawer, setShowDrawer] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [meta, setMeta] = useState<any>(null);

  const tab = TABS.find((t) => t.key === activeTab)!;

  useEffect(() => {
    api.get<any>("/vendors", { limit: 100 }).then((json) => {
      if (json.success) setVendors(json.data || []);
    }).catch(() => {});
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const json = await api.get<any>(tab.endpoint, {
        search: search || undefined,
        status: statusFilter || undefined,
        vendorId: vendorFilter || undefined,
      });
      if (json.success) {
        setData(json.data);
        setMeta(json.meta);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [tab.endpoint, search, statusFilter, vendorFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body: any = {};
      tab.createFields.forEach((f) => {
        if (formData[f.key] !== undefined && formData[f.key] !== "") {
          if (f.type === "number") body[f.key] = Number(formData[f.key]);
          else if (f.type === "checkbox") body[f.key] = Boolean(formData[f.key]);
          else body[f.key] = formData[f.key];
        }
      });

      await api.post(tab.endpoint, body);

      setShowDrawer(false);
      setFormData({});
      fetchData();
    } catch (e) {
      console.error(e);
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Phần mềm & Dịch vụ</h1>
          <p className="text-muted mt-1">Quản lý tài khoản email, tên miền, VPS, bản quyền phần mềm, chứng chỉ SSL</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton
            data={data}
            columns={tab.columns.map(c => ({ header: c.label, key: c.key, format: c.render ? (_: any, row: any) => c.render!(row) : undefined }))}
            filename={`phan_mem_${activeTab}`}
          />
          <button
            onClick={() => { setShowDrawer(true); setFormData({}); }}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
          >
            <i className="bi bi-plus-lg" /> Thêm mới
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-xl bg-card p-1 shadow-sm border border-border">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => { setActiveTab(t.key); setSearch(""); setStatusFilter(""); setVendorFilter(""); }}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === t.key ? "bg-primary text-primary-foreground shadow-sm" : "text-muted hover:bg-accent hover:text-foreground"}`}
          >
            <i className={`bi ${t.icon}`} /> {t.label}
          </button>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder={`Tìm kiếm ${tab.label.toLowerCase()}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-4 text-sm placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="active">Hoạt động</option>
          <option value="inactive">Ngưng</option>
          <option value="expired">Hết hạn</option>
        </select>
        <select
          value={vendorFilter}
          onChange={(e) => setVendorFilter(e.target.value)}
          className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">Tất cả NCC</option>
          {vendors.map((v: any) => (
            <option key={v.id} value={v.id}>{v.name}</option>
          ))}
        </select>
        {(statusFilter || vendorFilter) && (
          <button
            onClick={() => { setStatusFilter(""); setVendorFilter(""); }}
            className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2.5 text-sm text-muted hover:bg-accent hover:text-foreground transition-colors"
          >
            <i className="bi bi-x-circle" /> Xóa lọc
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {tab.columns.map((col) => (
                <th key={col.key} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={tab.columns.length} className="px-4 py-12 text-center text-muted">Đang tải...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={tab.columns.length} className="px-4 py-12 text-center text-muted">
                <i className="bi bi-inbox text-3xl block mb-2" />
                Chưa có dữ liệu. Nhấn &quot;Thêm mới&quot; để bắt đầu.
              </td></tr>
            ) : (
              data.map((item: any) => (
                <tr key={item.id} className="border-b border-border/50 hover:bg-accent/50 transition-colors">
                  {tab.columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-foreground">
                      {col.key === "status" ? (
                        <StatusBadge status={item.status} />
                      ) : col.render ? (
                        <span className={col.key === "expiryDate" && isExpiringSoon(item.expiryDate) ? "text-warning font-medium" : ""}>
                          {col.render(item)}
                        </span>
                      ) : (
                        item[col.key] || "—"
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
        {meta && meta.total > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border text-xs text-muted">
            <span>Hiển thị {data.length} / {meta.total} bản ghi</span>
            <span>Trang {meta.page} / {meta.totalPages}</span>
          </div>
        )}
      </div>

      {/* Create Drawer */}
      {showDrawer && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setShowDrawer(false)} />
          <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h2 className="text-lg font-semibold text-foreground">
                Thêm {tab.label}
              </h2>
              <button onClick={() => setShowDrawer(false)} className="rounded-lg p-1 hover:bg-accent">
                <i className="bi bi-x-lg text-lg" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-4 space-y-4">
              {tab.createFields.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    {field.label} {field.required && <span className="text-destructive">*</span>}
                  </label>
                  {field.type === "vendor-select" ? (
                    <VendorSelect
                      value={formData[field.key] || ""}
                      onChange={(v) => setFormData({ ...formData, [field.key]: v })}
                    />
                  ) : field.type === "contract-select" ? (
                    <ContractSelect
                      value={formData[field.key] || ""}
                      onChange={(v) => setFormData({ ...formData, [field.key]: v })}
                      vendorId={formData.vendorId || undefined}
                    />
                  ) : field.type === "textarea" ? (
                    <textarea
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      rows={3}
                      value={formData[field.key] || ""}
                      onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                    />
                  ) : field.type === "select" ? (
                    <select
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      value={formData[field.key] || ""}
                      onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                    >
                      <option value="">Chọn...</option>
                      {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : field.type === "checkbox" ? (
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData[field.key] || false}
                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.checked })}
                        className="rounded border-border"
                      />
                      <span className="text-sm text-muted">Bật</span>
                    </label>
                  ) : (
                    <input
                      type={field.type}
                      required={field.required}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      value={formData[field.key] || ""}
                      onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                    />
                  )}
                </div>
              ))}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowDrawer(false)}
                  className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {submitting ? "Đang lưu..." : "Tạo mới"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
