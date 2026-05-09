import { Check, Copy, RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { useClipboard } from '@/lib/useClipboard'
import { genPassword, strengthScore, type PasswordOptions } from './genPassword'

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'] as const
const STRENGTH_BG = [
  '',
  'bg-strength-1',
  'bg-strength-2',
  'bg-strength-3',
  'bg-strength-4',
] as const
const STRENGTH_TEXT = [
  '',
  'text-strength-1',
  'text-strength-2',
  'text-strength-3',
  'text-strength-4',
] as const

const DEFAULT_OPTS: PasswordOptions = {
  length: 16,
  uppercase: true,
  lowercase: true,
  digits: true,
  symbols: false,
}

export default function PasswordTool() {
  const [opts, setOpts] = useState<PasswordOptions>(DEFAULT_OPTS)
  const [password, setPassword] = useState('')
  const { copied, copy } = useClipboard()

  const generate = useCallback(() => {
    setPassword(genPassword(opts))
  }, [opts])

  useEffect(() => {
    generate()
  }, [generate])

  const toggle = (key: keyof Omit<PasswordOptions, 'length'>) =>
    setOpts((o) => ({ ...o, [key]: !o[key] }))

  const score = strengthScore(password)
  const strLabel = STRENGTH_LABELS[score]

  return (
    <div className="flex flex-col gap-5 max-w-md">
      {/* Password display */}
      <div className="flex items-center gap-2 rounded-md border border-border bg-background px-4 py-3">
        <span className="flex-1 font-mono text-base tracking-widest break-all text-foreground">
          {password || '—'}
        </span>
        <Button variant="ghost" size="icon" onClick={() => copy(password)} title="Copy">
          {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={generate} title="Regenerate">
          <RefreshCw className="size-4" />
        </Button>
      </div>

      {/* Strength meter */}
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors duration-300',
              i <= score ? STRENGTH_BG[score] : 'bg-border',
            )}
          />
        ))}
        <span className={cn('w-20 text-right text-xs font-medium', STRENGTH_TEXT[score])}>
          {strLabel}
        </span>
      </div>

      {/* Length slider */}
      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Length: {opts.length}
        </label>
        <Slider
          min={4}
          max={64}
          value={[opts.length]}
          onValueChange={([v]) => setOpts((o) => ({ ...o, length: v }))}
        />
      </div>

      {/* Charset options */}
      <div className="grid grid-cols-2 gap-3">
        {(
          [
            { key: 'uppercase', label: 'A–Z uppercase' },
            { key: 'lowercase', label: 'a–z lowercase' },
            { key: 'digits', label: '0–9 digits' },
            { key: 'symbols', label: '!@# symbols' },
          ] as { key: keyof Omit<PasswordOptions, 'length'>; label: string }[]
        ).map(({ key, label }) => (
          <label
            key={key}
            className="flex cursor-pointer items-center gap-2 text-sm text-foreground"
          >
            <Checkbox checked={opts[key]} onCheckedChange={() => toggle(key)} />
            {label}
          </label>
        ))}
      </div>
    </div>
  )
}
