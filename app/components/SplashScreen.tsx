"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

export const SPLASH_DONE_EVENT = "cq:splash-done";

type SplashWindow = Window & { __cqSplashDone?: boolean };

export function isSplashDone(): boolean {
  return (
    typeof window !== "undefined" &&
    Boolean((window as SplashWindow).__cqSplashDone)
  );
}

const MIN_VISIBLE_MS = 2800;
const MAX_VISIBLE_MS = 7000;
const LEAVE_MS = 550;
const BACK_BUBBLES = 44;
const FRONT_BUBBLES = 16;

/** Integer-only hash, so server and browser generate identical bubbles. */
function seeded(seed: number): number {
  let t = (seed + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

type Bubble = { key: string; className: string; style: CSSProperties };

function makeBubbles(): Bubble[] {
  const bubbles: Bubble[] = [];
  for (let i = 0; i < BACK_BUBBLES; i++) {
    const r = (n: number) => seeded(i * 7 + n);
    bubbles.push({
      key: `b${i}`,
      className:
        i % 3 === 2
          ? "cq-splash-bubble cq-splash-bubble--desktop"
          : "cq-splash-bubble",
      style: {
        left: `${(((i + r(1)) / BACK_BUBBLES) * 96 + 1).toFixed(2)}%`,
        "--s": `${Math.round(5 + r(2) * 26)}px`,
        "--dur": `${(3.4 + r(3) * 1.3).toFixed(2)}s`,
        "--delay": `${(r(4) * 2.6).toFixed(2)}s`,
        "--drift": `${Math.round((r(5) - 0.5) * 40)}px`,
      } as CSSProperties,
    });
  }
  // Front layer rises through the centre, passing over the logo.
  for (let i = 0; i < FRONT_BUBBLES; i++) {
    const r = (n: number) => seeded(1000 + i * 7 + n);
    bubbles.push({
      key: `f${i}`,
      className: "cq-splash-bubble cq-splash-bubble--front",
      style: {
        left: `${(34 + ((i + r(1)) / FRONT_BUBBLES) * 30).toFixed(2)}%`,
        "--s": `${Math.round(8 + r(2) * 20)}px`,
        "--dur": `${(3 + r(3) * 0.9).toFixed(2)}s`,
        "--delay": `${(0.15 + r(4) * 2.3).toFixed(2)}s`,
        "--drift": `${Math.round((r(5) - 0.5) * 48)}px`,
      } as CSSProperties,
    });
  }
  return bubbles;
}

const BUBBLES = makeBubbles();

function fadeOutAudio(audio: HTMLAudioElement | null) {
  if (!audio || audio.paused) return;
  const start = audio.volume;
  let step = 0;
  const timer = window.setInterval(() => {
    step += 1;
    audio.volume = Math.max(0, start * (1 - step / 10));
    if (step >= 10) {
      window.clearInterval(timer);
      audio.pause();
    }
  }, 50);
}

/**
 * Full-screen ocean loader shown on every page load. It is server-rendered
 * and CSS-animated so it covers the page from the very first paint; the
 * client only decides when to lift it (page fully loaded, and at least
 * MIN_VISIBLE_MS since navigation started).
 *
 * The bubble sound plays on load wherever the browser allows it. Phones and
 * Safari refuse sound until the visitor taps, so there it plays only if they
 * tap while the loader is showing.
 */
export function SplashScreen() {
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    try {
      if (window.localStorage.getItem("cq-lang") === "hi") {
        document.documentElement.lang = "hi";
      }
    } catch {
      /* storage unavailable */
    }

    const audio = audioRef.current;
    // pointerdown/touchstart don't count as permission to play sound on
    // phones; the end of a tap and the click do.
    const gestureEvents = ["pointerup", "touchend", "click", "keydown"] as const;
    const timers: number[] = [];
    let playing = false;
    let attempting = false;
    let done = false;

    function removeGestures() {
      gestureEvents.forEach((name) =>
        window.removeEventListener(name, playSound),
      );
    }

    function playSound() {
      if (!audio || done || playing || attempting) return;
      attempting = true;
      audio
        .play()
        .then(() => {
          playing = true;
          removeGestures();
        })
        .catch(() => {
          /* refused until the visitor taps; the gesture listeners retry */
        })
        .finally(() => {
          attempting = false;
        });
    }

    gestureEvents.forEach((name) =>
      window.addEventListener(name, playSound, { passive: true }),
    );
    if (audio) audio.volume = 0.8;
    playSound();

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const minMs = reduced ? 1200 : MIN_VISIBLE_MS;

    function leave() {
      if (done) return;
      done = true;
      removeGestures();
      (window as SplashWindow).__cqSplashDone = true;
      window.dispatchEvent(new Event(SPLASH_DONE_EVENT));
      setLeaving(true);
      timers.push(window.setTimeout(() => setGone(true), LEAVE_MS));
      timers.push(window.setTimeout(() => fadeOutAudio(audio), 2500));
    }

    function scheduleLeave() {
      timers.push(
        window.setTimeout(leave, Math.max(0, minMs - performance.now())),
      );
    }

    if (document.readyState === "complete") {
      scheduleLeave();
    } else {
      window.addEventListener("load", scheduleLeave, { once: true });
    }
    timers.push(
      window.setTimeout(leave, Math.max(0, MAX_VISIBLE_MS - performance.now())),
    );

    return () => {
      removeGestures();
      window.removeEventListener("load", scheduleLeave);
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  return (
    <>
      {!gone && (
        <div
          className={`cq-splash${leaving ? " is-leaving" : ""}`}
          role="status"
          aria-label="Loading CiviQuest"
        >
          <div className="cq-splash-wave cq-splash-wave--a" aria-hidden />
          <div className="cq-splash-wave cq-splash-wave--b" aria-hidden />

          {BUBBLES.map((bubble) => (
            <span
              key={bubble.key}
              aria-hidden
              className={bubble.className}
              style={bubble.style}
            />
          ))}

          <div className="cq-splash-content">
            <Image
              src="/cq-logo.png"
              alt="CiviQuest logo"
              width={120}
              height={119}
              loading="eager"
              fetchPriority="high"
              className="cq-splash-logo h-24 w-24 object-contain md:h-28 md:w-28"
            />
            <p className="font-[var(--font-montserrat)] text-3xl font-black tracking-tight text-white md:text-4xl">
              CiviQuest
            </p>
            <p className="cq-shimmer text-sm font-bold md:text-base">
              <span className="cq-splash-text-en">Civvy is warming up…</span>
              <span className="cq-splash-text-hi">सिवी तैयार हो रही है…</span>
            </p>
          </div>
        </div>
      )}
      <audio ref={audioRef} autoPlay preload="auto" aria-hidden>
        <source src="/sounds/splash-bubbles.m4a" type="audio/mp4" />
        <source src="/sounds/splash-bubbles.mp3" type="audio/mpeg" />
      </audio>
    </>
  );
}
