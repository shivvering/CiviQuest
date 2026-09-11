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
const MAX_LOADING_MS = 7000;
const LEAVE_MS = 550;
/** After a tap starts the sound, keep the ocean up long enough to hear it. */
const AFTER_TAP_MS = 1200;
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

type SoundState = "pending" | "playing" | "blocked" | "unavailable";

/**
 * Full-screen ocean loader shown on every page load. It is server-rendered
 * and CSS-animated so it covers the page from the very first paint; the
 * client decides when to lift it (page loaded, at least MIN_VISIBLE_MS since
 * navigation started, and the bubble sound playing).
 *
 * Phones and Safari refuse to play sound until the visitor taps the page. When
 * that happens the loader shows a "Tap to dive in" button and waits for the
 * tap, which starts the sound — the only way sound can play on those devices.
 */
export function SplashScreen() {
  const [live, setLive] = useState(false);
  const [needsTap, setNeedsTap] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setLive(true);
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
    let sound: SoundState = "pending";
    let attempting = false;
    let tappedAt: number | null = null;
    let ready = false;
    let done = false;

    function removeGestures() {
      gestureEvents.forEach((name) =>
        window.removeEventListener(name, onGesture),
      );
    }

    function leave() {
      if (done) return;
      done = true;
      removeGestures();
      (window as SplashWindow).__cqSplashDone = true;
      window.dispatchEvent(new Event(SPLASH_DONE_EVENT));
      setNeedsTap(false);
      setLeaving(true);
      timers.push(window.setTimeout(() => setGone(true), LEAVE_MS));
      timers.push(window.setTimeout(() => fadeOutAudio(audio), 2500));
    }

    function maybeLeave() {
      if (done || !ready || sound === "pending") return;
      if (sound === "blocked") {
        setNeedsTap(true);
        return;
      }
      const wait =
        tappedAt === null ? 0 : tappedAt + AFTER_TAP_MS - performance.now();
      if (wait > 0) {
        timers.push(window.setTimeout(maybeLeave, wait));
        return;
      }
      leave();
    }

    function startSound(fromGesture: boolean) {
      if (!audio) {
        sound = "unavailable";
        maybeLeave();
        return;
      }
      attempting = true;
      audio
        .play()
        .then(() => {
          attempting = false;
          sound = "playing";
          setNeedsTap(false);
          maybeLeave();
        })
        .catch((error: unknown) => {
          attempting = false;
          if (sound === "playing") return;
          const blocked =
            error instanceof DOMException && error.name === "NotAllowedError";
          if (blocked) {
            sound = "blocked";
            if (fromGesture) tappedAt = null;
            setNeedsTap(true);
          } else {
            sound = "unavailable";
          }
          maybeLeave();
        });
    }

    function onGesture() {
      if (done || sound === "playing" || attempting) return;
      tappedAt = performance.now();
      setNeedsTap(false);
      startSound(true);
    }

    gestureEvents.forEach((name) =>
      window.addEventListener(name, onGesture, { passive: true }),
    );
    if (audio) audio.volume = 0.8;
    startSound(false);

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const minMs = reduced ? 1200 : MIN_VISIBLE_MS;

    function markReady() {
      ready = true;
      maybeLeave();
    }

    function scheduleReady() {
      timers.push(
        window.setTimeout(markReady, Math.max(0, minMs - performance.now())),
      );
    }

    if (document.readyState === "complete") {
      scheduleReady();
    } else {
      window.addEventListener("load", scheduleReady, { once: true });
    }
    // Don't wait forever on slow assets or a sound file that won't load.
    timers.push(
      window.setTimeout(
        () => {
          if (sound === "pending") sound = "unavailable";
          markReady();
        },
        Math.max(0, MAX_LOADING_MS - performance.now()),
      ),
    );

    return () => {
      removeGestures();
      window.removeEventListener("load", scheduleReady);
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  const splashClass = [
    "cq-splash",
    live && "is-live",
    needsTap && "needs-tap",
    leaving && "is-leaving",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      {!gone && (
        <div className={splashClass} role="status" aria-label="Loading CiviQuest">
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
            {needsTap ? (
              <button type="button" className="cq-splash-tap">
                <span aria-hidden>🔊</span>
                <span className="cq-splash-text-en">Tap to dive in</span>
                <span className="cq-splash-text-hi">डुबकी लगाने के लिए टैप करो</span>
              </button>
            ) : (
              <p className="cq-shimmer text-sm font-bold md:text-base">
                <span className="cq-splash-text-en">Civvy is warming up…</span>
                <span className="cq-splash-text-hi">सिवी तैयार हो रही है…</span>
              </p>
            )}
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
