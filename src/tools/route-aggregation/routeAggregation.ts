import { ipToLong, longToIp, isValidIPv4 } from '../ip-calculator/ipCalc'

export interface ParseError {
  line: number
  input: string
}

export interface AggregationResult {
  cidrs: string[]
  errors: ParseError[]
  inputCount: number
}

function trailingZeros(n: number): number {
  return n === 0 ? 32 : 31 - Math.clz32(n & -n)
}

function rangeToCidrs(start: number, end: number): string[] {
  const result: string[] = []
  let cur = start

  while (cur <= end) {
    let prefix = 32 - trailingZeros(cur)

    while (prefix < 32 && cur + Math.pow(2, 32 - prefix) - 1 > end) {
      prefix++
    }

    const blockSize = prefix < 32 ? Math.pow(2, 32 - prefix) : 1
    result.push(`${longToIp(cur)}/${prefix}`)
    const next = cur + blockSize
    if (next > 0xffffffff) break
    cur = next
  }

  return result
}

function parseCidr(entry: string): [number, number] | null {
  const slashIdx = entry.indexOf('/')
  if (slashIdx === -1) {
    if (!isValidIPv4(entry)) return null
    const addr = ipToLong(entry)
    return [addr, addr]
  }

  const ip = entry.slice(0, slashIdx)
  const prefixStr = entry.slice(slashIdx + 1)

  if (!isValidIPv4(ip)) return null
  if (!/^\d+$/.test(prefixStr)) return null

  const prefix = parseInt(prefixStr, 10)
  if (prefix < 0 || prefix > 32) return null

  const addrLong = ipToLong(ip)
  const maskLong = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0
  const networkLong = (addrLong & maskLong) >>> 0
  const broadcastLong = prefix === 32 ? networkLong : (networkLong | (~maskLong >>> 0)) >>> 0

  return [networkLong, broadcastLong]
}

export function aggregateRoutes(input: string): AggregationResult {
  const lines = input.split('\n')
  const errors: ParseError[] = []
  const ranges: [number, number][] = []

  for (let i = 0; i < lines.length; i++) {
    const entry = lines[i].trim()
    if (!entry) continue

    const range = parseCidr(entry)
    if (range === null) {
      errors.push({ line: i + 1, input: entry })
    } else {
      ranges.push(range)
    }
  }

  if (ranges.length === 0) {
    return { cidrs: [], errors, inputCount: 0 }
  }

  ranges.sort((a, b) => (a[0] !== b[0] ? a[0] - b[0] : b[1] - a[1]))

  const merged: [number, number][] = [ranges[0]]
  for (let i = 1; i < ranges.length; i++) {
    const last = merged[merged.length - 1]
    const cur = ranges[i]
    if (cur[0] <= last[1] + 1) {
      if (cur[1] > last[1]) last[1] = cur[1]
    } else {
      merged.push([cur[0], cur[1]])
    }
  }

  const cidrs: string[] = []
  for (const [start, end] of merged) {
    cidrs.push(...rangeToCidrs(start, end))
  }

  return { cidrs, errors, inputCount: ranges.length }
}
