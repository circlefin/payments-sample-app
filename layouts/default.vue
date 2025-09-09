<template>
  <v-app>
    <v-navigation-drawer
      v-model="showDrawer"
      :rail="miniVariant"
      width="330"
      temporary
    >
      <v-list nav>
        <v-list-item to="/" exact>
          <template #prepend>
            <v-icon>mdi-home</v-icon>
          </template>
          <v-list-item-title>Home</v-list-item-title>
        </v-list-item>

        <v-list-group>
          <template #activator="{ props }">
            <v-list-item v-bind="props">
              <v-list-item-title>Core Functionality</v-list-item-title>
            </v-list-item>
          </template>

          <v-list-item to="/debug/businessAccount" exact>
            <v-list-item-title class="list-items"> Overview </v-list-item-title>
          </v-list-item>

          <v-list-item
            v-for="(item, i) in coreLinks"
            :key="`coreLinks-${i}`"
            :to="item.to"
            exact
          >
            <v-list-item-title class="list-items">
              {{ item.title }}
            </v-list-item-title>
          </v-list-item>
        </v-list-group>

        <v-list-group>
          <template #activator="{ props }">
            <v-list-item v-bind="props">
              <v-list-item-title>Payments APIs</v-list-item-title>
            </v-list-item>
          </template>

          <v-list-item to="/debug" exact>
            <v-list-item-title class="list-items"> Overview </v-list-item-title>
          </v-list-item>

          <v-list-item
            v-for="(item, i) in paymentsLinks"
            :key="`paymentlink-${i}`"
            :to="item.to"
            exact
          >
            <v-list-item-title class="list-items">
              {{ item.title }}
            </v-list-item-title>
          </v-list-item>
        </v-list-group>

        <v-list-group>
          <template #activator="{ props }">
            <v-list-item v-bind="props">
              <v-list-item-title>Payouts APIs</v-list-item-title>
            </v-list-item>
          </template>

          <v-list-item to="/debug/payouts" exact>
            <v-list-item-title class="list-items"> Overview </v-list-item-title>
          </v-list-item>

          <v-list-item
            v-for="(item, i) in payoutsLinks"
            :key="`payoutsLinks-${i}`"
            :to="item.to"
            exact
          >
            <v-list-item-title class="list-items">
              {{ item.title }}
            </v-list-item-title>
          </v-list-item>
        </v-list-group>

        <v-list-group>
          <template #activator="{ props }">
            <v-list-item v-bind="props">
              <v-list-item-title>Payment Intents APIs</v-list-item-title>
            </v-list-item>
          </template>

          <v-list-item to="/debug/paymentIntents" exact>
            <v-list-item-title class="list-items"> Overview </v-list-item-title>
          </v-list-item>

          <v-list-item
            v-for="(item, i) in paymentIntentsLinks"
            :key="`paymentIntentsLinks-${i}`"
            :to="item.to"
            exact
          >
            <v-list-item-title class="list-items">
              {{ item.title }}
            </v-list-item-title>
          </v-list-item>
        </v-list-group>

        <v-list-group>
          <template #activator="{ props }">
            <v-list-item v-bind="props">
              <v-list-item-title>Trade API</v-list-item-title>
            </v-list-item>
          </template>

          <v-list-item to="/debug/trades" exact>
            <v-list-item-title class="list-items"> Overview </v-list-item-title>
          </v-list-item>

          <v-list-item
            v-for="(item, i) in tradesLinks"
            :key="`tradesLinks-${i}`"
            :to="item.to"
            exact
          >
            <v-list-item-title class="list-items">
              {{ item.title }}
            </v-list-item-title>
          </v-list-item>
        </v-list-group>

        <v-list-group>
          <template #activator="{ props }">
            <v-list-item v-bind="props">
              <v-list-item-title>CPS Trade API</v-list-item-title>
            </v-list-item>
          </template>

          <v-list-item to="/debug/cps" exact>
            <v-list-item-title class="list-items"> Overview </v-list-item-title>
          </v-list-item>

          <v-list-item
            v-for="(item, i) in cpsTradesLinks"
            :key="`cpsTradesLinks-${i}`"
            :to="item.to"
            exact
          >
            <v-list-item-title class="list-items">
              {{ item.title }}
            </v-list-item-title>
          </v-list-item>
        </v-list-group>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar color="primary" density="compact" elevation="1" app>
      <v-app-bar-nav-icon
        style="color: white !important"
        @click.stop="showDrawer = !showDrawer"
      >
        <v-icon color="white">mdi-menu</v-icon>
      </v-app-bar-nav-icon>

      <v-spacer />

      <v-btn
        style="color: white !important"
        variant="text"
        icon
        @click.stop="showRightDrawer = !showRightDrawer"
      >
        <v-icon color="white">mdi-cog</v-icon>
      </v-btn>
    </v-app-bar>
    <v-main>
      <v-container>
        <NuxtPage />
      </v-container>
    </v-main>
    <v-navigation-drawer v-model="showRightDrawer" location="right" temporary>
      <div class="pa-3 pt-8">
        <p>Settings</p>
        <v-form class="mt-8">
          <v-text-field
            v-model="apiKey"
            label="Your API key"
            variant="outlined"
          />
          <p class="subtitle-2 font-weight-light mb-8">
            Do not share or record your API keys in publicly accessible mediums
            such as GitHub, client-side code, etc.
          </p>
        </v-form>
      </div>
    </v-navigation-drawer>
  </v-app>
