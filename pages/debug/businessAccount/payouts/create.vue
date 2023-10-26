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
    <v-row>
      <v-col cols="12" md="4">
        <v-form>
          <v-text-field v-model="formData.amount" label="Amount" />

          <v-select
            v-model="formData.currency"
            :items="currencyTypes.get(formData.destinationType)"
            label="Currency"
          />

          <v-text-field
            v-model="formData.destination"
            label="Fiat Account Id"
          />

          <v-select
            v-model="formData.destinationType"
            :items="destinationType"
            label="Fiat Account Type"
          />

          <v-btn
            depressed
            class="mb-7"
            color="primary"
            :loading="loading"
            @click.prevent="makeApiCall"
          >
            Make api call
          </v-btn>
        </v-form>
      </v-col>
      <v-col cols="12" md="8">
        <RequestInfo
          :url="requestUrl"
          :payload="payload"
          :response="response"
        />
      </v-col>
    </v-row>
    <ErrorSheet
      :error="error"
      :show-error="showError"
      @onChange="onErrorSheetClosed"
    />
  </v-layout>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import { mapGetters } from 'vuex'
import { v4 as uuidv4 } from 'uuid'
import RequestInfo from '@/components/RequestInfo.vue'
import ErrorSheet from '@/components/ErrorSheet.vue'
import { CreatePayoutPayload } from '@/lib/businessAccount/payoutsApi'
@Component({
  components: {
    RequestInfo,
    ErrorSheet,
  },
  computed: {
    ...mapGetters({
      payload: 'getRequestPayload',
      response: 'getRequestResponse',
      requestUrl: 'getRequestUrl',
    }),
  },
})
export default class CreatePayoutClass extends Vue {
  formData = {
    idempotencyKey: '',
    amount: '0.00',
    destination: '',
    destinationType: 'wire', // Default to wire
    currency: 'USD', // Default to USD
  }

  required = [(v: string) => !!v || 'Field is required']
  destinationType = ['wire', 'cbit', 'xpay', 'rtp']
  wireCurrencyTypes = ['USD', 'EUR']
  cbitCurrencyTypes = ['USD']
  xpayCurrencyTypes = ['USD']
  rtpCurrencyTypes = ['USD']
  currencyTypes = new Map([
    ['wire', this.wireCurrencyTypes],
    ['cbit', this.cbitCurrencyTypes],
    ['xpay', this.xpayCurrencyTypes],
    ['rtp', this.rtpCurrencyTypes],
  ])

  error = {}
  loading = false
  showError = false
  onErrorSheetClosed() {
    this.error = {}
    this.showError = false
  }

  async makeApiCall() {
    this.loading = true
    const amountDetail = {
      amount: this.formData.amount,
      currency: this.formData.currency,
    }
    const payload: CreatePayoutPayload = {
      idempotencyKey: uuidv4(),
      amount: amountDetail,
      destination: {
        id: this.formData.destination,
        type: this.formData.destinationType,
      },
    }
    try {
      await this.$businessAccountPayoutsApi.createPayout(payload)
    } catch (error) {
      this.error = error
      this.showError = true
    } finally {
      this.loading = false
    }
  }
}
</script>
