<template>
  <v-layout>
    <v-flex>
      <v-card class="body-1 px-6 py-8 mb-4" max-width="800" outlined>
        <h1 class="headline">Welcome to the sample payments application</h1>

        <p class="mt-6">
          This sample web application demonstrates some of the features of the
          <a href="https://www.circle.com/en/developers" target="_blank">
            Circle APIs
          </a>
        </p>

        <p class="font-weight-bold mt-8">This app provides:</p>

        <ul>
          <li>a sample UI implementation of common payments flows</li>
          <li>an api explorer to preview payload and response data</li>
        </ul>
      </v-card>

      <v-card class="body-1 px-6 py-8 mb-4" max-width="800" outlined>
        <h2 class="title">Example UI implementation</h2>

        <p class="mt-2">
          Explore the sample applications using your private api key.
        </p>

        <p class="font-weight-bold mt-6">Make payment UI</p>
        <p class="font-weight-light">
          Example form that combines adding card details and making a payment.
        </p>
        <p>
          <v-btn href="/flow/charge" color="primary"> Charge flow </v-btn>
        </p>

        <p class="font-weight-bold mt-6">Use existing card UI</p>
        <p class="font-weight-light">
          Example form to make payment by selecting a previously added card.
          Card information is only saved in your browser using local storage.
        </p>
        <p>
          <v-btn href="/flow/charge/existing-card" color="primary">
            Select card flow
          </v-btn>
        </p>

        <p class="font-weight-bold mt-6">Add card UI</p>
        <p class="font-weight-light">Simple form to enter card details.</p>

        <p>
          <v-btn href="/flow/card/create" color="primary">
            Add card flow
          </v-btn>
        </p>
      </v-card>

      <v-card class="body-1 px-6 py-8 mb-4" max-width="800" outlined>
        <h2 class="title">API viewer</h2>

        <p class="mt-2">
          Make api calls using your private api key. Explore payload and
          response data in the UI.
        </p>

        <v-btn href="/debug/" color="primary"> API endpoints </v-btn>
      </v-card>

      <v-card class="body-1 px-6 py-8 mb-4" max-width="800" outlined>
        <h2 class="title">Circle API documentation portal</h2>
        <p class="mt-2">
          View API guides and reference documentation, including available
          endpoints and parameters.
        </p>

        <p>
          <v-btn
            href="https://developers.circle.com"
            target="_blank"
            color="primary"
            outlined
          >
            Circle API documentation portal
          </v-btn>
        </p>
      </v-card>
      <v-card class="body-1 px-6 py-8 mb-4" max-width="800" outlined>
        <h2 class="title">Glossary</h2>
        <p class="mt-2">
          These words are commonly used across the app and documentation.
        </p>
        <p>
          <span class="font-weight-bold">Customer:</span> the entity that enters
          an agreement with Circle to gain access to the Payments API (i.e. a
          business).
        </p>
        <p>
          <span class="font-weight-bold">End user:</span> the entity that owns a
          payment method used throughout the API (in other words, a Customer's
          customer).
        </p>
        <p>
          <span class="font-weight-bold">Payment Method:</span> an external
          account that can originate or receive transfers (payments and
          payouts), i.e. a debit or credit card, a bank account, etc. Payment: a
          complex transaction involving fiat funds being transferred from an end
          user's payment method, and depositing an associated amount of
          stablecoin on a wallet.
        </p>
        <p>
          <span class="font-weight-bold">Payout:</span> a complex transaction a
          certain amount of stablecoin from a wallet and transferring the
          associated fiat funds to a payment method Please use the menu on the
          right to configure the api key.
        </p>
      </v-card>
    </v-flex>
  </v-layout>
</template>
