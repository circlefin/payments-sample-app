<!--
 Copyright 2023 Circle Internet Financial, LTD.  All rights reserved.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.

 SPDX-License-Identifier: Apache-2.0
-->

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
export default class PaymentIntentsIndexClass extends Vue {}
</script>
