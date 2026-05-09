import { diffLines as _diffLines } from 'diff'
import type { DiffOp } from '@/types'

export function diffLines(a: string, b: string): DiffOp[] {
  if (a === '' && b === '') return []
  return _diffLines(a, b, { newlineIsToken: false }).flatMap((part) => {
    const lines = part.value.replace(/\n$/, '').split('\n')
    const type: DiffOp['type'] = part.added ? 'add' : part.removed ? 'remove' : 'equal'
    return lines.map((line) => ({ type, line }))
  })
}
