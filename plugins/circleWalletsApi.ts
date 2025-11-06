import circleWalletsApi from '@/lib/circleWalletsApi'

export default defineNuxtPlugin(() => {
  return {
    provide: {
      circleWalletsApi,
    },
  }
})
