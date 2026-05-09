export interface FormatResult {
  output: string
  error: string | null
  valid: boolean
}

export function formatJson(input: string, indent: 2 | 4): FormatResult {
  try {
    const parsed = JSON.parse(input) as unknown
    return { output: JSON.stringify(parsed, null, indent), error: null, valid: true }
  } catch (e) {
    return { output: '', error: (e as Error).message, valid: false }
  }
}
