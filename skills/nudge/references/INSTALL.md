# Nudge Installation (Next.js App Router)

The component is inert when no config prop is passed — safe to leave permanently.

## 1. Install Dependencies

```bash
npm install calligraph motion
```

## 2. Copy Files

Copy these files from this skill's `references/` directory:

| Source | Destination |
|---|---|
| `references/__nudge.tsx` | `app/__nudge.tsx` |
| `references/__nudge-route.ts` | `app/api/__nudge/route.ts` |

Create the `app/api/__nudge/` directory if it does not exist.

## 3. Add to Root Layout

In `app/layout.tsx`, import and render `<Nudge />` inside `<body>`:

```tsx
import { Nudge } from "./__nudge";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Nudge />
      </body>
    </html>
  );
}
```
