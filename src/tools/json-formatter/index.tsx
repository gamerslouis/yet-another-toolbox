import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { CopyButton } from '@/components/CopyButton'
import { cn } from '@/lib/utils'
import { formatJson } from './formatJson'

export default function JsonFormatterTool() {
  const [input, setInput] = useState('')
  const [indent, setIndent] = useState<2 | 4>(2)

  const result = useMemo(() => formatJson(input, indent), [input, indent])

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Input JSON
          </label>
          <div className="relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[320px] resize-y font-mono text-sm pr-10"
              placeholder="Paste JSON here…"
            />
            <CopyButton text={input} className="absolute top-1.5 right-1.5" />
          </div>
        </div>

        {/* Output */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Formatted
            </label>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-muted-foreground mr-1">Indent:</span>
              {([2, 4] as const).map((n) => (
                <Button
                  key={n}
                  variant={indent === n ? 'default' : 'ghost'}
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => setIndent(n)}
                >
                  {n}
                </Button>
              ))}
            </div>
          </div>
          <div
            className={cn(
              'relative min-h-[320px] overflow-auto rounded-md border bg-secondary/50 px-3 py-2 pr-10',
              result.valid ? 'border-border' : 'border-destructive/50',
            )}
          >
            {result.valid ? (
              <pre className="font-mono text-sm text-foreground whitespace-pre-wrap break-all">
                {result.output}
              </pre>
            ) : (
              <span className="text-destructive text-xs">{result.error}</span>
            )}
            <CopyButton
              text={result.valid ? result.output : ''}
              className="absolute top-1.5 right-1.5"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
