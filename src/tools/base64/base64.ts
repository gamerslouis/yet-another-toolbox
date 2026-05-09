export type Mode = 'auto' | 'encode' | 'decode'

export type Result =
  | { ok: true; output: string; resolvedMode: 'encode' | 'decode' }
  | { ok: false; error: string }

export function encode(input: string): string {
  const bytes = new TextEncoder().encode(input)
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  return btoa(bin)
}

export function decode(input: string): string {
  const bin = atob(input)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
}

export function looksLikeBase64(input: string): boolean {
  const stripped = input.replace(/\s/g, '')
  if (!stripped || stripped.length % 4 !== 0) return false
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(stripped)) return false
  try {
    decode(stripped)
    return true
  } catch {
    return false
  }
}

export function process(input: string, mode: Mode): Result {
  if (!input.trim()) return { ok: true, output: '', resolvedMode: 'encode' }

  if (mode === 'auto') {
    if (looksLikeBase64(input)) {
      try {
        return { ok: true, output: decode(input.replace(/\s/g, '')), resolvedMode: 'decode' }
      } catch {
        // decoded bytes are not valid UTF-8 — fall through to encode
      }
    }
    return { ok: true, output: encode(input), resolvedMode: 'encode' }
  }

  if (mode === 'encode') {
    try {
      return { ok: true, output: encode(input), resolvedMode: 'encode' }
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'Encode failed' }
    }
  }

  try {
    return { ok: true, output: decode(input.replace(/\s/g, '')), resolvedMode: 'decode' }
  } catch {
    return { ok: false, error: 'Invalid Base64 — could not decode as UTF-8' }
  }
}
