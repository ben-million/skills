"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Phase = "idle" | "shake-1" | "shake-2" | "settle";

export function GrugLogo({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const mountedRef = useRef(true);

  const scheduleNext = useCallback(() => {
    const delay = 4000 + Math.random() * 8000;
    timeoutRef.current = setTimeout(() => {
      if (!mountedRef.current) return;
      setPhase("shake-1");
    }, delay);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    scheduleNext();
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [scheduleNext]);

  useEffect(() => {
    if (phase === "idle") return;

    let t: ReturnType<typeof setTimeout>;
    switch (phase) {
      case "shake-1":
        t = setTimeout(() => mountedRef.current && setPhase("shake-2"), 100);
        break;
      case "shake-2":
        t = setTimeout(() => mountedRef.current && setPhase("settle"), 100);
        break;
      case "settle":
        t = setTimeout(() => {
          if (!mountedRef.current) return;
          setPhase("idle");
          scheduleNext();
        }, 400);
        break;
    }
    return () => clearTimeout(t);
  }, [phase, scheduleNext]);

  const getTransform = () => {
    switch (phase) {
      case "shake-1":
        return "rotate(-3deg)";
      case "shake-2":
        return "rotate(3deg)";
      default:
        return "rotate(0deg)";
    }
  };

  const transition =
    phase === "settle"
      ? "transform 0.4s cubic-bezier(0.34, 1.8, 0.64, 1)"
      : "transform 0.08s cubic-bezier(0, 0, 0.2, 1)";

  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <span
        style={{
          display: "inline-block",
          transform: getTransform(),
          transition,
          transformOrigin: "center bottom",
        }}
      >
        {children}
      </span>
    </span>
  );
}
