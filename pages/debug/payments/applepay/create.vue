<template>
    <v-btn
        elevation="24"
        dark
        class="apple-pay-button apple-pay-button-text-pay"
        v-on="on"
        @click.prevent="makeApiCall"
        >
    </v-btn>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
@Component({})
export default class CreateApplePayVue extends Vue {
    mounted() {
      let recaptchaScript = document.createElement('script')
      //recaptchaScript.setAttribute('window.a', 'https://applepay.cdn-apple.com/jsapi/v1/apple-pay-sdk.js")
      //document.head.appendChild(recaptchaScript)
      //window
    }
    
    async makeApiCall() {
        alert(ApplePaySession.canMakePayments())
        // alert(applepayjs.ApplePaySession.canMakePayments())
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
