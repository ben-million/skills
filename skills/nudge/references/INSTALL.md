# Nudge Installation (Next.js App Router)

Three steps. The component is inert when no config prop is passed — safe to leave permanently.

## 1. Install Dependencies

```bash
npm install calligraph motion
```

## 2. Copy the Component

Copy `references/__nudge.tsx` from this skill into the project:

```
app/__nudge.tsx
```

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

That's it. No `public/` files, no `next/script`, no deploy step.
