---
name: paper-flex
description: Use when converting Paper design nodes from absolute positioning to flex containers. Covers absolute-to-flex conversion, restructuring layouts, preserving SVGs/images, cloning nodes, computing flex gaps from coordinates, auto-layout, and layered card effects.
---

# Paper Flex Conversion Specialist

You convert absolutely-positioned Paper design layouts into flex container layouts while preserving every visual element exactly.

## Critical Rules

### NEVER Delete-and-Recreate

**NEVER delete original nodes and recreate them from scratch.** SVGs, images, and complex styled elements CANNOT be accurately recreated — you will lose path data, image URLs, and precise styling. This is the #1 failure mode.

**Bad:** Delete all children, then write new HTML with hand-drawn SVGs.
**Good:** Clone existing nodes into new flex containers using `x-paper-clone`.

No exceptions for "it's just a simple shape" or "I can approximate it." If it exists in the design, clone it.

### `x-paper-clone` Ignores Position Overrides

Setting `style="position: absolute; ..."` on an `<x-paper-clone>` tag does NOT change the cloned node's position. After cloning, you MUST call `update_styles` to set `position: absolute` on every node that needs it. Batch all position updates into a single `update_styles` call.

### Clone Ordering — Paper Reorders Clones After Divs

**Paper places `x-paper-clone` elements AFTER regular `<div>` elements in the child list, regardless of their order in the HTML source.** This silently breaks z-order when you mix clones and divs in a single `write_html` call.

```html
<!-- You write this, expecting clone FIRST (renders behind): -->
<div style="position: relative;">
  <x-paper-clone node-id="BG_RECT" style="position: absolute;" />
  <div style="display: flex;">...content...</div>
</div>

<!-- Paper produces this — clone is LAST (renders ON TOP): -->
<!--   child 1: div (content)   -->
<!--   child 2: clone (background) ← wrong, now covers content -->
```

**Fix:** Insert decorative background clones in a SEPARATE `write_html` call BEFORE inserting content:

```
Step 1: write_html → container shell (empty)
Step 2: write_html into container → <x-paper-clone node-id="BG_RECT" />
Step 3: write_html into container → <div>...content...</div>
```

Since `insert-children` appends, the clone becomes child 1 (behind) and the div becomes child 2 (on top).

**Fix for wrong z-order after the fact:** If clones ended up in the wrong position:

1. Create a temp frame (`opacity: 0`) in the artboard
2. Clone the CONTENT elements into the temp frame
3. Delete the content elements from the container (decorative clones are now first)
4. Clone content back from the temp frame into the container (appends after decorative)
5. Delete the temp frame

### Cloned Elements Retain Absolute Coordinates

When you clone a node that had `position: absolute; left: 235px; top: 201px;`, the clone retains those coordinates. If the clone lands in a flex container where it becomes `position: relative` (or static), those `left`/`top` values act as offsets from the flex position — pushing the element hundreds of pixels off-screen.

**After cloning elements into flex containers, always call `update_styles` to reset `left` and `top` to `0px` on any clone that should participate in flex flow.** Only skip this for clones that genuinely need `position: absolute` with specific offsets.

### Hidden Shadows Become Visible in Flex Layouts

In flat absolutely-positioned layouts, some elements' `box-shadow` is invisible because a later sibling with an opaque background paints over them. When converting to flex, these elements move inside containers where nothing covers them — their shadows become suddenly and incorrectly visible.

**Example:** A search bar (child index 2) with `box-shadow` was fully covered by a white panel background (child index 9, rendering on top). After flex conversion, the search bar is inside the panel container with nothing covering it, so its shadow creates a visible border that didn't exist in the original.

**During step 2, you MUST identify shadow-hidden elements:**

1. For each element with `box-shadow`, check if a LATER sibling in the original tree has an opaque `backgroundColor` that covers the same area
2. If yes, that element's shadow was invisible in the original
3. After cloning, call `update_styles` to set `boxShadow: "none"` on these clones

Common shadow-hidden elements: input/search bar backgrounds, filter badges, highlight rectangles — any decorative rectangle that sits behind a panel or card background in the original z-order.

### Card Stack Constraints

When building layered card effects (a decorative back-card behind a front card):

