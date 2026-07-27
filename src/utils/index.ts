import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format a number with commas */
export function formatNumber(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return '—'
  return n.toLocaleString('en-US')
}

/** Format a percentage with sign */
export function formatPercent(n: number, decimals = 1): string {
  const sign = n >= 0 ? '+' : ''
  return `${sign}${n.toFixed(decimals)}%`
}

/** Clamp a value between min and max */
export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val))
}

/** Convert HSL string to hex (approximate) */
export function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

/** Parse a YYYY-MM-DD string to a Date */
export function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null
  const d = new Date(dateStr + 'T00:00:00Z')
  return isNaN(d.getTime()) ? null : d
}

/** Get month label from YYYY-MM (e.g. "2022-02" -> "Feb 2022") */
export function monthLabel(ym: string): string {
  if (!ym || typeof ym !== 'string') return ''
  const parts = ym.split('-')
  if (parts.length < 2) return ym
  const year = parts[0]
  const monthIdx = parseInt(parts[1], 10) - 1
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  if (isNaN(monthIdx) || monthIdx < 0 || monthIdx >= 12) return ym
  return `${months[monthIdx]} ${year}`
}

/** Truncate text with ellipsis */
export function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text
  return text.slice(0, maxLen) + '…'
}

/** Deep-equal check for primitive arrays */
export function arraysEqual<T>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return false
  return a.every((v, i) => v === b[i])
}

/** Debounce a function */
export function debounce<T extends (...args: unknown[]) => void>(fn: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout>
  return ((...args: unknown[]) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }) as T
}
