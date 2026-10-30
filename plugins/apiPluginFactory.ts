// plugins/apiPluginFactory.ts
import type { AxiosInstance } from 'axios'

type InstanceGetter = () => AxiosInstance

export function createApiPlugin(instanceGetter: InstanceGetter, provideName: string) {
  return defineNuxtPlugin(() => {
    const { $pinia } = useNuxtApp()
    // Use the store getter pattern used in the repo
    const store = useMainStore($pinia)
    const instance = instanceGetter()

    const reqInterceptor = (config: any) => {
      // defensive checks in case store methods are not present in some contexts
      try {
        store.clearRequestData?.()
        store.setRequestUrl?.(`${config.baseURL}${config.url}`)
        store.setRequestPayload?.(config.data)
      } catch (e) {
        // swallow store-related errors to avoid breaking requests
        // eslint-disable-next-line no-console
        console.warn('Store not available for API plugin interceptors', e)
      }

      config.headers = config.headers || {}
      if (store && store.bearerToken) {
        config.headers.Authorization = `Bearer ${store.bearerToken}`
      }
      return config
    }

    const resInterceptor = (response: any) => {
      try {
        store.setResponse?.(response)
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('Failed to set response in store', e)
      }
      return response
    }

    instance.interceptors.request.use(reqInterceptor, (err: any) => Promise.reject(err))
    instance.interceptors.response.use(resInterceptor, (err: any) => Promise.reject(err))

    return {
      provide: {
        [provideName]: instance,
      },
    }
  })
}

// Nuxt treats files in the `plugins/` directory as plugins and will ignore files
// that don't export a default `defineNuxtPlugin`. During the refactor this file
// ended up in `plugins/` but doesn't provide a default export, causing the
// bundler to exclude it and named exports (like `createApiPlugin`) to be
// unavailable. Add a no-op default plugin export so Nuxt includes this module
// and preserves its named exports.
export default defineNuxtPlugin(() => {})
