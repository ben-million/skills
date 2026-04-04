# paper-flex-conversion

A [Claude Code](https://claude.com/claude-code) skill for converting [Paper](https://paper.design) designs from absolute positioning to flex containers.

## The problem

Paper's MCP tools let Claude Code modify designs programmatically. But when asked to convert absolutely-positioned layouts to flex, Claude's default behavior is to delete nodes and recreate them from scratch — destroying SVGs, images, and precise styling in the process.

## What this skill does

Teaches Claude Code to restructure layouts **non-destructively** using `x-paper-clone` to preserve every original element while wrapping them in proper flex containers.

Key behaviors:
- **Clone, never recreate** — SVGs, images, and styled elements are cloned into new flex containers, not approximated
- **Scan for references** — checks other artboards for reusable flex versions of the same components
- **Compute gaps from coordinates** — derives `padding` and `gap` values from absolute `left`/`top` positions
- **Build incrementally** — one visual group per `write_html` call, inserted in correct order
- **Inherited CSS filters** — applies `filter: grayscale()` to leaf nodes only, never flex containers

## Install

```
npx skills add ben-million/paper-flex-conversion
```

## Usage

Once installed, the skill activates automatically when you ask Claude Code to convert Paper designs from absolute positioning to flex containers.

```
Convert this frame to use flex containers — currently everything is absolutely positioned.
```

## Requirements

- [Claude Code](https://claude.com/claude-code)
- [Paper](https://paper.design) MCP server connected
