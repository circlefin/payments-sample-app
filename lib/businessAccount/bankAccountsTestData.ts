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

export const exampleBankAccounts = [
  {
    title: 'US Bank Account',
    formData: {
      beneficiaryName: 'Satoshi Nakamoto',
      accountNumber: '11111111111',
      routingNumber: '121000248',
      iban: '',
      ffcMemo: '',
      billingDetails: {
        name: 'Satoshi Nakamoto',
        city: 'Boston',
        country: 'US',
        line1: '100 Money Street',
        line2: 'Suite 1',
        district: 'MA',
        postalCode: '01234',
      },
      bankAddress: {
        bankName: '',
        city: '',
        country: 'US',
        line1: '',
        line2: '',
        district: '',
        postalCode: '',
      },
      intermediaryBank: {
        identifier: '',
        type: '',
        countryCode: '',
      },
    },
  },
  {
    title: 'German Bank Account',
    formData: {
      beneficiaryName: 'Satoshi Nakamoto',
      accountNumber: '',
      routingNumber: '',
      iban: 'DE31100400480532013000',
      ffcMemo: '',
      billingDetails: {
        name: 'Satoshi Nakamoto',
        city: 'Boston',
        country: 'US',
        line1: '100 Money Street',
        line2: 'Suite 1',
        district: 'MA',
        postalCode: '01234',
      },
      bankAddress: {
        bankName: '',
        city: 'Kassel',
        country: 'DE',
        line1: '',
        line2: '',
        district: '',
        postalCode: '',
      },
      intermediaryBank: {
        identifier: '',
        type: '',
        countryCode: '',
      },
    },
  },
  {
    title: 'Mexican Bank Account',
    formData: {
      beneficiaryName: 'Satoshi Nakamoto',
      accountNumber: '002010077777777771',
      routingNumber: 'BDEMMXMF',
      iban: '',
      ffcMemo: '',
      billingDetails: {
        name: 'Satoshi Nakamoto',
        city: 'Boston',
        country: 'US',
        line1: '100 Money Street',
        line2: 'Suite 1',
        district: 'MA',
        postalCode: '01234',
      },
      bankAddress: {
        bankName: 'Banco Nacional de México',
        city: 'México DF',
        country: 'MX',
        line1: 'Isabel la Católica 165',
        line2: 'Colonia Obrera',
        district: 'México DF',
        postalCode: '06800',
      },
      intermediaryBank: {
        identifier: '',
        type: '',
        countryCode: '',
      },
    },
  },
]
