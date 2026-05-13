export interface SubnetInfo {
  address: string
  subnetMask: string
  subnetMaskLength: number
  wildcardMask: string
  networkAddress: string
  broadcastAddress: string
  firstAddress: string
  lastAddress: string
  numHosts: number
  isPrivate: boolean
}

function ipToLong(ip: string): number {
  return ip.split('.').reduce((acc, octet) => ((acc << 8) + parseInt(octet, 10)) >>> 0, 0)
}

function longToIp(n: number): string {
  return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.')
}

function prefixToMaskLong(prefix: number): number {
  return prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0
}

function maskLongToPrefix(maskLong: number): number {
  let count = 0
  let m = maskLong >>> 0
  while (m & 0x80000000) {
    count++
    m = (m << 1) >>> 0
  }
  return count
}

export function isValidIPv4(ip: string): boolean {
  const parts = ip.split('.')
  if (parts.length !== 4) return false
  return parts.every((p) => {
    if (!/^\d+$/.test(p)) return false
    const n = parseInt(p, 10)
    return n >= 0 && n <= 255
  })
}

export function isValidNetmask(netmask: string): boolean {
  if (/^\d+$/.test(netmask)) {
    const n = parseInt(netmask, 10)
    return n >= 0 && n <= 32
  }
  if (!isValidIPv4(netmask)) return false
  const maskLong = ipToLong(netmask)
  const wildcard = ~maskLong >>> 0
  return (wildcard & (wildcard + 1)) === 0
}

function isPrivateIp(ip: string): boolean {
  const n = ipToLong(ip)
  // >>> 0 converts each bitwise-AND result from signed-32 back to unsigned so the
  // hex literals (which JS parses as unsigned) compare correctly for high-bit ranges.
  return (
    (n & 0xff000000) >>> 0 === 0x0a000000 || // 10.0.0.0/8
    (n & 0xfff00000) >>> 0 === 0xac100000 || // 172.16.0.0/12
    (n & 0xffff0000) >>> 0 === 0xc0a80000 // 192.168.0.0/16
  )
}

export function calcSubnet(address: string, netmask: string): SubnetInfo | null {
  if (!isValidIPv4(address) || !isValidNetmask(netmask)) return null

  let maskLong: number
  let prefix: number

  if (/^\d+$/.test(netmask)) {
    prefix = parseInt(netmask, 10)
    maskLong = prefixToMaskLong(prefix)
  } else {
    maskLong = ipToLong(netmask)
    prefix = maskLongToPrefix(maskLong)
  }

  const addrLong = ipToLong(address)
  const wildcardLong = ~maskLong >>> 0
  const networkLong = (addrLong & maskLong) >>> 0
  const broadcastLong = (networkLong | wildcardLong) >>> 0

  const isHost = prefix < 31
  const numHosts = isHost
    ? Math.max(0, broadcastLong - networkLong - 1)
    : broadcastLong - networkLong + 1
  const firstAddress = isHost ? longToIp(networkLong + 1) : longToIp(networkLong)
  const lastAddress = isHost ? longToIp(broadcastLong - 1) : longToIp(broadcastLong)

  return {
    address,
    subnetMask: longToIp(maskLong),
    subnetMaskLength: prefix,
    wildcardMask: longToIp(wildcardLong),
    networkAddress: longToIp(networkLong),
    broadcastAddress: longToIp(broadcastLong),
    firstAddress,
    lastAddress,
    numHosts,
    isPrivate: isPrivateIp(longToIp(networkLong)),
  }
}

export function parseCidr(input: string): { address: string; netmask: string } | null {
  const slash = input.indexOf('/')
  if (slash === -1) return null
  return { address: input.slice(0, slash), netmask: input.slice(slash + 1) }
}

export function shiftNetwork(address: string, netmask: string, next: boolean): string {
  const info = calcSubnet(address, netmask)
  if (!info) return address
  const addrLong = ipToLong(address)
  const blockSize = Math.pow(2, 32 - info.subnetMaskLength)
  const shifted = (addrLong + blockSize * (next ? 1 : -1)) >>> 0
  return longToIp(shifted)
}
