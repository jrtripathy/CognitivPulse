import { cn, formatCurrency, formatDate, formatDateTime, slugify } from '../lib/utils'

describe('utils', () => {
  describe('cn', () => {
    it('merges class names', () => {
      expect(cn('a', 'b', undefined, 'c')).toContain('a')
      expect(cn('a', false, 'b')).toContain('b')
    })
  })

  describe('formatCurrency', () => {
    it('formats cents to USD', () => {
      expect(formatCurrency(12345)).toBe('$123.45')
    })
    it('formats to other currency', () => {
      expect(formatCurrency(1000, 'eur').includes('€')).toBe(true)
    })
  })

  describe('formatDate', () => {
    it('formats date string', () => {
      // Accept either Jan 1, 2023 or Dec 31, 2022 depending on timezone
      const formatted = formatDate('2023-01-01')
      expect(["Jan 1, 2023", "Dec 31, 2022"]).toContain(formatted)
    })
  })

  describe('formatDateTime', () => {
    it('formats date and time', () => {
      expect(formatDateTime('2023-01-01T12:34:56Z')).toMatch(/Jan.*2023/)
    })
  })

  describe('slugify', () => {
    it('slugifies text', () => {
      expect(slugify('Hello World!')).toBe('hello-world')
    })
  })
})
