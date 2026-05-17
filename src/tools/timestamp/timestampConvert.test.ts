import { describe, expect, test } from 'bun:test'
import { formatAll, parseInput, relativeTime } from './timestampConvert'

describe('parseInput — numeric auto-detect', () => {
  test('10-digit → seconds', () => {
    const r = parseInput('1715882400', 'auto')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.detected).toBe('Unix seconds')
    expect(r.date.toISOString()).toBe('2024-05-16T18:00:00.000Z')
  })

  test('11-digit → seconds (boundary)', () => {
    const r = parseInput('99999999999', 'auto')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.detected).toBe('Unix seconds')
  })

  test('12-digit → milliseconds (boundary)', () => {
    const r = parseInput('100000000000', 'auto')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.detected).toBe('Unix milliseconds')
  })

  test('13-digit → milliseconds', () => {
    const r = parseInput('1715882400000', 'auto')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.detected).toBe('Unix milliseconds')
    expect(r.date.toISOString()).toBe('2024-05-16T18:00:00.000Z')
  })

  test('16-digit → microseconds', () => {
    const r = parseInput('1715882400000000', 'auto')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.detected).toBe('Unix microseconds')
    expect(r.date.toISOString()).toBe('2024-05-16T18:00:00.000Z')
  })

  test('epoch 0 → 1970-01-01', () => {
    const r = parseInput('0', 'auto')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.date.toISOString()).toBe('1970-01-01T00:00:00.000Z')
  })

  test('negative → pre-1970', () => {
    const r = parseInput('-86400', 'auto')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.date.toISOString()).toBe('1969-12-31T00:00:00.000Z')
  })
})

describe('parseInput — manual unit override', () => {
  test('force seconds on a 13-digit number', () => {
    const r = parseInput('1715882400000', 'seconds')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.detected).toBe('Unix seconds')
    expect(r.date.getFullYear()).toBeGreaterThan(2024)
  })

  test('force milliseconds on a 10-digit number', () => {
    const r = parseInput('1715882400', 'milliseconds')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.detected).toBe('Unix milliseconds')
    expect(r.date.getFullYear()).toBe(1970)
  })

  test('force microseconds', () => {
    const r = parseInput('1715882400000000', 'microseconds')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.detected).toBe('Unix microseconds')
    expect(r.date.toISOString()).toBe('2024-05-16T18:00:00.000Z')
  })
})

describe('parseInput — date strings', () => {
  test('ISO 8601 string', () => {
    const r = parseInput('2024-05-16T18:00:00Z', 'auto')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.detected).toBe('Date string')
    expect(r.date.toISOString()).toBe('2024-05-16T18:00:00.000Z')
  })

  test('RFC date string', () => {
    const r = parseInput('Thu, 16 May 2024 18:00:00 GMT', 'auto')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.detected).toBe('Date string')
    expect(r.date.toISOString()).toBe('2024-05-16T18:00:00.000Z')
  })
})

describe('parseInput — invalid inputs', () => {
  test('empty string', () => {
    const r = parseInput('', 'auto')
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.error).toBe('')
  })

  test('whitespace only', () => {
    const r = parseInput('   ', 'auto')
    expect(r.ok).toBe(false)
  })

  test('alphabetic string', () => {
    const r = parseInput('abc', 'auto')
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.error).toBe('Unrecognized date or timestamp')
  })

  test('mixed garbage', () => {
    const r = parseInput('not-a-date!!', 'auto')
    expect(r.ok).toBe(false)
  })
})

describe('relativeTime', () => {
  const now = new Date('2024-05-16T18:00:00.000Z')

  test('30 seconds ago', () => {
    const t = new Date(now.getTime() - 30_000)
    expect(relativeTime(t, now)).toMatch(/30 seconds ago/)
  })

  test('in 5 minutes', () => {
    const t = new Date(now.getTime() + 5 * 60_000)
    expect(relativeTime(t, now)).toMatch(/in 5 minutes/)
  })

  test('3 hours ago', () => {
    const t = new Date(now.getTime() - 3 * 3_600_000)
    expect(relativeTime(t, now)).toMatch(/3 hours ago/)
  })

  test('in 2 days', () => {
    const t = new Date(now.getTime() + 2 * 86_400_000)
    expect(relativeTime(t, now)).toMatch(/in 2 days/)
  })

  test('last year', () => {
    const t = new Date(now.getTime() - 400 * 86_400_000)
    expect(relativeTime(t, now)).toMatch(/last year|1 year ago/)
  })

  test('in 2 years', () => {
    const t = new Date(now.getTime() + 800 * 86_400_000)
    expect(relativeTime(t, now)).toMatch(/in 2 years/)
  })
})

describe('formatAll', () => {
  const epoch = new Date(0)
  const now = new Date('2024-01-01T00:00:00.000Z')
  const fmt = formatAll(epoch, now)

  test('unixSeconds', () => {
    expect(fmt.unixSeconds).toBe('0')
  })

  test('unixMillis', () => {
    expect(fmt.unixMillis).toBe('0')
  })

  test('isoUtc', () => {
    expect(fmt.isoUtc).toBe('1970-01-01T00:00:00.000Z')
  })

  test('dateOnly', () => {
    expect(fmt.dateOnly).toBe('1970-01-01')
  })

  test('utcHuman', () => {
    expect(fmt.utcHuman).toBe('1970-01-01 00:00:00 UTC')
  })

  test('known date unix seconds', () => {
    const d = new Date('2024-05-16T18:00:00.000Z')
    const f = formatAll(d, now)
    expect(f.unixSeconds).toBe('1715882400')
    expect(f.unixMillis).toBe('1715882400000')
    expect(f.isoUtc).toBe('2024-05-16T18:00:00.000Z')
    expect(f.dateOnly).toBe('2024-05-16')
  })
})
