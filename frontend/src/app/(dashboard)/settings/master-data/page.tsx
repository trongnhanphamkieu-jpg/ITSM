"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/shared";
import { useI18n } from "@/lib/i18n";

interface MasterDataItem {
  id: string;
  type: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
}

const SYSTEM_TABS: { type: string; label: string; isCategory?: boolean }[] = [
  { type: "budget_category", label: "Danh mục ngân sách", isCategory: true },
  { type: "department", label: "Phòng ban" },
  { type: "contract_type", label: "Loại hợp đồng" },
  { type: "payment_method", label: "Phương thức TT" },
  { type: "unit_of_measure", label: "Đơn vị tính" },
  { type: "asset_category", label: "Loại tài sản" },
  { type: "environment", label: "Môi trường" },
  { type: "location", label: "Vị trí" },
  { type: "vehicle_type", label: "Loại xe" },
  { type: "fuel_type", label: "Nhiên liệu" },
  { type: "maintenance_type", label: "Bảo trì" },
];

const PAGE_SIZE = 10;

export default function MasterDataPage() {
  const { t } = useI18n();
  const [activeType, setActiveType] = useState(SYSTEM_TABS[0].type);
  const [items, setItems] = useState<MasterDataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<MasterDataItem | null>(null);
  const [form, setForm] = useState({ code: "", name: "", description: "" });
  const [saving, setSaving] = useState(false);

  // Seed
  const [seeding, setSeeding] = useState(false);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const activeTab = SYSTEM_TABS.find((t) => t.type === activeType);
  const isCategory = activeTab?.isCategory ?? false;

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      if (isCategory) {
        const res = await api.get<any>("/master-data/categories", {
          type: activeType,
        });
        const data = res?.data || res || [];
        setItems(Array.isArray(data) ? data : []);
        setTotal(Array.isArray(data) ? data.length : 0);
      } else {
        const res = await api.get<any>("/master-data/items", {
          type: activeType,
          page: String(page),
          limit: String(PAGE_SIZE),
        });
        const data = res?.data || res || [];
        setItems(Array.isArray(data) ? data : []);
        setTotal(res?.total ?? res?.meta?.total ?? data.length ?? 0);
      }
    } catch {
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [activeType, page, isCategory]);

  useEffect(() => {
    setPage(1);
  }, [activeType]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleToggle = async (item: MasterDataItem) => {
    try {
      const endpoint = isCategory
        ? `/master-data/categories/${item.id}`
        : `/master-data/items/${item.id}`;
      await api.patch(endpoint, { isActive: !item.isActive });
      fetchItems();
    } catch (e: any) {
      alert(e?.message || "Lỗi khi cập nhật");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isCategory) {
        if (editItem) {
          await api.patch(`/master-data/categories/${editItem.id}`, {
            name: form.name,
            description: form.description,
          });
        } else {
          await api.post("/master-data/categories", {
            type: activeType,
            code: form.code,
            name: form.name,
            description: form.description,
          });
        }
      } else {
        if (editItem) {
          await api.patch(`/master-data/items/${editItem.id}`, {
            name: form.name,
            description: form.description,
          });
        } else {
          await api.post("/master-data/items", {
            type: activeType,
            code: form.code,
            name: form.name,
            description: form.description,
          });
        }
      }
      setShowModal(false);
      setEditItem(null);
      setForm({ code: "", name: "", description: "" });
      fetchItems();
    } catch (e: any) {
      alert(e?.message || "Lỗi khi lưu");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn chắc chắn muốn xóa mục này?")) return;
    try {
      const endpoint = isCategory
        ? `/master-data/categories/${id}`
        : `/master-data/items/${id}`;
      await api.delete(endpoint);
      fetchItems();
    } catch (e: any) {
      alert(e?.message || "Lỗi khi xóa");
    }
  };

  const handleSeed = async () => {
    if (!confirm("Tạo dữ liệu mặc định cho hệ thống? (Chỉ thêm mới, không xóa dữ liệu cũ)")) return;
    setSeeding(true);
    try {
      await api.post<any>("/master-data/seed", {});
      fetchItems();
    } catch (e: any) {
      alert(e?.message || "Lỗi");
    } finally {
      setSeeding(false);
    }
  };

  const openCreate = () => {
    setEditItem(null);
    setForm({ code: "", name: "", description: "" });
    setShowModal(true);
  };

  const openEdit = (item: MasterDataItem) => {
    setEditItem(item);
    setForm({ code: item.code, name: item.name, description: item.description || "" });
    setShowModal(true);
  };

  const activeLabel = SYSTEM_TABS.find((t) => t.type === activeType)?.label || activeType;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <PageHeader
          title={t("master_data.title")}
          description={t("master_data.desc")}
        />
        <div className="flex gap-3">
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors disabled:opacity-50"
          >
            <i className={`bi ${seeding ? "bi-arrow-repeat animate-spin" : "bi-database-add"}`} />
            {seeding ? "Đang tạo..." : "Dữ liệu mẫu"}
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 transition-colors"
          >
            <i className="bi bi-plus-lg" />
            Thêm mới
          </button>
        </div>
      </div>

      {/* System Type Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-0 overflow-x-auto scrollbar-hide">
          {SYSTEM_TABS.map((tab) => (
            <button
              key={tab.type}
              onClick={() => setActiveType(tab.type)}
              className={`relative whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors ${
                activeType === tab.type
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              {activeType === tab.type && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Mã
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Tên
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Mô tả
              </th>
              <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Trạng thái
              </th>
              <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">
                  <i className="bi bi-arrow-repeat animate-spin text-lg mr-2" />
                  Đang tải...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">
                  <i className="bi bi-inbox text-2xl block mb-2 opacity-40" />
                  Chưa có dữ liệu {activeLabel}
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-border/40 hover:bg-muted/10 transition-colors"
                >
                  <td className="px-5 py-4 font-mono text-xs text-muted-foreground">
                    {item.code}
                  </td>
                  <td className="px-5 py-4 font-medium text-foreground">
                    {item.name}
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">
                    {item.description || "—"}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <button
                      onClick={() => handleToggle(item)}
                      className="inline-flex items-center"
                      title={item.isActive ? "Nhấn để tắt" : "Nhấn để bật"}
                    >
                      <span
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          item.isActive ? "bg-primary" : "bg-muted-foreground/30"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                            item.isActive ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </span>
                    </button>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div className="flex justify-center gap-1">
                      <button
                        onClick={() => openEdit(item)}
                        className="rounded-lg p-2 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
                        title="Sửa"
                      >
                        <i className="bi bi-pencil" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="rounded-lg p-2 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors"
                        title="Xóa"
                      >
                        <i className="bi bi-trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {!loading && total > 0 && (
          <div className="flex items-center justify-between border-t border-border px-5 py-3">
            <p className="text-sm text-muted-foreground">
              Hiển thị {(page - 1) * PAGE_SIZE + 1} đến{" "}
              {Math.min(page * PAGE_SIZE, total)} trong {total} mục
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted/50 disabled:opacity-40 transition-colors"
              >
                Trước
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    page === p
                      ? "bg-primary text-white"
                      : "text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted/50 disabled:opacity-40 transition-colors"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-2xl border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5">
              <h3 className="text-lg font-semibold">
                {editItem ? "Chỉnh sửa" : "Thêm mới"} — {activeLabel}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {editItem
                  ? "Cập nhật thông tin mục dữ liệu"
                  : `Thêm mục mới vào danh sách ${activeLabel}`}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Mã</label>
                <input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  disabled={!!editItem}
                  placeholder="VD: DEPT_06"
                  className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-muted/30 disabled:text-muted-foreground"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Tên</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="VD: Phòng Marketing"
                  className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Mô tả</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  placeholder="Mô tả ngắn (không bắt buộc)"
                  className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted/50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name.trim() || (!editItem && !form.code.trim())}
                className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {saving ? "Đang lưu..." : editItem ? "Cập nhật" : "Thêm mới"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
