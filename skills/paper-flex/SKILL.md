---
name: paper-flex
description: Use when converting Paper design nodes from absolute positioning to flex containers. Covers restructuring layouts, preserving SVGs/images, cloning nodes, and computing flex gaps from absolute coordinates.
---

# Paper Flex Conversion Specialist

You convert absolutely-positioned Paper design layouts into flex container layouts while preserving every visual element exactly.

## Critical Rule: NEVER Delete-and-Recreate

**NEVER delete original nodes and recreate them from scratch.** SVGs, images, and complex styled elements CANNOT be accurately recreated — you will lose path data, image URLs, and precise styling. This is the #1 failure mode.

**Bad:** Delete all children, then write new HTML with hand-drawn SVGs.
**Good:** Clone existing nodes into new flex containers using `x-paper-clone`.

No exceptions for "it's just a simple shape" or "I can approximate it." If it exists in the design, clone it.

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
  Card stack (flex column, relative — for layered card effects)
    Back card (position: absolute — the ONLY valid use of absolute)
    Front card (flex column, padding)
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

### 6. Build incrementally with clones

Each `write_html` call produces ONE visual group. Insert in order — `insert-children` always appends.

```html
<!-- Clone existing SVG into a new flex row -->
<div style="display: flex; flex-direction: row; align-items: center; gap: 10px;">
  <x-paper-clone node-id="ORIGINAL_SVG_ID" />
  <div style="display: flex; flex-direction: column; gap: 4px;">
    <div style="width: 67px; height: 8px; ..."></div>
  </div>
</div>
```

Sequence: set outer frame to flex first, then insert container shell, then insert each row into the card in top-to-bottom order.

**`x-paper-clone` creates COPIES, not moves.** The original nodes remain as direct children of their parent. After building all flex containers with clones, you MUST delete every original node that was cloned. Check with `get_children` on the parent to find remaining originals.

**SVG clones from reference artboards may contain ghost text nodes** (empty `" "` Text nodes inside the SVG). After cloning, call `get_tree_summary` on the cloned SVG and delete any Text children with empty/whitespace content — they can render as visible artifacts.

### 7. Screenshot and compare

Call `get_screenshot` after building. Compare against the original screenshot from step 1.

## Escape Hatches — Closed

| You Think | Do This Instead |
|---|---|
| "I can approximate this SVG" | No. Clone it with `x-paper-clone`. |
| "I'll delete everything and rebuild cleanly" | No. Clone existing nodes into new containers. |
| "This image node is simple, I'll recreate it" | No. Image nodes have `backgroundImage` URLs that are unique to the file. Clone. |
| "I'll fix the insertion order later" | No. Plan order before inserting. Rebuilding containers wastes time. |
| "I'll apply grayscale to the flex container" | No. CSS `filter` is inherited. Apply to individual leaf elements only. |
| "I'll simulate the back card with box-shadow" | No. Box-shadow produces subtly wrong colors and rendering. Use a real Rectangle element. |

## Rules for Layered Card Effects

The only valid use of `position: absolute` in the output is for decorative back-cards that create a layered shadow effect.

### Card stack wrapper — NO flex, use fixed dimensions

**CRITICAL:** The card stack wrapper must NOT use `display: flex`. Flex wrappers collapse to 0×0 in Paper when their children use absolute/relative positioning. Use a plain frame with explicit `width` and `height` matching the front card dimensions.

```html
<!-- CORRECT — fixed-size wrapper, no flex -->
<div style="position: relative; width: 274px; height: 184px;">
  <!-- Back card FIRST (renders behind in Paper's z-order) -->
  <div style="position: absolute; top: -12px; left: -12px; width: 252px; height: 187px; border-radius: 16px; background-color: #FCFCFC; box-shadow: #B0B0B038 0px 0px 0px 0.5px;"></div>
  <!-- Front card SECOND (renders on top), flex column for content -->
  <div style="position: relative; display: flex; flex-direction: column; width: 274px; height: 184px; ...">
    ...content rows...
  </div>
</div>
```

```html
<!-- WRONG — flex wrapper collapses to 0×0 -->
<div style="display: flex; position: relative;">
  ...
</div>

<!-- WRONG — back card inside front card as child (overlaps content) -->
<div style="display: flex; flex-direction: column; ...front card styles...">
  <div style="position: absolute; top: -12px; left: -12px; ...back card..."></div>
  ...content rows...
</div>

<!-- WRONG — simulating back card with box-shadow (wrong colors/rendering) -->
<div style="box-shadow: ..., #FCFCFC -12px -12px 0px 0px;">
```

### Why child order matters

Paper renders later children on top of earlier children (like Figma/Sketch). The back card MUST be the first child so it renders behind the front card. Always verify with `get_children` after building.

## Before marking complete, you MUST:

1. Verify no original SVGs or images were deleted without cloning
2. Verify insertion order matches visual top-to-bottom order
3. Take a screenshot and compare against the original
4. Verify CSS filters are on leaf nodes, not flex containers
5. Verify the only `position: absolute` remaining is for decorative back-cards

Do not skip any step. A skipped step means visual corruption.
