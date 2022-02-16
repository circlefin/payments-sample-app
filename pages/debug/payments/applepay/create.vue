<template>
    <v-btn
        elevation="24"
        dark
        class="apple-pay-button apple-pay-button-text-pay"
        v-if="isApplePayAvailable"
        @click.prevent="doApplePay"
        >
    </v-btn>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import { startApplePaySession, default_config, applePayAvailable } from '@/lib/applePay'
@Component({})
export default class CreateApplePayVue extends Vue {
    isApplePayAvailable:boolean = applePayAvailable()

    async doApplePay() {
        startApplePaySession({
            currencyCode: default_config.shop.shop_localisation.currencyCode,
            countryCode: default_config.shop.shop_localisation.countryCode,
            merchantCapabilities: [
                'supports3DS',
                'supportsCredit',
                'supportsDebit'
            ],
            supportedNetworks: default_config.payments.acceptedCardSchemes,
            shippingType: 'shipping',
            requiredBillingContactFields: [
                'postalAddress',
                'name',
                'phone',
                'email'
            ],
            requiredShippingContactFields: [
                'postalAddress',
                'name',
                'phone',
                'email'
            ],
            total: {
                label: default_config.shop.shop_name,
                amount: default_config.shop.product_price,
                type: 'final'
            }
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
