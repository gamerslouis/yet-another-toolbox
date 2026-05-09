# Yet Another Toolbox — Development Guide

## Stack

| Layer        | Tech                                       |
| ------------ | ------------------------------------------ |
| Runtime / PM | Bun 1.x                                    |
| Build        | Vite 6 + `@vitejs/plugin-react`            |
| UI           | React 19 + TypeScript (strict)             |
| Components   | shadcn/ui (New York style)                 |
| Styling      | Tailwind CSS v4 + CSS custom properties    |
| Lint         | ESLint 9 flat config + `typescript-eslint` |
| Format       | Prettier 3                                 |

## Commands

| Command           | Action                                   |
| ----------------- | ---------------------------------------- |
| `bun dev`         | Start dev server (Vite HMR)              |
| `bun run build`   | TypeScript check + Vite production build |
| `bun run preview` | Serve the `dist/` build locally          |
| `bun run lint`    | Run ESLint                               |
| `bun run format`  | Run Prettier (write)                     |

## Project Structure

```
src/
├── main.tsx              # React root, mounts ThemeProvider + App
├── App.tsx               # Layout: Sidebar, CommandPalette, tool Suspense boundary
├── index.css             # Tailwind import + all CSS custom property tokens
├── types.ts              # Tool interface, DiffOp type
├── tools/
│   ├── registry.ts       # Central TOOLS array with React.lazy imports
│   ├── text-diff/        # Text Diff tool
│   ├── password/         # Password Generator tool
│   ├── json-formatter/   # JSON Formatter tool
│   ├── base64/           # Placeholder
│   ├── color-picker/     # Placeholder
│   └── image-converter/  # Placeholder (pre-isolated chunk)
├── components/
│   ├── ui/               # shadcn/ui components (auto-generated, do not edit manually)
│   ├── Sidebar/          # Collapsible sidebar nav
│   ├── CommandPalette/   # ⌘K search palette
│   ├── ThemeProvider/    # Dark/light mode context
│   ├── ToolIcon.tsx      # Renders Tool['icon'] (string emoji or Lucide component)
│   └── CopyButton.tsx    # Floating copy-to-clipboard button for text boxes
└── lib/
    ├── utils.ts          # shadcn cn() helper
    ├── useLocalStorage.ts
    ├── useHotkey.ts
    └── useClipboard.ts   # navigator.clipboard wrapper with copied-state feedback
```

## Adding a New Tool

1. Create `src/tools/<tool-id>/index.tsx` (default export = React page component)
2. Add pure logic helpers alongside: `src/tools/<tool-id>/<helper>.ts`
3. Add one entry to `src/tools/registry.ts`:

```ts
{
  id: 'my-tool',
  label: 'My Tool',
  icon: '⚙',             // string emoji, or a Lucide component: icon: Braces
  tags: ['keyword1', 'keyword2'],
  category: 'misc',
  component: lazy(() => import('./my-tool')),
}
```

`icon` accepts `string | ComponentType<{ className?: string }>`. Use `<ToolIcon icon={tool.icon} />` wherever you need to render it — never render `tool.icon` directly as a JSX child.

4. Done — the tool appears in the sidebar and command palette automatically.

## Tool UX Conventions

- **Copy button**: every text input/output box gets a `<CopyButton>` floating top-right — wrap the textarea in `relative`, add `pr-10` to prevent text sliding under the button, place `<CopyButton className="absolute top-1.5 right-1.5" />` inside.
- **No sample data**: initial state is always empty; placeholder text on the textarea guides the user.
- **Smart auto-detect**: tools with a binary mode (encode/decode, etc.) should default to auto-detection and expose a manual override toggle.

## UX Principles

