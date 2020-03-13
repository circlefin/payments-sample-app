<template>
  <div>
    <v-text-field
      v-model="marketplaceInfo.walletAccountNumber"
      :value="value.walletAccountNumber"
      label="Enduser wallet"
      @input="updateInfo"
    />
    <v-btn :loading="loading" small @click.prevent="makeApiCall">
      Get wallet
    </v-btn>

    <v-text-field
      v-model="marketplaceInfo.merchantId"
      class="mt-8"
      :value="value.merchantId"
      label="Merchant Id"
      @input="updateInfo"
    />
    <v-text-field
      v-model="marketplaceInfo.merchantAccountNumber"
      :value="value.merchantAccountNumber"
      label="Merchant Account Number"
      @input="updateInfo"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'nuxt-property-decorator'
import { MarketplaceInfo } from '@/lib/marketplaceApi'

@Component
export default class MarketplaceInfoFieldsClass extends Vue {
  @Prop({ type: Object, default: () => {} })
  value!: MarketplaceInfo
  @Prop({ type: Boolean, default: false })
  loading!: boolean

  marketplaceInfo: MarketplaceInfo = {
    walletAccountNumber: '',
    merchantId: '',
    merchantAccountNumber: ''
  }

  @Watch('value', { immediate: true, deep: true })
  onValueChange(value: MarketplaceInfo) {
    this.marketplaceInfo.walletAccountNumber = value.walletAccountNumber
    this.marketplaceInfo.merchantId = value.merchantId
    this.marketplaceInfo.merchantAccountNumber = value.merchantAccountNumber
  }

  updateInfo() {
    this.$emit('input', {
      merchantId: this.marketplaceInfo.merchantId,
      merchantAccountNumber: this.marketplaceInfo.merchantAccountNumber,
      walletAccountNumber: this.marketplaceInfo.walletAccountNumber
    })
  }

  makeApiCall() {
    this.$emit('fetch-wallet')
  }
}
</script>
