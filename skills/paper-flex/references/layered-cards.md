# Layered Card Effects in Paper

Detailed reference for building layered card stacks in Paper flex layouts.

## Card stack wrapper — NO flex, use fixed dimensions

The card stack wrapper must NOT use `display: flex`. Flex wrappers collapse to 0×0 in Paper when their children use absolute/relative positioning. Use a plain frame with explicit `width` and `height` matching the front card dimensions.

The front card inside the wrapper must use `position: absolute; left: 0; top: 0;` — NOT `position: relative`. In a non-flex wrapper, `position: relative` causes vertical stacking instead of overlap. Both the back card and front card must be `position: absolute`.

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

## Z-order across overflow

Paper renders later children on top of earlier children (like Figma/Sketch). The back card MUST be the first child so it renders behind the front card. Always verify with `get_children` after building.

Z-order bleeds across flex siblings. When a card stack wrapper has children with negative `top`/`left` (back cards, corner marks extending above/beyond the wrapper), those overflowing children render ON TOP of earlier flex siblings — even if those siblings are visually above in the layout.

Example: a badge placed as a flex sibling ABOVE a card area will be hidden behind the card's back card or corner marks that overflow upward.

**Fix:** Any element that overlaps the card area (badges, labels, floating indicators) must be placed INSIDE the card stack wrapper as the LAST child with `position: absolute`, not as a separate flex sibling above it.

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
