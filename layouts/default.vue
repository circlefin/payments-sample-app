<template>
  <v-app>
    <v-navigation-drawer
      v-model="showDrawer"
      :mini-variant="miniVariant"
      clipped
      fixed
      app
      width="330"
    >
      <v-list>
        <v-list-item to="/" router exact>
          <v-list-item-content>
            <v-list-item-title>
              Home
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-group>
          <template v-slot:activator>
            <v-list-item-title>Sample flows</v-list-item-title>
          </template>

          <v-list-item
            v-for="(item, i) in flowLinks"
            :key="`flowlink-${i}`"
            :to="item.to"
            router
            exact
          >
            <v-list-item-content>
              <v-list-item-title class="list-items pl-2" v-text="item.title" />
            </v-list-item-content>
          </v-list-item>
        </v-list-group>

        <v-list-group v-if="!isMarketplace">
          <template v-slot:activator>
            <v-list-item-title>Payments APIs</v-list-item-title>
          </template>

          <v-list-item to="/debug" router exact>
            <v-list-item-content>
              <v-list-item-title class="list-items pl-2">
                Overview
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item
            v-for="(item, i) in paymentsLinks"
            :key="`paymentlink-${i}`"
            :to="item.to"
            router
            exact
          >
            <v-list-item-content>
              <v-list-item-title class="list-items pl-2" v-text="item.title" />
            </v-list-item-content>
          </v-list-item>
        </v-list-group>

        <v-list-group v-if="isMarketplace">
          <template v-slot:activator>
            <v-list-item-title>Marketplace APIs</v-list-item-title>
          </template>

          <v-list-item to="/debug" router exact>
            <v-list-item-content>
              <v-list-item-title class="list-items pl-2">
                Overview
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item
            v-for="(item, i) in marketplaceLinks"
            :key="`marketplacelink-${i}`"
            :to="item.to"
            router
            exact
          >
            <v-list-item-content>
              <v-list-item-title class="list-items pl-2" v-text="item.title" />
            </v-list-item-content>
          </v-list-item>
        </v-list-group>

        <v-list-group>
          <template v-slot:activator>
            <v-list-item-title>Wallets APIs</v-list-item-title>
          </template>

          <v-list-item to="/debug/wallets" router exact>
            <v-list-item-content>
              <v-list-item-title class="list-items pl-2">
                Overview
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item
            v-for="(item, i) in walletsLinks"
            :key="`walletsLinks-${i}`"
            :to="item.to"
            router
            exact
          >
            <v-list-item-content>
              <v-list-item-title class="list-items pl-2" v-text="item.title" />
            </v-list-item-content>
          </v-list-item>
        </v-list-group>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar clipped-left fixed app dark color="primary" dense>
      <v-app-bar-nav-icon @click.stop="showDrawer = !showDrawer" />
      <v-toolbar-title v-text="title" />
      <v-spacer />
      <v-btn icon @click.stop="showRightDrawer = !showRightDrawer">
        <v-icon>mdi-cog</v-icon>
      </v-btn>
    </v-app-bar>
    <v-content>
      <v-container>
        <nuxt />
      </v-container>
    </v-content>
    <v-navigation-drawer
      v-model="showRightDrawer"
      :right="true"
      temporary
      fixed
    >
      <v-content class="pa-3 pt-8">
        <p>
          Settings
        </p>
        <v-form class="mt-8">
          <v-text-field v-model="apiKey" label="Your API key" outlined />
          <p class="subtitle-2 font-weight-light mb-8">
            Do not share or record your API keys in publicly accessible mediums
            such as GitHub, client-side code, etc.
          </p>
          <v-switch
            v-model="isMarketplace"
            label="I am using a Circle Marketplaces API key"
          ></v-switch>
        </v-form>
      </v-content>
    </v-navigation-drawer>
  </v-app>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'

@Component
export default class DefaultLayoutsClass extends Vue {
  flowLinks = [
    {
      title: 'Charge a card',
      to: '/flow/charge',
    },
    {
      title: 'Use an existing card',
      to: '/flow/charge/existing-card',
    },
    {
      title: 'Add a new card',
      to: '/flow/card/create',
    },
  ]

