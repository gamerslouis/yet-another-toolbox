import { useMemo, useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { CopyButton } from '@/components/CopyButton'
import { aggregateRoutes } from './routeAggregation'

export default function RouteAggregationTool() {
  const [input, setInput] = useState('')

  const result = useMemo(() => aggregateRoutes(input), [input])

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Input — IPs or CIDRs (one per line)
          </label>
          <div className="relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[300px] resize-y font-mono text-sm pr-10"
              placeholder={'192.168.1.0/24\n192.168.2.0/24\n10.0.0.5'}
            />
            <CopyButton text={input} className="absolute top-1.5 right-1.5" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Aggregated CIDRs
            </label>
            {result.cidrs.length > 0 && (
              <span className="text-[11px] text-muted-foreground">
                {result.inputCount} input{result.inputCount !== 1 ? 's' : ''} →{' '}
                {result.cidrs.length} CIDR{result.cidrs.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="relative">
            <Textarea
              value={result.cidrs.join('\n')}
              readOnly
              className="min-h-[300px] resize-y font-mono text-sm pr-10 bg-secondary/30"
              placeholder="Results appear here…"
            />
            <CopyButton text={result.cidrs.join('\n')} className="absolute top-1.5 right-1.5" />
          </div>
        </div>
      </div>

      {result.errors.length > 0 && (
        <div className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 flex flex-col gap-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-destructive">
            {result.errors.length} invalid entr{result.errors.length !== 1 ? 'ies' : 'y'} skipped
          </p>
          {result.errors.map((e) => (
            <p key={e.line} className="font-mono text-xs text-destructive">
              Line {e.line}: {e.input}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
