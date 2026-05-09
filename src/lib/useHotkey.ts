import { useEffect } from 'react'

type ModifiedKey = {
  key: string
  meta?: boolean
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
}

export function useHotkey(hotkey: ModifiedKey, handler: () => void) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const metaMatch = hotkey.meta ? e.metaKey : !e.metaKey
      const ctrlMatch = hotkey.ctrl ? e.ctrlKey : !e.ctrlKey
      const shiftMatch = hotkey.shift ? e.shiftKey : !e.shiftKey
      const altMatch = hotkey.alt ? e.altKey : !e.altKey

      if (e.key === hotkey.key && metaMatch && ctrlMatch && shiftMatch && altMatch) {
        e.preventDefault()
        handler()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [hotkey.key, hotkey.meta, hotkey.ctrl, hotkey.shift, hotkey.alt, handler])
}
