"use client";

import { useState, useEffect } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("itms_theme");
    const isDark = stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("itms_theme", next ? "dark" : "light");
  };

  return (
    <button
      onClick={toggle}
      className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors hover:bg-sidebar-accent text-sidebar-foreground/70 hover:text-sidebar-foreground"
      title={dark ? "Chế độ sáng" : "Chế độ tối"}
    >
      <i className={`bi ${dark ? "bi-sun-fill" : "bi-moon-fill"} text-sm`} />
    </button>
  );
}
