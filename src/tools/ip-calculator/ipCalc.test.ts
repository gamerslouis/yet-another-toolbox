import { describe, expect, test } from 'bun:test'
import { calcSubnet, isValidIPv4, isValidNetmask, parseCidr, shiftNetwork } from './ipCalc'

describe('parseCidr', () => {
  test('parses CIDR prefix notation', () => {
    expect(parseCidr('192.168.1.0/24')).toEqual({ address: '192.168.1.0', netmask: '24' })
    expect(parseCidr('10.0.0.0/8')).toEqual({ address: '10.0.0.0', netmask: '8' })
  })

  test('parses dotted-decimal mask notation', () => {
    expect(parseCidr('192.168.1.0/255.255.255.0')).toEqual({
      address: '192.168.1.0',
      netmask: '255.255.255.0',
    })
  })

  test('returns null when no slash present', () => {
    expect(parseCidr('192.168.1.0')).toBeNull()
    expect(parseCidr('')).toBeNull()
  })
})

describe('isValidIPv4', () => {
  test('accepts valid addresses', () => {
    expect(isValidIPv4('0.0.0.0')).toBe(true)
    expect(isValidIPv4('192.168.0.1')).toBe(true)
    expect(isValidIPv4('255.255.255.255')).toBe(true)
    expect(isValidIPv4('10.0.0.1')).toBe(true)
  })

  test('rejects out-of-range octets', () => {
    expect(isValidIPv4('256.0.0.0')).toBe(false)
    expect(isValidIPv4('192.168.0.999')).toBe(false)
  })

  test('rejects wrong number of octets', () => {
    expect(isValidIPv4('192.168.0')).toBe(false)
    expect(isValidIPv4('192.168.0.0.0')).toBe(false)
    expect(isValidIPv4('')).toBe(false)
  })

  test('rejects non-numeric parts', () => {
    expect(isValidIPv4('abc.def.ghi.jkl')).toBe(false)
    expect(isValidIPv4('192.168.0.x')).toBe(false)
  })
})

describe('isValidNetmask', () => {
  test('accepts CIDR prefixes 0–32', () => {
    expect(isValidNetmask('0')).toBe(true)
    expect(isValidNetmask('24')).toBe(true)
    expect(isValidNetmask('32')).toBe(true)
  })

  test('rejects out-of-range CIDR', () => {
    expect(isValidNetmask('33')).toBe(false)
  })

  test('accepts valid dotted-decimal masks', () => {
    expect(isValidNetmask('255.255.255.0')).toBe(true)
    expect(isValidNetmask('255.255.0.0')).toBe(true)
    expect(isValidNetmask('255.0.0.0')).toBe(true)
    expect(isValidNetmask('255.255.255.255')).toBe(true)
    expect(isValidNetmask('0.0.0.0')).toBe(true)
  })

  test('rejects non-contiguous dotted-decimal masks', () => {
    expect(isValidNetmask('255.255.255.1')).toBe(false)
    expect(isValidNetmask('255.0.255.0')).toBe(false)
    expect(isValidNetmask('255.128.255.0')).toBe(false)
  })

  test('rejects garbage', () => {
    expect(isValidNetmask('abc')).toBe(false)
    expect(isValidNetmask('')).toBe(false)
  })
})

describe('calcSubnet', () => {
  test('returns null for invalid inputs', () => {
    expect(calcSubnet('bad', '24')).toBeNull()
    expect(calcSubnet('192.168.0.1', '33')).toBeNull()
    expect(calcSubnet('', '')).toBeNull()
  })

  test('/24 CIDR', () => {
    const r = calcSubnet('192.168.1.100', '24')!
    expect(r.subnetMask).toBe('255.255.255.0')
    expect(r.subnetMaskLength).toBe(24)
    expect(r.wildcardMask).toBe('0.0.0.255')
    expect(r.networkAddress).toBe('192.168.1.0')
    expect(r.broadcastAddress).toBe('192.168.1.255')
    expect(r.firstAddress).toBe('192.168.1.1')
    expect(r.lastAddress).toBe('192.168.1.254')
    expect(r.numHosts).toBe(254)
  })

  test('dotted-decimal mask equals equivalent CIDR', () => {
    const cidr = calcSubnet('10.0.0.1', '8')!
    const dotted = calcSubnet('10.0.0.1', '255.0.0.0')!
    expect(dotted.networkAddress).toBe(cidr.networkAddress)
    expect(dotted.broadcastAddress).toBe(cidr.broadcastAddress)
    expect(dotted.numHosts).toBe(cidr.numHosts)
  })

  test('/32 single host', () => {
    const r = calcSubnet('10.0.0.5', '32')!
    expect(r.networkAddress).toBe('10.0.0.5')
    expect(r.broadcastAddress).toBe('10.0.0.5')
    expect(r.numHosts).toBe(1)
    expect(r.firstAddress).toBe('10.0.0.5')
    expect(r.lastAddress).toBe('10.0.0.5')
  })

  test('/31 point-to-point', () => {
    const r = calcSubnet('10.0.0.0', '31')!
    expect(r.networkAddress).toBe('10.0.0.0')
    expect(r.broadcastAddress).toBe('10.0.0.1')
    expect(r.numHosts).toBe(2)
  })

  describe('private network detection', () => {
    test('10.0.0.0/8 range', () => {
      expect(calcSubnet('10.0.0.1', '8')!.isPrivate).toBe(true)
      expect(calcSubnet('10.255.255.255', '24')!.isPrivate).toBe(true)
    })

    test('172.16.0.0/12 range', () => {
      expect(calcSubnet('172.16.0.1', '12')!.isPrivate).toBe(true)
      expect(calcSubnet('172.31.255.254', '24')!.isPrivate).toBe(true)
      // boundaries: just outside the range
      expect(calcSubnet('172.15.0.1', '24')!.isPrivate).toBe(false)
      expect(calcSubnet('172.32.0.1', '24')!.isPrivate).toBe(false)
    })

    test('192.168.0.0/16 range', () => {
      expect(calcSubnet('192.168.0.1', '24')!.isPrivate).toBe(true)
      expect(calcSubnet('192.168.255.254', '24')!.isPrivate).toBe(true)
      // boundaries
      expect(calcSubnet('192.167.0.1', '24')!.isPrivate).toBe(false)
      expect(calcSubnet('192.169.0.1', '24')!.isPrivate).toBe(false)
    })

    test('public addresses are not private', () => {
      expect(calcSubnet('8.8.8.8', '32')!.isPrivate).toBe(false)
      expect(calcSubnet('1.1.1.1', '32')!.isPrivate).toBe(false)
    })
  })
})

describe('shiftNetwork', () => {
  test('next shifts to the following block', () => {
    expect(shiftNetwork('192.168.0.1', '24', true)).toBe('192.168.1.1')
  })

  test('prev shifts to the preceding block', () => {
    expect(shiftNetwork('192.168.1.1', '24', false)).toBe('192.168.0.1')
  })

  test('preserves host offset within block', () => {
    expect(shiftNetwork('10.0.0.5', '8', true)).toBe('11.0.0.5')
  })

  test('returns address unchanged for invalid inputs', () => {
    expect(shiftNetwork('bad', '24', true)).toBe('bad')
    expect(shiftNetwork('192.168.0.1', '99', true)).toBe('192.168.0.1')
  })
})
