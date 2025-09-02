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
      </v-card>

      <v-card class="body-1 px-6 py-8 mb-4" max-width="800" outlined>
        <h2 class="title">Payment Intents endpoints</h2>
        <span class="caption">Requires: api key</span>
        <br /><br />
        <p>Api endpoints to manage payment intents.</p>
        <p>
          <v-chip small color="primary warning">POST</v-chip>
          <a href="/debug/paymentIntents/create"> Create payment intent </a>
        </p>
        <p>
          <v-chip small color="primary warning">POST</v-chip>
          <a href="/debug/paymentIntents/expire"> Expire payment intent </a>
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
          <v-chip small color="primary warning">POST</v-chip>
          <a href="/debug/paymentIntents/createCryptoRefund">
            Create crypto refund
          </a>
        </p>
      </v-card>
    </v-col>
  </v-container>
</template>

<script setup lang="ts"></script>
