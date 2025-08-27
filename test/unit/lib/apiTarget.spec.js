import { getAPIHostname, getIsInternal, getLive } from '@/lib/apiTarget'

describe('apiTarget', () => {
  beforeEach(() => {
    // Mock window.location for Jest
    delete window.location
    window.location = {
      hostname: 'localhost',
      origin: 'http://localhost:3000',
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

    window.location = { origin: 'https://sample.circle.com' }
    expect(getAPIHostname()).toStrictEqual('api.circle.com')
    expect(getLive()).toBeTruthy()
    expect(getIsInternal()).toBeFalsy()

    window.location = { origin: 'https://sample-staging.circle.com' }
    expect(getAPIHostname()).toStrictEqual('api-staging.circle.com')
    expect(getLive()).toBeTruthy()
    expect(getIsInternal()).toBeTruthy()

    window.location = { origin: 'https://sample-sandbox.circle.com' }
    expect(getAPIHostname()).toStrictEqual('api-sandbox.circle.com')
    expect(getLive()).toBeFalsy()
    expect(getIsInternal()).toBeFalsy()

    window.location = { origin: 'https://sample-smokebox.circle.com' }
    expect(getAPIHostname()).toStrictEqual('api-smokebox.circle.com')
    expect(getLive()).toBeFalsy()
    expect(getIsInternal()).toBeTruthy()
  })
})
