# Vidhyapat Educator Portal
**React 18 + Vite 5 + Bootstrap 5**

---

## Quick Start

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build → dist/
npm run preview    # preview production build
```

---

## Project Structure

```
vidhyapat-educator/
├── index.html                   ← Vite entry (root level, not in public/)
├── vite.config.js               ← @ alias → src/
├── .env.example                 ← Copy to .env, add VITE_API_URL
│
└── src/
    ├── main.jsx                 ← App entry: Bootstrap → styles → App
    ├── App.jsx                  ← Routes
    │
    ├── styles/
    │   ├── tokens.css           ← SINGLE SOURCE OF TRUTH for all values
    │   ├── base.css             ← Global resets + Bootstrap overrides
    │   └── index.css            ← Imports tokens + base (imported in main.jsx)
    │
    ├── pages/
    │   ├── auth/
    │   │   ├── Login.jsx
    │   │   └── Login.css        ← Only CSS Bootstrap cannot handle
    │   └── dashboard/
    │       └── Dashboard.jsx
    │
    ├── components/
    │   ├── common/              ← Shared UI: Button, Input, Badge, Modal…
    │   └── layout/              ← Sidebar, Topbar, PageWrapper…
    │
    ├── services/
    │   └── auth.api.js          ← Replace mock with httpClient calls
    │
    ├── utils/
    │   ├── httpClient.js        ← Shared axios instance (configure here)
    │   └── auth.utils.js        ← Session helpers (get/save/clear)
    │
    ├── hooks/                   ← Custom hooks: useAuth, useFetch…
    └── context/                 ← React context: AuthContext…
```

---

## Style System — 3-Layer Rule

### The golden rule
```
Bootstrap utilities  →  CSS tokens (var())  →  component CSS file
```
Use the next layer only when the previous layer can't do it.

---

### Layer 1: Bootstrap utilities (use first, always)
Bootstrap classes in JSX for spacing, layout, color, components.

```jsx
<div className="d-flex align-items-center gap-3 mb-4 px-5">
<button className="btn btn-primary w-100 py-3">
<input className="form-control">
<div className="alert alert-danger text-sm py-2">
```

---

### Layer 2: CSS tokens (never hardcode values)
All values live in `styles/tokens.css`. Use `var()` everywhere.

```css
/* ✅ Correct */
.my-element {
  color: var(--color-primary);
  border-radius: var(--radius-md);
  font-family: var(--font-display);
  padding: var(--space-4);
}

/* ❌ Wrong — hardcoded, breaks when design changes */
.my-element {
  color: #1a56db;
  border-radius: 9px;
  padding: 16px;
}
```

---

### Layer 3: Component CSS (only when Bootstrap + tokens aren't enough)
Create `ComponentName.css` co-located next to `ComponentName.jsx`.
Only write CSS here for things Bootstrap literally cannot do:

| Needs custom CSS | Use Bootstrap instead |
|---|---|
| `position: absolute` (icon-in-input) | spacing, flex, grid |
| `::after` pseudo-element (overlay) | colors, text styles |
| `@keyframes` animations | `shadow-sm`, `rounded-*` |
| Fixed panel widths | `alert`, `badge`, `btn` |
| `white-space: pre-line` overrides | `form-control`, `form-label` |
| `font-family: var(--font-display)` | `text-muted`, `fw-bold` |

---

## Connecting Real API

1. `npm install axios`
2. Copy `.env.example` → `.env`, set `VITE_API_URL`
3. Open `src/utils/httpClient.js` — uncomment the real implementation
4. Update `src/services/auth.api.js`:
```js
import httpClient from '@/utils/httpClient'
export const educatorLogin = (data) =>
  httpClient.post('/auth/educator/login', data)
```

> **Vite note:** Environment variables must be prefixed with `VITE_`
> and accessed via `import.meta.env.VITE_API_URL` (not `process.env`)

---

## Adding a New Page

```
src/pages/courses/
  Courses.jsx
  Courses.css    ← only if Bootstrap + tokens aren't enough
```

```jsx
// Courses.jsx
import '@/pages/courses/Courses.css'  // or use @ alias

// only styles Bootstrap can't handle, using tokens:
// .courses-grid { grid-template-columns: repeat(3, 1fr); gap: var(--space-6); }
```

Add route in `App.jsx`:
```jsx
<Route path="/courses" element={<Courses />} />
```

---

## Token Quick Reference

| Token | Value | Use for |
|---|---|---|
| `--color-primary` | #1a56db | Buttons, links, focus rings |
| `--color-text` | #0f1729 | Body text |
| `--color-text-secondary` | #6b7a99 | Labels, subtitles |
| `--color-border` | #d0d8ea | Input borders |
| `--color-bg-input` | #f8faff | Input backgrounds |
| `--font-display` | Playfair Display | Page headings |
| `--font-body` | DM Sans | All body text |
| `--radius-md` | 9px | Inputs, buttons |
| `--radius-lg` | 12px | Cards, panels |
| `--shadow-btn` | blue glow | Primary buttons |
| `--transition-fast` | 0.15s ease | Hover states |
| `--space-4` | 16px | Base spacing unit |
| `--login-panel-width` | 480px | Auth page panel |
| `--sidebar-width` | 240px | Dashboard sidebar |
| `--topbar-height` | 60px | Dashboard topbar |
