"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Calligraph } from "calligraph";

const FONT = "'Open Runde', system-ui, sans-serif";
const SHAKE_KEYFRAMES = `@keyframes __nudge-shake{0%,100%{translate:0}25%{translate:-2px}50%{translate:2px}75%{translate:-1px}}`;
let shakeInjected = false;
const ARROW_D =
  "M13.415 2.5C12.634 1.719 11.367 1.719 10.586 2.5L3.427 9.659C2.01 11.076 3.014 13.5 5.018 13.5H7V20C7 21.104 7.895 22 9 22H15C16.105 22 17 21.104 17 20V13.5H18.983C20.987 13.5 21.991 11.076 20.574 9.659L13.415 2.5Z";
const ORIGINAL = 61;

const SLIDES = [
  { label: "font size", min: 32, max: 86, original: 61, unit: "px", demo: 48 },
  { label: "opacity", min: 0, max: 100, original: 100, unit: "%", demo: 20 },
  { label: "padding", min: 6, max: 48, original: 16, unit: "px", demo: 6 },
  { label: "color", min: 0, max: 360, original: 220, unit: "°", demo: 160 },
];

// ---------------------------------------------------------------------------
// Audio — subtle haptic tick via Web Audio API
// ---------------------------------------------------------------------------

let audioCtx: AudioContext | null = null;
let lastTickTime = 0;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

let oreoBuffer: AudioBuffer | null = null;
let oreoLoading = false;
let lastOreoIdx = 0;
let lastAlertTime = 0;

const OREO_SPRITES: [number, number][] = [
  [22000, 103], [12000, 109], [0, 120],
];
const OREO_BOUNDARY_MAX: [number, number] = [10000, 135];
const OREO_BOUNDARY_MIN: [number, number] = [24000, 145];

function loadOreoBuffer() {
  if (oreoBuffer || oreoLoading) return;
  oreoLoading = true;
  const ctx = getAudioCtx();
  fetch("/oreo.mp3")
    .then(r => r.arrayBuffer())
    .then(ab => ctx.decodeAudioData(ab))
    .then(buf => { oreoBuffer = buf; })
    .catch(() => { oreoLoading = false; });
}

function scheduleTick(time: number, volume: number) {
  const ctx = getAudioCtx();
  loadOreoBuffer();
  if (!oreoBuffer) return;
  lastOreoIdx = (lastOreoIdx + 1) % OREO_SPRITES.length;
  const sprite = OREO_SPRITES[lastOreoIdx];
  const offset = sprite[0] / 1000;
  const halfDur = sprite[1] / 1000 / 2;
  const src = ctx.createBufferSource();
  src.buffer = oreoBuffer;
  const gain = ctx.createGain();
  gain.gain.value = volume * (0.85 + Math.random() * 0.3);
  src.connect(gain);
  gain.connect(ctx.destination);
  src.start(time, offset, halfDur);
}

const OREO_CONFIRM: [number, number] = [8000, 112];

function playConfirm() {
  const ctx = getAudioCtx();
  loadOreoBuffer();
  if (!oreoBuffer) return;
  const offset = OREO_CONFIRM[0] / 1000;
  const halfDur = OREO_CONFIRM[1] / 1000 / 2;
  const src = ctx.createBufferSource();
  src.buffer = oreoBuffer;
  const gain = ctx.createGain();
  gain.gain.value = 0.6;
  src.connect(gain);
  gain.connect(ctx.destination);
  src.start(ctx.currentTime, offset, halfDur);
}

function playTick(held = false) {
  const now = performance.now();
  if (held && now - lastTickTime < 50) return;
  lastTickTime = now;

  const ctx = getAudioCtx();
  scheduleTick(ctx.currentTime, held ? 0.3 : 0.55);
}

let atBoundary = false;

function playBoundary(isMax: boolean) {
  if (atBoundary) return;
  atBoundary = true;
  const ctx = getAudioCtx();
  loadOreoBuffer();
  if (!oreoBuffer) return;
  const sprite = isMax ? OREO_BOUNDARY_MAX : OREO_BOUNDARY_MIN;
  const offset = sprite[0] / 1000;
  const halfDur = sprite[1] / 1000 / 2;
  const src = ctx.createBufferSource();
  src.buffer = oreoBuffer;
  const gain = ctx.createGain();
  gain.gain.value = 0.55;
  src.connect(gain);
  gain.connect(ctx.destination);
  src.start(ctx.currentTime, offset, halfDur);
}

