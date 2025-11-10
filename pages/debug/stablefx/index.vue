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
          Please use the settings panel on the right to configure your StableFX
          api key.
        </p>
        <p>
          You can also configure your Developer Controlled Wallets credentials
          for signing operations.
        </p>
      </v-card>

      <v-card class="body-1 px-6 py-8 mb-4" max-width="800" outlined>
        <h2 class="title">StableFX Trade API endpoints</h2>
        <span class="caption">Requires: api key</span>
        <br /><br />
        <p>API endpoints for StableFX trading</p>
        <p>
          <v-chip small color="primary warning">POST</v-chip>
          <a href="/debug/stablefx/quote">Create StableFX Quote</a>
        </p>
        <p>
          <v-chip small color="primary warning">POST</v-chip>
          <a href="/debug/stablefx/create">Create StableFX Trade</a>
        </p>
        <p>
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/stablefx/fetch">Get all StableFX Trades</a>
        </p>
        <p>
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/stablefx/details"> Get StableFX Trade by ID</a>
        </p>
        <p>
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/stablefx/fees">Get StableFX Trade Fees</a>
        </p>
        <p>
          <v-chip small color="primary warning">POST</v-chip>
          <a href="/debug/stablefx/signature">Register StableFX signature</a>
        </p>
        <p>
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/stablefx/presign">Get presign data for trade</a>
        </p>
        <p>
          <v-chip small color="primary warning">POST</v-chip>
          <a href="/debug/stablefx/funding-presign">
            Get presign data for funding
          </a>
        </p>
        <p>
          <v-chip small color="primary warning">POST</v-chip>
          <a href="/debug/stablefx/fund">Fund StableFX Trade</a>
        </p>
      </v-card>
    </v-col>
  </v-container>
</template>

<script setup lang="ts"></script>
