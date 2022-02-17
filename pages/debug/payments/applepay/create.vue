<template>
  <div>
    <v-text-field v-model="amountFormatted" :rules="rules" />

    <v-btn
      elevation="24"
      dark
      class="apple-pay-button apple-pay-button-text-pay"
      v-if="isApplePayAvailable"
      @click.prevent="doApplePay"
    >
    </v-btn>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'nuxt-property-decorator'
import {
  startApplePaySession,
  default_config,
  applePayAvailable,
} from '@/lib/applePay'
@Component({})
export default class CreateApplePayVue extends Vue {
  @Prop({ type: String, default: '' }) value!: string

  amountFormatted: string = '0.00'

  ruleFunctions = {
    positive: (v: string) => {
      return parseFloat(v) > 0 || 'Please enter a positive amount'
    },
    isCurrency: (v: string) => {
      const amount = v.trim()
      return (
        /^[0-9]+(.[0-9]{1,2})?$/.test(amount) || 'Please enter valid amount'
      )
    },
    isNumber: (v: string) => {
      return !isNaN(parseInt(v)) || 'Please enter valid amount'
    },
    isRequired: (v: string) => {
      return v.trim() !== '' || 'Please enter an amount'
    },
  }

  get rules() {
    return [
      this.ruleFunctions.isRequired,
      this.ruleFunctions.isNumber,
      this.ruleFunctions.isCurrency,
      this.ruleFunctions.positive,
    ]
  }

  @Watch('amountFormatted', { immediate: true })
  amountFormattedChange(value: string) {
    this.amountFormatted = this.format(value)
    this.$emit('input', this.amountFormatted)
  }

  @Watch('value', { immediate: true })
  valueChange(value: string) {
    this.amountFormatted = this.format(value)
  }

  format(value: string) {
    if (!value) {
      return ''
    }

    return value
  }

  isApplePayAvailable: boolean = applePayAvailable()

  async doApplePay() {
    startApplePaySession({
      currencyCode: default_config.shop.shop_localisation.currencyCode,
      countryCode: default_config.shop.shop_localisation.countryCode,
      merchantCapabilities: ['supports3DS', 'supportsCredit', 'supportsDebit'],
      supportedNetworks: default_config.payments.acceptedCardSchemes,
      shippingType: 'shipping',
      requiredBillingContactFields: ['postalAddress', 'name', 'phone', 'email'],
      requiredShippingContactFields: [
        'postalAddress',
        'name',
        'phone',
        'email',
      ],
      total: {
        label: default_config.shop.shop_name,
        amount: default_config.shop.product_price,
        type: 'final',
      },
    })
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
