import { useCallback, useEffect, useRef, useState } from 'react'

export function useClipboard(timeout = 1500) {
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current)
    }
  }, [])

  const copy = useCallback(
    (text: string) => {
      if (!text) return
      void navigator.clipboard.writeText(text)
      if (timerRef.current !== null) clearTimeout(timerRef.current)
      setCopied(true)
      timerRef.current = setTimeout(() => {
        setCopied(false)
        timerRef.current = null
      }, timeout)
    },
    [timeout],
  )

  return { copied, copy }
}
