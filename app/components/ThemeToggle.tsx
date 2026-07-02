"use client";

import { useEffect, useState } from "react";
import { loadTheme, saveTheme } from "@/lib/progress";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(loadTheme());
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    saveTheme(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={
        theme === "light" ? "Switch to night mode" : "Switch to day mode"
      }
      title={theme === "light" ? "Night mode" : "Day mode"}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-xl transition hover:scale-110 active:scale-95"
      style={{
        borderColor: "var(--line)",
        backgroundColor: "var(--card)",
        boxShadow: "var(--shadow-pop)",
      }}
    >
      <span className={mounted ? "cq-pop-in" : ""} key={theme}>
        {mounted ? (theme === "light" ? "🌙" : "☀️") : "🌙"}
      </span>
    </button>
  );
}
