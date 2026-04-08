# Nudge Installation

The runtime is installed once per project and stays during development. It is inert when no nudge session is active.

**Check first:** Grep for `__nudge` in the project. If the runtime is already installed, stop — go back to the main skill.

## Framework Detection

Check for config files in the project root:

| Config file | Framework | Entry point |
|---|---|---|
| `next.config.*` | Next.js App Router | `app/layout.tsx` |
| `next.config.*` + `pages/` | Next.js Pages Router | `pages/_app.tsx` |
| `vite.config.*` | Vite | `index.html` at project root |
| `svelte.config.*` | SvelteKit | `src/app.html` |
| `remix.config.*` or `app/root.tsx` | Remix | `app/root.tsx` |
| `astro.config.*` | Astro | `src/layouts/*.astro` or page-level |
| `public/index.html` | CRA | `public/index.html` |
| Fallback | — | Any `.html` entry file |

## All Frameworks: Copy the Runtime

Copy `references/runtime.js` to the project's `public/` (or equivalent static assets) directory as `__nudge.js`.

Add `public/__nudge.js` to the project's `.gitignore` so the runtime file is not committed.

## Next.js App Router

Add to `app/layout.tsx`. Inside `<body>`, add the config div and script tag. Guard with `process.env.NODE_ENV !== 'production'`:

```tsx
<body>
  {/* ...existing children... */}
  {process.env.NODE_ENV !== 'production' && (
    <>
      <div id="__nudge" style={{display:'none'}} />
      <script src="/__nudge.js" defer />
    </>
  )}
</body>
```

Use a plain `<script defer>` tag, NOT `next/script` with `strategy="afterInteractive"`. The `afterInteractive` strategy depends on React hydration. If any component has a hydration error, the script silently never loads. A plain `<script defer>` bypasses hydration entirely.

## Next.js Pages Router

In `pages/_app.tsx`, use `next/script` with `strategy="afterInteractive"`. If the script fails to load, fall back to a plain `<script defer>` tag in `pages/_document.tsx`.

## Vite / CRA / SvelteKit

Add before `</body>` in the HTML entry file:

```html
<div id="__nudge" style="display:none"></div>
<script src="/__nudge.js"></script>
```

## Remix / Astro

Use a `<script src="/__nudge.js">` tag and a `<div id="__nudge" style="display:none">` in the document body. Wrap in a dev-only conditional if the framework supports it.

## Production Safety

The runtime exits immediately when `#__nudge` has no `data-property` attribute. Combined with `NODE_ENV` guards, the runtime never activates in production. The config div and script tag are safe to leave in the layout permanently.
