export type Codec = 'auto' | 'base64' | 'url'
export type Direction = 'auto' | 'encode' | 'decode'

export type Result =
  | {
      ok: true
      output: string
      resolvedDirection: 'encode' | 'decode'
      resolvedCodec: 'base64' | 'url'
    }
  | { ok: false; error: string }

const encoder = new TextEncoder()
const decoder = new TextDecoder('utf-8', { fatal: true })

function b64Encode(input: string): string {
  const bytes = encoder.encode(input)
  const CHUNK = 0x8000
  let bin = ''
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK))
  }
  return btoa(bin)
}

function b64Decode(input: string): string {
  const bin = atob(input)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return decoder.decode(bytes)
}

function tryB64Decode(input: string): string | null {
  const stripped = input.replace(/\s/g, '')
  if (!stripped || stripped.length % 4 !== 0) return null
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(stripped)) return null
  try {
    return b64Decode(stripped)
  } catch {
    return null
  }
}

function looksLikeUrlEncoded(input: string): boolean {
  return /%[0-9A-Fa-f]{2}/.test(input)
}

function tryUrlDecode(input: string): string | null {
  if (!looksLikeUrlEncoded(input)) return null
  try {
    return decodeURIComponent(input)
  } catch {
    return null
  }
}

function processBase64(input: string, direction: Direction): Result {
  if (direction === 'auto') {
    const decoded = tryB64Decode(input)
    if (decoded !== null)
      return { ok: true, output: decoded, resolvedDirection: 'decode', resolvedCodec: 'base64' }
    return {
      ok: true,
      output: b64Encode(input),
      resolvedDirection: 'encode',
      resolvedCodec: 'base64',
    }
  }
  if (direction === 'encode') {
    return {
      ok: true,
      output: b64Encode(input),
      resolvedDirection: 'encode',
      resolvedCodec: 'base64',
    }
  }
  try {
    return {
      ok: true,
      output: b64Decode(input.replace(/\s/g, '')),
      resolvedDirection: 'decode',
      resolvedCodec: 'base64',
    }
  } catch {
    return { ok: false, error: 'Invalid Base64 — could not decode as UTF-8' }
  }
}

function processUrl(input: string, direction: Direction): Result {
  if (direction === 'auto') {
    const decoded = tryUrlDecode(input)
    if (decoded !== null)
      return { ok: true, output: decoded, resolvedDirection: 'decode', resolvedCodec: 'url' }
    return {
      ok: true,
      output: encodeURIComponent(input),
      resolvedDirection: 'encode',
      resolvedCodec: 'url',
    }
  }
  if (direction === 'encode') {
    return {
      ok: true,
      output: encodeURIComponent(input),
      resolvedDirection: 'encode',
      resolvedCodec: 'url',
    }
  }
  try {
    return {
      ok: true,
      output: decodeURIComponent(input),
      resolvedDirection: 'decode',
      resolvedCodec: 'url',
    }
  } catch {
    return { ok: false, error: 'Invalid URL encoding — malformed percent-encoding' }
  }
}

function processAutoCodec(input: string, direction: Direction): Result {
  if (direction === 'encode') {
    return {
      ok: true,
      output: b64Encode(input),
      resolvedDirection: 'encode',
      resolvedCodec: 'base64',
    }
  }

  // For auto and explicit decode: detect codec from content
  const b64Decoded = tryB64Decode(input)
  if (b64Decoded !== null)
    return { ok: true, output: b64Decoded, resolvedDirection: 'decode', resolvedCodec: 'base64' }

  const urlDecoded = tryUrlDecode(input)
  if (urlDecoded !== null)
    return { ok: true, output: urlDecoded, resolvedDirection: 'decode', resolvedCodec: 'url' }

  if (direction === 'auto') {
    // Plain text: default to Base64 encode
    return {
      ok: true,
      output: b64Encode(input),
      resolvedDirection: 'encode',
      resolvedCodec: 'base64',
    }
  }
  return { ok: false, error: 'Could not decode — not valid Base64 or URL encoding' }
}

export function process(input: string, codec: Codec, direction: Direction): Result {
  const resolvedCodec: 'base64' | 'url' = codec === 'auto' ? 'base64' : codec
  if (!input.trim()) return { ok: true, output: '', resolvedDirection: 'encode', resolvedCodec }

  if (codec === 'auto') return processAutoCodec(input, direction)
  if (codec === 'base64') return processBase64(input, direction)
  return processUrl(input, direction)
}
