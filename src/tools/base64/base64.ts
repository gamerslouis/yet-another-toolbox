export type Mode = 'auto' | 'encode' | 'decode'

export type Result =
  | { ok: true; output: string; resolvedMode: 'encode' | 'decode' }
  | { ok: false; error: string }

export function encode(input: string): string {
  const bytes = new TextEncoder().encode(input)
  const CHUNK = 0x8000
  let bin = ''
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK))
  }
  return btoa(bin)
}

export function decode(input: string): string {
  const bin = atob(input)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
}

function tryDecode(input: string): string | null {
  const stripped = input.replace(/\s/g, '')
  if (!stripped || stripped.length % 4 !== 0) return null
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(stripped)) return null
  try {
    return decode(stripped)
  } catch {
    return null
  }
}

export function looksLikeBase64(input: string): boolean {
  return tryDecode(input) !== null
}

export function process(input: string, mode: Mode): Result {
  if (!input.trim()) return { ok: true, output: '', resolvedMode: 'encode' }

  if (mode === 'auto') {
    const decoded = tryDecode(input)
    if (decoded !== null) return { ok: true, output: decoded, resolvedMode: 'decode' }
    return { ok: true, output: encode(input), resolvedMode: 'encode' }
  }

  if (mode === 'encode') {
    return { ok: true, output: encode(input), resolvedMode: 'encode' }
  }

  try {
    return { ok: true, output: decode(input.replace(/\s/g, '')), resolvedMode: 'decode' }
  } catch {
    return { ok: false, error: 'Invalid Base64 — could not decode as UTF-8' }
  }
}
