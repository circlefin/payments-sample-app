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
        <p class="subtitle-2">
          (Caution: When using a production api key it will charge your card).
        </p>
      </v-card>

      <v-card class="body-1 px-6 py-8 mb-4" max-width="800" outlined>
        <h2 class="title">Settlements endpoints</h2>
        <span class="caption">Requires: api key</span>
        <br /><br />
        <p>Api endpoints to manage settlements.</p>
        <p>
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/settlements/fetch"> Get all settlements </a>
        </p>
        <p>
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/settlements/details">
            Get settlement details by id
          </a>
        </p>
      </v-card>

      <v-card class="body-1 px-6 py-8 mb-4" max-width="800" outlined>
        <h2 class="title">Wires endpoints</h2>
        <span class="caption">Requires: api key</span>
        <br /><br />
        <p>Api endpoints to manage wire accounts.</p>
        <p>
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/wires/details"> Get wire account details by id </a>
        </p>
        <p>
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/wires/instructions">
            Get wire account instructions by id
          </a>
        </p>
        <p>
          <v-chip small color="primary warning">POST</v-chip>
          <a href="/debug/wires/create"> Create wire account </a>
        </p>
      </v-card>

      <v-card class="body-1 px-6 py-8 mb-4" max-width="800" outlined>
        <h2 class="title">Payouts endpoints</h2>
        <span class="caption">Requires: api key</span>
        <br /><br />
        <p>Api endpoints to manage payouts.</p>
        <p>
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/payouts/fetch">Get all payouts</a>
        </p>
        <p>
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/payouts/details"> Get payout details by id </a>
        </p>
        <p>
          <v-chip small color="primary warning">POST</v-chip>
          <a href="/debug/payouts/create"> Add payout </a>
        </p>
      </v-card>

      <v-card class="body-1 px-6 py-8 mb-4" max-width="800" outlined>
        <h2 class="title">Business Account Payout endpoints</h2>
        <span class="caption">Requires: api key</span>
        <br /><br />
        <p>Api endpoints to manage payouts.</p>
        <p>
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/businessAccount/payouts/details">
            Get payout details by id
          </a>
        </p>
        <p>
          <v-chip small color="primary warning">POST</v-chip>
          <a href="/debug/businessAccount/payouts/create"> Create payout </a>
        </p>
      </v-card>

      <v-card class="body-1 px-6 py-8 mb-4" max-width="800" outlined>
        <h2 class="title">Business Account Wire endpoints</h2>
        <span class="caption">Requires: api key</span>
        <br /><br />
        <p>Api endpoints to manage wire bank accounts.</p>
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
        <h2 class="title">Wallets endpoints</h2>
        <span class="caption">Requires: api key</span>
        <br /><br />
        <p>Api endpoints to manage wallets.</p>
        <p>
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/wallets/wallets/fetch">Get all wallets</a>
        </p>
        <p>
          <v-chip small color="primary">GET</v-chip>

          <a href="/debug/wallets/wallets/details">
            Get wallet details by id
          </a>
        </p>
        <p>
          <v-chip small color="primary warning">POST</v-chip>
          <a href="/debug/wallets/wallets/create"> Add wallet </a>
        </p>
      </v-card>

      <v-card class="body-1 px-6 py-8 mb-4" max-width="800" outlined>
        <h2 class="title">Addresses endpoints</h2>
        <span class="caption">Requires: api key</span>
        <br /><br />
        <p>Api endpoints to manage blockchain addresses.</p>
        <p>
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/wallets/addresses/fetch">Get all addresses</a>
        </p>
        <p>
          <v-chip small color="primary warning">POST</v-chip>
          <a href="/debug/wallets/addresses/create">
            Create blockchain address
          </a>
        </p>
      </v-card>

      <v-card class="body-1 px-6 py-8 mb-4" max-width="800" outlined>
        <h2 class="title">Transfers endpoints</h2>
        <span class="caption">Requires: api key</span>
        <br /><br />
        <p>Api endpoints to manage transfers.</p>
        <p>
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/wallets/transfers/fetch">Get all transfers</a>
        </p>
        <p>
          <v-chip small color="primary">GET</v-chip>

          <a href="/debug/wallets/transfers/details">
            Get transfer details by id
          </a>
        </p>
        <p>
          <v-chip small color="primary warning">POST</v-chip>
          <a href="/debug/wallets/transfers/create"> Add transfer </a>
        </p>
      </v-card>

      <v-card class="body-1 px-6 py-8 mb-4" max-width="800" outlined>
        <h2 class="title">Business Account Balance endpoints</h2>
        <span class="caption">Requires: api key</span>
        <br /><br />
        <p>Api endpoints to manage balances.</p>
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
export default class PayoutsIndexClass extends Vue {}
</script>
