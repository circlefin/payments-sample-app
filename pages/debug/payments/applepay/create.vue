<template>
  <v-layout>
    <v-row>
      <v-col cols="12" md="4" v-if="isApplePayAvailable">
        <v-form>
          <v-text-field v-model="formData.shopName" label="Shop Name" />
          <v-text-field v-model="formData.amount" label="Amount" />
          <v-text-field v-model="formData.currency" label="Currency" />
          <v-select
            v-model="formData.lineItemType"
            :items="lineItemTypes"
            label="Line Item Type"
          />
        </v-form>
        <v-btn
          v-if="isApplePayAvailable"
          elevation="24"
          dark
          class="apple-pay-button apple-pay-button-text-pay"
          @click.prevent="doApplePay"
        >
        </v-btn>
      </v-col>
      <v-col
        v-if="!live"
      >
        <v-btn
            outlined
            small
            depressed
            class="mb-7"
            :loading="loading"
            @click.prevent="autogenerateTokenAndConvert()"
        >
        Autogenerate Token and Convert
        </v-btn>
      </v-col>

      <v-col cols="12" md="8">
        <RequestInfo
          :url="requestUrl"
          :payload="payload"
          :response="response"
        />
      </v-col>
    </v-row>
  </v-layout>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import { mapGetters } from 'vuex'
import {
  startApplePaySession,
  DEFAULT_CONFIG,
  applePayAvailable,
} from '@/lib/applePay'
import RequestInfo from '@/components/RequestInfo.vue'
import ErrorSheet from '@/components/ErrorSheet.vue'
import { getLive } from '@/lib/apiTarget'

@Component({
  components: {
    RequestInfo,
    ErrorSheet
  },
  computed: {
    ...mapGetters({
      payload: 'getRequestPayload',
      response: 'getRequestResponse',
      requestUrl: 'getRequestUrl',
      apiKey: 'getApiKey',
    }),
  },
})
export default class CreateApplePayVue extends Vue {
  apiKey!: string
  live: boolean = getLive()
  isApplePayAvailable: boolean = this.live && applePayAvailable()
  lineItemTypes = ['final', 'pending']
  formData = {
    shopName: '',
    amount: '',
    currency: '',
    lineItemType: ''
  }
  loading = false
  showError = false
  error = {}

  doApplePay() {
    startApplePaySession(
      {
        currencyCode: this.formData.currency,
        countryCode: 'US',
        merchantCapabilities: [
          'supports3DS',
          'supportsCredit',
          'supportsDebit',
        ],
        supportedNetworks: [DEFAULT_CONFIG.payments.acceptedCardSchemes],
        shippingType: 'shipping',
        requiredBillingContactFields: [
          'postalAddress',
          'name',
          'phone',
          'email',
        ],
        requiredShippingContactFields: [
          'postalAddress',
          'name',
          'phone',
          'email',
        ],
        total: {
          label: this.formData.shopName,
          amount: this.formData.amount,
          type: this.formData.lineItemType,
        },
      },
      this.apiKey
    )
  }

  async autogenerateTokenAndConvert() {
    this.loading = true
   let tokenData = {
     version: "EC_v1",
     data: Math.random().toString(36).substring(2, 12),
     signature: Math.random().toString(36).substring(2, 12),
     header: {
          ephemeralPublicKey: Math.random().toString(36).substring(2, 12),
          publicKeyHash: Math.random().toString(36).substring(2, 12),
          transactionId: Math.random().toString(36).substring(2, 12)
     }
    }

    try {
      await this.$walletsApi.convertToken('applepay', tokenData)
    } catch (error) {
      this.error = error
      this.showError = true
      this.loading = false
    } finally {
      this.loading = false
    }
  }
}
</script>

<style scoped>
.apple-pay-button {
  width: 250px;
  height: 40px;
  display: inline-block;
  -webkit-appearance: -apple-pay-button;
  cursor: pointer;
}

.apple-pay-button-text-pay {
  -apple-pay-button-type: pay;
}
</style>
