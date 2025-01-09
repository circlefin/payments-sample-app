import { validate } from 'uuid'
const isNumber = (v: string) =>
  v === '' || !isNaN(parseInt(v)) || 'Please enter valid number'

const required = (v: string) => !!v || 'Field is required'

const validDecimal = (v: string) => {
  const [, decimal] = v.split('.')
  if (decimal === undefined || /^\d{2}$/.test(decimal)) {
    return true
  } else {
    return 'Decimal must be two digits'
  }
}
const isUUID = (v: string) =>
  v === '' || validate(v) || 'Please enter a valid UUID'

export { isNumber, required, validDecimal, isUUID }
