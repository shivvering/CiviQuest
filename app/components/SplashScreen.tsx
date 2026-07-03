"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const SESSION_KEY = "cq-splashed";

/**
 * Full-screen ocean loader: Civvy dives out of the water in an arc while
 * the app hydrates. Shows once per browser session, for at least minMs so
 * the dive completes, then fades away.
 */
export function SplashScreen({ minMs = 1900 }: { minMs?: number }) {
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    return !window.sessionStorage.getItem(SESSION_KEY);
  });
  const [hindi] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("cq-lang") === "hi";
  });
  const rootRef = useRef<HTMLDivElement | null>(null);
  const dolphinRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!visible) return;
    window.sessionStorage.setItem(SESSION_KEY, "1");

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const ctx = gsap.context(() => {
      if (!reduced && dolphinRef.current) {
        // Dive arc: rise out of the "water", flip, dive back, repeat.
        const tl = gsap.timeline({ repeat: -1 });
        tl.fromTo(
          dolphinRef.current,
          { y: 150, rotation: -18, opacity: 0.4 },
          {
            y: -60,
            rotation: 10,
            opacity: 1,
            duration: 0.9,
            ease: "power2.out",
          },
        )
          .to(dolphinRef.current, {
            y: 150,
            rotation: 38,
            opacity: 0.5,
            duration: 0.9,
            ease: "power2.in",
          })
          .set(dolphinRef.current, { rotation: -18 });

        // Rising bubbles
        gsap.utils
          .toArray<HTMLElement>(".cq-splash-bubble")
          .forEach((bubble, i) => {
            gsap.fromTo(
              bubble,
              { y: 0, opacity: 0 },
              {
                y: -window.innerHeight * 0.9,
                opacity: 0.9,
                duration: 3 + (i % 3),
                repeat: -1,
                delay: i * 0.45,
                ease: "none",
              },
            );
          });

        // Waves drifting sideways
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
      }
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

      {Array.from({ length: 7 }, (_, i) => (
        <span
          key={i}
          className="cq-splash-bubble"
          style={{
            left: `${12 + i * 12}%`,
            width: `${8 + (i % 3) * 6}px`,
            height: `${8 + (i % 3) * 6}px`,
          }}
        />
      ))}

      <div className="relative z-10 flex flex-col items-center gap-4">
        <div ref={dolphinRef}>
          <Image
            src="/Civvy-v2.png"
            alt=""
            width={200}
            height={200}
            priority
            className="h-36 w-36 object-contain md:h-44 md:w-44"
          />
        </div>
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
