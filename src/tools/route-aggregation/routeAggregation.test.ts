import { describe, expect, test } from 'bun:test'
import { aggregateRoutes } from './routeAggregation'

describe('aggregateRoutes', () => {
  test('empty input returns empty result', () => {
    expect(aggregateRoutes('')).toEqual({ cidrs: [], errors: [], inputCount: 0 })
    expect(aggregateRoutes('   \n  \n')).toEqual({ cidrs: [], errors: [], inputCount: 0 })
  })

  test('single host IP becomes /32', () => {
    const r = aggregateRoutes('10.0.0.1')
    expect(r.cidrs).toEqual(['10.0.0.1/32'])
    expect(r.errors).toEqual([])
    expect(r.inputCount).toBe(1)
  })

  test('CIDR subnet passthrough', () => {
    const r = aggregateRoutes('192.168.1.0/24')
    expect(r.cidrs).toEqual(['192.168.1.0/24'])
    expect(r.errors).toEqual([])
  })

  test('CIDR normalises host bits', () => {
    const r = aggregateRoutes('192.168.1.100/24')
    expect(r.cidrs).toEqual(['192.168.1.0/24'])
  })

  test('adjacent /24s aggregate to /23', () => {
    const r = aggregateRoutes('10.0.0.0/24\n10.0.1.0/24')
    expect(r.cidrs).toEqual(['10.0.0.0/23'])
  })

  test('four adjacent /24s aggregate to /22', () => {
    const r = aggregateRoutes('10.0.0.0/24\n10.0.1.0/24\n10.0.2.0/24\n10.0.3.0/24')
    expect(r.cidrs).toEqual(['10.0.0.0/22'])
  })

  test('non-aggregatable subnets stay separate', () => {
    const r = aggregateRoutes('10.0.0.0/24\n10.0.2.0/24')
    expect(r.cidrs).toEqual(['10.0.0.0/24', '10.0.2.0/24'])
  })

  test('overlapping subnets merge correctly', () => {
    const r = aggregateRoutes('10.0.0.0/24\n10.0.0.128/25')
    expect(r.cidrs).toEqual(['10.0.0.0/24'])
  })

  test('mixed hosts and subnets aggregate', () => {
    const r = aggregateRoutes('10.0.0.0\n10.0.0.1\n10.0.0.2\n10.0.0.3')
    expect(r.cidrs).toEqual(['10.0.0.0/30'])
  })

  test('irregular range splits into minimal CIDRs', () => {
    // 10.0.0.1 – 10.0.0.2 → two /32s (not aligned to /31)
    const r = aggregateRoutes('10.0.0.1\n10.0.0.2')
    expect(r.cidrs).toEqual(['10.0.0.1/32', '10.0.0.2/32'])
  })

  test('10.0.0.0/24 and 10.0.1.0/24 and 10.0.2.0/23 aggregate correctly', () => {
    const r = aggregateRoutes('10.0.0.0/24\n10.0.1.0/24\n10.0.2.0/23')
    expect(r.cidrs).toEqual(['10.0.0.0/22'])
  })

  test('invalid lines produce errors', () => {
    const r = aggregateRoutes('10.0.0.1\nbadinput\n10.0.0.2')
    expect(r.errors).toEqual([{ line: 2, input: 'badinput' }])
    expect(r.cidrs).toEqual(['10.0.0.1/32', '10.0.0.2/32'])
  })

  test('invalid CIDR prefix', () => {
    const r = aggregateRoutes('10.0.0.0/33')
    expect(r.errors).toHaveLength(1)
    expect(r.cidrs).toEqual([])
  })

  test('blank lines are ignored', () => {
    const r = aggregateRoutes('\n10.0.0.1\n\n10.0.0.2\n')
    expect(r.inputCount).toBe(2)
  })

  test('/0 covers entire address space', () => {
    const r = aggregateRoutes('0.0.0.0/0')
    expect(r.cidrs).toEqual(['0.0.0.0/0'])
  })

  test('0.0.0.0 host becomes /32', () => {
    const r = aggregateRoutes('0.0.0.0')
    expect(r.cidrs).toEqual(['0.0.0.0/32'])
  })

  test('255.255.255.255 host becomes /32', () => {
    const r = aggregateRoutes('255.255.255.255')
    expect(r.cidrs).toEqual(['255.255.255.255/32'])
  })
})
