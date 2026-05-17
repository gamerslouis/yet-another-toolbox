import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { CopyButton } from '@/components/CopyButton'
import { useLocalStorage } from '@/lib/useLocalStorage'
import { type UnitMode, formatStatic, parseInput, relativeTime } from './timestampConvert'

const UNIT_OPTIONS: { value: UnitMode; label: string }[] = [
  { value: 'auto', label: 'Auto' },
  { value: 'seconds', label: 's' },
  { value: 'milliseconds', label: 'ms' },
  { value: 'microseconds', label: 'µs' },
]

export default function TimestampTool() {
  const [input, setInput] = useState('')
  const [unit, setUnit] = useLocalStorage<UnitMode>('timestamp.unit', 'auto')
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const curSeconds = String(Math.floor(now / 1000))
  const curMillis = String(now)

  const parsed = useMemo(() => parseInput(input, unit), [input, unit])
  const staticFmts = useMemo(() => (parsed.ok ? formatStatic(parsed.date) : null), [parsed])
  const relative = useMemo(
    () => (parsed.ok ? relativeTime(parsed.date, new Date(now)) : ''),
    [parsed, now],
  )
  const formats = staticFmts ? { ...staticFmts, relative } : null

  const resultGroups: { heading: string; rows: [string, string][] }[] = formats
    ? [
        {
          heading: 'UTC',
          rows: [
            ['ISO 8601', formats.isoUtc],
            ['RFC 2822', formats.rfcUtc],
            ['Human', formats.utcHuman],
            ['Date', formats.dateOnly],
          ],
        },
        {
          heading: 'Local',
          rows: [
            ['Locale string', formats.localeString],
            ['With offset', formats.localHuman],
          ],
        },
        {
          heading: 'Unix',
          rows: [
            ['Seconds', formats.unixSeconds],
            ['Milliseconds', formats.unixMillis],
          ],
        },
        {
          heading: 'Relative',
          rows: [['From now', formats.relative]],
        },
      ]
    : []

  return (
    <div className="flex flex-col gap-5 max-w-lg">
      <div className="flex flex-col gap-2 rounded-md border bg-secondary/50 px-4 py-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Current time
        </span>
        <Row label="Seconds" value={curSeconds}>
          <CopyButton text={curSeconds} className="shrink-0" />
        </Row>
        <Row label="Milliseconds" value={curMillis}>
          <CopyButton text={curMillis} className="shrink-0" />
        </Row>
        <Button
          size="sm"
          variant="outline"
          className="self-start cursor-pointer"
          onClick={() => setInput(curSeconds)}
        >
          Use now
        </Button>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Input
          </label>
          <div className="flex items-center gap-1">
            <span className="mr-1 text-[10px] text-muted-foreground">Unit:</span>
            {UNIT_OPTIONS.map(({ value, label }) => (
              <Button
                key={value}
                variant={unit === value ? 'default' : 'ghost'}
                size="sm"
                className="h-6 cursor-pointer px-2 text-xs"
                onClick={() => setUnit(value)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
        <div className="relative">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. 1715882400, 1715882400000, or 2024-05-16T18:00:00Z"
            className="pr-10 font-mono"
          />
          <CopyButton text={input} className="absolute right-1.5 top-1.5" />
        </div>
        {!parsed.ok && parsed.error && <p className="text-xs text-destructive">{parsed.error}</p>}
        {parsed.ok && <p className="text-xs text-muted-foreground">Detected: {parsed.detected}</p>}
      </div>

      {formats && (
        <div className="flex flex-col gap-4">
          {resultGroups.map((group, gi) => (
            <div key={group.heading}>
              {gi > 0 && <Separator className="mb-4" />}
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.heading}
                </span>
                {group.rows.map(([label, value]) => (
                  <Row key={label} label={label} value={value}>
                    <CopyButton text={value} className="shrink-0" />
                  </Row>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Row({ label, value, children }: { label: string; value: string; children?: ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-28 shrink-0 text-xs text-muted-foreground">{label}</span>
      <span className="flex-1 break-all font-mono text-sm text-foreground">{value}</span>
      {children}
    </div>
  )
}
