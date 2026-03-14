"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/shared/page-header";

interface BudgetItem {
  name: string;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  note: string;
}

interface BudgetCategory {
  name: string;
  items: BudgetItem[];
}

const emptyItem = (): BudgetItem => ({
  name: "",
  description: "",
  unit: "Cái",
  quantity: 1,
  unitPrice: 0,
  note: "",
});

const emptyCategory = (): BudgetCategory => ({
  name: "",
  items: [emptyItem()],
});

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value) + "₫";
}

export default function CreateBudgetPlanPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [quarter, setQuarter] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState<BudgetCategory[]>([
    emptyCategory(),
  ]);

  const grandTotal = categories.reduce(
    (sum, cat) =>
      sum +
      cat.items.reduce((s, item) => s + item.quantity * item.unitPrice, 0),
    0
  );

  const updateCategory = (index: number, field: string, value: string) => {
    setCategories((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  };

  const addCategory = () =>
    setCategories((prev) => [...prev, emptyCategory()]);

  const removeCategory = (index: number) =>
    setCategories((prev) => prev.filter((_, i) => i !== index));

  const updateItem = (
    catIndex: number,
    itemIndex: number,
    field: string,
    value: string | number
  ) => {
    setCategories((prev) =>
      prev.map((cat, ci) =>
        ci === catIndex
          ? {
              ...cat,
              items: cat.items.map((item, ii) =>
                ii === itemIndex ? { ...item, [field]: value } : item
              ),
            }
          : cat
      )
    );
  };

  const addItem = (catIndex: number) => {
    setCategories((prev) =>
      prev.map((cat, ci) =>
        ci === catIndex ? { ...cat, items: [...cat.items, emptyItem()] } : cat
      )
    );
  };

  const removeItem = (catIndex: number, itemIndex: number) => {
    setCategories((prev) =>
      prev.map((cat, ci) =>
        ci === catIndex
          ? { ...cat, items: cat.items.filter((_, ii) => ii !== itemIndex) }
          : cat
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError("Vui lòng nhập tên kế hoạch");
    if (categories.some((c) => !c.name.trim()))
      return setError("Vui lòng nhập tên danh mục");
    if (categories.some((c) => c.items.some((i) => !i.name.trim())))
      return setError("Vui lòng nhập tên hạng mục");

    setIsSubmitting(true);
    setError("");

    try {
      await api.post("/budget-plans", {
        name,
        year,
        quarter: quarter || undefined,
        description: description || undefined,
        categories: categories.map((cat) => ({
          name: cat.name,
          items: cat.items.map((item) => ({
            name: item.name,
            description: item.description || undefined,
            unit: item.unit || undefined,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            note: item.note || undefined,
          })),
        })),
      });
      router.push("/budget/plans");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Có lỗi xảy ra";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">
          <i className="bi bi-house-door" />
        </Link>
        <span>/</span>
        <Link
          href="/budget/plans"
          className="hover:text-foreground transition-colors"
        >
          Kế hoạch ngân sách
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">Tạo mới</span>
      </nav>

      <PageHeader
        title="Tạo kế hoạch ngân sách"
        description="Lập kế hoạch chi tiêu CNTT với các danh mục và hạng mục"
      />

      {error && (
        <div className="mb-4 rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
          <i className="bi bi-exclamation-circle mr-2" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Header Info */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm mb-6">
          <h2 className="text-base font-semibold text-card-foreground mb-4">
            Thông tin chung
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-card-foreground mb-1.5">
                Tên kế hoạch <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Ngân sách CNTT Q1/2026"
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-1.5">
                Năm <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(+e.target.value)}
                min={2020}
                max={2050}
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-1.5">
                Quý
              </label>
              <select
                value={quarter}
                onChange={(e) =>
                  setQuarter(e.target.value ? +e.target.value : "")
                }
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              >
                <option value="">Cả năm</option>
                <option value="1">Quý 1</option>
                <option value="2">Quý 2</option>
                <option value="3">Quý 3</option>
                <option value="4">Quý 4</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-card-foreground mb-1.5">
              Mô tả
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Mô tả ngắn về kế hoạch ngân sách..."
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>
        </div>

        {/* Categories */}
        {categories.map((cat, ci) => {
          const catTotal = cat.items.reduce(
            (sum, item) => sum + item.quantity * item.unitPrice,
            0
          );
          return (
            <div
              key={ci}
              className="rounded-xl border border-border bg-card p-6 shadow-sm mb-4"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                    {ci + 1}
                  </div>
                  <input
                    type="text"
                    value={cat.name}
                    onChange={(e) =>
                      updateCategory(ci, "name", e.target.value)
                    }
                    placeholder="Tên danh mục (VD: Phần cứng)"
                    className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <span className="text-sm font-semibold text-primary whitespace-nowrap">
                    {formatCurrency(catTotal)}
                  </span>
                  {categories.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCategory(ci)}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-danger/10 hover:text-danger transition-colors"
                    >
                      <i className="bi bi-trash text-sm" />
                    </button>
                  )}
                </div>
              </div>

              {/* Items table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-2 font-medium text-muted-foreground w-[30%]">
                        Hạng mục *
                      </th>
                      <th className="pb-2 font-medium text-muted-foreground w-[15%]">
                        ĐVT
                      </th>
                      <th className="pb-2 font-medium text-muted-foreground w-[10%] text-right">
                        SL
                      </th>
                      <th className="pb-2 font-medium text-muted-foreground w-[20%] text-right">
                        Đơn giá
                      </th>
                      <th className="pb-2 font-medium text-muted-foreground w-[20%] text-right">
                        Thành tiền
                      </th>
                      <th className="pb-2 w-[5%]" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {cat.items.map((item, ii) => (
                      <tr key={ii}>
                        <td className="py-2 pr-2">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) =>
                              updateItem(ci, ii, "name", e.target.value)
                            }
                            placeholder="Tên hạng mục"
                            className="w-full rounded border border-input bg-background px-2 py-1.5 text-sm outline-none focus:border-primary"
                          />
                        </td>
                        <td className="py-2 pr-2">
                          <input
                            type="text"
                            value={item.unit}
                            onChange={(e) =>
                              updateItem(ci, ii, "unit", e.target.value)
                            }
                            className="w-full rounded border border-input bg-background px-2 py-1.5 text-sm outline-none focus:border-primary"
                          />
                        </td>
                        <td className="py-2 pr-2">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              updateItem(ci, ii, "quantity", +e.target.value)
                            }
                            min={1}
                            className="w-full rounded border border-input bg-background px-2 py-1.5 text-sm text-right outline-none focus:border-primary"
                          />
                        </td>
                        <td className="py-2 pr-2">
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) =>
                              updateItem(ci, ii, "unitPrice", +e.target.value)
                            }
                            min={0}
                            className="w-full rounded border border-input bg-background px-2 py-1.5 text-sm text-right outline-none focus:border-primary"
                          />
                        </td>
                        <td className="py-2 pr-2 text-right font-medium text-card-foreground whitespace-nowrap">
                          {formatCurrency(item.quantity * item.unitPrice)}
                        </td>
                        <td className="py-2">
                          {cat.items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeItem(ci, ii)}
                              className="rounded p-1 text-muted-foreground hover:text-danger transition-colors"
                            >
                              <i className="bi bi-x-lg text-xs" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                type="button"
                onClick={() => addItem(ci)}
                className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-dashed border-input px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                <i className="bi bi-plus" />
                Thêm hạng mục
              </button>
            </div>
          );
        })}

        <button
          type="button"
          onClick={addCategory}
          className="mb-6 w-full rounded-xl border-2 border-dashed border-input py-4 text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors"
        >
          <i className="bi bi-plus-lg mr-2" />
          Thêm danh mục
        </button>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-between rounded-xl border border-border bg-card px-6 py-4 shadow-lg">
          <div>
            <p className="text-sm text-muted-foreground">Tổng ngân sách</p>
            <p className="text-xl font-bold text-primary">
              {formatCurrency(grandTotal)}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/budget/plans"
              className="rounded-lg border border-input px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
            >
              Hủy
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <i className="bi bi-arrow-repeat animate-spin mr-2" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <i className="bi bi-check-lg mr-2" />
                  Lưu kế hoạch
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
