# Yet Another Toolbox — Specification

## Overview

A browser-based utility toolbox website. All computation runs client-side. No backend required.
Deployable to Cloudflare Pages, GitHub Pages, or Netlify as a static site.

---

## Core Tools (fully implemented)

| Tool                 | Description                                                                                |
| -------------------- | ------------------------------------------------------------------------------------------ |
| Text Diff            | Line-by-line comparison of two text blocks, auto-updates on input                          |
| Password Generator   | Charset options (upper/lower/digits/symbols), strength meter, clipboard copy               |
| JSON Formatter       | Format & validate JSON with configurable indent (2 or 4 spaces), auto-updates              |
| Base64 Encode/Decode | Auto-detects encode vs decode; manual override (Auto / Encode / Decode toggle); UTF-8-safe |

## Placeholder Tools (UI shell, logic TBD)

| Tool            | Notes                                                             |
| --------------- | ----------------------------------------------------------------- |
| Color Picker    | Hex / RGB / HSL converter and picker                              |
| Image Converter | Pre-isolated chunk; will load heavy WASM/canvas library in future |

---

## UX Requirements

### Dark / Light Mode

- Initial value: read from `localStorage` key `yat-theme`; fall back to `prefers-color-scheme`
- Toggle button persists preference to `localStorage`
- Applied via `.dark` class on `<html>` (shadcn/ui convention)

### Responsive Design (RWD)

- Desktop: persistent sidebar (240px)
- Tablet / Mobile (≤ 640px): sidebar hidden by default, opens as overlay
- Hamburger button (☰) visible when sidebar is collapsed

### Sidebar Navigation

- Default: expanded, full tool list visible
- Collapsible: toggle button inside sidebar header
- Collapsed: sidebar completely hidden (no icon-only mode)
- Hamburger ☰ in top-left restores it

### Command Palette

- Hotkey: `⌘K` (macOS) / `Ctrl+K` (Windows/Linux)
- Opens modal overlay with search input
- Keyboard navigation: `↑↓` to navigate, `Enter` to open, `ESC` to close
- Search scope: tool name + tags

### Auto-Update

- Text Diff, JSON Formatter: results update on every keystroke (no submit button)
- Password Generator: regenerates on every option change

---

## Technical Requirements

### Performance — Lazy Loading

- Each tool page is a separate Rollup/Vite chunk (via `React.lazy` + dynamic `import()`)
- Vendor chunk (react, react-dom) split separately
- Main app shell loads < 30KB gzip

### Tech Stack

- Runtime / PM: Bun
- Build: Vite 6 + `@vitejs/plugin-react`
- UI: React 19 + TypeScript (strict mode)
- Components: shadcn/ui (New York style, components copied into repo)
- Styling: Tailwind CSS v4 + CSS custom properties for theme tokens
- Lint: ESLint 9 (flat config) + `typescript-eslint`
- Format: Prettier 3

### Deployment

- Output: pure static files in `dist/`
- No API server, no backend, no external runtime dependencies

---

## Non-Functional Requirements

| Item                  | Description                                                                                                                                           |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Privacy               | All computation runs in the browser; no user data leaves the device                                                                                   |
| No backend            | Static deployment; no API server needed                                                                                                               |
| No external resources | No CDN fonts, analytics, or external scripts — all dependencies bundled via Bun/Vite                                                                  |
| Offline               | Site works without network after first load                                                                                                           |
| Extensibility         | New tool = new folder under `src/tools/` + one entry in `src/tools/registry.ts`                                                                       |
| Smart input handling  | Tools auto-detect input format/state when reasonable (e.g. Base64 encode vs decode) and provide a manual override for edge cases like double-encoding |

---

## Adding a New Tool (Checklist)

1. Create `src/tools/<tool-id>/index.tsx` — default export the React page component
2. Add logic helpers to `src/tools/<tool-id>/<helper>.ts` (pure functions, zero deps)
3. Add an entry to `src/tools/registry.ts` TOOLS array:
   - `id`, `label`, `icon`, `tags`, `category`
   - `component: lazy(() => import('./<tool-id>'))`
4. Tool appears automatically in sidebar and command palette
5. No routing, no config changes needed
