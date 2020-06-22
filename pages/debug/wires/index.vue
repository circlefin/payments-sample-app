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
        <h2 class="title">Accounts endpoints</h2>
        <span class="caption">Requires: api key</span>
        <br /><br />
        <p>
          Api endpoints to manage wire accounts.
        </p>
        <p>
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/wires/details">
            Get wire account details by id
          </a>
        </p>
        <p>
          <v-chip small color="primary">POST</v-chip>
          <a href="/debug/wires/create">
            Create wire account
          </a>
        </p>
      </v-card>
    </v-flex>
  </v-layout>
</template>
