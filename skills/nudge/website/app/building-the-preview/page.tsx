"use client";

import {
  BudgeMePaperPreview,
  type PreviewFeatures,
} from "@/components/budge-me-paper-preview";

const BLOG = { showLabel: false, showButtons: false, showText: false } as const;

const STAGE_1: PreviewFeatures = { ...BLOG };

const STAGE_2: PreviewFeatures = { ...BLOG, keyboard: true };

const STAGE_3: PreviewFeatures = { ...BLOG, keyboard: true, expandValue: true };

const STAGE_3B: PreviewFeatures = { ...BLOG, keyboard: true, expandValue: true, animatedDigits: true };

const STAGE_4: PreviewFeatures = {
  ...BLOG,
  keyboard: true,
  expandValue: true,
  animatedDigits: true,
  arrowBounce: true,
  barPhysics: true,
  idleOpacity: true,
};

const STAGE_5: PreviewFeatures = {
  ...BLOG,
  keyboard: true,
  expandValue: true,
  animatedDigits: true,
  arrowBounce: true,
  barPhysics: true,
  idleOpacity: true,
  boundaryShake: true,
};

const STAGE_6: PreviewFeatures = {
  ...BLOG,
  keyboard: true,
  expandValue: true,
  animatedDigits: true,
  arrowBounce: true,
  barPhysics: true,
  idleOpacity: true,
  boundaryShake: true,
  sound: true,
};

const STAGE_7: PreviewFeatures = {
  ...BLOG,
  keyboard: true,
  expandValue: true,
  animatedDigits: true,
  arrowBounce: true,
  barPhysics: true,
  idleOpacity: true,
  boundaryShake: true,
  numberInput: true,
};

const STAGE_8: PreviewFeatures = {
  ...BLOG,
  keyboard: true,
  expandValue: true,
  animatedDigits: true,
  arrowBounce: true,
  barPhysics: true,
  idleOpacity: true,
  boundaryShake: true,
  buttonFeedback: true,
  shiftStep: true,
  numberInput: true,
};

const STAGE_SLIDES: PreviewFeatures = {
  keyboard: true,
  expandValue: true,
  animatedDigits: true,
  arrowBounce: true,
  barPhysics: true,
  idleOpacity: true,
  boundaryShake: true,
  buttonFeedback: true,
  shiftStep: true,
  numberInput: true,
  sound: true,
  showLabel: true,
  showButtons: true,
  showText: true,
};

