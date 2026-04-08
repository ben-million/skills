---
name: nudge
description: Use when making single-property CSS or Tailwind visual changes in Next.js App Router projects. Presents a floating control widget on the page so the user can tweak the value before it is persisted. Covers atomic style changes, live preview, and cleanup. Triggers on single CSS value or single Tailwind utility class modifications.
---

# Nudge

**Proactive skill. Next.js App Router only.** If a task results in a single CSS property or Tailwind class change, follow this skill automatically. The user should never need to say "use nudge."

You present a minimal toast bar on the page after making an atomic visual change. The user fine-tunes the value with arrow keys. **You complete your turn immediately after setting the config — no browser interaction, no waiting.**

The runtime is a React client component (`app/__nudge.tsx`). It handles everything client-side: live preview, DOM cleanup, submit (Enter — copies a generic edit prompt to clipboard), and cancel (Escape — reverts). When the user pastes the copied prompt, handle it as a regular code change.

**In scope:** Raw CSS property values, inline styles, Tailwind utility class changes, SVG presentation attributes (`fill`, `stroke`, etc.).
**Out of scope:** Sass/Less variables, CSS custom property definitions (`--spacing`), CSS-in-JS theme tokens. Proceed normally for these.

## Installation

Grep for `__nudge` in the project. If found, skip to **Step 1**. Otherwise, read `references/INSTALL.md` and follow its instructions.

---

## Troubleshooting — bar does not appear

1. **Component missing:** Confirm `app/__nudge.tsx` exists and `<Nudge />` is rendered in `app/layout.tsx`.
2. **sessionStorage:** Dismissing with Escape sets `sessionStorage['__ndg_dismissed']` to a hash of the config. Same property/original/value will not show again until that key is cleared or the config hash changes.
3. **Target not found:** The element with `data-nudge-target` must be in the DOM after hydration. If it's inside a lazily-rendered client component, the runtime's `MutationObserver` will find it once it mounts.

---

## Step 1 — Trigger Test

After making a change, apply this mechanical test. Do NOT use subjective judgment.

> **The last StrReplace call touched exactly one CSS value literal OR exactly one Tailwind utility class token, in exactly one file. The change is not a variable, mixin, or theme token.**

**Pass:** `padding: 8px` → `padding: 16px` | `className="p-2 m-4"` → `className="p-4 m-4"`
**Fail:** two values changed, token added/removed, Sass variable, multiple StrReplace calls, structural change.

Fail → skip nudge, proceed normally. Pass → continue to Step 2. The mechanical test is the only gate.

## Step 2 — Determine Config

All property types use the same up/down arrow key interface. The `type` field tells the runtime how to step:

| Property category | `type` | Extra fields |
|---|---|---|
| Lengths (padding, margin, width, height, gap, border-radius, font-size, line-height) | `numeric` | step: 1 |
| Colors (color, background-color, border-color) | `color` | — (runtime adjusts HSL lightness ±2% per step) |
| SVG colors (fill, stroke, stop-color) | `color` | — (same HSL stepping; runtime auto-detects SVG elements) |
| SVG numeric (stroke-width, stroke-opacity, fill-opacity) | `numeric` | step: 1 (or step: 0.01 for opacity values) |
| font-weight | `options` | options: [100,200,300,400,500,600,700,800,900] |
| opacity | `numeric` | min: 0, max: 1, step: 0.01 |
| Other numeric | `numeric` | step: 1 |

**Tailwind sources:** resolve the class to its CSS property and value. For axis shorthands, use the block-axis property:

| Tailwind class | CSS property | Example |
|---|---|---|
| `p-4` | `padding` | `padding: 16px` |
| `px-4` | `padding-left,padding-right` | `padding-left: 16px` |
| `py-4` | `padding-top,padding-bottom` | `padding-top: 16px` |
| `pt-4`, `pb-4`, `pl-4`, `pr-4` | `padding-top`, `padding-bottom`, `padding-left`, `padding-right` | direct mapping |
| `m-4` | `margin` | `margin: 16px` |
| `mx-4` | `margin-left,margin-right` | `margin-left: 16px` |
| `my-4` | `margin-top,margin-bottom` | `margin-top: 16px` |
| `mt-4`, `mb-4`, `ml-4`, `mr-4` | `margin-top`, `margin-bottom`, `margin-left`, `margin-right` | direct mapping |
| `gap-4` | `gap` | `gap: 16px` |
| `gap-x-4` | `column-gap` | `column-gap: 16px` |
| `gap-y-4` | `row-gap` | `row-gap: 16px` |
| `w-*` | `width` | `width: 16px` |
| `h-*` | `height` | `height: 16px` |
| `rounded-*` | `border-radius` | `border-radius: 8px` |
| `text-[size]` | `font-size` | `font-size: 14px` |
| `leading-*` | `line-height` | `line-height: 20px` |
| `text-[color]` | `color` | `color: #1a1a1a` |
| `bg-[color]` | `background-color` | `background-color: #fff` |

Resolve Tailwind spacing scale to pixels: multiply the value by 4 (`p-4` = `16px`, `py-2` = `8px`). For arbitrary values like `p-[14px]`, use the literal value.

**CSS sources:** use the raw CSS value directly.

**SVG attributes:** SVG elements use presentation attributes (`fill="#ccc"`) not inline styles. The `property` must match the attribute name (e.g. `fill`, `stroke`). The runtime detects SVG elements and uses `setAttribute`/`getAttribute` automatically. Do NOT confuse the SVG `color` attribute with `fill` — SVG shapes are painted by `fill`, not `color`.

## Step 3 — Mark Target Element

Add `data-nudge-target` to the changed element in source:

```jsx
<div data-nudge-target style={{ padding: '16px' }}>
```

For Tailwind classes, also add an inline style override so the runtime can manipulate the value directly:

```jsx
<div data-nudge-target className="py-4" style={{ paddingTop: '16px', paddingBottom: '16px' }}>
```

For SVG presentation attributes, mark the element that carries the attribute:

```jsx
<path data-nudge-target fill="#B8B8B8" d="..." />
```

## Step 4 — Activate

Use `StrReplace` to update the `<Nudge />` component in `app/layout.tsx`, passing a `config` prop:

**Numeric example (lengths):**

```tsx
<Nudge config={{
  property: "padding",
  value: "16px",
  original: "8px",
  type: "numeric",
  step: 1,
  file: "app/components/Card.tsx",
  line: "12",
}} />
```

**Color example:**

```tsx
<Nudge config={{
  property: "color",
  value: "#1a1a1a",
  original: "#333333",
  type: "color",
  file: "app/components/Card.tsx",
  line: "12",
}} />
```

**SVG fill example:**

```tsx
<Nudge config={{
  property: "fill",
  value: "#B8B8B8",
  original: "#CDCDCD",
  type: "color",
  file: "app/components/Icon.tsx",
  line: "5",
}} />
```

**Options example (font-weight):**

```tsx
<Nudge config={{
  property: "font-weight",
  value: "600",
  original: "400",
  type: "options",
  options: [100,200,300,400,500,600,700,800,900],
  file: "app/components/Card.tsx",
  line: "12",
}} />
```

## Step 5 — Complete

**Your turn is done.** Do NOT open a browser, verify the panel, or wait for the user. Next.js HMR delivers the change.

Tell the user: "I've changed X to Y. Use arrow keys on the page to fine-tune it."

The runtime handles submit, cancel, target marker removal, and sessionStorage dismiss. When the user pastes the submitted prompt, it reads as a normal edit instruction — make the edit and reset the config back to `<Nudge />`.
