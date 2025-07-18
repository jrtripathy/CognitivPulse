import { cn, formatCurrency, formatDate, formatDateTime, slugify } from '../lib/utils'

describe('lib/utils', () => {
  it('cn merges class names', () => {
    expect(cn('a', 'b', undefined, 'c')).toContain('a')
    expect(cn('a', false, 'b')).toContain('b')
  })

  it('formatCurrency formats cents to USD', () => {
    expect(formatCurrency(12345)).toMatch(/\$/)
  })

  it('formatDate formats date string', () => {
    expect(formatDate('2023-01-01')).toMatch(/\d{4}/)
  })

  it('formatDateTime formats date and time', () => {
    expect(formatDateTime('2023-01-01T12:34:56Z')).toMatch(/\d{4}/)
  })

  it('slugify slugifies text', () => {
    expect(slugify('Hello World!')).toBe('hello-world')
  })
})
