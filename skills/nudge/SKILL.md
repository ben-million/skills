---
name: nudge
description: Use when making single-property CSS or Tailwind visual changes in web projects. Presents a floating control widget on the page so the user can tweak the value before it is persisted. Covers atomic style changes, live preview, framework-aware injection, and cleanup. Triggers on single CSS value or single Tailwind utility class modifications.
---

# Nudge

**Proactive skill.** If a task results in a single CSS property or Tailwind class change, follow this skill automatically. The user should never need to say "use nudge."

You present a minimal toast bar on the page after making an atomic visual change. The user fine-tunes the value with arrow keys. **You complete your turn immediately after inserting the config — no browser interaction, no waiting.**

The runtime handles everything client-side: live preview, DOM cleanup, submit (Enter — copies a generic edit prompt to clipboard), and cancel (Escape — reverts). When the user pastes the copied prompt, it is a normal edit instruction — handle it as a regular code change.

**In scope:** Raw CSS property values, inline styles, Tailwind utility class changes.
**Out of scope:** Sass/Less variables, CSS custom property definitions (`--spacing`), CSS-in-JS theme tokens. Proceed normally for these.

## Installation

Grep for `__nudge` in the project. If found, skip to **Step 1**. Otherwise, read `references/INSTALL.md` and follow its instructions. Do NOT inline the runtime.

---

## Step 1 — Trigger Test

After making a change, apply this mechanical test. Do NOT use subjective judgment.

> **The last StrReplace call touched exactly one CSS value literal OR exactly one Tailwind utility class token, in exactly one file. The change is not a variable, mixin, or theme token.**

**Pass:** `padding: 8px` → `padding: 16px` | `className="p-2 m-4"` → `className="p-4 m-4"`
**Fail:** two values changed, token added/removed, Sass variable, multiple StrReplace calls, structural change.

Fail → skip nudge, proceed normally. Pass → continue to Step 2. The mechanical test is the only gate.

## Step 2 — Determine Config

All property types use the same up/down arrow key interface. The `data-type` attribute tells the runtime how to step:

| Property category | `data-type` | Extra attributes |
|---|---|---|
| Lengths (padding, margin, width, height, gap, border-radius, font-size, line-height) | `numeric` | min=0, max=4× current (64 min), step=1 |
| Colors (color, background-color, border-color) | `color` | — (runtime adjusts HSL lightness ±2% per step) |
| font-weight | `options` | `data-options="[100,200,300,400,500,600,700,800,900]"` |
| opacity | `numeric` | min=0, max=1, step=0.01 |
| Other numeric | `numeric` | step=1 |

**Tailwind sources:** resolve the class to its CSS property and value (`p-4` → `padding: 16px`).

**CSS sources:** use the raw CSS value directly.

## Step 3 — Mark Target Element

Add `data-nudge-target` to the changed element in source:

```jsx
<div data-nudge-target style={{ padding: '16px' }}>
```

Do NOT use a CSS selector. The runtime finds `[data-nudge-target]`.

## Step 4 — Update Config

Use `StrReplace` to set `data-*` attributes on the `#__nudge` div in the layout file. Include `data-file` and `data-line` so the runtime can produce a prompt with source location context.

**Numeric example (lengths):**

```jsx
<div id="__nudge"
  data-property="padding"
  data-value="16px"
  data-original="8px"
  data-type="numeric"
  data-min="0"
  data-max="64"
  data-step="1"
  data-file="app/components/Card.tsx"
  data-line="12"
  style={{display:'none'}}
/>
```

**Color example:**

```jsx
<div id="__nudge"
  data-property="color"
  data-value="#1a1a1a"
  data-original="#333333"
  data-type="color"
  data-file="app/components/Card.tsx"
  data-line="12"
  style={{display:'none'}}
/>
```

**Options example (font-weight):**

```jsx
<div id="__nudge"
  data-property="font-weight"
  data-value="600"
  data-original="400"
  data-type="options"
  data-options="[100,200,300,400,500,600,700,800,900]"
  data-file="app/components/Card.tsx"
  data-line="12"
  style={{display:'none'}}
/>
```

The config div MUST appear before the script tag in the DOM. The installation step ensures this.

## Step 5 — Complete

**Your turn is done.** Do NOT open a browser, verify the panel, or wait for the user. The runtime activates via HMR.

Tell the user: "I've changed X to Y. Use arrow keys on the page to fine-tune it."

The runtime handles submit, cancel, and all DOM cleanup (config div reset, target marker removal). When the user pastes the submitted prompt, it reads as a normal edit instruction — just make the edit. No special parsing or cleanup steps required.