function playDoubleTick() {
  const ctx = getAudioCtx();
  scheduleTick(ctx.currentTime, 0.25);
  scheduleTick(ctx.currentTime + 0.055, 0.15);
}

function Arrow({
  active,
  down,
  disabled,
  onClick,
  activeColor,
}: {
  active: boolean;
  down?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  activeColor?: string;
}) {
  const fill = disabled ? "#A7A7A7" : active ? (activeColor ?? "#FFFFFF") : "#A7A7A7";
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={disabled ? undefined : onClick}
      style={{
        width: 19,
        height: "auto",
        flexShrink: 0,
        cursor: disabled ? "default" : "pointer",
        transform: `rotate(${down ? 180 : 0}deg) translateY(${active && !disabled ? -2.5 : 0}px) scale(${active && !disabled ? 1.08 : 1})`,
        transition: active
          ? "transform 0.03s cubic-bezier(0, 0, 0.2, 1)"
          : "transform 0.45s cubic-bezier(0.34, 1.8, 0.64, 1)",
      }}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d={ARROW_D}
        fill={fill}
        style={{
          transition: disabled
            ? "fill 0.2s ease"
            : active ? "fill 0.05s ease" : "fill 0.3s ease",
        }}
      />
    </svg>
  );
}

export interface PreviewFeatures {
  keyboard?: boolean;
  expandValue?: boolean;
  animatedDigits?: boolean;
  arrowBounce?: boolean;
  barPhysics?: boolean;
  boundaryShake?: boolean;
  sound?: boolean;
  buttonFeedback?: boolean;
  numberInput?: boolean;
  shiftStep?: boolean;
  idleOpacity?: boolean;
  showLabel?: boolean;
  showButtons?: boolean;
  showText?: boolean;
}

const ALL_FEATURES: PreviewFeatures = {
  keyboard: true,
  expandValue: true,
  animatedDigits: true,
  arrowBounce: true,
  barPhysics: true,
  boundaryShake: true,
  sound: true,
  buttonFeedback: true,
  numberInput: true,
  shiftStep: true,
  idleOpacity: true,
  showLabel: true,
  showButtons: true,
  showText: true,
};

