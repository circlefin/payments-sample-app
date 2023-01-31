const isNumber = (v: string) =>
  v === '' || !isNaN(parseInt(v)) || 'Please enter valid number'

const required = (v: string) => !!v || 'Field is required'

const onlyTwoDecimals = (v: string) => {
  const [, decimal] = v.split('.')
  if (!decimal || decimal.length === 2) {
    return true
  } else {
    return 'Decimal amount must have two digits'
  }
}
const uuidRegex =
  '[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}'

const isUUID = (v: string) =>
  new RegExp(uuidRegex).test(v) || 'Please enter a valid UUID'

export { isNumber, required, onlyTwoDecimals, isUUID }
