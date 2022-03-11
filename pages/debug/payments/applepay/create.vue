<template>
  <v-btn
    v-if="isApplePayAvailable"
    elevation="24"
    dark
    class="apple-pay-button apple-pay-button-text-pay"
    @click.prevent="doApplePay"
  >
  </v-btn>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import { mapGetters } from 'vuex'
import {
  DEFAULT_CONFIG,
  applePayAvailable,
  startApplePaySessionBackendPay,
} from '@/lib/applePay'
@Component({
  computed: {
    ...mapGetters({
      apiKey: 'getApiKey',
    }),
  },
})
export default class CreateApplePayVue extends Vue {
  apiKey!: string

  isApplePayAvailable: boolean = applePayAvailable()

  doApplePay() {
    startApplePaySessionBackendPay(
      {
        currencyCode: DEFAULT_CONFIG.shop.shop_localisation.currencyCode,
        countryCode: DEFAULT_CONFIG.shop.shop_localisation.countryCode,
        merchantCapabilities: [
          'supports3DS',
          'supportsCredit',
          'supportsDebit',
        ],
        supportedNetworks: DEFAULT_CONFIG.payments.acceptedCardSchemes,
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
          label: DEFAULT_CONFIG.shop.shop_name,
          amount: DEFAULT_CONFIG.shop.product_price,
          type: 'final',
        },
      },
      this.apiKey
    )
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
