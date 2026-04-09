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
  { label: "opacity", min: 0, max: 100, original: 50, unit: "%", demo: 30 },
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

let tickBuffer: AudioBuffer | null = null;
let lastAlertTime = 0;

function getTickBuffer(ctx: AudioContext) {
  if (tickBuffer && tickBuffer.sampleRate === ctx.sampleRate) return tickBuffer;
  const sr = ctx.sampleRate;
  const dur = 0.008;
  const len = Math.ceil(sr * dur);
  const buf = ctx.createBuffer(1, len, sr);
  const d = buf.getChannelData(0);

  let seed = 7;
  function noise() {
    seed = (seed * 16807 + 0) % 2147483647;
    return (seed / 2147483647) * 2 - 1;
  }

  for (let i = 0; i < len; i++) {
    const t = i / sr;

    // Sharp strike impulse (first ~0.3ms)
    const strike = noise() * Math.exp(-t * 20000);
    // Metallic ring — the pawl/spring resonance
    const ring = Math.sin(2 * Math.PI * 3200 * t) * Math.exp(-t * 1800);
    // Secondary resonance — adds metallic complexity
    const ring2 = Math.sin(2 * Math.PI * 5100 * t) * Math.exp(-t * 2500);
    // Low body — subtle weight of the mechanism
    const body = Math.sin(2 * Math.PI * 900 * t) * Math.exp(-t * 4000);

    d[i] = 0.2 * strike + 0.4 * ring + 0.25 * ring2 + 0.15 * body;
  }

  tickBuffer = buf;
  return buf;
}

function scheduleTick(time: number, volume: number) {
  const ctx = getAudioCtx();
  const src = ctx.createBufferSource();
  src.buffer = getTickBuffer(ctx);
  const gain = ctx.createGain();
  gain.gain.value = volume;
  src.connect(gain);
  gain.connect(ctx.destination);
  src.start(time);
}

let confirmBuffer: AudioBuffer | null = null;

function getConfirmBuffer(ctx: AudioContext) {
  if (confirmBuffer && confirmBuffer.sampleRate === ctx.sampleRate) return confirmBuffer;
  const sr = ctx.sampleRate;
  const dur = 0.025;
  const len = Math.ceil(sr * dur);
  const buf = ctx.createBuffer(1, len, sr);
  const d = buf.getChannelData(0);

  let seed = 13;
  function noise() {
    seed = (seed * 16807 + 0) % 2147483647;
    return (seed / 2147483647) * 2 - 1;
  }

  for (let i = 0; i < len; i++) {
    const t = i / sr;

    // Heavy strike — broader, weightier than the tick
    const strike = noise() * Math.exp(-t * 12000);
    // Low bolt — the latch engaging
    const bolt = Math.sin(2 * Math.PI * 1400 * t) * Math.exp(-t * 800);
    // Metallic catch — brief ring at the end
    const catch_ = Math.sin(2 * Math.PI * 3800 * t) * Math.exp(-t * 1200);
    // Body resonance
    const body = Math.sin(2 * Math.PI * 600 * t) * Math.exp(-t * 1500);

    d[i] = 0.2 * strike + 0.3 * bolt + 0.2 * catch_ + 0.3 * body;
  }

  confirmBuffer = buf;
  return buf;
}

function playConfirm() {
  const ctx = getAudioCtx();
  const src = ctx.createBufferSource();
  src.buffer = getConfirmBuffer(ctx);
  const gain = ctx.createGain();
  gain.gain.value = 0.3;
  src.connect(gain);
  gain.connect(ctx.destination);
  src.start(ctx.currentTime);
}

function playTick(held = false) {
  const now = performance.now();
  if (held && now - lastTickTime < 50) return;
  lastTickTime = now;

  const ctx = getAudioCtx();
  scheduleTick(ctx.currentTime, held ? 0.12 : 0.25);
}

