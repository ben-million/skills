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

**Margins are not supported in Paper.** Do NOT use `margin` for spacing. Use these alternatives:
- **Uniform spacing:** `gap` on the flex container
- **Non-uniform spacing:** invisible spacer divs (`<div style="height: 16px; flex-shrink: 0;"></div>`)
- **Section-specific insets:** split content into wrapper divs with different `padding` values

When different rows in a card have different left insets (e.g. top bar at 15px, content at 19px), use separate wrapper divs inside the flex column, each with its own padding — not a single card padding with per-row offsets.

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

**CRITICAL: `x-paper-clone` ignores `position` style overrides.** Setting `style="position: absolute; ..."` on an `<x-paper-clone>` tag does NOT change the cloned node's position. Clones always inherit the original node's `position` value (typically `relative`). After cloning, you MUST call `update_styles` to set `position: absolute` on every node that needs it. Batch all position updates into a single `update_styles` call for efficiency.

```html
<!-- Style on x-paper-clone is IGNORED for position — clone gets position: relative -->
<x-paper-clone node-id="BACK_CARD_ID" style="position: absolute; left: -12px; top: -12px;" />
```

```
After cloning, fix with update_styles:
  update_styles({ updates: [{ nodeIds: ["CLONED_ID"], styles: { position: "absolute" } }] })
```

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

**CRITICAL:** The front card inside the wrapper must use `position: absolute; left: 0; top: 0;` — NOT `position: relative`. In a non-flex wrapper, `position: relative` causes vertical stacking instead of overlap. Both the back card and front card must be `position: absolute`.

```html
<!-- CORRECT — fixed-size wrapper, all children absolute -->
<div style="position: relative; width: 274px; height: 184px;">
  <!-- Back card FIRST (renders behind in Paper's z-order) -->
  <div style="position: absolute; top: -12px; left: -12px; width: 252px; height: 187px; border-radius: 16px; background-color: #FCFCFC; box-shadow: #B0B0B038 0px 0px 0px 0.5px;"></div>
  <!-- Front card SECOND (renders on top), absolute + flex column for content -->
  <div style="position: absolute; left: 0; top: 0; display: flex; flex-direction: column; width: 274px; height: 184px; ...">
    ...content rows...
  </div>
</div>
```

```html
<!-- WRONG — front card with position: relative causes vertical stacking, not overlap -->
<div style="position: relative; width: 274px; height: 184px;">
  <div style="position: absolute; ...back card..."></div>
  <div style="position: relative; display: flex; ...front card...">...</div>
</div>

<!-- WRONG — flex wrapper collapses to 0×0 -->
<div style="display: flex; position: relative;">
  ...
</div>

<!-- WRONG — simulating back card with box-shadow (wrong colors/rendering) -->
<div style="box-shadow: ..., #FCFCFC -12px -12px 0px 0px;">
```

### Why child order matters — z-order across overflow

Paper renders later children on top of earlier children (like Figma/Sketch). The back card MUST be the first child so it renders behind the front card. Always verify with `get_children` after building.

**CRITICAL — Z-order bleeds across flex siblings.** When a card stack wrapper has children with negative `top`/`left` (back cards, corner marks extending above/beyond the wrapper), those overflowing children render ON TOP of earlier flex siblings — even if those siblings are visually above in the layout.

Example: a badge placed as a flex sibling ABOVE a card area will be hidden behind the card's back card or corner marks that overflow upward.

**Fix:** Any element that overlaps the card area (badges, labels, floating indicators) must be placed INSIDE the card stack wrapper as the LAST child with `position: absolute`, not as a separate flex sibling above it. This guarantees it renders on top of all card layers.

```
WRONG — badge as flex sibling above card (hidden behind card's overflow):
  Content wrapper (flex column)
    Badge          ← renders BEHIND the card's back card overflow
    Card area (relative)
      Back card (absolute, top: -12px)  ← overflows upward, covers badge
      Front card (absolute)

CORRECT — badge inside card area as last child (renders on top):
  Content wrapper (flex column)
    Card area (relative)
      Back card (absolute, top: -12px)
      Front card (absolute)
      Corner marks (absolute)
      Badge (absolute, top: -24px, last child)  ← renders on top of everything
```

## Before marking complete, you MUST:

1. Verify no original SVGs or images were deleted without cloning
2. Verify insertion order matches visual top-to-bottom order
3. **Verify all cloned nodes that need `position: absolute` actually have it** — call `get_computed_styles` on every clone that should be absolute. `x-paper-clone` does NOT apply position overrides; you must fix them with `update_styles`.
4. **Verify overlapping elements (badges, labels) are the LAST child** of their shared container — not flex siblings that can be hidden behind overflow from later siblings.
5. Take a screenshot and compare against the original
6. Verify CSS filters are on leaf nodes, not flex containers
7. Verify the only `position: absolute` remaining is for decorative back-cards, overlapping labels, and overlay elements

Do not skip any step. A skipped step means visual corruption.
