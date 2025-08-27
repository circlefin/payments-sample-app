<template>
  <v-container>
    <v-col>
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
        <h2 class="title">Payments endpoints</h2>
        <span class="caption">Requires: api key</span>
        <br /><br />
        <p>Api endpoints to manage payments.</p>

        <p>
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/payments/fetch"> Get all payments </a>
        </p>
        <p>
          <v-chip small color="primary warning">POST</v-chip>
          <a href="/debug/payments/create">Make payment</a>
        </p>
        <p>
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/payments/details"> Get payment details by id </a>
        </p>
        <p>
          <v-chip small color="primary warning">POST</v-chip>
          <a href="/debug/payments/capture"> Capture payment </a>
        </p>
        <p>
          <v-chip small color="primary warning">POST</v-chip>
          <a href="/debug/payments/cancel"> Cancel payment </a>
        </p>
        <p>
          <v-chip small color="primary warning">POST</v-chip>
          <a href="/debug/payments/refund"> Refund payment </a>
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
        <h2 class="title">Payment intents endpoints</h2>
        <span class="caption">Requires: api key</span>
        <br /><br />
        <p>Api endpoints to manage payment intents.</p>
        <p>
          <v-chip small color="primary warning">POST</v-chip>
          <a href="/debug/paymentIntents/create"> Add payment intent</a>
        </p>
        <p>
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/paymentIntents/fetch">Get all payment intents</a>
        </p>
        <p>
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/paymentIntents/details">
            Get payment intent details by id
          </a>
        </p>
        <p>
          <v-chip small color="primary">POST</v-chip>
          <a href="/debug/paymentIntents/expire">
            Expire a payment intent by id
          </a>
        </p>
      </v-card>

      <v-card class="body-1 px-6 py-8 mb-4" max-width="800" outlined>
        <h2 class="title">Balances endpoints</h2>
        <span class="caption">Requires: api key</span>
        <br /><br />
        <p>Api endpoints to manage balances.</p>
        <p>
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/payments/balances/fetch"> Get all balances </a>
        </p>
      </v-card>
    </v-col>
  </v-container>
</template>

<script setup lang="ts">
import { getLive } from '@/lib/apiTarget'

const isSandbox = !getLive()
</script>
