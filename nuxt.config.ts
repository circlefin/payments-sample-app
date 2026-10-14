// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-08-27',
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
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap',
        },
      ],
    },
  },

  css: ['vuetify/styles', '~/assets/css/main.css', '~/assets/css/app.css'],

  plugins: [
    '~/plugins/vuetify.client.ts',
    '~/plugins/paymentsApi.ts',
    '~/plugins/settlementsApi.ts',
    '~/plugins/walletsApi.ts',
    '~/plugins/paymentIntentsApi.ts',
    '~/plugins/mocksApi.ts',
    '~/plugins/stablefxTradesApi.ts',
    '~/plugins/businessAccount/addressesApi.ts',
    '~/plugins/businessAccount/balancesApi.ts',
    '~/plugins/businessAccount/bankAccountsApi.ts',
    '~/plugins/businessAccount/cbitAccountsApi.ts',
    '~/plugins/businessAccount/xpayAccountsApi.ts',
    '~/plugins/businessAccount/depositsApi.ts',
    '~/plugins/businessAccount/payoutsApi.ts',
    '~/plugins/businessAccount/transfersApi.ts',
    '~/plugins/daa/index.ts',
    '~/plugins/cryptoPaymentMetadataApi.ts',
    '~/plugins/cryptoPaymentsApi.ts',
    '~/plugins/beta/addressBookApi.ts',
    '~/plugins/payoutsApi.ts',
    '~/plugins/tradesApi.ts',
    '~/plugins/circleWalletsApi.ts',
  ],

  modules: ['@pinia/nuxt', '@pinia-plugin-persistedstate/nuxt'],

  runtimeConfig: {
    // The private keys which are only available within server-side
    // Keys within public, will be also exposed to the client-side

    // Circle Developer-Controlled Wallets (server only, never sent to browsers)
    circleApiKey: process.env.CIRCLE_API_KEY || '',
    circleEntitySecret: process.env.CIRCLE_ENTITY_SECRET || '',
    circleWalletSetId: process.env.CIRCLE_WALLET_SET_ID || '',
    circleBaseUrl: process.env.CIRCLE_W3S_BASE_URL || 'https://api.circle.com',
    circleBlockchain: process.env.CIRCLE_BLOCKCHAIN || 'MATIC-AMOY',
    circleAccountType: process.env.CIRCLE_ACCOUNT_TYPE || 'SCA',
    maxSendUsdc: process.env.MAX_SEND_USDC || '',
    allowLiveFunds: process.env.ALLOW_LIVE_FUNDS || '',

    // Supabase service role key (server only)
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',

    public: {
      baseUrl: process.env.BASE_URL || 'https://api-sandbox.circle.com',
      // The Supabase URL and anon key are designed to be public
      supabaseUrl: process.env.SUPABASE_URL || '',
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
    },
  },

  routeRules: {
    '/**': { headers: { 'cache-control': 'no-cache' } },
    '/_nuxt/**': {
      headers: { 'cache-control': 'public, max-age=31536000, immutable' },
    },
  },

  vite: {
    define: {
      global: 'globalThis',
    },
    optimizeDeps: {
      include: [],
    },
    build: {
      rollupOptions: {
        external: [],
      },
    },
  },

  typescript: {
    typeCheck: false,
  },
})
