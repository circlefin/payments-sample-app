import { amountRules } from './amountValidation'

describe('amountRules', () => {
  it.each(['12', '12.3', '12.34'])(
    'accepts %s as a valid currency amount',
    (value) => {
      expect(amountRules.isRequired(value)).toBe(true)
      expect(amountRules.isNumber(value)).toBe(true)
      expect(amountRules.isCurrency(value)).toBe(true)
      expect(amountRules.positive(value)).toBe(true)
    },
  )

  it.each(['12a34', '12,34', '1.2.3'])(
    'rejects malformed amount %s',
    (value) => {
      expect(amountRules.isNumber(value)).toBe('Please enter valid amount')
      expect(amountRules.isCurrency(value)).toBe('Please enter valid amount')
      expect(amountRules.positive(value)).toBe('Please enter a positive amount')
    },
  )

  it('rejects zero as a non-positive amount', () => {
    expect(amountRules.isNumber('0')).toBe(true)
    expect(amountRules.isCurrency('0')).toBe(true)
    expect(amountRules.positive('0')).toBe('Please enter a positive amount')
  })
})
