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
        <h2 class="title">Cards endpoints</h2>
        <span class="caption">Requires: api key</span>
        <br /><br />
        <p>
          Api endpoints to manage cards:
        </p>

        <p>
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/cards/fetch">Get all cards</a>
        </p>
        <p>
          <v-chip small color="primary">GET</v-chip>

          <a href="/debug/cards/details">
            Get card details by id
          </a>
        </p>
        <p>
          <v-chip small color="primary warning">POST</v-chip>
          <a href="/debug/cards/create">
            Add card
          </a>
        </p>
        <p>
          <v-chip small color="primary accent">PUT</v-chip>
          <a href="/debug/cards/update">
            Update card details
          </a>
        </p>
      </v-card>

      <v-card class="body-1 px-6 py-8 mb-4" max-width="800" outlined>
        <h2 class="title">Payments endpoints</h2>
        <span class="caption">Requires: api key</span>
        <br /><br />
        <p>
          Api endpoints to manage payments.
        </p>

        <p>
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/payments/fetch">
            Get all payments
          </a>
        </p>
        <p>
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/payments/details">
            Get payment details by id
          </a>
        </p>
        <p>
          <v-chip small color="primary warning">POST</v-chip>
          <a href="/debug/payments/create">Make payment</a>
        </p>
        <p>
          <v-chip small color="primary warning">POST</v-chip>
          <a href="/debug/payments/cancel">
            Cancel payment
          </a>
        </p>
        <p>
          <v-chip small color="primary warning">POST</v-chip>
          <a href="/debug/payments/refund">
            Refund payment
          </a>
        </p>
      </v-card>
    </v-flex>
  </v-layout>
</template>
