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
    startApplePaySessionBackendPay(DEFAULT_CONFIG.payments, this.apiKey)
  }
}
</script>

<style scoped>
@import '~/assets/applePayButton.css';
</style>
