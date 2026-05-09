import { useMemo, useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { diffLines } from './diffLines'

const INITIAL_LEFT = `hello world
foo bar
baz`

const INITIAL_RIGHT = `hello world
foo baz
baz qux`

export default function TextDiffTool() {
  const [left, setLeft] = useState(INITIAL_LEFT)
  const [right, setRight] = useState(INITIAL_RIGHT)

  const diff = useMemo(() => diffLines(left, right), [left, right])
  const changeCount = diff.filter((d) => d.type !== 'equal').length

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Input panes */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Original
          </label>
          <Textarea
            value={left}
            onChange={(e) => setLeft(e.target.value)}
            className="min-h-[180px] resize-y font-mono text-sm"
            placeholder="Paste original text…"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Modified
          </label>
          <Textarea
            value={right}
            onChange={(e) => setRight(e.target.value)}
            className="min-h-[180px] resize-y font-mono text-sm"
            placeholder="Paste modified text…"
          />
        </div>
      </div>

      {/* Diff output */}
      <div className="rounded-md border border-border overflow-hidden flex-1 min-h-0">
        <div className="flex items-center gap-2 border-b border-border bg-secondary/50 px-3 py-2 text-xs font-semibold">
          {changeCount === 0 ? (
            <span className="text-success">✓ Identical</span>
          ) : (
            <span className="text-primary">{changeCount} change(s)</span>
          )}
        </div>
        <div className="overflow-y-auto max-h-[280px] font-mono text-xs">
          {diff.map((line, i) => (
            <div
              key={i}
              className={cn('flex items-start px-3 py-0.5 leading-5', {
                'bg-diff-add-bg text-diff-add': line.type === 'add',
                'bg-diff-rem-bg text-diff-rem': line.type === 'remove',
                'text-muted-foreground/50': line.type === 'equal',
              })}
            >
              <span className="w-4 shrink-0 select-none text-center opacity-60">
                {line.type === 'add' ? '+' : line.type === 'remove' ? '−' : ' '}
              </span>
              <span className="whitespace-pre-wrap break-all">{line.line || ' '}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
