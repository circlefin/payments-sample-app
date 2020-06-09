<template>
  <div class="mb-6">
    <v-select
      v-if="hasMerchants"
      class="select-input"
      :items="merchantItems"
      label="Select merchant"
      :loading="merchantsLoading"
      @change="selectMerchant"
    ></v-select>
    <v-row class="mt-n4">
      <v-col>
        <v-text-field
          v-model="marketplaceInfo.merchantId"
          :value="value.merchantId"
          label="Merchant Id"
          @input="updateInfo"
        />
      </v-col>
      <v-col>
        <v-text-field
          v-model="marketplaceInfo.merchantWalletId"
          :value="value.merchantWalletId"
          label="Merchant Wallet"
          @input="updateInfo"
        />
      </v-col>
    </v-row>
    <v-row align="center">
      <v-col>
        <v-text-field
          v-model="marketplaceInfo.walletId"
          :value="value.walletId"
          label="End User wallet"
          @input="updateInfo"
        />
      </v-col>
      <v-col>
        <v-btn
          :loading="loading"
          outlined
          small
          @click.prevent="makeWalletApiCall"
        >
          Get wallet
        </v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'nuxt-property-decorator'
import { MarketplaceInfo } from '@/lib/marketplaceApi'

interface Merchant {
  id: string
  marketplaceId: string
  merchantId: string
  merchantWalletId: string
  createDate: number
}

@Component
export default class MarketplaceInfoFieldsClass extends Vue {
  @Prop({ type: Object, default: () => {} }) value!: MarketplaceInfo
  loading: boolean = false
  merchants: Merchant[] = []
  merchantsLoading: boolean = true
  marketplaceInfo: MarketplaceInfo = {
    walletId: '',
    merchantId: '',
    merchantWalletId: '',
  }

  async mounted() {
    try {
      this.merchants = await this.$marketplaceApi.getMerchants()
    } catch (error) {
      // silently fail
    }
    this.merchantsLoading = false
  }

  get hasMerchants() {
    if (this.merchantsLoading) {
      return true
    }
    return this.merchants.length > 0
  }

  get merchantItems() {
    return this.merchants.map((merchant: Merchant) => {
      return merchant.merchantWalletId
    })
  }

  selectMerchant(value: string) {
    const merchant: Merchant | undefined = this.merchants.find((merchant) => {
      return merchant.merchantWalletId === value
    })

    if (merchant) {
      this.marketplaceInfo.merchantId = merchant.merchantId
      this.marketplaceInfo.merchantWalletId = merchant.merchantWalletId
      this.updateInfo()
    }
  }

  @Watch('value', { immediate: true, deep: true })
  onValueChange(value: MarketplaceInfo) {
    this.marketplaceInfo.walletId = value.walletId
    this.marketplaceInfo.merchantId = value.merchantId
    this.marketplaceInfo.merchantWalletId = value.merchantWalletId
  }

  updateInfo() {
    this.$emit('input', {
      merchantId: this.marketplaceInfo.merchantId,
      merchantWalletId: this.marketplaceInfo.merchantWalletId,
      walletId: this.marketplaceInfo.walletId,
    })
  }

  async makeWalletApiCall() {
    this.loading = true

    try {
      const res = await this.$marketplaceApi.createWallet()
      if (res.walletId) {
        this.marketplaceInfo.walletId = res.walletId
        this.updateInfo()
      }
    } catch (error) {
      this.$emit('showError', error)
    } finally {
      this.loading = false
    }
  }
}
</script>

<style scoped></style>
