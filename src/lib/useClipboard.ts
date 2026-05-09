import { useCallback, useState } from 'react'

export function useClipboard(timeout = 1500) {
  const [copied, setCopied] = useState(false)
  const copy = useCallback(
    (text: string) => {
      if (!text) return
      void navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), timeout)
    },
    [timeout],
  )
  return { copied, copy }
}
