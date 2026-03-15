"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { VendorSelect } from "@/components/shared/vendor-select";
import { ContractSelect } from "@/components/shared/contract-select";
import { UserSelect } from "@/components/shared/user-select";
import { ExportButton } from "@/components/shared/export-button";

type TabKey = "hardware" | "infra" | "ip";

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
    key: "hardware",
    label: "Phần cứng",
    icon: "bi-pc-display",
    endpoint: "/hard-inventory/hardware-assets",
    columns: [
      { key: "assetTag", label: "Mã tài sản" },
      { key: "name", label: "Tên thiết bị" },
      { key: "category", label: "Danh mục" },
      { key: "brand", label: "Thương hiệu", render: (i: any) => `${i.brand || ""} ${i.model || ""}`.trim() || "—" },
      { key: "serialNumber", label: "Serial", render: (i: any) => i.serialNumber || "—" },
      { key: "location", label: "Vị trí", render: (i: any) => i.location || "—" },
      { key: "assignedTo", label: "Gán cho", render: (i: any) => i.assignedTo || "—" },
      { key: "warrantyExpiry", label: "Hết bảo hành", render: (i: any) => i.warrantyExpiry ? new Date(i.warrantyExpiry).toLocaleDateString("vi-VN") : "—" },
      { key: "status", label: "Trạng thái" },
    ],
    createFields: [
      { key: "assetTag", label: "Mã tài sản", type: "text", required: true },
      { key: "name", label: "Tên thiết bị", type: "text", required: true },
      { key: "category", label: "Danh mục", type: "select", required: true, options: [
        { value: "laptop", label: "Laptop" },
        { value: "desktop", label: "Desktop" },
        { value: "monitor", label: "Màn hình" },
        { value: "printer", label: "Máy in" },
        { value: "phone", label: "Điện thoại" },
        { value: "tablet", label: "Tablet" },
        { value: "peripheral", label: "Phụ kiện" },
        { value: "other", label: "Khác" },
      ]},
      { key: "vendorId", label: "Nhà cung cấp", type: "vendor-select" },
      { key: "contractId", label: "Hợp đồng", type: "contract-select" },
      { key: "brand", label: "Thương hiệu", type: "text" },
      { key: "model", label: "Model", type: "text" },
      { key: "serialNumber", label: "Số serial", type: "text" },
      { key: "location", label: "Vị trí", type: "text" },
      { key: "assignedTo", label: "Gán cho", type: "user-select" },
      { key: "cost", label: "Giá trị (VND)", type: "number" },
      { key: "notes", label: "Ghi chú", type: "textarea" },
    ],
  },
  {
    key: "infra",
    label: "Hạ tầng",
    icon: "bi-diagram-3",
    endpoint: "/hard-inventory/infra-resources",
    columns: [
      { key: "name", label: "Tên thiết bị" },
      { key: "infraType", label: "Loại", render: (i: any) => INFRA_TYPE_MAP[i.infraType] || i.infraType },
      { key: "brand", label: "Thương hiệu", render: (i: any) => `${i.brand || ""} ${i.model || ""}`.trim() || "—" },
      { key: "location", label: "Vị trí", render: (i: any) => i.location || "—" },
      { key: "rackUnit", label: "Rack/U", render: (i: any) => i.rackUnit || "—" },
      { key: "ipAddress", label: "IP", render: (i: any) => i.ipAddress || "—" },
      { key: "managementUrl", label: "URL quản trị", render: (i: any) => i.managementUrl || "—" },
      { key: "status", label: "Trạng thái" },
    ],
    createFields: [
      { key: "name", label: "Tên thiết bị", type: "text", required: true },
      { key: "infraType", label: "Loại", type: "select", required: true, options: [
        { value: "switch", label: "Switch" },
        { value: "router", label: "Router" },
        { value: "firewall", label: "Firewall" },
        { value: "access_point", label: "Access Point" },
        { value: "ups", label: "UPS" },
        { value: "pdu", label: "PDU" },
        { value: "rack", label: "Tủ Rack" },
        { value: "cable_tray", label: "Máng cáp" },
        { value: "other", label: "Khác" },
      ]},
      { key: "vendorId", label: "Nhà cung cấp", type: "vendor-select" },
      { key: "brand", label: "Thương hiệu", type: "text" },
      { key: "model", label: "Model", type: "text" },
      { key: "serialNumber", label: "Serial", type: "text" },
      { key: "location", label: "Vị trí", type: "text" },
      { key: "rackUnit", label: "Rack/U", type: "text" },
      { key: "ipAddress", label: "IP", type: "text" },
      { key: "managementUrl", label: "URL quản trị", type: "text" },
      { key: "notes", label: "Ghi chú", type: "textarea" },
    ],
  },
  {
    key: "ip",
    label: "Địa chỉ IP",
    icon: "bi-hdd-network",
    endpoint: "/hard-inventory/ip-addresses",
    columns: [
      { key: "address", label: "Địa chỉ IP" },
      { key: "subnet", label: "Subnet", render: (i: any) => i.subnet || "—" },
      { key: "gateway", label: "Gateway", render: (i: any) => i.gateway || "—" },
      { key: "vlan", label: "VLAN", render: (i: any) => i.vlan || "—" },
      { key: "ipType", label: "Loại", render: (i: any) => IP_TYPE_MAP[i.ipType] || i.ipType },
      { key: "assignedTo", label: "Gán cho", render: (i: any) => i.assignedTo || "—" },
      { key: "assignedType", label: "Thiết bị", render: (i: any) => i.assignedType || "—" },
      { key: "status", label: "Trạng thái" },
    ],
    createFields: [
      { key: "address", label: "Địa chỉ IP", type: "text", required: true },
      { key: "subnet", label: "Subnet mask", type: "text" },
      { key: "gateway", label: "Gateway", type: "text" },
      { key: "vlan", label: "VLAN", type: "text" },
      { key: "ipType", label: "Loại", type: "select", options: [
        { value: "static", label: "Static" },
        { value: "dhcp", label: "DHCP" },
        { value: "reserved", label: "Reserved" },
      ]},
      { key: "assignedTo", label: "Gán cho", type: "user-select" },
      { key: "assignedType", label: "Loại thiết bị", type: "select", options: [
        { value: "hardware", label: "Phần cứng" },
        { value: "infra", label: "Hạ tầng" },
        { value: "vps", label: "VPS" },
      ]},
      { key: "notes", label: "Ghi chú", type: "textarea" },
    ],
  },
];

