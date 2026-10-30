import { isNumber, validDecimal } from './validation'

describe('isNumber', () => {
  it('accepts integers and decimals', () => {
    expect(isNumber('12')).toBe(true)
    expect(isNumber('1.5')).toBe(true)
    expect(isNumber('-5')).toBe(true)
  })

  it('accepts an empty string', () => {
    expect(isNumber('')).toBe(true)
  })

  it('rejects trailing non-numeric characters', () => {
    // Regression: parseInt('12abc') === 12 let malformed values pass.
    expect(isNumber('12abc')).toBe('Please enter valid number')
    expect(isNumber('1.5x')).toBe('Please enter valid number')
  })

  it('rejects non-numeric input', () => {
    expect(isNumber('abc')).toBe('Please enter valid number')
    expect(isNumber('0x10')).toBe('Please enter valid number')
    expect(isNumber('Infinity')).toBe('Please enter valid number')
  })
})

describe('validDecimal', () => {
  it('accepts an integer with no decimal part', () => {
    expect(validDecimal('1')).toBe(true)
    expect(validDecimal('100')).toBe(true)
  })

  it('accepts exactly two decimal digits', () => {
    expect(validDecimal('1.50')).toBe(true)
    expect(validDecimal('0.99')).toBe(true)
  })

  it('accepts an empty string', () => {
    expect(validDecimal('')).toBe(true)
  })

  it('rejects a single decimal digit', () => {
    expect(validDecimal('1.5')).toBe('Decimal must be two digits')
  })

  it('rejects more than two decimal digits', () => {
    expect(validDecimal('1.500')).toBe('Decimal must be two digits')
  })

  it('rejects non-digit decimal content', () => {
    expect(validDecimal('1.99x')).toBe('Decimal must be two digits')
  })

  it('rejects values with more than one decimal point', () => {
    // Regression: destructuring only the second `split('.')` segment let
    // malformed values like "1.23.45" pass because "23" is two digits.
    expect(validDecimal('1.23.45')).toBe('Decimal must be two digits')
    expect(validDecimal('1.55.99')).toBe('Decimal must be two digits')
    expect(validDecimal('100.00.00')).toBe('Decimal must be two digits')
  })
})
