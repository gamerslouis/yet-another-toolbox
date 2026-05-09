import { diffLines as _diffLines } from 'diff'
import type { DiffOp } from '@/types'

export function diffLines(a: string, b: string): DiffOp[] {
  const result: DiffOp[] = []
  for (const part of _diffLines(a, b, { newlineIsToken: false })) {
    const value = part.value.endsWith('\n') ? part.value.slice(0, -1) : part.value
    const type: DiffOp['type'] = part.added ? 'add' : part.removed ? 'remove' : 'equal'
    for (const line of value.split('\n')) {
      result.push({ type, line })
    }
  }
  return result
}