const INFRA_TYPE_MAP: Record<string, string> = {
  switch: "Switch", router: "Router", firewall: "Firewall",
  access_point: "Access Point", ups: "UPS", pdu: "PDU",
  cable_tray: "Máng cáp", rack: "Tủ Rack", other: "Khác",
};

const IP_TYPE_MAP: Record<string, string> = {
  static: "Static", dhcp: "DHCP", reserved: "Reserved",
};

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  in_use: { label: "Đang dùng", color: "bg-emerald-100 text-emerald-700" },
  available: { label: "Sẵn sàng", color: "bg-blue-100 text-blue-700" },
  maintenance: { label: "Bảo trì", color: "bg-amber-100 text-amber-700" },
  disposed: { label: "Thanh lý", color: "bg-red-100 text-red-700" },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] || { label: status, color: "bg-gray-100 text-gray-600" };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${s.color}`}>{s.label}</span>;
}

function isWarrantyExpiring(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;
  const diff = (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= 30;
}

export default function HardInventoryPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("hardware");
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
          <h1 className="text-2xl font-bold text-foreground">Phần cứng & Hạ tầng</h1>
          <p className="text-muted mt-1">Quản lý thiết bị phần cứng, hạ tầng mạng và địa chỉ IP</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton
            data={data}
            columns={tab.columns.map(c => ({ header: c.label, key: c.key, format: c.render ? (_: any, row: any) => c.render!(row) : undefined }))}
            filename={`phan_cung_${activeTab}`}
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
          <option value="in_use">Đang dùng</option>
          <option value="available">Sẵn sàng</option>
          <option value="maintenance">Bảo trì</option>
          <option value="disposed">Thanh lý</option>
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
            <tr className="border-b border-border bg-accent/30">
              {tab.columns.map((col) => (
                <th key={col.key} className="px-4 py-3 text-left font-semibold text-foreground/70 uppercase text-xs tracking-wide">{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={tab.columns.length} className="py-12 text-center text-muted">Đang tải...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={tab.columns.length} className="py-12 text-center text-muted">
                <i className="bi bi-inbox text-3xl block mb-2" />Chưa có dữ liệu
              </td></tr>
            ) : (
              data.map((item: any) => (
                <tr key={item.id} className="border-b border-border/50 hover:bg-accent/20 transition-colors">
                  {tab.columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-foreground">
                      {col.key === "status" ? (
                        <StatusBadge status={item.status} />
                      ) : col.key === "warrantyExpiry" && isWarrantyExpiring(item.warrantyExpiry) ? (
                        <span className="text-amber-600 font-medium">⚠ {col.render ? col.render(item) : item[col.key]}</span>
                      ) : (
                        col.render ? col.render(item) : (item[col.key] ?? "—")
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
        {meta && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border text-sm text-muted">
            <span>Hiển thị {data.length} / {meta.total} bản ghi</span>
            <span>Trang {meta.page} / {meta.totalPages}</span>
          </div>
        )}
      </div>

      {/* Create Drawer */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowDrawer(false)} />
          <div className="relative w-full max-w-md bg-card shadow-2xl overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Thêm {tab.label}</h2>
                <button onClick={() => setShowDrawer(false)} className="text-muted hover:text-foreground">
                  <i className="bi bi-x-lg text-xl" />
                </button>
              </div>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {tab.createFields.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
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
                  ) : field.type === "user-select" ? (
                    <UserSelect
                      value={formData[field.key] || ""}
                      onChange={(v) => setFormData({ ...formData, [field.key]: v })}
                    />
                  ) : field.type === "select" ? (
                    <select
                      value={formData[field.key] || ""}
                      onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                      required={field.required}
                      className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="">Chọn...</option>
                      {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : field.type === "textarea" ? (
                    <textarea
                      value={formData[field.key] || ""}
                      onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                      rows={3}
                      className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  ) : (
                    <input
                      type={field.type}
                      value={formData[field.key] || ""}
                      onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                      required={field.required}
                      className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  )}
                </div>
              ))}
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDrawer(false)}
                  className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {submitting ? "Đang lưu..." : "Tạo mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
