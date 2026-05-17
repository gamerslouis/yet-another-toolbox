import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { CopyButton } from '@/components/CopyButton'
import { cn } from '@/lib/utils'
import { process, type Codec, type Direction } from './text-encode'

const CODECS: Codec[] = ['auto', 'base64', 'url']
const CODEC_LABELS: Record<Codec, string> = { auto: 'Auto', base64: 'Base64', url: 'URL' }

const DIRECTIONS: Direction[] = ['auto', 'encode', 'decode']
const DIRECTION_LABELS: Record<Direction, string> = {
  auto: 'Auto',
  encode: 'Encode',
  decode: 'Decode',
}

function ToggleGroup<T extends string>({
  items,
  labels,
  value,
  onChange,
}: {
  items: T[]
  labels: Record<T, string>
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="flex items-center gap-1">
      {items.map((item) => (
        <Button
          key={item}
          variant={value === item ? 'default' : 'ghost'}
          size="sm"
          className="h-6 px-2 text-xs"
          onClick={() => onChange(item)}
        >
          {labels[item]}
        </Button>
      ))}
    </div>
  )
}

export default function TextEncodeTool() {
  const [input, setInput] = useState('')
  const [codec, setCodec] = useState('auto')
  const [direction, setDirection] = useState('auto')

  const result = useMemo(() => process(input, codec, direction), [input, codec, direction])
  const output = result.ok ? result.output : ''
  const resolvedDirection = result.ok ? result.resolvedDirection : null
  const resolvedCodec = result.ok ? result.resolvedCodec : null
  const error = !result.ok ? result.error : null

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground pt-0.5">
            Input
          </label>
          <div className="flex flex-col items-end gap-1">
            <ToggleGroup
              items={CODECS}
              labels={CODEC_LABELS}
              value={codec}
              onChange={(v) => setCodec(v)}
            />
            <ToggleGroup
              items={DIRECTIONS}
              labels={DIRECTION_LABELS}
              value={direction}
              onChange={(v) => setDirection(v)}
            />
          </div>
        </div>
        <div className="relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[160px] resize-y font-mono text-sm pr-10"
            placeholder="Type or paste text here…"
          />
          <CopyButton text={input} className="absolute top-1.5 right-1.5" />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Output
          </label>
          {(codec === 'auto' || direction === 'auto') &&
            resolvedDirection &&
            resolvedCodec &&
            input.trim() && (
              <span className="text-[10px] text-muted-foreground font-mono">
                → {codec === 'auto' ? `${CODEC_LABELS[resolvedCodec]} · ` : ''}
                {resolvedDirection === 'encode' ? 'Encoded' : 'Decoded'}
              </span>
            )}
        </div>
        <div
          className={cn(
            'relative min-h-[160px] overflow-auto rounded-md border bg-secondary/50 px-3 py-2 pr-10',
            error ? 'border-destructive/50' : 'border-border',
          )}
        >
          {error ? (
            <span className="text-destructive text-xs">{error}</span>
          ) : (
            <pre className="font-mono text-sm text-foreground whitespace-pre-wrap break-all">
              {output}
            </pre>
          )}
          <CopyButton text={output} className="absolute top-1.5 right-1.5" />
        </div>
      </div>
    </div>
  )
}
