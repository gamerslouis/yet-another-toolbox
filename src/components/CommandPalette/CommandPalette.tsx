import { Search } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { ToolIcon } from '@/components/ToolIcon'
import type { Tool } from '@/types'

interface CommandPaletteProps {
  tools: Tool[]
  onSelect: (tool: Tool) => void
  onClose: () => void
}

export function CommandPalette({ tools, onSelect, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [cursor, setCursor] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const results = useMemo(() => {
    const q = query.toLowerCase()
    if (!q) return tools
    return tools.filter(
      (t) => t.label.toLowerCase().includes(q) || t.tags.some((tag) => tag.includes(q)),
    )
  }, [tools, query])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    setCursor(0)
  }, [query])

  // scroll active item into view
  useEffect(() => {
    const el = listRef.current?.children[cursor] as HTMLElement | undefined
    el?.scrollIntoView({ block: 'nearest' })
  }, [cursor])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setCursor((c) => Math.min(c + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setCursor((c) => Math.max(c - 1, 0))
    } else if (e.key === 'Enter') {
      if (results[cursor]) onSelect(results[cursor])
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-[min(560px,90vw)] overflow-hidden rounded-xl border border-border bg-popover shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input row */}
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Search className="size-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search tools…"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-80 overflow-y-auto">
          {results.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">No tools found</div>
          ) : (
            results.map((tool, i) => (
              <button
                key={tool.id}
                className={cn(
                  'flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors',
                  i === cursor ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50',
                )}
                onMouseEnter={() => setCursor(i)}
                onClick={() => onSelect(tool)}
              >
                <ToolIcon
                  icon={tool.icon}
                  className="w-6 text-center text-base text-muted-foreground flex items-center justify-center"
                />
                <span className="flex-1 text-sm text-foreground">{tool.label}</span>
                {i === cursor && (
                  <kbd className="rounded border border-border bg-secondary px-1 py-0.5 text-[10px] font-mono text-muted-foreground">
                    ↵
                  </kbd>
                )}
              </button>
            ))
          )}
        </div>

        {/* Footer hints */}
        <div className="flex items-center gap-4 border-t border-border px-4 py-2 text-[11px] text-muted-foreground font-mono">
          <span>
            <kbd className="rounded border border-border bg-secondary px-1 py-0.5">↑↓</kbd> navigate
          </span>
          <span>
            <kbd className="rounded border border-border bg-secondary px-1 py-0.5">↵</kbd> open
          </span>
          <span>
            <kbd className="rounded border border-border bg-secondary px-1 py-0.5">⌘K</kbd> toggle
          </span>
        </div>
      </div>
    </div>
  )
}
