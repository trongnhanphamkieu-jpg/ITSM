import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as Vietnamese currency (1.000.000 đ)
 */
export function formatCurrency(
  value: number | string | null | undefined,
  options?: { showSymbol?: boolean; currency?: string }
): string {
  const { showSymbol = true, currency = "đ" } = options || {};
  if (value === null || value === undefined || value === "") return "—";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "—";
  const formatted = new Intl.NumberFormat("vi-VN").format(num);
  return showSymbol ? `${formatted} ${currency}` : formatted;
}

/**
 * Parse formatted currency string back to raw number
 */
export function parseCurrencyInput(formatted: string): number {
  const cleaned = formatted.replace(/\D/g, "");
  return cleaned ? parseInt(cleaned, 10) : 0;
}
