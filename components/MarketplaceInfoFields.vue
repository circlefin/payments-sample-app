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
          v-model="marketplaceInfo.merchantWallet"
          :value="value.merchantWallet"
          label="Merchant Wallet"
          @input="updateInfo"
        />
      </v-col>
    </v-row>
    <v-row align="center">
      <v-col>
        <v-text-field
          v-model="marketplaceInfo.endUserWallet"
          :value="value.endUserWallet"
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
  merchantWallet: string
  createDate: number
}

@Component
export default class MarketplaceInfoFieldsClass extends Vue {
  @Prop({ type: Object, default: () => {} }) value!: MarketplaceInfo
  loading: boolean = false
  merchants: Merchant[] = []
  merchantsLoading: boolean = true
  marketplaceInfo: MarketplaceInfo = {
    endUserWallet: '',
    merchantId: '',
    merchantWallet: ''
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
      return merchant.merchantWallet
    })
  }

  selectMerchant(value: string) {
    const merchant: Merchant | undefined = this.merchants.find((merchant) => {
      return merchant.merchantWallet === value
    })

    if (merchant) {
      this.marketplaceInfo.merchantId = merchant.merchantId
      this.marketplaceInfo.merchantWallet =
        merchant.merchantWallet
      this.updateInfo()
    }
  }

  @Watch('value', { immediate: true, deep: true })
  onValueChange(value: MarketplaceInfo) {
    this.marketplaceInfo.endUserWallet = value.endUserWallet
    this.marketplaceInfo.merchantId = value.merchantId
    this.marketplaceInfo.merchantWallet = value.merchantWallet
  }

  updateInfo() {
    this.$emit('input', {
      merchantId: this.marketplaceInfo.merchantId,
      merchantWallet: this.marketplaceInfo.merchantWallet,
      endUserWallet: this.marketplaceInfo.endUserWallet
    })
  }

  async makeWalletApiCall() {
    this.loading = true

    try {
      const res = await this.$marketplaceApi.createWallet()
      if (res.number) {
        this.marketplaceInfo.endUserWallet = res.number
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
