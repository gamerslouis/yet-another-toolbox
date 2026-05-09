import { Badge } from '@/components/ui/badge'

export default function Base64Tool() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 text-center">
      <div className="text-5xl opacity-20">⇌</div>
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-semibold text-foreground">Base64 Encode / Decode</h2>
        <Badge variant="secondary">Coming soon</Badge>
      </div>
      <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
        Encode and decode text between plain UTF-8 and Base64 format — entirely in your browser.
      </p>
    </div>
  )
}
