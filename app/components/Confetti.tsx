"use client";

import { useMemo } from "react";

const COLORS = ["#4296CD", "#2589C9", "#F5B301", "#1BA098", "#7C5CD9", "#E86A92"];

/** Lightweight CSS confetti burst — no dependencies, respects reduced motion. */
export function Confetti({ pieces = 36 }: { pieces?: number }) {
  const items = useMemo(
    () =>
      Array.from({ length: pieces }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.9,
        color: COLORS[i % COLORS.length],
        duration: 2 + Math.random() * 1.4,
      })),
    [pieces],
  );

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map((item, index) => (
        <span
          key={index}
          className="cq-confetti"
          style={{
            left: `${item.left}%`,
            backgroundColor: item.color,
            animationDelay: `${item.delay}s`,
            animationDuration: `${item.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
