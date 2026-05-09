import type { DiffOp } from '@/types'

export function diffLines(a: string, b: string): DiffOp[] {
  const linesA = a === '' ? [] : a.split('\n')
  const linesB = b === '' ? [] : b.split('\n')
  const m = linesA.length
  const n = linesB.length

  // LCS DP table
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      if (linesA[i] === linesB[j]) {
        dp[i][j] = dp[i + 1][j + 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1])
      }
    }
  }

  const result: DiffOp[] = []
  let i = 0
  let j = 0
  while (i < m || j < n) {
    if (i < m && j < n && linesA[i] === linesB[j]) {
      result.push({ type: 'equal', line: linesA[i] })
      i++
      j++
    } else if (j < n && (i >= m || dp[i][j + 1] >= dp[i + 1][j])) {
      result.push({ type: 'add', line: linesB[j] })
      j++
    } else {
      result.push({ type: 'remove', line: linesA[i] })
      i++
    }
  }
  return result
}
