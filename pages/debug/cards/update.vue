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
          <v-text-field v-model="formData.cardId" label="Card Id" />

          <v-text-field v-model="formData.cvv" label="CVV" />

          <v-text-field v-model="formData.expiry.month" label="Expiry Month" />

          <v-text-field v-model="formData.expiry.year" label="Expiry Year" />

          <v-text-field
            v-model="formData.billingDetails.firstName"
            label="Billing Details: First Name"
          />
          <v-text-field
            v-model="formData.billingDetails.lastName"
            label="Billing Details: Last Name"
          />
          <v-text-field
            v-model="formData.billingDetails.line1"
            label="Billing Details: Address Line 1"
          />
          <v-text-field
            v-model="formData.billingDetails.line2"
            label="Billing Details: Address Line 2"
          />
          <v-text-field
            v-model="formData.billingDetails.city"
            label="Billing Details: City"
          />
          <v-text-field
            v-model="formData.billingDetails.postalCode"
            label="Billing Details: Postal Code"
          />
          <v-text-field
            v-model="formData.billingDetails.district"
            label="Billing Details: District"
          />
          <v-text-field
            v-model="formData.billingDetails.country"
            label="Billing Details: Country"
          />
          <v-text-field
            v-model="formData.billingDetails.phone"
            label="Billing Details: Phone"
          />
          <v-text-field
            v-model="formData.billingDetails.email"
            label="Billing Details: Email"
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
import openPGP from '@/lib/openpgp'
import RequestInfo from '@/components/RequestInfo.vue'
import ErrorSheet from '@/components/ErrorSheet.vue'
import { getLive } from '@/lib/apiTarget'
import { UpdateCardPayload } from '@/lib/cardsApi'

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
export default class UpdateCardsClass extends Vue {
  // data
  formData = {
    cardId: '',
    cvv: '',
    expiry: {
      month: '',
      year: '',
    },
    billingDetails: {
      firstName: '',
      lastName: '',
      line1: '',
      line2: '',
      city: '',
      postalCode: '',
      district: '',
      country: '',
      phone: '',
      email: '',
    },
  }

  rules = {
    required: (v: string) => !!v || 'Field is required',
    isNumber: (v: string) => !isNaN(parseInt(v)) || 'Please enter valid number',
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
    const { cardId, cvv, expiry, billingDetails } = this.formData

    const cardDetails: {
      cvv?: string
    } = {
      cvv,
    }

    const nullIfEmpty = (prop: string | undefined) => {
      if (prop !== undefined && prop.trim() === '') {
        return undefined
      }
      return prop
    }

    const payload: UpdateCardPayload = {
      expMonth: nullIfEmpty(expiry.month) ? parseInt(expiry.month) : undefined,
      expYear: nullIfEmpty(expiry.year) ? parseInt(expiry.year) : undefined,
      billingDetails: {
        firstName: nullIfEmpty(billingDetails.firstName),
        lastName: nullIfEmpty(billingDetails.lastName),
        line1: nullIfEmpty(billingDetails.line1),
        line2: nullIfEmpty(billingDetails.line2),
        city: nullIfEmpty(billingDetails.city),
        postalCode: nullIfEmpty(billingDetails.postalCode),
        district: nullIfEmpty(billingDetails.district),
        country: nullIfEmpty(billingDetails.country),
        phone: nullIfEmpty(billingDetails.phone),
        email: nullIfEmpty(billingDetails.email),
      },
    }

    try {
      const publicKey = await this.$cardsApi.getPCIPublicKey()
      const encryptedData = await openPGP.encrypt(cardDetails, publicKey)
      const { encryptedMessage, keyId } = encryptedData
      payload.keyId = keyId
      payload.encryptedData = encryptedMessage
      await this.$cardsApi.updateCard(cardId, payload)
    } catch (error) {
      this.error = error
      this.showError = true
    } finally {
      this.loading = false
    }
  }
}
</script>
