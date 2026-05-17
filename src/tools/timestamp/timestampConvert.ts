export type UnitMode = 'auto' | 'seconds' | 'milliseconds' | 'microseconds'

export type ParseResult = { ok: true; date: Date; detected: string } | { ok: false; error: string }

export interface TimeFormats {
  unixSeconds: string
  unixMillis: string
  isoUtc: string
  rfcUtc: string
  utcHuman: string
  localHuman: string
  localeString: string
  dateOnly: string
  relative: string
}

function pad(n: number, len = 2): string {
  return String(n).padStart(len, '0')
}

function formatOffset(offsetMinutes: number): string {
  const sign = offsetMinutes <= 0 ? '+' : '-'
  const abs = Math.abs(offsetMinutes)
  return `UTC${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`
}

const RTF = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

export function relativeTime(target: Date, now: Date): string {
  const diffMs = target.getTime() - now.getTime()
  const abs = Math.abs(diffMs)

  if (abs < 60_000) return RTF.format(Math.round(diffMs / 1000), 'second')
  if (abs < 3_600_000) return RTF.format(Math.round(diffMs / 60_000), 'minute')
  if (abs < 86_400_000) return RTF.format(Math.round(diffMs / 3_600_000), 'hour')
  if (abs < 2_592_000_000) return RTF.format(Math.round(diffMs / 86_400_000), 'day')
  if (abs < 31_536_000_000) return RTF.format(Math.round(diffMs / 2_592_000_000), 'month')
  return RTF.format(Math.round(diffMs / 31_536_000_000), 'year')
}

export function formatStatic(date: Date): Omit<TimeFormats, 'relative'> {
  const ms = date.getTime()

  const Y = pad(date.getUTCFullYear(), 4)
  const Mo = pad(date.getUTCMonth() + 1)
  const D = pad(date.getUTCDate())
  const H = pad(date.getUTCHours())
  const Mi = pad(date.getUTCMinutes())
  const S = pad(date.getUTCSeconds())

  const lY = pad(date.getFullYear(), 4)
  const lMo = pad(date.getMonth() + 1)
  const lD = pad(date.getDate())
  const lH = pad(date.getHours())
  const lMi = pad(date.getMinutes())
  const lS = pad(date.getSeconds())
  const offset = formatOffset(date.getTimezoneOffset())

  return {
    unixSeconds: String(Math.floor(ms / 1000)),
    unixMillis: String(ms),
    isoUtc: date.toISOString(),
    rfcUtc: date.toUTCString(),
    utcHuman: `${Y}-${Mo}-${D} ${H}:${Mi}:${S} UTC`,
    localHuman: `${lY}-${lMo}-${lD} ${lH}:${lMi}:${lS} (${offset})`,
    localeString: date.toLocaleString(),
    dateOnly: `${Y}-${Mo}-${D}`,
  }
}

export function formatAll(date: Date, now: Date): TimeFormats {
  return { ...formatStatic(date), relative: relativeTime(date, now) }
}

export function parseInput(input: string, unit: UnitMode): ParseResult {
  const s = input.trim()
  if (!s) return { ok: false, error: '' }

  if (/^-?\d+$/.test(s)) {
    const num = Number(s)
    if (!Number.isFinite(num)) return { ok: false, error: 'Number out of range' }

    let effectiveUnit: 'seconds' | 'milliseconds' | 'microseconds'
    if (unit !== 'auto') {
      effectiveUnit = unit
    } else {
      const len = String(Math.abs(num)).length
      if (len <= 11) effectiveUnit = 'seconds'
      else if (len <= 14) effectiveUnit = 'milliseconds'
      else effectiveUnit = 'microseconds'
    }

    let ms: number
    if (effectiveUnit === 'seconds') ms = num * 1000
    else if (effectiveUnit === 'milliseconds') ms = num
    else ms = num / 1000

    const date = new Date(ms)
    if (isNaN(date.getTime())) return { ok: false, error: 'Timestamp out of range' }
    return { ok: true, date, detected: `Unix ${effectiveUnit}` }
  }

  const ms = Date.parse(s)
  if (isNaN(ms)) return { ok: false, error: 'Unrecognized date or timestamp' }
  return { ok: true, date: new Date(ms), detected: 'Date string' }
}
