<template>
  <div>
    <v-text-field
      v-model="walletRefId"
      :value="value.walletRefId"
      label="Wallet RefId"
      @input="updateInfo"
    />
    <v-text-field
      v-model="merchantId"
      :value="value.merchantId"
      label="Merchant Id"
      @input="updateInfo"
    />
    <v-text-field
      v-model="merchantAccountNumber"
      :value="value.merchantAccountNumber"
      label="Merchant Account Number"
      @input="updateInfo"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'nuxt-property-decorator'
import { MarketplaceInfo } from '@/lib/paymentsApi'

@Component
export default class MarketplaceInfoFieldsClass extends Vue {
  @Prop({ type: Object, default: () => {} })
  value!: MarketplaceInfo
  walletRefId = this.value.walletRefId
  merchantId = this.value.merchantId
  merchantAccountNumber = this.value.merchantAccountNumber

  updateInfo() {
    this.$emit('input', {
      merchantId: this.merchantId,
      merchantAccountNumber: this.merchantAccountNumber,
      walletRefId: this.walletRefId
    })
  }
}
</script>
