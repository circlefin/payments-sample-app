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

      <v-card
        v-if="isMarketplace"
        class="body-1 px-6 py-8 mb-4"
        max-width="800"
        outlined
      >
        <h2 class="title">Merchant endpoints</h2>
        <span class="caption">Requires: api key</span>
        <br /><br />
        <p>Api endpoints specific to merchants.</p>
        <p>
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/marketplace/merchants/fetch"> Get merchants </a>
        </p>
      </v-card>

      <v-card class="body-1 px-6 py-8 mb-4" max-width="800" outlined>
        <h2 class="title">ACH accounts endpoints</h2>
        <span class="caption">Requires: api key</span>
        <br /><br />
        <p>
          Api endpoints to manage Plaid ACH accounts:
        </p>

        <p>
          <v-chip small color="primary warning">POST</v-chip>
          <a href="/debug/ach/mocks/create">
            Create a mock ACH bank account
          </a>
        </p>

        <p>
          <v-chip small color="primary warning">POST</v-chip>
          <a href="/debug/ach/create">
            Add Plaid ACH account
          </a>
        </p>

        <p>
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/ach/details">
            Get ACH account details by id
          </a>
        </p>
      </v-card>

      <v-card class="body-1 px-6 py-8 mb-4" max-width="800" outlined>
        <h2 class="title">Payments endpoints</h2>
        <span class="caption">Requires: api key</span>
        <br /><br />
        <p>Api endpoints to manage payments.</p>

        <p v-if="isMarketplace">
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/marketplace/payments/fetch"> Get all payments </a>
        </p>
        <p v-else>
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/payments/fetch"> Get all payments </a>
        </p>
        <p v-if="isMarketplace">
          <v-chip small color="primary warning">POST</v-chip>
          <a href="/debug/marketplace/payments/create">Make payment</a>
        </p>
        <p v-else>
          <v-chip small color="primary warning">POST</v-chip>
          <a href="/debug/payments/create">Make payment</a>
        </p>
        <p v-if="isMarketplace">
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/marketplace/payments/details">
            Get payment details by id
          </a>
        </p>
        <p v-else>
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/payments/details"> Get payment details by id </a>
        </p>
        <p v-if="isMarketplace">
          <v-chip small color="primary warning">POST</v-chip>
          <a href="/debug/marketplace/payments/capture"> Capture payment </a>
        </p>
        <p v-else>
          <v-chip small color="primary warning">POST</v-chip>
          <a href="/debug/payments/capture"> Capture payment </a>
        </p>
        <p v-if="isMarketplace">
          <v-chip small color="primary warning">POST</v-chip>
          <a href="/debug/marketplace/payments/cancel"> Cancel payment </a>
        </p>
        <p v-else>
          <v-chip small color="primary warning">POST</v-chip>
          <a href="/debug/payments/cancel"> Cancel payment </a>
        </p>
        <p v-if="isMarketplace">
          <v-chip small color="primary warning">POST</v-chip>
          <a href="/debug/marketplace/payments/refund"> Refund payment </a>
        </p>
        <p v-else>
          <v-chip small color="primary warning">POST</v-chip>
          <a href="/debug/payments/refund"> Refund payment </a>
        </p>
        <p v-if="isSandbox && !isMarketplace">
          <v-chip small color="primary warning">POST</v-chip>
          <a href="/debug/payments/mocks/wire">
            Simulate an incoming bank wire payment
          </a>
        </p>
      </v-card>

      <v-card class="body-1 px-6 py-8 mb-4" max-width="800" outlined>
        <h2 class="title">Cards endpoints</h2>
        <span class="caption">Requires: api key</span>
        <br /><br />
        <p>Api endpoints to manage cards:</p>
        <p>
          <v-chip small color="primary warning">POST</v-chip>
          <a href="/debug/cards/create"> Add card </a>
        </p>
        <p>
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/cards/fetch">Get all cards</a>
        </p>
        <p>
          <v-chip small color="primary">GET</v-chip>

          <a href="/debug/cards/details"> Get card details by id </a>
        </p>
        <p>
          <v-chip small color="primary accent">PUT</v-chip>
          <a href="/debug/cards/update"> Update card details </a>
        </p>
      </v-card>

      <v-card class="body-1 px-6 py-8 mb-4" max-width="800" outlined>
        <h2 class="title">Wires endpoints</h2>
        <span class="caption">Requires: api key</span>
        <br /><br />
        <p>Api endpoints to manage wire accounts.</p>
        <p>
          <v-chip small color="primary warning">POST</v-chip>
          <a href="/debug/wires/create"> Create wire account </a>
        </p>
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
      </v-card>

      <v-card
        v-if="!isMarketplace"
        class="body-1 px-6 py-8 mb-4"
        max-width="800"
        outlined
      >
        <h2 class="title">On-chain payments endpoints</h2>
        <span class="caption">Requires: api key</span>
        <br /><br />
        <p>Api endpoints to initiate on-chain payments.</p>
        <p>
          <v-chip small color="primary warning">POST</v-chip>
          <a href="/debug/wallets/wallets/create"> Add wallet </a>
        </p>
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
          <a href="/debug/wallets/addresses/create"> Add address </a>
        </p>
        <p>
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/wallets/addresses/fetch">Get all addresses</a>
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
        <h2 class="title">Chargebacks endpoints</h2>
        <span class="caption">Requires: api key</span>
        <br /><br />
        <p>Api endpoints to manage chargebacks.</p>
        <p>
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/chargebacks/fetch">Get all chargebacks</a>
        </p>
        <p>
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/chargebacks/details">
            Get chargeback details by id
          </a>
        </p>
        <p v-if="isSandbox && !isMarketplace">
          <v-chip small color="primary warning">POST</v-chip>
          <a href="/debug/chargebacks/mocks/create"> Create mock chargeback </a>
        </p>
      </v-card>

      <v-card class="body-1 px-6 py-8 mb-4" max-width="800" outlined>
        <h2 class="title">Reversals endpoints</h2>
        <span class="caption">Requires: api key</span>
        <br /><br />
        <p>Api endpoints to manage reversals.</p>
        <p v-if="!isMarketplace">
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/reversals/fetch"> Get all reversals </a>
        </p>
      </v-card>

      <v-card
        v-if="!isMarketplace"
        class="body-1 px-6 py-8 mb-4"
        max-width="800"
        outlined
      >
        <h2 class="title">Balances endpoints</h2>
        <span class="caption">Requires: api key</span>
        <br /><br />
        <p>Api endpoints to manage balances.</p>
        <p>
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/payments/balances/fetch"> Get all balances </a>
        </p>
      </v-card>

      <v-card
        v-if="isMarketplace"
        class="body-1 px-6 py-8 mb-4"
        max-width="800"
        outlined
      >
        <h2 class="title">Payouts endpoints</h2>
        <span class="caption">Requires: api key</span>
        <br /><br />
        <p>Api endpoints to manage payouts.</p>
        <p>
          <v-chip small color="primary warning">POST</v-chip>
          <a href="/debug/payouts/create"> Add payout </a>
        </p>
        <p>
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/payouts/fetch">Get all payouts</a>
        </p>
        <p>
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/payouts/details"> Get payout details by id </a>
        </p>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import { mapGetters } from 'vuex'
import { getLive } from '@/lib/apiTarget'

@Component({
  computed: {
    ...mapGetters({
      isMarketplace: 'isMarketplace',
    }),
  },
})
export default class DebugIndexClass extends Vue {
  isSandbox: Boolean = !getLive()
}
</script>
