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

const payfacMerchantIdentityCertificate: string =
  process.env.APPLE_PAY_PAYFAC_CERTIFICATE != null
    ? process.env.APPLE_PAY_PAYFAC_CERTIFICATE!
    : ''
const payfacMerchantIdentityKey: string =
  process.env.APPLE_PAY_PAYFAC_PRIVATE_KEY != null
    ? process.env.APPLE_PAY_PAYFAC_PRIVATE_KEY!
    : ''
const partnershipMerchantIdentityCertificate: string =
  process.env.APPLE_PAY_PARTNERSHIP_CERTIFICATE != null
    ? process.env.APPLE_PAY_PARTNERSHIP_CERTIFICATE!
    : ''
const partnershipMerchantIdentityKey: string =
  process.env.APPLE_PAY_PARTNERSHIP_PRIVATE_KEY != null
    ? process.env.APPLE_PAY_PARTNERSHIP_PRIVATE_KEY!
    : ''

const domainValidation: string =
  process.env.APPLE_PAY_DOMAIN_VERIFICATION != null
    ? process.env.APPLE_PAY_DOMAIN_VERIFICATION!
    : ''

const partnershipMerchantId: string =
  process.env.APPLE_PAY_PARTNERSHIP_MERCHANT_ID != null
    ? process.env.APPLE_PAY_PARTNERSHIP_MERCHANT_ID!
    : ''

const payfacMerchantId: string =
  process.env.APPLE_PAY_PAYFAC_MERCHANT_ID != null
    ? process.env.APPLE_PAY_PAYFAC_MERCHANT_ID!
    : ''

export {
  payfacMerchantIdentityCertificate,
  payfacMerchantIdentityKey,
  domainValidation,
  partnershipMerchantIdentityCertificate,
  partnershipMerchantIdentityKey,
  partnershipMerchantId,
  payfacMerchantId,
}
