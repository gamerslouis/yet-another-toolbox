import { useState } from 'react'
import { CopyButton } from '@/components/CopyButton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { calcSubnet, isValidIPv4, isValidNetmask, parseCidr, shiftNetwork } from './ipCalc'

const PRIVATE_NETWORKS = [
  ['10.0.0.0/8', '10/8'],
  ['172.16.0.0/12', '172.16/12'],
  ['192.168.0.0/16', '192.168/16'],
] as const

function getCidrError(cidr: string, parsed: ReturnType<typeof parseCidr>): string | null {
  if (!cidr) return null
  if (!parsed) return 'Use CIDR format, e.g. 192.168.1.0/24'
  if (!isValidIPv4(parsed.address)) return 'Invalid IPv4 address'
  if (!isValidNetmask(parsed.netmask)) return 'Invalid netmask or prefix'
  return null
}

export default function IpCalculatorTool() {
  const [cidr, setCidr] = useState('')

  const parsed = parseCidr(cidr)
  const cidrError = getCidrError(cidr, parsed)
  const info = parsed && !cidrError ? calcSubnet(parsed.address, parsed.netmask) : null

  const results: [label: string, value: string, copyable: boolean][] = info
    ? [
        ['Address', info.address, true],
        ['Netmask', `${info.subnetMask} / ${info.subnetMaskLength}`, true],
        ['Wildcard', info.wildcardMask, true],
        ['Network', info.networkAddress, true],
        ['Broadcast', info.broadcastAddress, true],
        ['First host', info.firstAddress, true],
        ['Last host', info.lastAddress, true],
        ['Hosts', info.numHosts.toLocaleString(), false],
        ['Private', info.isPrivate ? 'Yes' : 'No', false],
      ]
    : []

  const handleSetPrefix = (prefix: string) => {
    const ip = parsed?.address ?? cidr
    setCidr(`${ip}/${prefix}`)
  }

  const handleShift = (next: boolean) => {
    if (!parsed || cidrError) return
    const newAddress = shiftNetwork(parsed.address, parsed.netmask, next)
    setCidr(`${newAddress}/${parsed.netmask}`)
  }

  return (
    <div className="flex flex-col gap-5 max-w-lg">
      <div className="flex flex-col gap-3">
        <Field label="IP / CIDR" error={cidrError}>
          <Input
            value={cidr}
            onChange={(e) => setCidr(e.target.value)}
            placeholder="e.g. 192.168.1.0/24 or 10.0.0.1/255.0.0.0"
            className={cn(cidrError && 'border-destructive focus-visible:ring-destructive')}
          />
        </Field>

        <Field label="Quick prefix">
          <div className="flex gap-1">
            {(['8', '16', '24'] as const).map((p) => (
              <Button
                key={p}
                variant="outline"
                size="sm"
                onClick={() => handleSetPrefix(p)}
                className="px-2 text-xs"
              >
                /{p}
              </Button>
            ))}
          </div>
        </Field>

        <Field label="Private network">
          <div className="flex flex-wrap gap-1">
            {PRIVATE_NETWORKS.map(([cidrVal, label]) => (
              <Button
                key={label}
                variant="outline"
                size="sm"
                onClick={() => setCidr(cidrVal)}
                className="text-xs"
              >
                {label}
              </Button>
            ))}
          </div>
        </Field>

        <Field label="Switch network">
          <div className="flex gap-1">
            <Button variant="outline" size="sm" onClick={() => handleShift(false)}>
              ← Prev
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleShift(true)}>
              Next →
            </Button>
          </div>
        </Field>
      </div>

      <Separator />

      {info ? (
        <div className="flex flex-col gap-2">
          {results.map(([label, value, copyable]) => (
            <div key={label} className="flex items-center gap-2">
              <span className="w-24 shrink-0 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {label}
              </span>
              <span className="flex-1 font-mono text-sm text-foreground">{value}</span>
              {copyable && <CopyButton text={value} className="shrink-0" />}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          {cidrError ?? 'Enter an IP address in CIDR notation above.'}
        </p>
      )}
    </div>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string | null
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
