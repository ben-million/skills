"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Calligraph } from "calligraph";

const FONT = "'Open Runde', system-ui, sans-serif";
const SHAKE_KEYFRAMES = `@keyframes __nudge-shake{0%,100%{translate:0}25%{translate:-2px}50%{translate:2px}75%{translate:-1px}}`;
let shakeInjected = false;
const ARROW_D =
  "M13.415 2.5C12.634 1.719 11.367 1.719 10.586 2.5L3.427 9.659C2.01 11.076 3.014 13.5 5.018 13.5H7V20C7 21.104 7.895 22 9 22H15C16.105 22 17 21.104 17 20V13.5H18.983C20.987 13.5 21.991 11.076 20.574 9.659L13.415 2.5Z";
const ORIGINAL = 61;

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

function scheduleTick(time: number, volume: number) {
  const ctx = getAudioCtx();

  // Metallic transient — resonant filtered noise
  const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * 0.004), ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource();
  noise.buffer = buf;
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 3200;
  bp.Q.value = 6;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(volume * 0.7, time);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.003);
  noise.connect(bp);
  bp.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noise.start(time);

  // Resonant body — short metallic ring
  const body = ctx.createOscillator();
  const bodyGain = ctx.createGain();
  body.type = "sine";
  body.frequency.value = 1800;
  bodyGain.gain.setValueAtTime(volume * 0.4, time);
  bodyGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.012);
  body.connect(bodyGain);
  bodyGain.connect(ctx.destination);
  body.start(time);
  body.stop(time + 0.015);

  // High ping — crisp edge
  const ping = ctx.createOscillator();
  const pingGain = ctx.createGain();
  ping.type = "sine";
  ping.frequency.value = 4800;
  pingGain.gain.setValueAtTime(volume * 0.15, time);
  pingGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.004);
  ping.connect(pingGain);
  pingGain.connect(ctx.destination);
  ping.start(time);
  ping.stop(time + 0.006);
}

function playConfirm() {
  const ctx = getAudioCtx();
  const t = ctx.currentTime;

  // Heavy thock — low impact
  const thock = ctx.createOscillator();
  const thockGain = ctx.createGain();
  thock.type = "sine";
  thock.frequency.setValueAtTime(350, t);
  thock.frequency.exponentialRampToValueAtTime(80, t + 0.015);
  thockGain.gain.setValueAtTime(0.35, t);
  thockGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.025);
  thock.connect(thockGain);
  thockGain.connect(ctx.destination);
  thock.start(t);
  thock.stop(t + 0.03);

  // Click transient — filtered noise burst
  const buf = ctx.createBuffer(1, ctx.sampleRate * 0.008, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource();
  noise.buffer = buf;
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 3500;
  bp.Q.value = 1.5;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.18, t);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.006);
  noise.connect(bp);
  bp.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noise.start(t);

  // Latch settle — secondary lighter click
  const latch = ctx.createOscillator();
  const latchGain = ctx.createGain();
  latch.type = "sine";
  latch.frequency.setValueAtTime(600, t + 0.04);
  latch.frequency.exponentialRampToValueAtTime(250, t + 0.05);
  latchGain.gain.setValueAtTime(0.15, t + 0.04);
  latchGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.055);
  latch.connect(latchGain);
  latchGain.connect(ctx.destination);
  latch.start(t + 0.04);
  latch.stop(t + 0.06);
}

function playTick(held = false) {
  const now = performance.now();
  if (held && now - lastTickTime < 50) return;
  lastTickTime = now;

  const ctx = getAudioCtx();
  scheduleTick(ctx.currentTime, held ? 0.12 : 0.25);
}

function playDoubleTick() {
  const ctx = getAudioCtx();
  scheduleTick(ctx.currentTime, 0.25);
  scheduleTick(ctx.currentTime + 0.055, 0.15);
}

function Arrow({
  active,
  down,
  onClick,
}: {
  active: boolean;
  down?: boolean;
  onClick?: () => void;
}) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      style={{
        width: 19,
        height: "auto",
        flexShrink: 0,
        cursor: "pointer",
        transform: `rotate(${down ? 180 : 0}deg) translateY(${active ? -1.5 : 0}px) scale(${active ? 1.05 : 1})`,
        transition: active
          ? "transform 0.1s cubic-bezier(0.2, 0, 0, 1.6)"
          : "transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)",
      }}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d={ARROW_D}
        fill={active ? "#FFFFFF" : "#A7A7A7"}
        style={{
          transition: active ? "fill 0.05s ease" : "fill 0.3s ease",
        }}
      />
    </svg>
  );
}

