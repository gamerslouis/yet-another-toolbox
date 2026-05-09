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
│   └── ToolIcon.tsx      # Renders Tool['icon'] (string emoji or Lucide component)
└── lib/
    ├── utils.ts          # shadcn cn() helper
    ├── useLocalStorage.ts
    └── useHotkey.ts
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