</template>

<script setup lang="ts">
const store = useMainStore()

const coreLinks = [
  {
    title: 'GET /businessAccount/balances',
    to: '/debug/businessAccount/balances/fetch',
  },
  {
    title: 'POST /businessAccount/payouts',
    to: '/debug/businessAccount/payouts/create',
  },
  {
    title: 'GET /businessAccount/payouts/',
    to: '/debug/businessAccount/payouts/fetch',
  },
  {
    title: 'GET /businessAccount/payouts/{id}',
    to: '/debug/businessAccount/payouts/details',
  },
  {
    title: 'POST /businessAccount/banks/wires',
    to: '/debug/businessAccount/bankAccounts/create',
  },
  {
    title: 'GET /businessAccount/banks/wires',
    to: '/debug/businessAccount/bankAccounts/fetch',
  },
  {
    title: 'GET /businessAccount/banks/wires/{id}',
    to: '/debug/businessAccount/bankAccounts/details',
  },
  {
    title: 'GET /businessAccount/banks/wires/{id}/instructions',
    to: '/debug/businessAccount/bankAccounts/instructions',
  },
  {
    title: 'POST /mocks/payments/wire',
    to: '/debug/payments/mocks/wire',
  },
  {
    title: 'POST /mocks/payments/pix',
    to: '/debug/payments/mocks/pix',
  },
  {
    title: 'POST /businessAccount/banks/cbit',
    to: '/debug/businessAccount/cbitAccounts/create',
  },
  {
    title: 'GET /businessAccount/banks/cbit',
    to: '/debug/businessAccount/cbitAccounts/fetch',
  },
  {
    title: 'GET /businessAccount/banks/cbit/{id}',
    to: '/debug/businessAccount/cbitAccounts/details',
  },
  {
    title: 'GET /businessAccount/banks/cbit/{id}/instructions',
    to: '/debug/businessAccount/cbitAccounts/instructions',
  },
  {
    title: 'POST /businessAccount/banks/xpay',
    to: '/debug/businessAccount/xpayAccounts/create',
  },
  {
    title: 'GET /businessAccount/banks/xpay',
    to: '/debug/businessAccount/xpayAccounts/fetch',
  },
  {
    title: 'GET /businessAccount/banks/xpay/{id}',
    to: '/debug/businessAccount/xpayAccounts/details',
  },
  {
    title: 'GET /businessAccount/banks/xpay/{id}/instructions',
    to: '/debug/businessAccount/xpayAccounts/instructions',
  },
  {
    title: 'POST /businessAccount/transfers',
    to: '/debug/businessAccount/transfers/create',
  },
  {
    title: 'GET /businessAccount/transfers',
    to: '/debug/businessAccount/transfers/fetch',
  },
  {
    title: 'GET /businessAccount/transfers/{id}',
    to: '/debug/businessAccount/transfers/details',
  },
  {
    title: 'POST /businessAccount/wallets/addresses/deposit',
    to: '/debug/businessAccount/addresses/deposit/create',
  },
  {
    title: 'GET /businessAccount/wallets/addresses/deposit',
    to: '/debug/businessAccount/addresses/deposit/fetch',
  },
  {
    title: 'POST /businessAccount/wallets/addresses/recipient',
    to: '/debug/businessAccount/addresses/recipient/create',
  },
  {
    title: 'GET /businessAccount/wallets/addresses/recipient',
    to: '/debug/businessAccount/addresses/recipient/fetch',
  },
  {
    title: 'DELETE /businessAccount/wallets/addresses/recipient/{id}',
    to: '/debug/businessAccount/addresses/recipient/delete',
  },
  {
    title: 'GET /businessAccount/deposits',
    to: '/debug/businessAccount/deposits/fetch',
  },
]

