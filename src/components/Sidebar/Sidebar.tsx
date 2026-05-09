import { Menu, Moon, Search, Sun, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useTheme } from '@/components/ThemeProvider/useTheme'
import { ToolIcon } from '@/components/ToolIcon'
import { cn } from '@/lib/utils'
import type { Tool } from '@/types'

interface SidebarProps {
  tools: Tool[]
  activeTool: Tool
  onSelect: (tool: Tool) => void
  onSearchOpen: () => void
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({
  tools,
  activeTool,
  onSelect,
  onSearchOpen,
  collapsed,
  onToggle,
}: SidebarProps) {
  const { theme, toggle } = useTheme()

  return (
    <>
      {/* Hamburger when sidebar is closed */}
      {collapsed && (
        <button
          onClick={onToggle}
          title="Open sidebar"
          className="fixed left-3 top-3 z-50 flex size-8 items-center justify-center rounded-md border border-border bg-card text-muted-foreground shadow-sm hover:bg-accent hover:text-accent-foreground"
        >
          <Menu className="size-4" />
        </button>
      )}

      {/* Sidebar panel */}
      {!collapsed && (
        <aside
          className="flex h-full flex-col bg-card border-r border-border"
          style={{ width: 'var(--sidebar-w)', flexShrink: 0 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-3 min-h-[3.5rem]">
            <span
              className="text-lg font-bold text-foreground tracking-tight"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Toolbox
            </span>
            <Button variant="ghost" size="icon" onClick={onToggle} title="Close sidebar">
              <X className="size-4" />
            </Button>
          </div>

          <Separator />

          {/* Search trigger */}
          <div className="p-2">
            <button
              onClick={onSearchOpen}
              className="flex w-full items-center gap-2 rounded-md border border-input bg-secondary px-3 py-2 text-xs text-muted-foreground hover:border-ring transition-colors"
            >
              <Search className="size-3" />
              <span className="flex-1 text-left">Search tools…</span>
              <kbd className="rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-mono">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Tool list */}
          <nav className="flex flex-col gap-0.5 px-2 flex-1 overflow-y-auto">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => onSelect(tool)}
                className={cn(
                  'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors w-full text-left',
                  activeTool.id === tool.id
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                )}
              >
                <ToolIcon
                  icon={tool.icon}
                  className="text-base w-5 text-center flex items-center justify-center"
                />
                <span className="flex-1 truncate">{tool.label}</span>
                {tool.placeholder && <span className="text-[10px] opacity-50 font-mono">soon</span>}
              </button>
            ))}
          </nav>

          <Separator />

          {/* Footer */}
          <div className="flex items-center justify-end p-2">
            <Button variant="ghost" size="icon" onClick={toggle} title="Toggle dark mode">
              {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
          </div>
        </aside>
      )}
    </>
  )
}
