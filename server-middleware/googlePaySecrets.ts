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

const merchantId: string =
  process.env.GOOGLE_PAY_PAYFAC_MERCHANT_ID != null
    ? process.env.GOOGLE_PAY_PAYFAC_MERCHANT_ID!
    : ''

const merchantName: string =
  process.env.GOOGLE_PAY_PAYFAC_MERCHANT_NAME != null
    ? process.env.GOOGLE_PAY_PAYFAC_MERCHANT_NAME!
    : ''

const checkoutKey: string =
  process.env.GOOGLE_PAY_PAYFAC_CHECKOUT_KEY != null
    ? process.env.GOOGLE_PAY_PAYFAC_CHECKOUT_KEY!
    : ''

export { merchantId, merchantName, checkoutKey }
