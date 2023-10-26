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

import { getAPIHostname, getLive } from '@/lib/apiTarget'

describe('apiTarget', () => {
  beforeEach(() => {
    // https://stackoverflow.com/questions/54021037/how-to-mock-window-location-href-with-jest-vuejs
    delete global.window.location
    global.window = Object.create(window)
    global.window.location = {
      origin: 'testorigin',
    }
  })

  test('returns environment variable if localhost', () => {
    window.location.hostname = 'localhost'

    process.env.baseUrl = 'foobar'

    expect(getAPIHostname()).toStrictEqual('foobar')
    expect(getLive()).toBeTruthy()
  })

  test('correctly translates known hostnames', () => {
    process.env.baseUrl = ''

    window.location.origin = 'sample.circle.com'
    expect(getAPIHostname()).toStrictEqual('api.circle.com')
    expect(getLive()).toBeTruthy()

    window.location.origin = 'sample-staging.circle.com'
    expect(getAPIHostname()).toStrictEqual('api-staging.circle.com')
    expect(getLive()).toBeTruthy()

    window.location.origin = 'sample-sandbox.circle.com'
    expect(getAPIHostname()).toStrictEqual('api-sandbox.circle.com')
    expect(getLive()).toBeFalsy()

    window.location.origin = 'sample-smokebox.circle.com'
    expect(getAPIHostname()).toStrictEqual('api-smokebox.circle.com')
    expect(getLive()).toBeFalsy()
  })
})
