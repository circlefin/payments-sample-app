<template>
  <v-layout>
    <v-flex>
      <v-card class="body-1 px-6 py-8 mb-4" max-width="800" outlined>
        <h1 class="headline">API viewer</h1>

        <p class="mt-6">
          Make api calls using your private api key. Explore payload and
          response data in the UI.
        </p>
      </v-card>

      <v-card class="body-1 px-6 py-8 mb-4" max-width="800" outlined>
        <h2 class="title">Bank Account endpoints</h2>
        <span class="caption">Requires: api key</span>
        <br /><br />
        <p>
          Api endpoints to manage business accounts.
        </p>
        <p>
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/businessAccount/bankAccounts/fetch">Get all wires</a>
        </p>
        <p>
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/businessAccount/bankAccounts/details">
            Get wire details by id
          </a>
        </p>
        <p>
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/businessAccount/bankAccounts/instructions">
            Get wire instructions by id
          </a>
        </p>
        <p>
          <v-chip small color="primary warning">POST</v-chip>
          <a href="/debug/wallets/wallets/create">
            Add bank account
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
            Add transfer
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
          Api endpoints to manage payout.
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
            Add payout
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
          <a href="/debug/businessAccount/transfers/fetch">Get all balances</a>
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
