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
