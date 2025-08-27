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
    </v-col>
  </v-container>
</template>

<script setup lang="ts">
const store = useMainStore()
</script>
