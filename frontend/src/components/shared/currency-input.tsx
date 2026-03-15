"use client";

import { useState, useCallback } from "react";

interface CurrencyInputProps {
  value: number | string;
  onChange: (rawValue: number) => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  currency?: string;
}

function formatWithDots(num: number | string): string {
  const n = typeof num === "string" ? parseInt(num.replace(/\D/g, ""), 10) : num;
  if (isNaN(n) || n === 0) return "";
  return new Intl.NumberFormat("vi-VN").format(n);
}

function parseRaw(formatted: string): number {
  const cleaned = formatted.replace(/\D/g, "");
  return cleaned ? parseInt(cleaned, 10) : 0;
}

export function CurrencyInput({
  value,
  onChange,
  required = false,
  disabled = false,
  placeholder = "VD: 1.000.000",
  className = "",
  currency = "VNĐ",
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState(() => formatWithDots(value));

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = parseRaw(e.target.value);
      setDisplayValue(raw > 0 ? formatWithDots(raw) : "");
      onChange(raw);
    },
    [onChange]
  );

  const handleBlur = useCallback(() => {
    const raw = parseRaw(displayValue);
    setDisplayValue(raw > 0 ? formatWithDots(raw) : "");
  }, [displayValue]);

  return (
    <div className="relative">
      <input
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full rounded-lg border border-border bg-surface px-4 py-2.5 pr-14 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 ${className}`}
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted">
        {currency}
      </span>
    </div>
  );
}
