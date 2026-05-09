import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { formatJson } from './formatJson'

const INITIAL = '{"name":"Louis","tools":["diff","password"],"active":true}'

export default function JsonFormatterTool() {
  const [input, setInput] = useState(INITIAL)
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
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[320px] resize-y font-mono text-sm"
            placeholder="Paste JSON here…"
          />
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
              'min-h-[320px] overflow-auto rounded-md border bg-secondary/50 px-3 py-2',
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
          </div>
        </div>
      </div>
    </div>
  )
}
