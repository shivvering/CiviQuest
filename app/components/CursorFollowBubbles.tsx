"use client";

import { useEffect, useRef, useState } from "react";

const BUBBLE_COUNT = 6;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

const BUBBLES: Array<{
  size: number;
  followLerp: number;
  opacity: number;
  blur: number;
  background: string;
}> = [
  {
    size: 420,
    followLerp: 0.22,
    opacity: 0.22,
    blur: 48,
    background:
      "radial-gradient(circle at 35% 30%, rgba(147, 220, 255, 0.95) 0%, rgba(66, 150, 205, 0.35) 42%, rgba(66, 150, 205, 0) 72%)",
  },
  {
    size: 320,
    followLerp: 0.18,
    opacity: 0.2,
    blur: 40,
    background:
      "radial-gradient(circle at 40% 35%, rgba(200, 240, 255, 0.9) 0%, rgba(47, 155, 215, 0.3) 45%, rgba(47, 155, 215, 0) 70%)",
  },
  {
    size: 240,
    followLerp: 0.15,
    opacity: 0.18,
    blur: 32,
    background:
      "radial-gradient(circle at 50% 40%, rgba(255, 255, 255, 0.75) 0%, rgba(129, 200, 240, 0.28) 50%, rgba(129, 200, 240, 0) 68%)",
  },
  {
    size: 160,
    followLerp: 0.12,
    opacity: 0.16,
    blur: 24,
    background:
      "radial-gradient(circle at 45% 45%, rgba(234, 247, 255, 0.95) 0%, rgba(66, 150, 205, 0.22) 55%, rgba(66, 150, 205, 0) 72%)",
  },
  {
    size: 100,
    followLerp: 0.1,
    opacity: 0.14,
    blur: 16,
    background:
      "radial-gradient(circle, rgba(255, 255, 255, 0.65) 0%, rgba(66, 150, 205, 0.18) 60%, rgba(66, 150, 205, 0) 75%)",
  },
  {
    size: 56,
    followLerp: 0.08,
    opacity: 0.35,
    blur: 8,
    background:
      "radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, rgba(147, 220, 255, 0.45) 55%, rgba(147, 220, 255, 0) 75%)",
  },
];

export function CursorFollowBubbles() {
  const rootRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const posRef = useRef(
    Array.from({ length: BUBBLE_COUNT }, () => ({ x: 0, y: 0 })),
  );
  const seededRef = useRef(false);
  const [motionOk, setMotionOk] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const id = requestAnimationFrame(() => {
      setMotionOk(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!motionOk) {
      return;
    }

    const root = rootRef.current;
    if (!root) {
      return;
    }

    const nodes = root.querySelectorAll<HTMLElement>("[data-cq-bubble]");

    const seed = (x: number, y: number) => {
      targetRef.current = { x, y };
      if (!seededRef.current) {
        for (let i = 0; i < BUBBLE_COUNT; i += 1) {
          posRef.current[i] = { x, y };
        }
        seededRef.current = true;
      }
    };

    const onMouseMove = (event: MouseEvent) => {
      seed(event.clientX, event.clientY);
    };

    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (touch) {
        seed(touch.clientX, touch.clientY);
      }
    };

    seed(window.innerWidth / 2, window.innerHeight / 2);

    let raf = 0;

    const tick = () => {
      const t = targetRef.current;
      const pos = posRef.current;

      const first = BUBBLES[0];
      if (first) {
        pos[0]!.x = lerp(pos[0]!.x, t.x, first.followLerp);
        pos[0]!.y = lerp(pos[0]!.y, t.y, first.followLerp);
      }

      for (let i = 1; i < BUBBLE_COUNT; i += 1) {
        const cfg = BUBBLES[i];
        const prev = pos[i - 1];
        const cur = pos[i];
        if (!cfg || !prev || !cur) continue;
        cur.x = lerp(cur.x, prev.x, cfg.followLerp);
        cur.y = lerp(cur.y, prev.y, cfg.followLerp);
      }

      for (let i = 0; i < nodes.length; i += 1) {
        const el = nodes[i];
        const p = pos[i];
        if (!el || !p) continue;
        el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) translate(-50%, -50%)`;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [motionOk]);

  if (!motionOk) {
    return null;
  }

  return (
    <div
      ref={rootRef}
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      {BUBBLES.map((bubble, index) => (
        <div
          key={index}
          data-cq-bubble
          className="absolute left-0 top-0 will-change-transform"
          style={{
            width: bubble.size,
            height: bubble.size,
            opacity: bubble.opacity,
            filter: `blur(${bubble.blur}px)`,
            background: bubble.background,
            borderRadius: "50%",
          }}
        />
      ))}
    </div>
  );
}
