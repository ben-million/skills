# Budge Installation (Next.js App Router)

Three steps. The component is inert when no config prop is passed — safe to leave permanently.

## 1. Install Dependencies

```bash
npm install calligraph motion
```

## 2. Copy the Component

Copy `references/__budge.tsx` from this skill into the project:

```
app/__budge.tsx
```

## 3. Add to Root Layout

In `app/layout.tsx`, import and render `<Budge />` inside `<body>`:

```tsx
import { Budge } from "./__budge";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Budge />
      </body>
    </html>
  );
}
```

That's it. No `public/` files, no `next/script`, no deploy step.