  marketplaceLinks = [
    {
      title: 'GET /cards',
      to: '/debug/cards/fetch',
    },
    {
      title: 'GET /cards/{id}',
      to: '/debug/cards/details',
    },
    {
      title: 'POST /cards',
      to: '/debug/cards/create',
    },
    {
      title: 'PUT /cards/{id}',
      to: '/debug/cards/update',
    },
    {
      title: 'GET /marketplace/payments',
      to: '/debug/marketplace/payments/fetch',
    },
    {
      title: 'GET /marketplace/payments/{id}',
      to: '/debug/marketplace/payments/details',
    },
    {
      title: 'POST /marketplace/payments',
      to: '/debug/marketplace/payments/create',
    },
    {
      title: 'POST /marketplace/payments/{id}/cancel',
      to: '/debug/marketplace/payments/cancel',
    },
    {
      title: 'POST /marketplace/payments/{id}/refund',
      to: '/debug/marketplace/payments/refund',
    },
    {
      title: 'GET /marketplace/merchants',
      to: '/debug/marketplace/merchants/fetch',
    },
    {
      title: 'GET /settlements',
      to: '/debug/settlements/fetch',
    },
    {
      title: 'GET /settlements/{id}',
      to: '/debug/settlements/details',
    },
  ]

  paymentsLinks = [
    {
      title: 'GET /cards',
      to: '/debug/cards/fetch',
    },
    {
      title: 'GET /cards/{id}',
      to: '/debug/cards/details',
    },
    {
      title: 'POST /cards',
      to: '/debug/cards/create',
    },
    {
      title: 'PUT /cards/{id}',
      to: '/debug/cards/update',
    },
    {
      title: 'GET /payments',
      to: '/debug/payments/fetch',
    },
    {
      title: 'GET /payments/{id}',
      to: '/debug/payments/details',
    },
    {
      title: 'POST /payments',
      to: '/debug/payments/create',
    },
    {
      title: 'POST /payments/{id}/cancel',
      to: '/debug/payments/cancel',
    },
    {
      title: 'POST /payments/{id}/refund',
      to: '/debug/payments/refund',
    },
    {
      title: 'GET /balances',
      to: '/debug/payments/balances/fetch',
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
      title: 'GET /wires/{id}',
      to: '/debug/wires/details',
    },
    {
      title: 'POST /wires',
      to: '/debug/wires/create',
    },
    {
      title: 'GET /payouts',
      to: '/debug/payments/payouts/fetch',
    },
    {
      title: 'GET /payouts/{id}',
      to: '/debug/payments/payouts/details',
    },
    {
      title: 'POST /payouts',
      to: '/debug/payments/payouts/create',
    },
  ]

  walletsLinks = [
    {
      title: 'GET /wallets',
      to: '/debug/wallets/wallets/fetch',
    },
    {
      title: 'GET /wallets/{id}',
      to: '/debug/wallets/wallets/details',
    },
    {
      title: 'POST /wallets',
      to: '/debug/wallets/wallets/create',
    },
    {
      title: 'GET /{walletId}/addresses',
      to: '/debug/wallets/addresses/fetch',
    },
    {
      title: 'POST /{walletId}/addresses',
      to: '/debug/wallets/addresses/create',
    },
    {
      title: 'GET /transfers',
      to: '/debug/wallets/transfers/fetch',
    },
    {
      title: 'GET /transfers/{id}',
      to: '/debug/wallets/transfers/details',
    },
    {
      title: 'POST /transfers',
      to: '/debug/wallets/transfers/create',
    },
  ]

  miniVariant = false
  right = true
  showRightDrawer = false
  showDrawer = false

  get title() {
    const navItems = this.flowLinks.concat(this.paymentsLinks)
    const currentPage = navItems.find((item) => {
      return item.to === this.$route.path
    })
    return currentPage && currentPage.title
  }

  get apiKey() {
    return this.$store.getters.getApiKey
  }

  set apiKey(value: string) {
    this.$store.commit('SET_BEARER_TOKEN', value)
  }

  get isMarketplace() {
    return this.$store.getters.isMarketplace
  }

  set isMarketplace(bool: boolean) {
    this.$store.commit('SET_IS_MARKETPLACE', bool)
    this.$router.push('/')
  }
}
</script>

<style scoped>
.list-items {
  font-size: 14px;
}
.pointer {
  cursor: pointer;
}
</style>
