"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const SESSION_KEY = "cq-splashed";
const BUBBLE_COUNT = 30;

/**
 * Full-screen ocean loader: a stream of bubbles rises fast from the bottom,
 * then — at mid-screen — snaps into slow motion and drifts up until it
 * fades out. Shows once per browser session for at least minMs.
 */
export function SplashScreen({ minMs = 2200 }: { minMs?: number }) {
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    return !window.sessionStorage.getItem(SESSION_KEY);
  });
  const [hindi] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("cq-lang") === "hi";
  });
  // The glow filter draws boxy artifacts around the image while the PNG is
  // still decoding — keep the logo hidden until it has fully loaded, then
  // fade it in with the glow.
  const [logoReady, setLogoReady] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Load events are unreliable across caches/webviews — poll `complete`
  // briefly instead, then reveal the logo with its glow.
  useEffect(() => {
    const check = () => {
      const img = rootRef.current?.querySelector("img");
      if (img?.complete && img.naturalWidth > 0) {
        setLogoReady(true);
        return true;
      }
      return false;
    };
    if (check()) return;
    const poll = window.setInterval(() => {
      if (check()) window.clearInterval(poll);
    }, 120);
    const stop = window.setTimeout(() => {
      window.clearInterval(poll);
      setLogoReady(true); // fail-open: show the logo regardless
    }, 5000);
    return () => {
      window.clearInterval(poll);
      window.clearTimeout(stop);
    };
  }, []);

  useEffect(() => {
    if (!visible) return;
    window.sessionStorage.setItem(SESSION_KEY, "1");

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const ctx = gsap.context(() => {
      if (reduced) return;

      // Some embedded viewports report innerHeight 0 — fall back hard.
      const screenH = () =>
        window.innerHeight ||
        document.documentElement.clientHeight ||
        window.screen?.height ||
        900;

      gsap.utils
        .toArray<HTMLElement>(".cq-splash-bubble")
        .forEach((bubble, i) => {
          // Fast sprint to mid-screen, then a sudden slow-motion drift
          // to the top where the bubble dissolves. Function-based values
          // + repeatRefresh so resizes are picked up every loop.
          const tl = gsap.timeline({
            repeat: -1,
            delay: (i * 0.37) % 2.6,
            repeatDelay: 0.15,
            repeatRefresh: true,
          });
          tl.set(bubble, { y: 30, opacity: 0, scale: 0.7 })
            .to(bubble, {
              y: () => -screenH() * 0.5,
              opacity: 1,
              scale: 1,
              duration: 0.5 + (i % 3) * 0.08,
              ease: "power1.in",
            })
            .to(bubble, {
              y: () => -screenH() * 1.05,
              opacity: 0,
              scale: 1.15,
              duration: 3.2 + (i % 4) * 0.4,
              ease: "none",
            });
        });

      // Gentle drifting waves at the bottom keep the water alive.
      gsap.to(".cq-splash-wave--a", {
        x: 60,
        duration: 3.2,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });
      gsap.to(".cq-splash-wave--b", {
        x: -80,
        duration: 4.1,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });
    }, rootRef);

    const timer = window.setTimeout(() => {
      if (rootRef.current) {
        gsap.to(rootRef.current, {
          opacity: 0,
          duration: reduced ? 0 : 0.45,
          onComplete: () => setVisible(false),
        });
      } else {
        setVisible(false);
      }
    }, minMs);

    return () => {
      window.clearTimeout(timer);
      ctx.revert();
    };
  }, [visible, minMs]);

  if (!visible) return null;

  return (
    <div ref={rootRef} className="cq-splash" role="status" aria-label="Loading CiviQuest">
      <div className="cq-splash-wave cq-splash-wave--a" style={{ background: "#1e6fa8" }} />
      <div className="cq-splash-wave cq-splash-wave--b" style={{ background: "#2f9bd7", height: "34vh", bottom: "-8vh" }} />

      {Array.from({ length: BUBBLE_COUNT }, (_, i) => {
        const size = 6 + (i % 7) * 5;
        return (
          <span
            key={i}
            className="cq-splash-bubble"
            style={{
              left: `${2 + ((i * 61) % 95)}%`,
              width: `${size}px`,
              height: `${size}px`,
            }}
          />
        );
      })}

      <div className="relative z-10 flex flex-col items-center gap-3">
        <Image
          src="/cq-logo.png"
          alt="CiviQuest logo"
          width={120}
          height={119}
          priority
          onLoad={() => setLogoReady(true)}
          className="h-24 w-24 object-contain md:h-28 md:w-28"
          style={{
            opacity: logoReady ? 1 : 0,
            transform: logoReady ? "scale(1)" : "scale(0.9)",
            filter: logoReady
              ? "drop-shadow(0 6px 18px rgba(255, 255, 255, 0.35))"
              : "none",
            transition: "opacity 0.5s ease, transform 0.5s ease, filter 0.5s ease",
          }}
        />
        <p className="font-[var(--font-montserrat)] text-3xl font-black tracking-tight text-white md:text-4xl">
          CiviQuest
        </p>
        <p className="cq-shimmer text-sm font-bold md:text-base">
          {hindi ? "सिवी तैयार हो रही है…" : "Civvy is warming up…"}
        </p>
      </div>
    </div>
  );
}
