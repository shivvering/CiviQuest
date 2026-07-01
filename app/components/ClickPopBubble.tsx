"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";

type ClickPopBubbleProps = {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  "aria-label"?: string;
};

export function ClickPopBubble({
  children,
  className = "",
  style,
  "aria-label": ariaLabel = "Decorative bubble",
}: ClickPopBubbleProps) {
  const [popping, setPopping] = useState(false);
  const activeRef = useRef(false);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

  const finish = useCallback(() => {
    activeRef.current = false;
    setPopping(false);
  }, []);

  const activate = useCallback(() => {
    if (activeRef.current) {
      return;
    }
    activeRef.current = true;
    setPopping(true);
    const ms = reducedMotionRef.current ? 140 : 500;
    window.setTimeout(finish, ms);
  }, [finish]);

  const onPointerDown = useCallback(
    (event: PointerEvent<HTMLSpanElement>) => {
      event.stopPropagation();
      if (event.pointerType === "mouse" && event.button !== 0) {
        return;
      }
      activate();
    },
    [activate],
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLSpanElement>) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      activate();
    },
    [activate],
  );

  return (
    <span
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      className={`cq-pop-bubble inline-flex touch-manipulation select-none outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#4296CD] ${
        popping ? "cq-pop-bubble--popping" : ""
      } ${className}`}
      style={style}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
    >
      {children}
    </span>
  );
}
