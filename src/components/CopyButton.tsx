import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useClipboard } from '@/lib/useClipboard'

interface Props {
  text: string
  className?: string
}

export function CopyButton({ text, className }: Props) {
  const { copied, copy } = useClipboard()
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => copy(text)}
      title="Copy"
      className={cn('size-7', className)}
    >
      {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
    </Button>
  )
}
