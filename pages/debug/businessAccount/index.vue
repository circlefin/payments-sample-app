<template>
  <v-layout>
    <v-flex>
      <v-card class="body-1 px-6 py-8 mb-4" max-width="800" outlined>
        <h1 class="headline">API viewer</h1>

        <p class="mt-6">
          Make API calls using your private API key. Explore payload and
          response data in the UI.
        </p>
      </v-card>

      <v-card class="body-1 px-6 py-8 mb-4" max-width="800" outlined>
        <h2 class="title">Business Wire Account endpoints</h2>
        <span class="caption">Requires: api key</span>
        <br /><br />
        <p>
          Api endpoints to manage business wire accounts.
        </p>
        <p>
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/businessAccount/bankAccounts/fetch">
            Get all wire accounts
          </a>
        </p>
        <p>
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/businessAccount/bankAccounts/details">
            Get wire account details by id
          </a>
        </p>
        <p>
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/businessAccount/bankAccounts/instructions">
            Get wire instructions for id
          </a>
        </p>
        <p>
          <v-chip small color="primary warning">POST</v-chip>
          <a href="/debug/businessAccount/bankAccounts/create">
            Create wire account
          </a>
        </p>
      </v-card>

      <v-card class="body-1 px-6 py-8 mb-4" max-width="800" outlined>
        <h2 class="title">Transfer endpoints</h2>
        <span class="caption">Requires: api key</span>
        <br /><br />
        <p>
          Api endpoints to manage transfers.
        </p>
        <p>
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/businessAccount/transfers/fetch">Get all transfers</a>
        </p>
        <p>
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/businessAccount/transfers/details">
            Get transfer details by id
          </a>
        </p>
        <p>
          <v-chip small color="primary warning">POST</v-chip>
          <a href="/debug/businessAccount/transfers/create">
            Create transfer
          </a>
        </p>
      </v-card>

      <v-card class="body-1 px-6 py-8 mb-4" max-width="800" outlined>
        <h2 class="title">Address endpoints</h2>
        <span class="caption">Requires: api key</span>
        <br /><br />
        <p>
          Api endpoints to manage blockchain addresses.
        </p>
        <p>
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/businessAccount/addresses/deposit/fetch">
            Get all deposit addresses
          </a>
        </p>
        <p>
          <v-chip small color="primary warning">POST</v-chip>
          <a href="/debug/businessAccount/addresses/deposit/create">
            Create deposit address
          </a>
        </p>
        <p>
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/businessAccount/addresses/recipient/fetch">
            Get all recipient addresses
          </a>
        </p>
        <p>
          <v-chip small color="primary warning">POST</v-chip>
          <a href="/debug/businessAccount/addresses/recipient/create">
            Create recipient address
          </a>
        </p>
      </v-card>

      <v-card class="body-1 px-6 py-8 mb-4" max-width="800" outlined>
        <h2 class="title">Payout endpoints</h2>
        <span class="caption">Requires: api key</span>
        <br /><br />
        <p>
          Api endpoints to manage payouts.
        </p>
        <p>
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/businessAccount/payouts/details">
            Get payout details by id
          </a>
        </p>
        <p>
          <v-chip small color="primary warning">POST</v-chip>
          <a href="/debug/businessAccount/payouts/create">
            Create payout
          </a>
        </p>
      </v-card>

      <v-card class="body-1 px-6 py-8 mb-4" max-width="800" outlined>
        <h2 class="title">Balance endpoints</h2>
        <span class="caption">Requires: api key</span>
        <br /><br />
        <p>
          Api endpoints to manage balances.
        </p>
        <p>
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/businessAccount/balances/fetch">Get all balances</a>
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
export default class BusinessAccountIndexClass extends Vue {}
</script>
