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
      </v-card>

      <v-card class="body-1 px-6 py-8 mb-4" max-width="800" outlined>
        <h2 class="title">Checkout Sessions endpoints</h2>
        <span class="caption">Requires: api key</span>
        <br /><br />
        <p>Api endpoints to manage checkout sessions.</p>
        <p>
          <v-chip small color="primary warning">POST</v-chip>
          <a href="/debug/checkoutSessions/create"
            >Create a checkout session
          </a>
        </p>
        <p>
          <v-chip small color="primary warning">GET</v-chip>
          <a href="/debug/checkoutSessions/fetch">Get all checkout sessions </a>
        </p>
        <p>
          <v-chip small color="primary warning">POST</v-chip>
          <a href="/debug/checkoutSessions/extend">
            Extend a checkout session
          </a>
        </p>
        <p>
          <v-chip small color="primary">GET</v-chip>
          <a href="/debug/checkoutSessions/details">
            Get checkout session details by id
          </a>
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
export default class CheckoutSessionsIndexClass extends Vue {}
</script>