const paymentsLinks = [
  {
    title: 'GET /payments',
    to: '/debug/payments/fetch',
  },
  {
    title: 'POST /payments',
    to: '/debug/payments/create',
  },
  {
    title: 'POST /payments/crypto',
    to: '/debug/payments/crypto/create',
  },
  {
    title: 'GET /payments/{id}',
    to: '/debug/payments/details',
  },
  {
    title: 'GET /settlements',
    to: '/debug/settlements/fetch',
  },
  {
    title: 'GET /settlements/{id}',
    to: '/debug/settlements/details',
  },
  {
    title: 'GET /balances',
    to: '/debug/payments/balances/fetch',
  },
  {
    title: 'GET /presign',
    to: '/debug/payments/crypto/presign',
  },
]

const payoutsLinks = [
  {
    title: 'POST /addressBook/recipients',
    to: '/debug/addressBook/create',
  },
  {
    title: 'GET /addressBook/recipients',
    to: '/debug/addressBook/fetch',
  },
  {
    title: 'GET /addressBook/recipients/{id}',
    to: '/debug/addressBook/details',
  },
  {
    title: 'PATCH /addressBook/recipients/{id}',
    to: '/debug/addressBook/patch',
  },
  {
    title: 'DELETE /addressBook/recipients/{id}',
    to: '/debug/addressBook/delete',
  },
  {
    title: 'POST /payouts',
    to: '/debug/payouts/create',
  },
  {
    title: 'GET /payouts',
    to: '/debug/payouts/fetch',
  },
  {
    title: 'GET /payouts/{id}',
    to: '/debug/payouts/details',
  },
]

const paymentIntentsLinks = [
  {
    title: 'POST /paymentIntents',
    to: '/debug/paymentIntents/create',
  },
  {
    title: 'GET /paymentIntents',
    to: '/debug/paymentIntents/fetch',
  },
  {
    title: 'GET /paymentIntents/{id}',
    to: '/debug/paymentIntents/details',
  },
  {
    title: 'POST /paymentIntents/{id}/expire',
    to: '/debug/paymentIntents/expire',
  },
  {
    title: 'POST /paymentIntents/{id}/refund',
    to: '/debug/paymentIntents/createCryptoRefund',
  },
]

const tradesLinks = [
  {
    title: 'Create Trade Flow',
    to: '/debug/trades/flow',
  },
  {
    title: 'POST /quotes',
    to: '/debug/trades/quote',
  },
  {
    title: 'POST /trades',
    to: '/debug/trades/create',
  },
  {
    title: 'GET /trades',
    to: '/debug/trades/fetch',
  },
  {
    title: 'GET /trades/{id}',
    to: '/debug/trades/details',
  },
  {
    title: 'GET /trades/settlements',
    to: '/debug/trades/settlements/fetch',
  },
  {
    title: 'GET /trades/settlements/{id}',
    to: '/debug/trades/settlements/details',
  },
  {
    title: 'GET /trades/settlements/instructions',
    to: '/debug/trades/settlements/instructions',
  },
]

const cpsTradesLinks = [
  {
    title: 'POST /cps/quotes',
    to: '/debug/cps/quote',
  },
  {
    title: 'POST /cps/trades',
    to: '/debug/cps/create',
  },
  {
    title: 'GET /cps/trades',
    to: '/debug/cps/fetch',
  },
  {
    title: 'GET /cps/trades/{id}',
    to: '/debug/cps/details',
  },
  {
    title: 'GET /cps/signatures/presign',
    to: '/debug/cps/presign',
  },
  {
    title: 'POST /cps/signatures',
    to: '/debug/cps/signature',
  },
]

const miniVariant = ref(false)
const showRightDrawer = ref(false)
const showDrawer = ref(false)

const apiKey = computed({
  get: () => store.getApiKey,
  set: (value: string) => store.setBearerToken(value),
})
</script>

<style scoped>
.list-items {
  font-size: 14px;
}
.pointer {
  cursor: pointer;
}

/* Reduce padding for navigation items */
:deep(.v-list-group__items .v-list-item) {
  padding-left: 8px !important;
}

:deep(.v-list-item__content) {
  padding-left: 0 !important;
}

:deep(.v-list-item-title) {
  margin-left: 0 !important;
  padding-left: 0 !important;
}
</style>
