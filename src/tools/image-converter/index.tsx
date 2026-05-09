import { Badge } from '@/components/ui/badge'

export default function ImageConverterTool() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 text-center">
      <div className="text-5xl opacity-20">🖼</div>
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-semibold text-foreground">Image Converter</h2>
        <Badge variant="secondary">Coming soon</Badge>
      </div>
      <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
        Convert and resize images between PNG, JPEG, and WebP formats — no upload required.
      </p>
      <div className="rounded-md border border-border bg-secondary/50 px-4 py-3 text-left">
        <pre className="font-mono text-xs text-muted-foreground leading-relaxed">
          {`// This chunk loads its heavy library on demand.\n// In production it is fetched only when you\n// navigate here — keeping the initial load lean.`}
        </pre>
      </div>
    </div>
  )
}