function playAlert() {
  const now = performance.now();
  if (now - lastAlertTime < 400) return;
  lastAlertTime = now;

  const ctx = getAudioCtx();
  const t = ctx.currentTime;

  function bonk(freq: number, start: number, dur: number, vol: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, start);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.82, start + dur);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(vol, start + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + dur + 0.01);

    // Overtone for woody timbre
    const h = ctx.createOscillator();
    const hg = ctx.createGain();
    h.type = "sine";
    h.frequency.setValueAtTime(freq * 3.2, start);
    h.frequency.exponentialRampToValueAtTime(freq * 2.6, start + dur);
    hg.gain.setValueAtTime(vol * 0.15, start);
    hg.gain.exponentialRampToValueAtTime(0.0001, start + dur * 0.6);
    h.connect(hg);
    hg.connect(ctx.destination);
    h.start(start);
    h.stop(start + dur + 0.01);
  }

  bonk(490, t, 0.08, 0.12);
  bonk(370, t + 0.06, 0.1, 0.1);
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
}: {
  active: boolean;
  down?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  const fill = disabled ? "#A7A7A7" : active ? "#FFFFFF" : "#A7A7A7";
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
        transform: `rotate(${down ? 180 : 0}deg) translateY(${active && !disabled ? -1.5 : 0}px) scale(${active && !disabled ? 1.05 : 1})`,
        transition: active
          ? "transform 0.1s cubic-bezier(0.2, 0, 0, 1.6)"
          : "transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)",
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

export function BudgeMePaperPreview({ features: f = ALL_FEATURES }: { features?: PreviewFeatures } = {}) {
  const [value, setValue] = useState(ORIGINAL);
  const [typedRaw, setTypedRaw] = useState<string | null>(null);
  const [activeKey, setActiveKey] = useState<"up" | "down" | null>(null);
  const [isNudging, setIsNudging] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [pressedButton, setPressedButton] = useState<"reset" | "copy" | "prev" | "next" | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [shaking, setShaking] = useState(false);
  const shakeTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const nudgeTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const confirmedTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const digitBufferRef = useRef("");
  const digitTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const valueRef = useRef(ORIGINAL);
  const calibrationRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (!shakeInjected) {
      const style = document.createElement("style");
      style.textContent = SHAKE_KEYFRAMES;
      document.head.appendChild(style);
      shakeInjected = true;
    }
  }, []);

  const [slide, setSlide] = useState(0);
  const s = SLIDES[slide];

  const goToSlide = useCallback((index: number) => {
    if (index < 0 || index >= SLIDES.length) return;
    calibrationRef.current.forEach(clearTimeout);
    calibrationRef.current = [];
    setSlide(index);
    const cfg = SLIDES[index];
    valueRef.current = cfg.original;
    setValue(cfg.original);
    setTypedRaw(null);
    setIsNudging(false);
    setShaking(false);
    setConfirmed(false);
    setActiveKey(null);
    digitBufferRef.current = "";
    clearTimeout(digitTimeoutRef.current);
    clearTimeout(nudgeTimeoutRef.current);
    clearTimeout(shakeTimeoutRef.current);
    clearTimeout(confirmedTimeoutRef.current);

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
      if (f.sound) playAlert();
      return;
    }
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
    const prop = slide === 0 ? "font-size" : "opacity";
    const val = slide === 0 ? `${valueRef.current}px` : `${valueRef.current}%`;
    const prompt = `Set \`${prop}\` to \`${val}\``;
    navigator.clipboard?.writeText(prompt);
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
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        reset();
      } else if (e.key === "Enter") {
        e.preventDefault();
        copy();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToSlide(slide - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goToSlide(slide + 1);
      }
    }

    function onKeyUp(e: KeyboardEvent) {
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        setActiveKey(null);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
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
  const nudgeY = f.barPhysics ? (activeKey === "down" ? 1.5 : activeKey === "up" ? -1.5 : 0) : 0;
  const baseScale = f.barPhysics ? (confirmed ? 1.02 : isNudging ? 1 : 0.92) : 1;

  const expandTransition =
    "max-width 0.5s cubic-bezier(0.32, 0.72, 0, 1), " +
    "margin-right 0.5s cubic-bezier(0.32, 0.72, 0, 1), " +
    "opacity 0.35s ease 0.1s";
  const collapseTransition =
    "max-width 0.45s cubic-bezier(0.32, 0.72, 0, 1), " +
    "margin-right 0.45s cubic-bezier(0.32, 0.72, 0, 1), " +
    "opacity 0.15s ease";

  return (
    <div className="budge-me-paper-preview [font-synthesis:none] flex w-114.25 h-77.75 flex-col rounded-[14px] overflow-clip bg-[#FEFEFE] [box-shadow:#0000000F_0px_0px_0px_1px,#0000000F_0px_1px_2px_-1px,#0000000A_0px_2px_4px] antialiased text-xs/4">
      <div className={`flex flex-col items-center grow shrink basis-[0%] gap-7${f.showText === false && f.showLabel === false ? " justify-center" : ""}`}>
        {f.showLabel !== false && (
          <div className="[letter-spacing:0em] [white-space-collapse:preserve] font-medium text-[15px]/[22px] text-[#696969] pt-3.5 self-start pl-4">
{s.label}
          </div>
        )}
        {f.showText !== false && (
          <div
            className="left-0 top-0 [white-space-collapse:preserve] relative text-[#3C3C3C] text-[61px]/18.5"
            style={{
              fontFamily: '"Ivar Hand TRIAL", ui-serif, serif',
              fontSize: slide === 0 ? `${value}px` : '61px',
              opacity: slide === 1 ? value / 100 : 1,
              transition: slide === 0
                ? "font-size 0.1s cubic-bezier(0.32, 0.72, 0, 1)"
                : "opacity 0.1s cubic-bezier(0.32, 0.72, 0, 1)",
            }}
          >
            budge me
          </div>
        )}

        <div
          ref={barRef}
          style={{
            display: "flex",
            height: 37,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 9999,
            padding: "0 16px",
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
                  : activeKey
                    ? "transform 0.06s cubic-bezier(0.2, 0, 0, 1), opacity 0.1s ease"
                    : "transform 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.15), opacity 0.4s ease 0.1s")
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
                  maxWidth: isNudging ? 100 : 0,
                  marginRight: isNudging ? 1 : 0,
                  opacity: isNudging ? 1 : 0,
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
                />
                <Arrow
                  active={f.arrowBounce ? activeKey === "up" : false}
                  disabled={shaking && atMax}
                  onClick={() => triggerNudge("up")}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {f.showButtons !== false && (
        <div className="flex items-center justify-between h-17.25 shrink-0 px-4 border-t border-solid border-t-[#EEEEEE]">
          <div
            onClick={() => { if (f.buttonFeedback) { setPressedButton("prev"); setTimeout(() => setPressedButton(null), 70); } goToSlide(slide - 1); }}
            className="flex items-center justify-center rounded-full gap-6 bg-white [box-shadow:#0000000F_0px_0px_0px_1px,#0000000F_0px_1px_2px_-1px,#0000000A_0px_2px_4px] shrink-0 size-9 cursor-pointer"
            style={{
              visibility: slide === 0 ? "hidden" : "visible",
              ...(f.buttonFeedback ? {
                transform: pressedButton === "prev" ? "scale(0.9)" : "scale(1)",
                transition: pressedButton === "prev"
                  ? "transform 0.03s linear"
                  : "transform 0.1s cubic-bezier(0.32, 0.72, 0, 1)",
              } : {}),
            }}
          >
            <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '24.14px', height: '24.14px', flexShrink: 0 }}>
              <path fillRule="evenodd" clipRule="evenodd" d="M14.707 16.707C15.098 16.317 15.098 15.683 14.707 15.293L11.414 12L14.707 8.707C15.098 8.317 15.098 7.683 14.707 7.293C14.317 6.902 13.683 6.902 13.293 7.293L9.293 11.293C9.105 11.48 9 11.735 9 12C9 12.265 9.105 12.52 9.293 12.707L13.293 16.707C13.683 17.098 14.317 17.098 14.707 16.707Z" fill="#000000" />
            </svg>
          </div>
          <div className="flex items-center gap-3.25">
            <button
              type="button"
              onClick={reset}
              className="cursor-pointer flex items-center justify-center w-27 h-9 rounded-full gap-6 bg-white [box-shadow:#0000000F_0px_0px_0px_1px,#0000000F_0px_1px_2px_-1px,#0000000A_0px_2px_4px] shrink-0"
              style={f.buttonFeedback ? {
                transform: pressedButton === "reset" ? "scale(0.975)" : "scale(1)",
                transition: pressedButton === "reset"
                  ? "transform 0.03s linear"
                  : "transform 0.1s cubic-bezier(0.32, 0.72, 0, 1)",
              } : undefined}
            >
              <div className="[letter-spacing:0px] w-max left-0 top-0 [white-space-collapse:preserve] relative text-[#323232] font-sans font-medium shrink-0 text-[15px]/4.5">
                Reset
              </div>
              <div className="[letter-spacing:0px] w-max left-0 top-0 [white-space-collapse:preserve] relative text-[#919191] font-sans font-medium shrink-0 text-[15px]/4.5">
                R
              </div>
            </button>
            <button
              type="button"
              onClick={copy}
              className="cursor-pointer flex items-center justify-center w-27 h-9 rounded-full gap-6 bg-white [box-shadow:#0000000F_0px_0px_0px_1px,#0000000F_0px_1px_2px_-1px,#0000000A_0px_2px_4px] shrink-0"
              style={f.buttonFeedback ? {
                transform: pressedButton === "copy" ? "scale(0.975)" : "scale(1)",
                transition: pressedButton === "copy"
                  ? "transform 0.03s linear"
                  : "transform 0.1s cubic-bezier(0.32, 0.72, 0, 1)",
              } : undefined}
            >
              <div className="[letter-spacing:0px] w-max left-0 top-0 [white-space-collapse:preserve] relative text-[#323232] font-sans font-medium shrink-0 text-[15px]/4.5">
                Copy
              </div>
              <div className="[letter-spacing:0px] w-max h-3.75 left-0 top-0 [white-space-collapse:preserve] relative text-[#919191] font-sans font-medium shrink-0 text-[15px]/4.5">
                ↵
              </div>
            </button>
          </div>
          <div
            onClick={() => { if (f.buttonFeedback) { setPressedButton("next"); setTimeout(() => setPressedButton(null), 70); } goToSlide(slide + 1); }}
            className="flex items-center justify-center rounded-full gap-6 bg-white [box-shadow:#0000000F_0px_0px_0px_1px,#0000000F_0px_1px_2px_-1px,#0000000A_0px_2px_4px] shrink-0 size-9 cursor-pointer"
            style={{
              visibility: slide === SLIDES.length - 1 ? "hidden" : "visible",
              ...(f.buttonFeedback ? {
                transform: pressedButton === "next" ? "scale(0.9)" : "scale(1)",
                transition: pressedButton === "next"
                  ? "transform 0.03s linear"
                  : "transform 0.1s cubic-bezier(0.32, 0.72, 0, 1)",
              } : {}),
            }}
          >
            <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ rotate: '180deg', width: '24.14px', height: 'auto', flexShrink: 0, transformOrigin: '50% 50%' }}>
              <path fillRule="evenodd" clipRule="evenodd" d="M14.707 16.707C15.098 16.317 15.098 15.683 14.707 15.293L11.414 12L14.707 8.707C15.098 8.317 15.098 7.683 14.707 7.293C14.317 6.902 13.683 6.902 13.293 7.293L9.293 11.293C9.105 11.48 9 11.735 9 12C9 12.265 9.105 12.52 9.293 12.707L13.293 16.707C13.683 17.098 14.317 17.098 14.707 16.707Z" fill="#000000" style={{ transformOrigin: '50% 50%' }} />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
