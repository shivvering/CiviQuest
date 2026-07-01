"use client";

import type { CSSProperties } from "react";
import { ClickPopBubble } from "@/app/components/ClickPopBubble";

/** Decorative bubbles on the marketing homepage only — matches light CiviQuest palette. */
const ORBS: Array<{
  top: string;
  left?: string;
  right?: string;
  size: number;
  style: CSSProperties;
}> = [
  {
    top: "12%",
    left: "6%",
    size: 48,
    style: {
      background:
        "radial-gradient(circle at 32% 28%, rgba(255,255,255,0.95), rgba(147,220,255,0.55) 45%, rgba(66,150,205,0.35) 100%)",
      boxShadow:
        "0 4px 18px rgba(66,150,205,0.25), inset 0 -4px 10px rgba(6,62,95,0.08)",
    },
  },
  {
    top: "20%",
    right: "8%",
    size: 36,
    style: {
      background:
        "radial-gradient(circle at 40% 35%, rgba(255,255,255,0.9), rgba(184,220,240,0.85) 55%, rgba(66,150,205,0.25) 100%)",
      boxShadow: "0 3px 14px rgba(66,150,205,0.2)",
    },
  },
  {
    top: "58%",
    left: "5%",
    size: 32,
    style: {
      background:
        "radial-gradient(circle at 50% 40%, rgba(255,255,255,0.85), rgba(229,246,255,0.95) 50%, rgba(66,150,205,0.2) 100%)",
      boxShadow: "inset 0 2px 6px rgba(255,255,255,0.9)",
    },
  },
  {
    top: "68%",
    right: "10%",
    size: 44,
    style: {
      background:
        "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.95), rgba(66,150,205,0.4) 55%, rgba(47,155,215,0.15) 100%)",
      boxShadow: "0 4px 16px rgba(66,150,205,0.22)",
    },
  },
  {
    top: "42%",
    left: "12%",
    size: 26,
    style: {
      background:
        "radial-gradient(circle, rgba(255,255,255,0.95), rgba(147,220,255,0.45) 70%, rgba(66,150,205,0.15) 100%)",
      boxShadow: "0 2px 10px rgba(66,150,205,0.15)",
    },
  },
  {
    top: "50%",
    right: "16%",
    size: 30,
    style: {
      background:
        "radial-gradient(circle at 55% 40%, rgba(234,247,255,1), rgba(66,150,205,0.35) 100%)",
      boxShadow: "0 3px 12px rgba(6,62,95,0.12)",
    },
  },
];

export function LandingPoppableDecor() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
      {ORBS.map((orb, index) => (
        <ClickPopBubble
          key={index}
          aria-label="Playful bubble — tap to pop"
          className="pointer-events-auto absolute flex items-center justify-center rounded-full border border-white/80 ring-1 ring-[#dceef8]/90"
          style={{
            top: orb.top,
            left: orb.left,
            right: orb.right,
            width: orb.size,
            height: orb.size,
            ...orb.style,
          }}
        />
      ))}
    </div>
  );
}