- **Cursor pointer on all interactive elements** — every clickable element (`<button>`, `<a>`, shadcn `Button`) must have `cursor-pointer`. The shadcn `Button` base class already includes it; raw `<button>` elements must add it explicitly.
- **Hover must have visible color feedback** — every interactive element needs a perceptible background or text color change on hover. `ghost` buttons use `hover:bg-accent`; avoid placing them on `bg-secondary` containers because `--accent === --secondary` in this theme, making the hover invisible. Use `bg-background` or `bg-card` as the container background instead.
- **Never disable a button just to suppress a no-op** — if a button does nothing when its source is empty, guard inside the handler (e.g. `if (!text) return`). Do not set `disabled` — it removes `pointer-events`, killing cursor and hover feedback.
- **Dark mode hover must have sufficient lightness contrast** — `--accent` in dark mode must be visibly brighter than `--card` and `--secondary`. Current value: `oklch(24%)` (card is `13%`, secondary is `16%`). Do not let accent drift back below `20%`.
- **Live results, no submit button** — tools that transform input (Text Diff, JSON Formatter, Base64) update output on every keystroke via `useMemo`. Never add a submit/run button for synchronous transformations.
- **No sample data on load** — initial state is always empty; `placeholder` text on the textarea guides the user. Avoid pre-filling inputs with demo content.
- **Smart auto-detect with manual override** — tools with a binary mode (encode/decode, etc.) should detect the likely intent from the input and default to it. Always expose a manual toggle for edge cases (e.g. double-encoding).

## CSS / Theming Rules

- All color/spacing tokens are in `src/index.css` as CSS custom properties
- Dark mode: `.dark` class on `<html>` (shadcn convention)
- **Never hardcode colors in components** — always use Tailwind semantic utilities (`bg-primary`, `text-muted-foreground`) or CSS variables exposed via `@theme inline`
- **Never use `style={{ color: ... }}` or raw `var(--token)` in JSX** — add the token to `@theme inline` in `index.css` first, then use the generated Tailwind class
- **No raw Tailwind color values** (`text-red-500`, `bg-emerald-600`) for status indicators — use semantic tokens or define a CSS variable
- **Prefer `size-N` over `w-N h-N`** when width equals height (icons, avatars, square buttons)
- Custom tool tokens (`--diff-add`, `--success`, `--strength-*`) are defined in `:root`/`.dark` and exposed in `@theme inline` so they work as Tailwind utilities

## shadcn/ui Components

- Components live in `src/components/ui/` — these are owned by the project and can be edited
- Add new components via CLI: `bunx --bun shadcn@latest add <component-name>`
- When patching a component (bug fix, variant tweak), edit the file directly — that is the intended workflow
- Use built-in variants first (`variant="outline"`, `size="sm"`) before reaching for `className` overrides
- Use `cn()` from `@/lib/utils` for all conditional or merged class names

## Chunk Strategy

Each `React.lazy(() => import('./tools/<id>'))` in `registry.ts` becomes its own Rollup chunk.
The `image-converter` chunk is intentionally pre-isolated for a future heavy WASM/canvas library.

**Target chunk sizes (gzip):**

- `vendor.js` (react + react-dom): ~50KB
- Main app shell: < 30KB
- Each tool chunk: < 15KB

## Before Every Commit

Run and fix both checks before committing. CI enforces them on every PR and will block merge if either fails.

```bash
bun run format   # auto-fix formatting (Prettier)
bun run lint     # report ESLint issues (fix manually)
```

Prettier check is `--check` mode in CI (read-only). Run `bun run format` locally to write fixes, then stage the changes.

## CI (GitHub Actions)

Three jobs run on every PR and on pushes to `main`:

| Job               | What it does                                              |
| ----------------- | --------------------------------------------------------- |
| **Lint & Format** | `prettier --check .` then `eslint .`                      |
| **Type Check**    | `tsc --noEmit -p tsconfig.app.json`                       |
| **Build**         | `vite build` (verifies no broken imports or chunk errors) |

Workflow file: `.github/workflows/ci.yml`

## Code Style

- No semicolons, single quotes, 2-space indent (enforced by Prettier)
- TypeScript strict mode — no `any`, no unused variables
- Tool logic in pure `.ts` helper files, not inside React components
- No comments unless the WHY is non-obvious
