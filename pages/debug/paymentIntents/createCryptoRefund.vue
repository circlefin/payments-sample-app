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
          <v-text-field
            v-model="formData.paymentIntentId"
            label="Payment Intent ID"
          />

          <v-text-field
            v-model="formData.fromCurrency"
            label="Source Currency"
          />

          <v-text-field v-model="formData.toAmount" label="Refund Amount" />

          <v-text-field v-model="formData.toCurrency" label="Refund Currency" />

          <v-text-field
            v-model="formData.address"
            label="Destination Address"
          />

          <v-text-field
            v-model="formData.blockchain"
            label="Destination Blockchain"
          />

          <v-btn
            v-if="!!formData.paymentIntentId"
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
import { CreateCryptoRefundPayload } from '@/lib/paymentIntentsApi'

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
      isMarketplace: 'isMarketplace',
    }),
  },
})
export default class CreatePaymentIntentClass extends Vue {
  formData = {
    paymentIntentId: '',
    idempotencyKey: '',
    fromCurrency: '',
    toAmount: '',
    toCurrency: '',
    blockchain: '',
    address: '',
  }

  required = [(v: string) => !!v || 'Field is required']
  error = {}
  loading = false
  showError = false

  onErrorSheetClosed() {
    this.error = {}
    this.showError = false
  }

  async makeApiCall() {
    this.loading = true
    const fromAmountDetail = {
      currency: this.formData.fromCurrency,
    }
    const toAmountDetail = {
      amount: this.formData.toAmount,
      currency: this.formData.toCurrency,
    }

    const payload: CreateCryptoRefundPayload = {
      idempotencyKey: uuidv4(),
      destination: {
        chain: this.formData.blockchain,
        address: this.formData.address,
      },
      amount: fromAmountDetail,
      toAmount: toAmountDetail,
    }
    try {
      await this.$paymentIntentsApi.createCryptoRefund(
        this.formData.paymentIntentId,
        payload
      )
    } catch (error) {
      this.error = error
      this.showError = true
    } finally {
      this.loading = false
    }
  }
}
</script>
