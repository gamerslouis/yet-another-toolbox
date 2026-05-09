import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { CopyButton } from '@/components/CopyButton'
import { useLocalStorage } from '@/lib/useLocalStorage'
import { process as processBase64, type Mode } from './base64'

const MODES: Mode[] = ['auto', 'encode', 'decode']
const MODE_LABELS: Record<Mode, string> = { auto: 'Auto', encode: 'Encode', decode: 'Decode' }

export default function Base64Tool() {
  const [input, setInput] = useState('')
  const [mode, setMode] = useLocalStorage<Mode>('base64.mode', 'auto')

  const result = useMemo(() => processBase64(input, mode), [input, mode])
  const output = result.ok ? result.output : ''
  const resolvedMode = result.ok ? result.resolvedMode : null
  const error = !result.ok ? result.error : null

  return (
    <div className="flex flex-col gap-4">
      {/* Input */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Input
          </label>
          <div className="flex items-center gap-1">
            {MODES.map((m) => (
              <Button
                key={m}
                variant={mode === m ? 'default' : 'ghost'}
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => setMode(m)}
              >
                {MODE_LABELS[m]}
              </Button>
            ))}
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

      {/* Output */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Output
          </label>
          {mode === 'auto' && resolvedMode && input.trim() && (
            <span className="text-[10px] text-muted-foreground font-mono">
              → {resolvedMode === 'encode' ? 'Encoded' : 'Decoded'}
            </span>
          )}
        </div>
        <div className="relative min-h-[160px] overflow-auto rounded-md border border-border bg-secondary/50 px-3 py-2 pr-10">
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
