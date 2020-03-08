<template>
  <v-app>
    <v-navigation-drawer
      v-model="showDrawer"
      :mini-variant="miniVariant"
      :clipped="clipped"
      fixed
      app
    >
      <v-list>
        <v-list-item to="/" router exact>
          <v-list-item-content>
            <v-list-item-title>
              Home
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-title
            class="pointer"
            @click.stop="showFlowSubnav = !showFlowSubnav"
          >
            Sample flows
          </v-list-item-title>
        </v-list-item>
        <div v-if="showFlowSubnav">
          <v-list-item
            v-for="(item, i) in flowSubitems"
            :key="i"
            :to="item.to"
            router
            exact
          >
            <v-list-item-content>
              <v-list-item-title class="body-2 pl-2" v-text="item.title" />
            </v-list-item-content>
          </v-list-item>
        </div>
        <v-list-item>
          <v-list-item-title
            class="pointer"
            @click.stop="showApiSubnav = !showApiSubnav"
          >
            API viewer
          </v-list-item-title>
        </v-list-item>
        <v-list-item v-if="showApiSubnav" to="/debug" router exact>
          <v-list-item-content>
            <v-list-item-title class="body-2 pl-2">
              Overview
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <div v-if="showApiSubnav">
          <v-list-item
            v-for="(item, i) in apiSubitems"
            :key="i + flowSubitems.length"
            :to="item.to"
            router
            exact
          >
            <v-list-item-content>
              <v-list-item-title class="body-2 pl-2" v-text="item.title" />
            </v-list-item-content>
          </v-list-item>
        </div>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar :clipped-left="clipped" fixed app dark color="primary" dense>
      <v-app-bar-nav-icon @click.stop="showDrawer = !showDrawer" />
      <v-toolbar-title v-text="title" />
      <v-spacer />
      <v-btn icon @click.stop="showRightDrawer = !showRightDrawer">
        <v-icon>mdi-settings</v-icon>
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
            Do not share or record your API keys in publicly accessible mediums such as GitHub,
            client-side code, etc.
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
  // data
  clipped = true
  showFlowSubnav = true
  showApiSubnav = false
  flowSubitems = [
    {
      title: 'Charge a card',
      to: '/flow/charge'
    },
    {
      title: 'Use an existing card',
      to: '/flow/charge/existing-card'
    },
    {
      title: 'Add a new card',
      to: '/flow/card/create'
    }
  ]
  apiSubitems = [
    {
      title: 'GET /cards',
      to: '/debug/cards/fetch'
    },
    {
      title: 'GET /cards/{id}',
      to: '/debug/cards/details'
    },
    {
      title: 'POST /cards',
      to: '/debug/cards/create'
    },
    {
      title: 'PUT /cards/{id}',
      to: '/debug/cards/update'
    },
    {
      title: 'GET /payments',
      to: '/debug/payments/fetch'
    },
    {
      title: 'GET /payments/{id}',
      to: '/debug/payments/details'
    },
    {
      title: 'POST /payments',
      to: '/debug/payments/create'
    },
    {
      title: 'POST /payments/{id}/cancel',
      to: '/debug/payments/cancel'
    },
    {
      title: 'POST /payments/{id}/refund',
      to: '/debug/payments/refund'
    }
  ]
  miniVariant = false
  right = true
  showRightDrawer = false
  showDrawer = false

  get title() {
    const navItems = this.flowSubitems.concat(this.apiSubitems)
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
  }

  updateWalletRefId(value: string) {
    this.$store.commit('UPDATE_WALLET_REFID', value)
  }

  updateMerchantId(value: string) {
    this.$store.commit('UPDATE_MERCHANT_ID', value)
  }

  updateMerchantAccountNumber(value: string) {
    this.$store.commit('UPDATE_MERCHANT_ACCOUNT', value)
  }
}
</script>

<style scoped>
.pointer {
  cursor: pointer;
}
</style>
