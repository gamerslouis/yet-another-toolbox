import { Suspense, useCallback, useState } from 'react'
import { GithubIcon, BookOpen } from 'lucide-react'
import { CommandPalette } from '@/components/CommandPalette/CommandPalette'
import { Sidebar } from '@/components/Sidebar/Sidebar'
import { ThemeProvider } from '@/components/ThemeProvider/ThemeProvider'
import { useLocalStorage } from '@/lib/useLocalStorage'
import { useHotkey } from '@/lib/useHotkey'
import { TOOLS } from '@/tools/registry'
import { ToolIcon } from '@/components/ToolIcon'
import type { Tool } from '@/types'

function Spinner() {
  return (
    <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
      Loading…
    </div>
  )
}

function ToolArea({ tool }: { tool: Tool }) {
  const ToolComponent = tool.component
  return (
    <Suspense fallback={<Spinner />}>
      <ToolComponent />
    </Suspense>
  )
}

function AppShell() {
  const [activeTool, setActiveTool] = useState<Tool>(TOOLS[0])
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useLocalStorage('yat-sidebar', true)

  const openPalette = useCallback(() => setPaletteOpen(true), [])
  const closePalette = useCallback(() => setPaletteOpen(false), [])

  // ⌘K / Ctrl+K toggles palette
  useHotkey(
    { key: 'k', meta: true },
    useCallback(() => setPaletteOpen((o) => !o), []),
  )
  useHotkey(
    { key: 'k', ctrl: true },
    useCallback(() => setPaletteOpen((o) => !o), []),
  )

  const handleSelect = useCallback((tool: Tool) => {
    setActiveTool(tool)
    setPaletteOpen(false)
  }, [])

  return (
    <div className="flex h-full overflow-hidden bg-background">
      <Sidebar
        tools={TOOLS}
        activeTool={activeTool}
        onSelect={handleSelect}
        onSearchOpen={openPalette}
        collapsed={!sidebarOpen}
        onToggle={() => setSidebarOpen((o) => !o)}
      />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center gap-3 border-b border-border bg-card px-6 py-4 shrink-0">
          {/* Offset for hamburger when sidebar is collapsed */}
          {!sidebarOpen && <div className="w-8" />}
          <ToolIcon icon={activeTool.icon} className="text-xl" iconClassName="size-5" />
          <h1
            className="text-base font-semibold text-foreground"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            {activeTool.label}
          </h1>
          <div className="ml-auto flex items-center gap-1">
            <a
              href="https://github.com/gamerslouis/yet-another-toolbox"
              target="_blank"
              rel="noopener noreferrer"
              className="flex size-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label="GitHub repository"
            >
              <GithubIcon className="size-4" />
            </a>
            <a
              href="https://blog.louisif.me"
              target="_blank"
              rel="noopener noreferrer"
              className="flex size-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label="Blog"
            >
              <BookOpen className="size-4" />
            </a>
          </div>
        </header>

        {/* Tool content */}
        <div className="flex-1 overflow-y-auto p-6">
          <ToolArea tool={activeTool} />
        </div>
      </main>

      {paletteOpen && (
        <CommandPalette tools={TOOLS} onSelect={handleSelect} onClose={closePalette} />
      )}
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AppShell />
    </ThemeProvider>
  )
}
