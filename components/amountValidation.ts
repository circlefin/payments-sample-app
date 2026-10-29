const VALID_AMOUNT_PATTERN = /^[0-9]+(\.[0-9]{1,2})?$/

export const amountRules = {
  positive: (value: string) => {
    const amount = value.trim()
    return (
      (VALID_AMOUNT_PATTERN.test(amount) && Number(amount) > 0) ||
      'Please enter a positive amount'
    )
  },
  isCurrency: (value: string) => {
    return (
      VALID_AMOUNT_PATTERN.test(value.trim()) || 'Please enter valid amount'
    )
  },
  isNumber: (value: string) => {
    return (
      VALID_AMOUNT_PATTERN.test(value.trim()) || 'Please enter valid amount'
    )
  },
  isRequired: (value: string) => {
    return value.trim() !== '' || 'Please enter an amount'
  },
}
