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
        <h2 class="title">Trade API endpoints</h2>
        <span class="caption">Requires: api key</span>
        <br /><br />
        <p>Api endpoints for FX trading</p>
        <p>
          <a href="/debug/trades/flow">Create trade flow</a>
        </p>
        <p>
          <v-chip small color="primary warning">POST</v-chip>
          <a href="/debug/trades/quote">Create quote</a>
        </p>
        <p>
          <v-chip small color="primary warning">POST</v-chip>
          <a href="/debug/trades/create">Create trade</a>
        </p>
        <p>
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/trades/fetch">Get all trades</a>
        </p>
        <p>
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/trades/details"> Get trade details by id </a>
        </p>
        <p>
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/trades/settlements/fetch">
            Get all trade settlements
          </a>
        </p>
        <p>
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/trades/settlements/details">
            Get trade settlement details by id
          </a>
        </p>
        <p>
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/trades/settlements/instructions">
            Get trade settlement instructions
          </a>
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
export default class TradeApiIndexClass extends Vue {}
</script>
