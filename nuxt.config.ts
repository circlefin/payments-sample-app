// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: false,

  devServer: {
    host: '0.0.0.0',
    port: 3011,
  },

  app: {
    head: {
      titleTemplate: '%s - ' + process.env.npm_package_name,
      title: process.env.npm_package_name || '',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: process.env.npm_package_description || '',
        },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        {
          rel: 'stylesheet',
          href: 'https://cdn.jsdelivr.net/npm/@mdi/font@latest/css/materialdesignicons.min.css',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900&display=swap',
        },
      ],
      script: [
        {
          src: 'https://pay.google.com/gp/p/js/pay.js',
          async: true,
          defer: true,
        },
      ],
    },
  },

  css: ['vuetify/styles', '~/assets/css/main.css'],

  plugins: [
    '~/plugins/vuetify.client.ts',
    '~/plugins/paymentsApi.ts',
    '~/plugins/settlementsApi.ts',
    '~/plugins/walletsApi.ts',
    '~/plugins/paymentIntentsApi.ts',
    '~/plugins/mocksApi.ts',
    '~/plugins/cpsTradesApi.ts',
    '~/plugins/businessAccount/addressesApi.ts',
    '~/plugins/businessAccount/balancesApi.ts',
    '~/plugins/businessAccount/bankAccountsApi.ts',
    '~/plugins/businessAccount/cbitAccountsApi.ts',
    '~/plugins/businessAccount/xpayAccountsApi.ts',
    '~/plugins/businessAccount/depositsApi.ts',
    '~/plugins/businessAccount/payoutsApi.ts',
    '~/plugins/businessAccount/transfersApi.ts',
    '~/plugins/cryptoPaymentMetadataApi.ts',
    '~/plugins/cryptoPaymentsApi.ts',
    '~/plugins/beta/addressBookApi.ts',
    '~/plugins/payoutsApi.ts',
    '~/plugins/tradesApi.ts',
  ],

  modules: ['@pinia/nuxt', '@pinia-plugin-persistedstate/nuxt'],

  build: {
    // Nuxt 3 uses Vite by default, so this config is different
  },

  runtimeConfig: {
    // The private keys which are only available within server-side
    // Keys within public, will be also exposed to the client-side
    public: {
      baseUrl: process.env.BASE_URL || 'https://api-sandbox.circle.com',
    },
  },

  nitro: {
    // Server handlers are automatically handled by the server/api directory structure
  },

  vite: {
    define: {
      global: 'globalThis',
    },
    optimizeDeps: {
      include: ['openpgp'],
    },
    build: {
      rollupOptions: {
        external: ['openpgp'],
      },
    },
  },

  typescript: {
    typeCheck: true,
  },
})
