---
name: bkmrk
description: Quick bookmark/note capture. Invoked with /bkmrk. Stores the note as a plain .txt file in the user's iCloud Drive bkmrk/ folder so it syncs across devices. Use when the user runs /bkmrk, says "bkmrk this", "add a bkmrk", "save a bookmark", or otherwise asks to capture a URL / snippet / quick note for later.
---

# bkmrk

Fast, low-ceremony bookmark and note capture. One flat folder, plain `.txt` files, no frontmatter.

Storage path:

```
~/Library/Mobile Documents/com~apple~CloudDocs/bkmrk/
```

## When invoked

- `/bkmrk <content>` — capture the arg verbatim as the note body.
- `/bkmrk` with no args — ask the user what to capture.
- Implicit phrasing ("bkmrk this", "save as bkmrk") — treat the referenced content (URL, quote, snippet, recent message) as the body.

## How to save

1. **Filename.** Short kebab-case slug derived from the content. Examples:
   - A URL → use the domain + slug of the path (`news-ycombinator-com-item-123.txt`, or just `hn-claude-design.txt` if a title is obvious).
   - A quote/snippet → 3–5 word slug of the key phrase (`borges-library-of-babel.txt`).
   - If the user provides an explicit name after the content (e.g. `/bkmrk <url> as hn-top`), use that slug verbatim.
2. **Collisions.** If `<slug>.txt` exists, append today's date: `<slug>-YYYY-MM-DD.txt`. If that also exists, append `-2`, `-3`, etc. Never overwrite.
3. **Body.** Plain text, verbatim. No markdown, no frontmatter, no auto-added timestamps. For a bare URL, the file contents are just the URL on one line.
4. **Write** using the `Write` tool at:
   ```
   /Users/benmaclaurin/Library/Mobile Documents/com~apple~CloudDocs/bkmrk/<slug>.txt
   ```
5. **Confirm in one line** — just the filename used. E.g. "Saved: `hn-claude-design.txt`".

## What NOT to do

- Don't use `.md` — this skill is `.txt` only. For markdown notes use the `commonplace` skill.
- Don't create subdirectories. Keep the folder flat.
- Don't reformat, summarize, or rewrap the user's content.
- Don't add frontmatter or metadata lines.
- Don't list the folder unless asked.
