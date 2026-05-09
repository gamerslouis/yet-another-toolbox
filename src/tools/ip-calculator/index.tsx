import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { calcSubnet, isValidIPv4, isValidNetmask, shiftNetwork } from './ipCalc'

const INITIAL_ADDRESS = '192.168.0.1'
const INITIAL_NETMASK = '24'

function useClipboard() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const copy = (key: string, value: string) => {
    void navigator.clipboard.writeText(value)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 1500)
  }
  return { copiedKey, copy }
}

export default function IpCalculatorTool() {
  const [address, setAddress] = useState(INITIAL_ADDRESS)
  const [netmask, setNetmask] = useState(INITIAL_NETMASK)
  const { copiedKey, copy } = useClipboard()

  const addressError = address && !isValidIPv4(address) ? 'Invalid IPv4 address' : null
  const netmaskError = netmask && !isValidNetmask(netmask) ? 'Invalid netmask or prefix' : null
  const info = !addressError && !netmaskError ? calcSubnet(address, netmask) : null

  const results: [string, string][] = info
    ? [
        ['Address', info.address],
        ['Netmask', `${info.subnetMask} / ${info.subnetMaskLength}`],
        ['Wildcard', info.wildcardMask],
        ['Network', info.networkAddress],
        ['Broadcast', info.broadcastAddress],
        ['First host', info.firstAddress],
        ['Last host', info.lastAddress],
        ['Hosts', info.numHosts.toLocaleString()],
        ['Private', info.isPrivate ? 'Yes' : 'No'],
      ]
    : []

  const handleClassChange = (prefix: string) => setNetmask(prefix)

  const handlePrivateNetwork = (addr: string, prefix: string) => {
    setAddress(addr)
    setNetmask(prefix)
  }

  const handleShift = (next: boolean) => {
    setAddress((prev) => shiftNetwork(prev, netmask, next))
  }

  return (
    <div className="flex flex-col gap-5 max-w-lg">
      {/* Inputs */}
      <div className="flex flex-col gap-3">
        <Field label="Address" error={addressError}>
          <Input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. 192.168.0.1"
            className={cn(addressError && 'border-destructive focus-visible:ring-destructive')}
          />
        </Field>

        <Field label="Netmask / Prefix" error={netmaskError}>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              value={netmask}
              onChange={(e) => setNetmask(e.target.value)}
              placeholder="e.g. 24 or 255.255.255.0"
              className={cn(
                'min-w-0 flex-1',
                netmaskError && 'border-destructive focus-visible:ring-destructive',
              )}
            />
            <div className="flex gap-1">
              {(['8', '16', '24'] as const).map((p) => (
                <Button
                  key={p}
                  variant="outline"
                  size="sm"
                  onClick={() => handleClassChange(p)}
                  className="px-2 text-xs"
                >
                  /{p}
                </Button>
              ))}
            </div>
          </div>
        </Field>

        <Field label="Private network">
          <div className="flex flex-wrap gap-1">
            {(
              [
                ['10.0.0.0', '8', '10/8'],
                ['172.16.0.0', '12', '172.16/12'],
                ['192.168.0.0', '16', '192.168/16'],
              ] as const
            ).map(([addr, prefix, label]) => (
              <Button
                key={label}
                variant="outline"
                size="sm"
                onClick={() => handlePrivateNetwork(addr, prefix)}
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

      {/* Results */}
      {info ? (
        <div className="flex flex-col gap-2">
          {results.map(([label, value]) => (
            <div key={label} className="flex items-center gap-2">
              <span className="w-24 shrink-0 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {label}
              </span>
              <span className="flex-1 font-mono text-sm text-foreground">{value}</span>
              {label !== 'Hosts' && label !== 'Private' && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 shrink-0"
                  onClick={() => copy(label, value)}
                  title={`Copy ${label}`}
                >
                  {copiedKey === label ? (
                    <Check className="size-3.5 text-success" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                </Button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          {addressError ?? netmaskError ?? 'Enter a valid IP address and netmask above.'}
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