export function BudgeMePaperPreview({ features: f = ALL_FEATURES, autoFocus }: { features?: PreviewFeatures; autoFocus?: boolean } = {}) {
  const [value, setValue] = useState(ORIGINAL);
  const [typedRaw, setTypedRaw] = useState<string | null>(null);
  const [activeKey, setActiveKey] = useState<"up" | "down" | null>(null);
  const [isNudging, setIsNudging] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [pressedButton, setPressedButton] = useState<"reset" | "copy" | "prev" | "next" | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [shaking, setShaking] = useState(false);
  const shakeTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const nudgeTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const confirmedTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const digitBufferRef = useRef("");
  const digitTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const valueRef = useRef(ORIGINAL);
  const calibrationRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const calibratedRef = useRef<Set<number>>(new Set([0]));

  useEffect(() => {
    if (!shakeInjected) {
      const style = document.createElement("style");
      style.textContent = SHAKE_KEYFRAMES;
      document.head.appendChild(style);
      shakeInjected = true;
    }
  }, []);

  useEffect(() => {
    if (autoFocus) containerRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    if (f.sound) loadOreoBuffer();
  }, [f.sound]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    function onWindowFocus() {
      if (el && el.contains(document.activeElement) || document.activeElement === document.body) {
        el?.focus();
      }
    }
    window.addEventListener("focus", onWindowFocus);
    return () => window.removeEventListener("focus", onWindowFocus);
  }, []);

  const [slide, setSlide] = useState(0);
  const s = SLIDES[slide];

  const goToSlide = useCallback((index: number) => {
    index = ((index % SLIDES.length) + SLIDES.length) % SLIDES.length;
    calibrationRef.current.forEach(clearTimeout);
    calibrationRef.current = [];
    setSlide(index);
    const cfg = SLIDES[index];
    valueRef.current = cfg.original;
    setValue(cfg.original);
    setTypedRaw(null);
    setIsNudging(true);
    setShaking(false);
    setConfirmed(false);
    setShowPrompt(false);
    setActiveKey(null);
    digitBufferRef.current = "";
    clearTimeout(digitTimeoutRef.current);
    clearTimeout(nudgeTimeoutRef.current);
    clearTimeout(shakeTimeoutRef.current);
    clearTimeout(confirmedTimeoutRef.current);

    if (!calibratedRef.current.has(index)) {
      calibratedRef.current.add(index);

      const steps: [number, number][] = [];
      const range = cfg.original - cfg.demo;
      const downSteps = 4;
      const upSteps = 5;
      let t = 200;

      for (let i = 1; i <= downSteps; i++) {
        const val = Math.round(cfg.original - (range * i) / downSteps);
        steps.push([t, val]);
        t += 75 + i * 8;
      }
      t += 150;
      for (let i = 1; i <= upSteps; i++) {
        const val = Math.round(cfg.demo + (range * i) / upSteps);
        steps.push([t, val]);
        t += 65 + (upSteps - i) * 6;
      }

      steps.forEach(([delay, val], i) => {
        calibrationRef.current.push(
          setTimeout(() => {
            valueRef.current = val;
            setValue(val);
            setIsNudging(true);
            setActiveKey(i < downSteps ? "down" : "up");
            if (f.sound) playTick();
            clearTimeout(nudgeTimeoutRef.current);
          }, delay),
          setTimeout(() => {
            setActiveKey(null);
          }, delay + 60),
        );
      });

      calibrationRef.current.push(
        setTimeout(() => {
          setIsNudging(false);
        }, t + 300),
      );
    } else {
      setIsNudging(false);
    }
  }, [f.sound]);

  const cancelCalibration = useCallback(() => {
    if (calibrationRef.current.length === 0) return;
    calibrationRef.current.forEach(clearTimeout);
    calibrationRef.current = [];
    setActiveKey(null);
  }, []);

  const applyDigitBufferRef = useRef(() => {});
  applyDigitBufferRef.current = () => {
    const num = parseInt(digitBufferRef.current, 10);
    digitBufferRef.current = "";
    if (isNaN(num)) return;
    const clamped = Math.min(s.max, Math.max(s.min, num));
    if (clamped !== valueRef.current) {
      valueRef.current = clamped;
      setValue(clamped);
      setIsNudging(true);
      clearTimeout(nudgeTimeoutRef.current);
      nudgeTimeoutRef.current = setTimeout(() => setIsNudging(false), 600);
      playTick();
    }
  };

  const step = useCallback((direction: number, shift = false, held = false) => {
    cancelCalibration();
    const mult = (f.shiftStep && shift) ? 10 : 1;
    const next = valueRef.current + direction * mult;
    if (next > s.max || next < s.min) {
      if (f.boundaryShake) {
        setShaking(true);
        clearTimeout(shakeTimeoutRef.current);
        shakeTimeoutRef.current = setTimeout(() => setShaking(false), 300);
      }
      if (f.sound) playBoundary(next > s.max);
      return;
    }
    atBoundary = false;
    setShaking(false);
    valueRef.current = next;
    setValue(valueRef.current);
    if (f.sound) playTick(held);
  }, [f.shiftStep, f.boundaryShake, f.sound, s.min, s.max, cancelCalibration]);

  const triggerNudge = useCallback(
    (dir: "up" | "down") => {
      step(dir === "up" ? 1 : -1);
      setActiveKey(dir);
      setTimeout(() => setActiveKey(null), 100);
    },
    [step],
  );

  const reset = useCallback(() => {
    cancelCalibration();
    const prev = valueRef.current;
    valueRef.current = s.original;
    setValue(s.original);
    setIsNudging(true);
    if (f.buttonFeedback) setPressedButton("reset");
    clearTimeout(nudgeTimeoutRef.current);
    nudgeTimeoutRef.current = setTimeout(() => setIsNudging(false), 600);
    if (f.buttonFeedback) setTimeout(() => setPressedButton(null), 70);
    if (f.sound) {
      if (Math.floor(prev / 10) !== Math.floor(s.original / 10)) {
        playDoubleTick();
      } else {
        playTick();
      }
    }
  }, [f.buttonFeedback, f.sound, s.original, cancelCalibration]);

  const copy = useCallback(() => {
    cancelCalibration();
    const props = ["font-size", "opacity", "padding", "color"];
    const prop = props[slide] ?? props[0];
    const val = slide === 3 ? `hsl(${valueRef.current}, 70%, 55%)` : `${valueRef.current}${s.unit}`;
    const prompt = `Set \`${prop}\` to \`${val}\``;
    navigator.clipboard?.writeText(prompt);
    setShowPrompt(true);
    setConfirmed(true);
    setIsNudging(true);
    if (f.buttonFeedback) setPressedButton("copy");
    clearTimeout(confirmedTimeoutRef.current);
    confirmedTimeoutRef.current = setTimeout(() => {
      setConfirmed(false);
      setIsNudging(false);
    }, 800);
    if (f.buttonFeedback) setTimeout(() => setPressedButton(null), 70);
    if (f.sound) playConfirm();
  }, [f.buttonFeedback, f.sound, slide, cancelCalibration]);

  useEffect(() => {
    if (!f.keyboard) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        step(1, e.shiftKey, e.repeat);
        setActiveKey("up");
        if (f.expandValue) {
          setIsNudging(true);
          clearTimeout(nudgeTimeoutRef.current);
          nudgeTimeoutRef.current = setTimeout(() => setIsNudging(false), 600);
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        step(-1, e.shiftKey, e.repeat);
        setActiveKey("down");
        if (f.expandValue) {
          setIsNudging(true);
          clearTimeout(nudgeTimeoutRef.current);
          nudgeTimeoutRef.current = setTimeout(() => setIsNudging(false), 600);
        }
      } else if (f.numberInput && e.key >= "0" && e.key <= "9") {
        e.preventDefault();
        if (digitBufferRef.current.length >= 3) return;
        digitBufferRef.current += e.key;
        const num = parseInt(digitBufferRef.current, 10);
        if (!isNaN(num)) {
          setTypedRaw(digitBufferRef.current);
          setIsNudging(true);
          if (f.sound) playTick();
          if (num >= s.min && num <= s.max) {
            valueRef.current = num;
            setValue(num);
          }
        }
        clearTimeout(digitTimeoutRef.current);
        clearTimeout(nudgeTimeoutRef.current);
        digitTimeoutRef.current = setTimeout(() => {
          const final = parseInt(digitBufferRef.current, 10);
          digitBufferRef.current = "";
          if (!isNaN(final) && (final < s.min || final > s.max)) {
            const clamped = Math.min(s.max, Math.max(s.min, final));
            valueRef.current = clamped;
            setValue(clamped);
            setTypedRaw(null);
            if (f.boundaryShake) {
              setShaking(true);
              clearTimeout(shakeTimeoutRef.current);
              shakeTimeoutRef.current = setTimeout(() => setShaking(false), 300);
            }
            if (f.sound) playAlert();
            nudgeTimeoutRef.current = setTimeout(() => setIsNudging(false), 600);
          } else {
            setTypedRaw(null);
            setIsNudging(false);
          }
        }, 500);
      } else if ((e.key === "r" || e.key === "R") && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        reset();
      } else if (e.key === "Enter") {
        e.preventDefault();
        copy();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (f.buttonFeedback) { setPressedButton("prev"); setTimeout(() => setPressedButton(null), 70); }
        goToSlide(slide - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (f.buttonFeedback) { setPressedButton("next"); setTimeout(() => setPressedButton(null), 70); }
        goToSlide(slide + 1);
      }
    }

    function onKeyUp(e: KeyboardEvent) {
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        setActiveKey(null);
      }
    }

    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("keydown", onKeyDown);
    el.addEventListener("keyup", onKeyUp);
    return () => {
      el.removeEventListener("keydown", onKeyDown);
      el.removeEventListener("keyup", onKeyUp);
      clearTimeout(nudgeTimeoutRef.current);
    };
  }, [step, reset, copy, goToSlide, slide, f.keyboard, f.expandValue, f.numberInput, f.boundaryShake, f.sound, s.min, s.max]);

  const displayValue = typedRaw !== null ? `${typedRaw}${s.unit}` : `${value}${s.unit}`;
  const typedOutOfRange = typedRaw !== null && (() => {
    const n = parseInt(typedRaw, 10);
    return !isNaN(n) && (n < s.min || n > s.max);
  })();
  const atMin = value <= s.min;
  const atMax = value >= s.max;
  const isColorSlide = slide === 3;
  const targetColor = `hsl(${value}, 70%, 55%)`;
  const nudgeY = 0;
  const baseScale = f.barPhysics ? (confirmed ? 1.02 : isNudging ? 1 : 0.8) : 1;

  const expandTransition =
    "max-width 0.5s cubic-bezier(0.32, 0.72, 0, 1), " +
    "margin-right 0.5s cubic-bezier(0.32, 0.72, 0, 1), " +
    "opacity 0.35s ease 0.1s";
  const collapseTransition =
    "max-width 0.45s cubic-bezier(0.32, 0.72, 0, 1), " +
    "margin-right 0.45s cubic-bezier(0.32, 0.72, 0, 1), " +
    "opacity 0.15s ease";

  return (
    <>
    <div
      ref={containerRef}
      tabIndex={0}
      onPointerDown={() => containerRef.current?.focus()}
      className="budge-me-paper-preview [font-synthesis:none] flex w-114.25 h-77.75 flex-col rounded-[14px] overflow-clip bg-[#FEFEFE] [box-shadow:#0000000F_0px_0px_0px_1px,#0000000F_0px_1px_2px_-1px,#0000000A_0px_2px_4px] antialiased text-xs/4 outline-none">
      <div className={`flex min-h-0 flex-col items-center grow shrink basis-[0%] gap-7${f.showText === false && f.showLabel === false ? " justify-center" : ""}`}>
        {f.showLabel !== false && (
          <div className="tracking-[0.13em] font-sans font-semibold text-xs/4.5 text-[#909090] pt-3.5 self-center shrink-0 uppercase">
{s.label}
          </div>
        )}
        {f.showText !== false && (
          <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center">
            <div style={{
              position: "relative",
              padding: slide === 2 ? value : 0,
              background: slide === 2 ? "rgba(59, 130, 246, 0.08)" : "transparent",
              borderRadius: slide === 2 ? 6 : 0,
              transition: "padding 0.1s cubic-bezier(0.32, 0.72, 0, 1), background 0.2s ease, border-radius 0.2s ease",
            }}>
              {slide === 2 && (
                <div style={{
                  position: "absolute",
                  inset: 0,
                  border: "1.5px dashed rgba(59, 130, 246, 0.35)",
                  borderRadius: 6,
                  pointerEvents: "none",
                }} />
              )}
              <div
                className="left-0 top-0 [white-space-collapse:preserve] relative text-[#3C3C3C] text-[61px]/18.5"
                style={{
                  fontFamily: '"Ivar Hand TRIAL", ui-serif, serif',
                  fontSize: slide === 0 ? `${value}px` : '61px',
                  opacity: slide === 1 ? value / 100 : 1,
                  color: isColorSlide ? targetColor : undefined,
                  background: slide === 2 ? "#FEFEFE" : "transparent",
                  borderRadius: slide === 2 ? 3 : 0,
                  transition: slide === 0
                    ? "font-size 0.1s cubic-bezier(0.32, 0.72, 0, 1)"
                    : slide === 1
                      ? "opacity 0.1s cubic-bezier(0.32, 0.72, 0, 1)"
                      : isColorSlide
                        ? "color 0.1s cubic-bezier(0.32, 0.72, 0, 1)"
                        : "background 0.2s ease",
                }}
              >
                budge
              </div>
            </div>
          </div>
        )}

        <div
          ref={barRef}
          className="shrink-0"
          style={{
            display: "flex",
            height: 37,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 9999,
            padding: "0 16px",
            ...(f.showText === false ? { marginTop: "auto" } : {}),
            marginBottom: 24,
            background: "#161616",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            fontSynthesis: "none",
            WebkitFontSmoothing: "antialiased",
            userSelect: "none",
            transform: `translateY(${nudgeY}px) scale(${baseScale})`,
            opacity: f.idleOpacity ? (isNudging || confirmed ? 1 : 0.8) : 1,
            transition: f.barPhysics
              ? (confirmed
                  ? "transform 0.3s cubic-bezier(0.2, 0, 0, 1.2), opacity 0.2s ease"
                  : isNudging
                    ? "transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.15s ease"
                    : "transform 0.5s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.4s ease 0.1s")
              : "opacity 0.3s ease",
            animation: shaking
              ? "__nudge-shake 0.15s cubic-bezier(0.36, 0.07, 0.19, 0.97) infinite"
              : "none",
          }}
        >
          {confirmed ? (
            <span
              style={{
                color: "#fff",
                fontFamily: FONT,
                fontWeight: 500,
                fontSize: 14.5,
                lineHeight: "22px",
                whiteSpace: "nowrap",
              }}
            >
              Prompt copied
            </span>
          ) : (
            <>
              <div
                style={{
                  maxWidth: isNudging && !isColorSlide ? 100 : 0,
                  marginRight: isNudging && !isColorSlide ? 1 : 0,
                  opacity: isNudging && !isColorSlide ? 1 : 0,
                  transition: isNudging
                    ? expandTransition
                    : collapseTransition,
                  display: "flex",
                  alignItems: "center",
                  overflow: "visible",
                }}
              >
{f.animatedDigits ? (
                  <Calligraph
                    variant="slots"
                    animation="snappy"
                    stagger={0}
                    style={{
                      color: shaking || typedOutOfRange ? "#A7A7A7" : "#fff",
                      fontFamily: FONT,
                      fontWeight: 500,
                      fontSize: 14.5,
                      lineHeight: "22px",
                      whiteSpace: "nowrap",
                      fontVariantNumeric: "tabular-nums",
                      minWidth: 48,
                      textAlign: "left",
                      transition: "color 0.2s ease",
                    }}
                  >
                    {displayValue}
                  </Calligraph>
                ) : (
                  <span
                    style={{
                      color: shaking || typedOutOfRange ? "#A7A7A7" : "#fff",
                      fontFamily: FONT,
                      fontWeight: 500,
                      fontSize: 14.5,
                      lineHeight: "22px",
                      whiteSpace: "nowrap",
                      fontVariantNumeric: "tabular-nums",
                      minWidth: 48,
                      textAlign: "left",
                      transition: "color 0.2s ease",
                    }}
                  >
                    {displayValue}
                  </span>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Arrow
                  down
                  active={f.arrowBounce ? activeKey === "down" : false}
                  disabled={shaking && atMin}
                  onClick={() => triggerNudge("down")}
                  activeColor={isColorSlide ? targetColor : undefined}
                />
                <Arrow
                  active={f.arrowBounce ? activeKey === "up" : false}
                  disabled={shaking && atMax}
                  onClick={() => triggerNudge("up")}
                  activeColor={isColorSlide ? targetColor : undefined}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {f.showButtons !== false && (
        <div className="flex items-center justify-between h-15 shrink-0 px-3.5">
          <div
            onClick={() => { if (f.buttonFeedback) { setPressedButton("prev"); setTimeout(() => setPressedButton(null), 70); } if (f.sound) playTick(); goToSlide(slide - 1); }}
            className="flex items-center justify-center rounded-full overflow-hidden bg-white [box-shadow:#0000000F_0px_0px_0px_1px,#0000000F_0px_1px_2px_-1px,#0000000A_0px_2px_4px] shrink-0 size-8 cursor-pointer"
            style={f.buttonFeedback ? {
              transform: pressedButton === "prev" ? "translateX(-2px) scale(0.9)" : "translateX(0) scale(1)",
              transition: pressedButton === "prev"
                ? "transform 0.05s cubic-bezier(0.2, 0, 0, 1.6)"
                : "transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)",
            } : undefined}
          >
            <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '20px', height: '20px', flexShrink: 0, marginLeft: '-1.5px' }}>
              <path fillRule="evenodd" clipRule="evenodd" d="M14.707 16.707C15.098 16.317 15.098 15.683 14.707 15.293L11.414 12L14.707 8.707C15.098 8.317 15.098 7.683 14.707 7.293C14.317 6.902 13.683 6.902 13.293 7.293L9.293 11.293C9.105 11.48 9 11.735 9 12C9 12.265 9.105 12.52 9.293 12.707L13.293 16.707C13.683 17.098 14.317 17.098 14.707 16.707Z" fill="#000000" />
            </svg>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={reset}
              className="cursor-pointer flex items-center justify-center px-4 h-8 rounded-full gap-1.5 bg-white [box-shadow:#0000000F_0px_0px_0px_1px,#0000000F_0px_1px_2px_-1px,#0000000A_0px_2px_4px] shrink-0"
              style={f.buttonFeedback ? {
                transform: pressedButton === "reset" ? "scale(0.975)" : "scale(1)",
                transition: pressedButton === "reset"
                  ? "transform 0.03s linear"
                  : "transform 0.1s cubic-bezier(0.32, 0.72, 0, 1)",
              } : undefined}
            >
              <div className="[letter-spacing:0px] w-max left-0 top-0 [white-space-collapse:preserve] relative text-[#323232] font-sans font-medium shrink-0 text-[14px]/4.5">
                Reset
              </div>
              <div className="[letter-spacing:0px] w-max left-0 top-0 [white-space-collapse:preserve] relative text-[#919191] font-sans font-medium shrink-0 text-[14px]/4.5">
                R
              </div>
            </button>
            <button
              type="button"
              onClick={copy}
              className="cursor-pointer flex items-center justify-center px-4 h-8 rounded-full gap-1.5 bg-white [box-shadow:#0000000F_0px_0px_0px_1px,#0000000F_0px_1px_2px_-1px,#0000000A_0px_2px_4px] shrink-0"
              style={f.buttonFeedback ? {
                transform: pressedButton === "copy" ? "scale(0.975)" : "scale(1)",
                transition: pressedButton === "copy"
                  ? "transform 0.03s linear"
                  : "transform 0.1s cubic-bezier(0.32, 0.72, 0, 1)",
              } : undefined}
            >
              <div className="[letter-spacing:0px] w-max left-0 top-0 [white-space-collapse:preserve] relative text-[#323232] font-sans font-medium shrink-0 text-[14px]/4.5">
                Copy
              </div>
              <div className="[letter-spacing:0px] w-max left-0 top-0 [white-space-collapse:preserve] relative text-[#919191] font-sans font-medium shrink-0 text-[14px]/4.5">
                ↵
              </div>
            </button>
          </div>
          <div
            onClick={() => { if (f.buttonFeedback) { setPressedButton("next"); setTimeout(() => setPressedButton(null), 70); } if (f.sound) playTick(); goToSlide(slide + 1); }}
            className="flex items-center justify-center rounded-full overflow-hidden bg-white [box-shadow:#0000000F_0px_0px_0px_1px,#0000000F_0px_1px_2px_-1px,#0000000A_0px_2px_4px] shrink-0 size-8 cursor-pointer"
            style={f.buttonFeedback ? {
              transform: pressedButton === "next" ? "translateX(2px) scale(0.9)" : "translateX(0) scale(1)",
              transition: pressedButton === "next"
                ? "transform 0.05s cubic-bezier(0.2, 0, 0, 1.6)"
                : "transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)",
            } : undefined}
          >
            <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ rotate: '180deg', width: '20px', height: '20px', flexShrink: 0, transformOrigin: '50% 50%', marginRight: '-1.5px' }}>
              <path fillRule="evenodd" clipRule="evenodd" d="M14.707 16.707C15.098 16.317 15.098 15.683 14.707 15.293L11.414 12L14.707 8.707C15.098 8.317 15.098 7.683 14.707 7.293C14.317 6.902 13.683 6.902 13.293 7.293L9.293 11.293C9.105 11.48 9 11.735 9 12C9 12.265 9.105 12.52 9.293 12.707L13.293 16.707C13.683 17.098 14.317 17.098 14.707 16.707Z" fill="#000000" style={{ transformOrigin: '50% 50%' }} />
            </svg>
          </div>
        </div>
      )}
    </div>
    {showPrompt && (
      <div
        style={{
          marginTop: 16,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          fontSize: 13.5,
          lineHeight: "20px",
          color: "#6B6B6B",
          textAlign: "center",
          display: "flex",
          alignItems: "baseline",
          justifyContent: "center",
          gap: "0.35em",
        }}
      >
        <span style={{ color: "#999", fontStyle: "italic", marginRight: "0.15em" }}>Prompt</span>
        <span>Set {["font-size", "opacity", "padding", "color"][slide]} to </span>
        {slide === 3 ? (
          <span>
            hsl(<Calligraph
              variant="slots"
              animation="snappy"
              style={{
                fontFamily: "inherit",
                fontSize: "inherit",
                lineHeight: "inherit",
                color: "inherit",
                fontVariantNumeric: "tabular-nums",
                display: "inline-flex",
              }}
            >
              {`${value}`}
            </Calligraph>, 70%, 55%)
          </span>
        ) : (
          <Calligraph
            variant="slots"
            animation="snappy"
            style={{
              fontFamily: "inherit",
              fontSize: "inherit",
              lineHeight: "inherit",
              color: "inherit",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {`${value}${s.unit}`}
          </Calligraph>
        )}
      </div>
    )}
    </>
  );
}
