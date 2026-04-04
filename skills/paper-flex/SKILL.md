---
name: converting-paper-to-flex
description: Use when converting Paper design nodes from absolute positioning to flex containers. Covers absolute-to-flex conversion, restructuring layouts, preserving SVGs/images, cloning nodes, computing flex gaps from coordinates, auto-layout, and layered card effects.
---

# Paper Flex Conversion Specialist

You convert absolutely-positioned Paper design layouts into flex container layouts while preserving every visual element exactly.

## Critical Rules

### NEVER Delete-and-Recreate

**NEVER delete original nodes and recreate them from scratch.** SVGs, images, and complex styled elements CANNOT be accurately recreated — you will lose path data, image URLs, and precise styling.

**Bad:** Delete all children, then write new HTML with hand-drawn SVGs.
**Good:** Clone existing nodes into new flex containers using `x-paper-clone`.

No exceptions for "it's just a simple shape" or "I can approximate it." If it exists in the design, clone it.

### `x-paper-clone` Ignores Position Overrides

Setting `style="position: absolute; ..."` on an `<x-paper-clone>` tag does NOT change the cloned node's position. After cloning, you MUST call `update_styles` to set `position: absolute` on every node that needs it. Batch all position updates into a single `update_styles` call.

### Clone Ordering — Paper Reorders Clones After Divs

**Paper places `x-paper-clone` elements AFTER regular `<div>` elements in the child list, regardless of HTML source order.** This breaks z-order when you mix clones and divs in a single `write_html` call.

**Fix:** Insert decorative background clones in a SEPARATE `write_html` call BEFORE inserting content:

```
Step 1: write_html → container shell (empty)
Step 2: write_html into container → <x-paper-clone node-id="BG_RECT" />
Step 3: write_html into container → <div>...content...</div>
```

If clones ended up in the wrong z-order: create a temp frame, clone content elements there, delete originals from container, clone content back from temp (appends after decorative clones), delete temp frame.

### Cloned Elements Retain Absolute Coordinates

Clones keep their original `left`/`top` values, which act as offsets in flex containers and push elements off-screen. **After cloning into flex containers, call `update_styles` to reset `left: "0px"` and `top: "0px"` on any clone in flex flow.**

### Hidden Shadows Become Visible in Flex Layouts

In flat layouts, some elements' `box-shadow` is hidden behind later opaque siblings — flex conversion removes that coverage. **During step 2, for each element with `box-shadow`:** check if a LATER sibling has an opaque `backgroundColor` covering the same area. If yes, call `update_styles` to set `boxShadow: "none"` on these clones after conversion.

### Card Stack Constraints

When building layered card effects (decorative back-card behind a front card):

1. Card stack wrapper must NOT use `display: flex` — use a plain frame with explicit `width` and `height`
2. Both cards must use `position: absolute` — never `position: relative` for the front card
3. Back card must be FIRST child (renders behind)
4. Overlapping elements (badges, labels) must be LAST child

See `references/layered-cards.md` for examples.

## Workflow

### 1. Screenshot + analyze structure

Call `get_screenshot` and `get_tree_summary(depth=10)` on the target node. Identify every child element and its role.

### 2. Get computed styles for ALL children

Call `get_computed_styles` with every child node ID. Record positions, dimensions, colors, fonts, shadows, filters, border-radius, and `backgroundImage` URLs.

### 3. Scan for reference artboards

Call `get_basic_info` to list all artboards. Check if another artboard contains a flex version or reusable elements. If found, clone from there.

### 4. Identify logical groups

Map the flat absolutely-positioned children into a semantic hierarchy of flex containers, rows, and columns.

### 5. Compute flex gaps from absolute positions

```
gap = nextElement.top - (currentElement.top + currentElement.height)
leftPadding = firstChild.left - container.left
topPadding = firstChild.top - container.top
```

**Margins are not supported in Paper.** Use `gap` for uniform spacing, invisible spacer divs for non-uniform spacing, and wrapper divs with different `padding` for varying insets.

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

**When z-order matters, use separate `write_html` calls** for decorative clones and content divs (see Clone Ordering rule).

**After cloning, call `update_styles` to:** reset `left`/`top` to `"0px"` on flex-flow clones, and set `boxShadow: "none"` on shadow-hidden clones.

**`x-paper-clone` creates COPIES.** Originals remain — delete every original that was cloned after building all containers. Verify with `get_children`.

**SVG clones from reference artboards may contain ghost text nodes.** After cloning, call `get_tree_summary` on the SVG and delete any empty Text children.

### 7. Screenshot and compare

Call `get_screenshot` after building. Compare against the original from step 1.

## Escape Hatches — Closed

| You Think | Do This Instead |
|---|---|
| "I can approximate this SVG" | No. Clone it with `x-paper-clone`. |
| "I'll delete everything and rebuild cleanly" | No. Clone existing nodes into new containers. |
| "This image node is simple, I'll recreate it" | No. Image nodes have unique `backgroundImage` URLs. Clone. |
| "I'll fix the insertion order later" | No. Plan order before inserting. |
| "I'll apply grayscale to the flex container" | No. CSS `filter` is inherited. Apply to leaf elements only. |
| "I'll simulate the back card with box-shadow" | No. Use a real Rectangle element. |
| "I'll mix clones and divs in one write_html" | No. Paper reorders clones after divs. Use separate calls. |
| "The clone's box-shadow should be fine" | No. Check if original was hidden behind opaque sibling. |

## Before marking complete, you MUST:

1. Verify no original SVGs or images were deleted without cloning
2. Verify insertion order matches visual top-to-bottom order
3. Verify all cloned nodes needing `position: absolute` actually have it via `get_computed_styles`
4. Verify overlapping elements are the LAST child of their container
5. Verify clones in flex flow have `left: 0; top: 0`
6. Verify shadow-hidden clones have `boxShadow: "none"`
7. Verify decorative background clones are EARLIER children than content divs via `get_children`
8. Take a screenshot and compare against the original
9. Verify CSS filters are on leaf nodes, not flex containers
10. Verify `position: absolute` only remains for back-cards, overlapping labels, and overlays

Do not skip any step. A skipped step means visual corruption.
