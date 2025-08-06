<template>
  <v-layout>
    <v-flex>
      <v-card class="body-1 px-6 py-8 mb-4" max-width="800" outlined>
        <h1 class="headline">API viewer</h1>

        <p class="mt-6">
          Make api calls using your private api key. Explore payload and
          response data in the UI.
        </p>
        <p>
          Please use the settings panel on the right to configure your payments
          api key.
        </p>
      </v-card>

      <v-card class="body-1 px-6 py-8 mb-4" max-width="800" outlined>
        <h2 class="title">CPS Trade API endpoints</h2>
        <span class="caption">Requires: api key</span>
        <br /><br />
        <p>API endpoints for CPS trading</p>
        <p>
          <a href="/debug/cps/flow">Create CPS Trade Flow</a>
        </p>
        <p>
          <v-chip small color="primary warning">POST</v-chip>
          <a href="/debug/cps/quote">Create CPS Quote</a>
        </p>
        <p>
          <v-chip small color="primary warning">POST</v-chip>
          <a href="/debug/cps/create">Create CPS Trade</a>
        </p>
        <p>
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/cps/fetch">Get all CPS Trades</a>
        </p>
        <p>
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/cps/details"> Get CPS Trade by ID</a>
        </p>
        <p>
          <v-chip small color="primary warning">POST</v-chip>
          <a href="/debug/cps/signature">Register CPS signature</a>
        </p>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import { mapGetters } from 'vuex'

@Component({
  computed: {
    ...mapGetters({
      isMarketplace: 'isMarketplace',
    }),
  },
})
export default class CpsTradeApiIndexClass extends Vue {}
</script>
