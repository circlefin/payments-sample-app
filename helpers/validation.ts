/**
 * Copyright 2023 Circle Internet Financial, LTD.  All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

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
