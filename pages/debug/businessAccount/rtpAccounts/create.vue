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
            v-model="formData.accountNumber"
            label="Account Number"
          />

          <v-text-field
            v-model="formData.routingNumber"
            label="Routing Number"
            hint="RTN/BIC/Swift code of the bank associated with the account. Required for US accounts"
          />

          <v-text-field
            v-model="formData.billingDetails.name"
            label="Billing Name"
          />

          <v-text-field
            v-model="formData.billingDetails.line1"
            label="Billing Address Line 1"
          />

          <v-text-field
            v-model="formData.billingDetails.line2"
            label="Billing Address Line 2"
          />

          <v-text-field
            v-model="formData.billingDetails.postalCode"
            label="Billing Postalcode"
          />

          <v-text-field
            v-model="formData.billingDetails.city"
            label="Billing City"
          />

          <v-text-field
            v-model="formData.billingDetails.district"
            label="Billing District"
            hint="State / County / Province / Region portion of the address. US and Canada use the two-letter code for the subdivision"
          />

          <v-text-field
            v-model="formData.billingDetails.country"
            label="Billing Country Code"
          />

          <v-btn
            depressed
            color="primary"
            :loading="loading"
            @click.prevent="makeApiCall()"
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
import { getLive } from '@/lib/apiTarget'
import { CreateRTPAccountPayload } from '@/lib/businessAccount/rtpAccountsApi'
import RequestInfo from '@/components/RequestInfo.vue'
import ErrorSheet from '@/components/ErrorSheet.vue'
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
export default class CreateRTPClass extends Vue {
  // data
  formData = {
    beneficiaryName: '',
    accountNumber: '',
    routingNumber: '',
    iban: '',
    billingDetails: {
      name: '',
      city: '',
      country: '',
      line1: '',
      line2: '',
      district: '',
      postalCode: '',
    },
    bankAddress: {
      bankName: '',
      city: '',
      country: '',
      line1: '',
      line2: '',
      district: '',
      postalCode: '',
    },
  }

  rules = {
    isNumber: (v: string) =>
      v === '' || !isNaN(parseInt(v)) || 'Please enter valid number',
    required: (v: string) => !!v || 'Field is required',
  }

  error = {}
  loading = false
  showError = false
  expiryLabels = {
    month: 'Expiry Month',
    year: 'Expiry Year',
  }

  isSandbox: Boolean = !getLive()
  onErrorSheetClosed() {
    this.error = {}
    this.showError = false
  }

  async makeApiCall() {
    this.loading = true
    const { accountNumber, routingNumber, ...data } = this.formData
    const { billingDetails } = data

    const payload: CreateRTPAccountPayload = {
      idempotencyKey: uuidv4(),
      accountNumber,
      routingNumber,
      billingDetails: {
        name: billingDetails.name,
        line1: billingDetails.line1,
        line2: billingDetails.line2,
        city: billingDetails.city,
        district: billingDetails.district,
        country: billingDetails.country,
        postalCode: billingDetails.postalCode,
      },
    }

    try {
      await this.$rtpAccountsApi.createRTPAccount(payload)
    } catch (error: any) {
      this.error = error
      this.showError = true
    } finally {
      this.loading = false
    }
  }
}
</script>
