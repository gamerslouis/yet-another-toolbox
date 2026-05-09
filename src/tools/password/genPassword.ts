export interface PasswordOptions {
  length: number
  uppercase: boolean
  lowercase: boolean
  digits: boolean
  symbols: boolean
}

const CHARSETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  digits: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
}

export function genPassword(opts: PasswordOptions): string {
  let pool = ''
  if (opts.uppercase) pool += CHARSETS.uppercase
  if (opts.lowercase) pool += CHARSETS.lowercase
  if (opts.digits) pool += CHARSETS.digits
  if (opts.symbols) pool += CHARSETS.symbols
  if (!pool || opts.length < 1) return ''

  const arr = new Uint8Array(opts.length)
  crypto.getRandomValues(arr)
  return Array.from(arr)
    .map((b) => pool[b % pool.length])
    .join('')
}

export function strengthScore(pw: string): 0 | 1 | 2 | 3 | 4 {
  if (!pw) return 0
  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= 16) score++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return Math.min(score, 4) as 0 | 1 | 2 | 3 | 4
}
