import { useState } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T | (() => T)) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      if (item !== null) return JSON.parse(item) as T
    } catch {
      // ignore parse errors
    }
    return typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue
  })

  const setValue = (value: T | ((prev: T) => T)) => {
    const next = typeof value === 'function' ? (value as (prev: T) => T)(storedValue) : value
    setStoredValue(next)
    try {
      localStorage.setItem(key, JSON.stringify(next))
    } catch {
      // ignore write errors (e.g. private browsing quota)
    }
  }

  return [storedValue, setValue] as const
}