export default function BuildingThePreviewPage() {
  return (
    <div className="[font-synthesis:none] overflow-x-clip antialiased min-h-screen bg-white flex flex-col items-center">
      <div className="page-content w-full flex flex-col items-center pt-3 sm:pt-6 pb-24">
        <div className="relative w-full max-w-112.75 min-w-0 px-4 sm:px-0">
          <a
            href="/"
            className="[letter-spacing:0em] [white-space-collapse:preserve] font-medium text-[15px]/[22px] text-[#999] hover:text-[#555] transition-colors"
          >
            &larr; back
          </a>

          <div className="flex flex-col gap-24 mt-10">
            <Section title="The value readout">
              <P>
                When you press an arrow key, the value display slides in from
                the left with a <Code>max-width</Code> transition. After 600ms
                of inactivity it collapses back. The expand is 500ms with a
                delayed opacity fade; the collapse is faster at 450ms with
                immediate opacity. This asymmetry makes it feel responsive
                opening and not jarring closing.
              </P>
              <P>
                Clicking the arrows deliberately does not expand the value
                display. The reason: the expanding readout shifts the arrow
                buttons sideways, which would make you miss on consecutive
                clicks.
              </P>
              <Demo>
                <BudgeMePaperPreview features={STAGE_3} />
              </Demo>
            </Section>

            <Section title="Animated digits">
              <P>
                The plain text readout works, but the digits just swap
                instantly — there&apos;s no sense of movement. Wrapping the
                value in Calligraph with <Code>variant=&ldquo;slots&rdquo;</Code>{" "}
                and <Code>animation=&ldquo;snappy&rdquo;</Code> gives each
                digit its own slot that rolls up or down when the number
                changes. It turns a static label into something that feels
                mechanically connected to the arrows.
              </P>
              <Demo>
                <BudgeMePaperPreview features={STAGE_3B} />
              </Demo>
            </Section>

            <Section title="Physics">
              <P>
                Three things happen at once. The arrows bounce — 1.5px up and
                1.05× scale on press (100ms, overshoot curve), slower ease back
                on release. The fill flashes white for 50ms. The bar scales
                between 0.8× idle, 1× active, and 1.02× on confirm. Scaling up
                uses a 250ms spring with overshoot{" "}
                <Code>cubic-bezier(0.34, 1.56, 0.64, 1)</Code>; scaling back
                down is a slower 500ms ease-out with no bounce, so it pops into
                action and settles gently.
              </P>
              <P>
                At idle the bar fades to 80% opacity. It snaps back to 100%
                instantly when nudging, then fades with a 400ms ease and 100ms
                delay to prevent flicker during rapid use.
              </P>
              <Demo>
                <BudgeMePaperPreview features={STAGE_4} />
              </Demo>
            </Section>

            <Section title="Boundaries">
              <P>
                Try going past the max or below the min. The bar shakes — a CSS
                keyframe that loops at ±2px every 150ms. It plays continuously
                while the key is held. Each slide defines its own range (e.g.
                32–86 for font size, 0–100 for opacity, 0–48 for padding,
                0–360 for color), and the boundary logic adapts automatically.
              </P>
              <P>
                While the bar shakes, the arrow that caused it drops to the
                inactive gray and the value readout dims to match. The cursor
                switches to default and clicks are ignored. It only lasts as
                long as the shake — 300ms — then everything resets.
              </P>
              <P>
                An earlier implementation used React{" "}
                <Code>key</Code> remounting to restart the animation, which
                caused visual glitches on key hold because each rapid keydown
                remounted the entire bar. The fix: a boolean{" "}
                <Code>shaking</Code> state that clears 300ms after the last
                attempt, with the CSS animation set to{" "}
                <Code>infinite</Code> while true.
              </P>
              <P>
                A macOS-style alert sound also plays, throttled to once per
                400ms so it doesn&apos;t stack.
              </P>
              <Demo>
                <BudgeMePaperPreview features={STAGE_5} />
              </Demo>
            </Section>

            <Section title="Sound">
              <P>
                Every value change plays a mechanical tick synthesised with the
                Web Audio API. The sound is a pre-computed 8ms AudioBuffer:
                a noise strike, a 3200Hz metallic ring, a 5100Hz secondary
                resonance, and a 900Hz body. A deterministic PRNG seeds the
                noise so every tick is identical.
              </P>
              <P>
                When holding a key, the tick is throttled to once every 50ms at
                reduced volume (0.12 vs 0.25). Without this, the browser&apos;s
                ~33ms keydown repeat creates overlapping clicks that buzz.
              </P>
              <P>
                Reset plays a double tick when crossing a tens boundary (e.g.
                72→61). The confirm action has its own deeper, heavier latch
                sound — same mechanical family, different weight.
              </P>
              <Demo>
                <BudgeMePaperPreview features={STAGE_6} />
              </Demo>
            </Section>

            <Section title="Number input">
              <P>
                Arrow keys are fine for small adjustments, but jumping from 61
                to 42 one tick at a time is painful. Typing digits solves this —
                press <Code>4</Code> then <Code>2</Code> and the value lands
                instantly.
              </P>
              <P>
                The implementation uses a digit buffer. Each keypress appends to
                it and the raw string is shown immediately as{" "}
                <Code>typedRaw</Code> — so pressing <Code>4</Code> shows{" "}
                &ldquo;4px&rdquo; even though 4 is out of range. If the
                accumulated number falls within the slide&apos;s range, the
                underlying value updates live on every keystroke. If not, the
                display still reflects what you&apos;ve typed but turns gray
                immediately to signal it&apos;s out of bounds — and the bar
                doesn&apos;t move.
              </P>
              <P>
                After 500ms of no further digits, the buffer commits. This
                window is long enough to comfortably type two digits but short
                enough that the UI doesn&apos;t feel sluggish. If the final
                number is out of range it clamps to the nearest boundary,
                triggers the shake, and plays the alert sound. Valid numbers
                just settle in silently.
              </P>
              <P>
                A subtle detail: each digit press plays a tick and expands the
                readout, so you get the same tactile feedback as arrow nudging.
                The readout shows the raw typed string rather than the clamped
                value, so you see exactly what you entered before the system
                corrects it.
              </P>
              <Demo>
                <BudgeMePaperPreview features={STAGE_7} />
              </Demo>
            </Section>

            <Section title="Everything else">
              <P>
                The final layer adds button press feedback — 0.975× scale on
                press, 30ms in, 70ms hold — and Shift+Arrow for 10× stepping
                to cover the remaining gap between single ticks and direct
                number entry.
              </P>
              <Demo>
                <BudgeMePaperPreview features={STAGE_8} />
              </Demo>
            </Section>

            <Section title="Slide design">
              <P>
                A single demo only shows one property. To present the range of
                what nudge can control, the preview cycles through four slides:
                font size, opacity, padding, and color. Left/right chevron
                buttons navigate between them, as do the arrow keys.
              </P>
              <P>
                Each slide is defined as a config object — label, min, max,
                original value, unit, and a demo target for the calibration
                animation. The entire component reads from this config: boundary
                checks, value display, copy prompt, and the text effect all
                adapt automatically. Adding a new slide is a single line.
              </P>
              <P>
                When you land on a new slide, a calibration sequence plays. It
                mimics real usage — four ticks stepping down to the demo value,
                a brief pause, then five ticks stepping back up. Each tick
                fires an arrow bounce and a sound. The pacing decelerates on
                the way down and accelerates on the way back, like someone
                exploring then correcting. The bar starts at full scale
                immediately so there&apos;s no awkward idle shrink before the
                first tick.
              </P>
              <P>
                The calibration can be interrupted. Any user interaction — a key
                press, a click, a digit — cancels the remaining timeouts and
                hands control back instantly. This prevents the demo from
                fighting the user.
              </P>
              <P>
                Each slide has its own visual treatment. Font size changes the{" "}
                <Code>font-size</Code> of the text. Opacity fades it. Padding
                wraps the text in a container with blue dashed guidelines and a
                tinted background showing the padding area — negative vertical
                margins cancel out the growth so the nudge bar stays in place.
                Color shifts the text hue across 360° and, instead of showing
                a numeric readout, flashes the arrows in the target color when
                active.
              </P>
              <P>
                The navigation buttons match the rest of the control&apos;s
                design language: same pill shape, same box shadow, same press
                feedback (0.9× scale, 30ms in). The left button hides on the
                first slide and the right button hides on the last using{" "}
                <Code>visibility: hidden</Code> so the layout doesn&apos;t
                shift. A small uppercase label at the top center identifies the
                current property.
              </P>
              <Demo>
                <BudgeMePaperPreview features={STAGE_SLIDES} />
              </Demo>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-4 left-0 top-0 w-full min-w-0 [white-space-collapse:preserve] relative text-[#3F3F3F] font-semibold text-[18px]/5.75">
        {title}
      </div>
      {children}
    </div>
  );
}

function Demo({ children }: { children: React.ReactNode }) {
  return <div className="mt-6">{children}</div>;
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <div className="[letter-spacing:0em] [white-space-collapse:preserve] font-medium text-[15px]/[22px] text-[#707070] mb-4">
      {children}
    </div>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-mono text-[13.5px] text-[#555] bg-[#F5F5F5] rounded px-1 py-0.5">
      {children}
    </code>
  );
}