1. The card stack wrapper must NOT use `display: flex` — use a plain frame with explicit `width` and `height`
2. Both back card and front card must use `position: absolute` — never `position: relative` for the front card
3. Back card must be the FIRST child (renders behind in Paper's z-order)
4. Overlapping elements (badges, labels) must be the LAST child inside the card wrapper — never flex siblings above it

See `references/layered-cards.md` for detailed examples and z-order rules.

## Workflow

### 1. Screenshot + analyze structure

Call `get_screenshot` and `get_tree_summary(depth=10)` on the target node. Identify every child element and its role.

### 2. Get computed styles for ALL children

Call `get_computed_styles` with every child node ID. Record:
- Absolute `left` and `top` positions
- `width`, `height` dimensions
- Colors, fonts, shadows, filters, border-radius
- Any `backgroundImage` URLs (these are image nodes — must be cloned)

### 3. Scan for reference artboards

Call `get_basic_info` to list all artboards in the file. Check if another artboard contains a flex version of the same component or reusable elements (SVGs, icons). If found, clone from there instead of recreating.

### 4. Identify logical groups

Map the flat list of absolutely-positioned children into a semantic hierarchy:

```
Outer frame (flex column, center)
  Card stack (relative, fixed dimensions)
    Back card (position: absolute)
    Front card (position: absolute, flex column, padding)
      Row 1: traffic lights (flex row, gap)
      Row 2: icon + bars (flex row with nested flex column)
      Row 3: input field (flex row)
      Row 4: status line (flex row, gap)
  Bottom element
```

### 5. Compute flex gaps from absolute positions

Convert absolute coordinates to padding and gap values:

```
gap = nextElement.top - (currentElement.top + currentElement.height)
leftPadding = firstChild.left - container.left
topPadding = firstChild.top - container.top
```

**Margins are not supported in Paper.** Do NOT use `margin` for spacing:
- **Uniform spacing:** `gap` on the flex container
- **Non-uniform spacing:** invisible spacer divs (`<div style="height: 16px; flex-shrink: 0;"></div>`)
- **Section-specific insets:** split content into wrapper divs with different `padding` values

When different rows have different left insets, use separate wrapper divs each with its own padding — not a single card padding with per-row offsets.

### 6. Build incrementally with clones

Each `write_html` call produces ONE visual group. Insert in order — `insert-children` always appends.

```html
<div style="display: flex; flex-direction: row; align-items: center; gap: 10px;">
  <x-paper-clone node-id="ORIGINAL_SVG_ID" />
  <div style="display: flex; flex-direction: column; gap: 4px;">
    <div style="width: 67px; height: 8px; ..."></div>
  </div>
</div>
```

Sequence: set outer frame to flex first, then insert container shell, then insert each row into the card in top-to-bottom order.

**When a container has decorative background clones AND content divs, use separate `write_html` calls:**

```
Step 1: write_html → empty container shell
Step 2: write_html into container → decorative clone(s) only
Step 3: write_html into container → content div(s)
```

This ensures decorative clones are earlier children (render behind) and content divs are later children (render on top). NEVER mix clones and divs in a single `write_html` call when z-order matters — Paper reorders them.

**After cloning into flex containers, call `update_styles` to:**
- Reset `left: "0px"` and `top: "0px"` on clones participating in flex flow
- Set `boxShadow: "none"` on clones whose shadow was hidden in the original (see "Hidden Shadows" rule)

**`x-paper-clone` creates COPIES, not moves.** The original nodes remain as direct children of their parent. After building all flex containers with clones, you MUST delete every original node that was cloned. Check with `get_children` on the parent to find remaining originals.

**SVG clones from reference artboards may contain ghost text nodes** (empty `" "` Text nodes inside the SVG). After cloning, call `get_tree_summary` on the cloned SVG and delete any Text children with empty/whitespace content.

### 7. Screenshot and compare

Call `get_screenshot` after building. Compare against the original screenshot from step 1.

## Escape Hatches — Closed

| You Think | Do This Instead |
|---|---|
| "I can approximate this SVG" | No. Clone it with `x-paper-clone`. |
| "I'll delete everything and rebuild cleanly" | No. Clone existing nodes into new containers. |
| "This image node is simple, I'll recreate it" | No. Image nodes have `backgroundImage` URLs unique to the file. Clone. |
| "I'll fix the insertion order later" | No. Plan order before inserting. Rebuilding containers wastes time. |
| "I'll apply grayscale to the flex container" | No. CSS `filter` is inherited. Apply to individual leaf elements only. |
| "I'll simulate the back card with box-shadow" | No. Box-shadow produces wrong colors and rendering. Use a real Rectangle element. |
| "I'll mix clones and divs in one write_html for z-order" | No. Paper reorders clones after divs. Use separate `write_html` calls. |
| "The clone's box-shadow should be fine in the flex layout" | No. Check if the original was hidden behind an opaque sibling. If so, remove the shadow. |

## Before marking complete, you MUST:

1. Verify no original SVGs or images were deleted without cloning
2. Verify insertion order matches visual top-to-bottom order
3. Verify all cloned nodes that need `position: absolute` actually have it — call `get_computed_styles` on every clone that should be absolute
4. Verify overlapping elements (badges, labels) are the LAST child of their shared container
5. Verify clones in flex flow have `left: 0; top: 0` — not retained absolute coordinates from the original
6. Verify clones whose `box-shadow` was hidden in the original (behind opaque siblings) have `boxShadow: "none"`
7. Verify decorative background clones are EARLIER children than content divs in every container (call `get_children` to check)
8. Take a screenshot and compare against the original
9. Verify CSS filters are on leaf nodes, not flex containers
10. Verify the only `position: absolute` remaining is for decorative back-cards, overlapping labels, and overlay elements

Do not skip any step. A skipped step means visual corruption.
