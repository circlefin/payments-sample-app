import { validate } from 'uuid'
// parseInt parses a leading numeric prefix and ignores the rest, so
// parseInt('12abc') === 12 let malformed values pass. Match the whole string
// against a plain (optionally signed) integer/decimal number instead.
const isNumber = (v: string) =>
  v === '' || /^-?\d+(\.\d+)?$/.test(v) || 'Please enter valid number'

const required = (v: string) => !!v || 'Field is required'

const validDecimal = (v: string) => {
  const parts = v.split('.')
  const decimal = parts[1]
  // Reject more than one decimal point: destructuring only the second segment
  // let malformed values like "1.23.45" pass because "23" is two digits.
  if (parts.length <= 2 && (decimal === undefined || /^\d{2}$/.test(decimal))) {
    return true
  } else {
    return 'Decimal must be two digits'
  }
}
const isUUID = (v: string) =>
  v === '' || validate(v) || 'Please enter a valid UUID'

export { isNumber, required, validDecimal, isUUID }