export function BudgeMePaperPreview() {
  const [value, setValue] = useState(ORIGINAL);
  const [activeKey, setActiveKey] = useState<"up" | "down" | null>(null);
  const [isNudging, setIsNudging] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [pressedButton, setPressedButton] = useState<"reset" | "copy" | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [shaking, setShaking] = useState(false);
  const shakeTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const nudgeTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const confirmedTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const valueRef = useRef(ORIGINAL);

  useEffect(() => {
    if (!shakeInjected) {
      const style = document.createElement("style");
      style.textContent = SHAKE_KEYFRAMES;
      document.head.appendChild(style);
      shakeInjected = true;
    }
  }, []);

  const step = useCallback((direction: number, shift = false, held = false) => {
    const mult = shift ? 10 : 1;
    const next = valueRef.current + direction * mult;
    if (next > 86 || next < 32) {
      setShaking(true);
      clearTimeout(shakeTimeoutRef.current);
      shakeTimeoutRef.current = setTimeout(() => setShaking(false), 300);
      return;
    }
    setShaking(false);
    const prev = valueRef.current;
    valueRef.current = next;
    setValue(valueRef.current);
    const tensChanged = Math.floor(prev / 10) !== Math.floor(next / 10);
    if (tensChanged && !held) {
      playDoubleTick();
    } else {
      playTick(held);
    }
  }, []);

  const triggerNudge = useCallback(
    (dir: "up" | "down") => {
      step(dir === "up" ? 1 : -1);
      setActiveKey(dir);
      setTimeout(() => setActiveKey(null), 100);
    },
    [step],
  );

  const reset = useCallback(() => {
    const prev = valueRef.current;
    valueRef.current = ORIGINAL;
    setValue(ORIGINAL);
    setIsNudging(true);
    setPressedButton("reset");
    clearTimeout(nudgeTimeoutRef.current);
    nudgeTimeoutRef.current = setTimeout(() => setIsNudging(false), 600);
    setTimeout(() => setPressedButton(null), 70);
    if (Math.floor(prev / 10) !== Math.floor(ORIGINAL / 10)) {
      playDoubleTick();
    } else {
      playTick();
    }
  }, []);

  const copy = useCallback(() => {
    const prompt = `Set \`font-size\` to \`${valueRef.current}px\``;
    navigator.clipboard?.writeText(prompt);
    setConfirmed(true);
    setIsNudging(true);
    setPressedButton("copy");
    clearTimeout(confirmedTimeoutRef.current);
    confirmedTimeoutRef.current = setTimeout(() => {
      setConfirmed(false);
      setIsNudging(false);
    }, 800);
    setTimeout(() => setPressedButton(null), 70);
    playConfirm();
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        step(1, e.shiftKey, e.repeat);
        setActiveKey("up");
        setIsNudging(true);
        clearTimeout(nudgeTimeoutRef.current);
        nudgeTimeoutRef.current = setTimeout(() => setIsNudging(false), 600);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        step(-1, e.shiftKey, e.repeat);
        setActiveKey("down");
        setIsNudging(true);
        clearTimeout(nudgeTimeoutRef.current);
        nudgeTimeoutRef.current = setTimeout(() => setIsNudging(false), 600);
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        reset();
      } else if (e.key === "Enter") {
        e.preventDefault();
        copy();
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
  }, [step, reset, copy]);

  const displayValue = `${value}px`;
  const nudgeY = activeKey === "down" ? 1 : activeKey === "up" ? -1 : 0;
  const baseScale = confirmed ? 1.05 : isNudging ? 1 : 0.85;

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
      <div className="flex flex-col items-center grow shrink basis-[0%] gap-7">
        <div className="[letter-spacing:0em] [white-space-collapse:preserve] font-['OpenRunde-Medium','Open_Runde',system-ui,sans-serif] font-medium text-[15px]/[22px] text-[#696969] pt-3.5 self-start pl-4">
          font size
        </div>
        <div
          className="left-0 top-0 [white-space-collapse:preserve] relative text-[#3C3C3C] text-[61px]/18.5"
          style={{
            fontFamily: '"Ivar Hand TRIAL", ui-serif, serif',
            fontSize: `${value}px`,
            transition: "font-size 0.1s cubic-bezier(0.32, 0.72, 0, 1)",
          }}
        >
          budge me
        </div>

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
            transition: confirmed
              ? "transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)"
              : activeKey
                ? "transform 0.1s cubic-bezier(0.2, 0, 0, 1.4)"
                : "transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)",
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
                <Calligraph
                  variant="slots"
                  animation="snappy"
                  style={{
                    color: "#fff",
                    fontFamily: FONT,
                    fontWeight: 500,
                    fontSize: 14.5,
                    lineHeight: "22px",
                    whiteSpace: "nowrap",
                    fontVariantNumeric: "tabular-nums",
                    minWidth: 48,
                    textAlign: "left",
                  }}
                >
                  {displayValue}
                </Calligraph>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Arrow
                  down
                  active={activeKey === "down"}
                  onClick={() => triggerNudge("down")}
                />
                <Arrow
                  active={activeKey === "up"}
                  onClick={() => triggerNudge("up")}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center h-17.25 shrink-0 gap-3.25 border-t border-solid border-t-[#EEEEEE]">
        <button
          type="button"
          onClick={reset}
          className="cursor-pointer flex items-center justify-center w-27 h-9 rounded-full gap-6 bg-white [box-shadow:#0000000F_0px_0px_0px_1px,#0000000F_0px_1px_2px_-1px,#0000000A_0px_2px_4px] shrink-0"
          style={{
            transform: pressedButton === "reset" ? "scale(0.975)" : "scale(1)",
            transition: pressedButton === "reset"
              ? "transform 0.03s linear"
              : "transform 0.1s cubic-bezier(0.32, 0.72, 0, 1)",
          }}
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
          style={{
            transform: pressedButton === "copy" ? "scale(0.975)" : "scale(1)",
            transition: pressedButton === "copy"
              ? "transform 0.03s linear"
              : "transform 0.1s cubic-bezier(0.32, 0.72, 0, 1)",
          }}
        >
          <div className="[letter-spacing:0px] w-max left-0 top-0 [white-space-collapse:preserve] relative text-[#323232] font-sans font-medium shrink-0 text-[15px]/4.5">
            Copy
          </div>
          <div className="[letter-spacing:0px] w-max h-3.75 left-0 top-0 [white-space-collapse:preserve] relative text-[#919191] font-sans font-medium shrink-0 text-[15px]/4.5">
            ↵
          </div>
        </button>
      </div>
    </div>
  );
}
