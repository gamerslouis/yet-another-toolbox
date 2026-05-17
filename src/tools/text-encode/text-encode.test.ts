import { describe, expect, test } from 'bun:test'
import { process } from './text-encode'

describe('base64 encode', () => {
  test('encodes plain ASCII', () => {
    const r = process('hello', 'base64', 'encode')
    expect(r).toEqual({
      ok: true,
      output: 'aGVsbG8=',
      resolvedDirection: 'encode',
      resolvedCodec: 'base64',
    })
  })

  test('encodes UTF-8 (CJK)', () => {
    const r = process('你好', 'base64', 'encode')
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.resolvedDirection).toBe('encode')
      expect(r.resolvedCodec).toBe('base64')
    }
  })

  test('encodes UTF-8 (emoji)', () => {
    const r = process('🎉', 'base64', 'encode')
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.resolvedDirection).toBe('encode')
      expect(r.resolvedCodec).toBe('base64')
    }
  })
})

describe('base64 decode', () => {
  test('decodes valid base64', () => {
    const r = process('aGVsbG8=', 'base64', 'decode')
    expect(r).toEqual({
      ok: true,
      output: 'hello',
      resolvedDirection: 'decode',
      resolvedCodec: 'base64',
    })
  })

  test('round-trips UTF-8 (emoji)', () => {
    const encoded = process('🎉', 'base64', 'encode')
    expect(encoded.ok).toBe(true)
    if (!encoded.ok) return
    const decoded = process(encoded.output, 'base64', 'decode')
    expect(decoded).toEqual({
      ok: true,
      output: '🎉',
      resolvedDirection: 'decode',
      resolvedCodec: 'base64',
    })
  })

  test('returns error for invalid base64', () => {
    const r = process('not!!valid==', 'base64', 'decode')
    expect(r.ok).toBe(false)
  })

  test('returns error for invalid UTF-8 bytes', () => {
    const r = process('/////', 'base64', 'decode')
    expect(r.ok).toBe(false)
  })
})

describe('base64 auto direction', () => {
  test('auto-decodes valid base64 input', () => {
    const r = process('aGVsbG8=', 'base64', 'auto')
    expect(r).toEqual({
      ok: true,
      output: 'hello',
      resolvedDirection: 'decode',
      resolvedCodec: 'base64',
    })
  })

  test('auto-encodes plain text', () => {
    const r = process('hello world', 'base64', 'auto')
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.resolvedDirection).toBe('encode')
      expect(r.resolvedCodec).toBe('base64')
    }
  })
})

describe('url encode', () => {
  test('encodes space as %20', () => {
    const r = process('hello world', 'url', 'encode')
    expect(r).toEqual({
      ok: true,
      output: 'hello%20world',
      resolvedDirection: 'encode',
      resolvedCodec: 'url',
    })
  })

  test('encodes reserved chars', () => {
    const r = process('a=1&b=2', 'url', 'encode')
    expect(r).toEqual({
      ok: true,
      output: 'a%3D1%26b%3D2',
      resolvedDirection: 'encode',
      resolvedCodec: 'url',
    })
  })

  test('encodes UTF-8 (CJK)', () => {
    const r = process('你好', 'url', 'encode')
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.output).toBe(encodeURIComponent('你好'))
      expect(r.resolvedDirection).toBe('encode')
      expect(r.resolvedCodec).toBe('url')
    }
  })
})

describe('url decode', () => {
  test('decodes %20 to space', () => {
    const r = process('hello%20world', 'url', 'decode')
    expect(r).toEqual({
      ok: true,
      output: 'hello world',
      resolvedDirection: 'decode',
      resolvedCodec: 'url',
    })
  })

  test('round-trips reserved chars', () => {
    const encoded = process('a=1&b=2', 'url', 'encode')
    expect(encoded.ok).toBe(true)
    if (!encoded.ok) return
    const decoded = process(encoded.output, 'url', 'decode')
    expect(decoded).toEqual({
      ok: true,
      output: 'a=1&b=2',
      resolvedDirection: 'decode',
      resolvedCodec: 'url',
    })
  })

  test('returns error for malformed percent-encoding', () => {
    const r = process('%GG', 'url', 'decode')
    expect(r.ok).toBe(false)
  })

  test('returns error for lone percent sign', () => {
    const r = process('hello%', 'url', 'decode')
    expect(r.ok).toBe(false)
  })
})

describe('url auto direction', () => {
  test('auto-decodes input with %XX sequences', () => {
    const r = process('hello%20world', 'url', 'auto')
    expect(r).toEqual({
      ok: true,
      output: 'hello world',
      resolvedDirection: 'decode',
      resolvedCodec: 'url',
    })
  })

  test('auto-encodes plain text with no %XX', () => {
    const r = process('hello world', 'url', 'auto')
    expect(r).toEqual({
      ok: true,
      output: 'hello%20world',
      resolvedDirection: 'encode',
      resolvedCodec: 'url',
    })
  })
})

describe('auto codec', () => {
  test('detects base64 and decodes', () => {
    const r = process('aGVsbG8=', 'auto', 'auto')
    expect(r).toEqual({
      ok: true,
      output: 'hello',
      resolvedDirection: 'decode',
      resolvedCodec: 'base64',
    })
  })

  test('detects url-encoded and decodes', () => {
    const r = process('hello%20world', 'auto', 'auto')
    expect(r).toEqual({
      ok: true,
      output: 'hello world',
      resolvedDirection: 'decode',
      resolvedCodec: 'url',
    })
  })

  test('defaults to base64 encode for plain text', () => {
    const r = process('hello world', 'auto', 'auto')
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.resolvedDirection).toBe('encode')
      expect(r.resolvedCodec).toBe('base64')
    }
  })

  test('explicit encode uses base64', () => {
    const r = process('hello', 'auto', 'encode')
    expect(r).toEqual({
      ok: true,
      output: 'aGVsbG8=',
      resolvedDirection: 'encode',
      resolvedCodec: 'base64',
    })
  })

  test('explicit decode detects base64', () => {
    const r = process('aGVsbG8=', 'auto', 'decode')
    expect(r).toEqual({
      ok: true,
      output: 'hello',
      resolvedDirection: 'decode',
      resolvedCodec: 'base64',
    })
  })

  test('explicit decode detects url-encoding', () => {
    const r = process('hello%20world', 'auto', 'decode')
    expect(r).toEqual({
      ok: true,
      output: 'hello world',
      resolvedDirection: 'decode',
      resolvedCodec: 'url',
    })
  })

  test('explicit decode errors on unrecognized input', () => {
    const r = process('hello world', 'auto', 'decode')
    expect(r.ok).toBe(false)
  })
})

describe('empty input', () => {
  test('auto codec auto direction empty string', () => {
    const r = process('', 'auto', 'auto')
    expect(r).toEqual({
      ok: true,
      output: '',
      resolvedDirection: 'encode',
      resolvedCodec: 'base64',
    })
  })

  test('base64 auto direction empty string', () => {
    const r = process('', 'base64', 'auto')
    expect(r).toEqual({
      ok: true,
      output: '',
      resolvedDirection: 'encode',
      resolvedCodec: 'base64',
    })
  })

  test('url encode whitespace-only', () => {
    const r = process('   ', 'url', 'encode')
    expect(r).toEqual({ ok: true, output: '', resolvedDirection: 'encode', resolvedCodec: 'url' })
  })

  test('base64 decode empty string', () => {
    const r = process('', 'base64', 'decode')
    expect(r).toEqual({
      ok: true,
      output: '',
      resolvedDirection: 'encode',
      resolvedCodec: 'base64',
    })
  })
})
