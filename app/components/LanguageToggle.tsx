"use client";

import type { Lang } from "@/lib/i18n";

/** EN ⇄ हिंदी segmented pill. Controlled — the page owns the lang state. */
export function LanguageToggle({
  lang,
  onChange,
}: {
  lang: Lang;
  onChange: (lang: Lang) => void;
}) {
  const seg = (value: Lang, label: string) => (
    <button
      type="button"
      onClick={() => onChange(value)}
      aria-pressed={lang === value}
      className="rounded-full px-3 py-1.5 text-xs font-black transition md:text-sm"
      style={
        lang === value
          ? { backgroundColor: "var(--brand)", color: "var(--on-brand)" }
          : { color: "var(--text-soft)" }
      }
    >
      {label}
    </button>
  );

  return (
    <div
      role="group"
      aria-label="Language / भाषा"
      className="flex items-center rounded-full border p-1"
      style={{
        borderColor: "var(--line)",
        backgroundColor: "var(--card)",
        boxShadow: "var(--shadow-pop)",
      }}
    >
      {seg("en", "EN")}
      {seg("hi", "हिंदी")}
    </div>
  );
}
