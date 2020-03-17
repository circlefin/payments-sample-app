<template>
  <div class="mb-6">
    <v-row align="center">
      <v-col>
        <v-text-field
          v-model="marketplaceInfo.merchantId"
          :value="value.merchantId"
          label="Merchant Id"
          @input="updateInfo"
        />

        <v-text-field
          v-model="marketplaceInfo.merchantAccountNumber"
          :value="value.merchantAccountNumber"
          label="Merchant Account"
          @input="updateInfo"
        />
      </v-col>
      <v-col v-if="hasMerchants">
        <v-select
          :items="merchantItems"
          label="Select merchant"
          dense
          outlined
          @change="selectMerchant"
        ></v-select>
      </v-col>
    </v-row>

    <v-row align="center">
      <v-col>
        <v-text-field
          v-model="marketplaceInfo.walletAccountNumber"
          :value="value.walletAccountNumber"
          label="Enduser wallet"
          @input="updateInfo"
        />
      </v-col>
      <v-col>
        <v-btn :loading="loading" outlined @click.prevent="makeWalletApiCall">
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
  merchantAccountNumber: string
  createDate: number
}

@Component
export default class MarketplaceInfoFieldsClass extends Vue {
  @Prop({ type: Object, default: () => {} }) value!: MarketplaceInfo
  loading: boolean = false
  merchants: Merchant[] = []

  marketplaceInfo: MarketplaceInfo = {
    walletAccountNumber: '',
    merchantId: '',
    merchantAccountNumber: ''
  }

  async mounted() {
    try {
      this.merchants = await this.$marketplaceApi.getMerchants()
    } catch (error) {
      // silently fail
    }
  }

  get hasMerchants() {
    return this.merchants.length > 0
  }

  get merchantItems() {
    return this.merchants.map((merchant: Merchant) => {
      return merchant.merchantAccountNumber
    })
  }

  selectMerchant(value: string) {
    const merchant: Merchant | undefined = this.merchants.find((merchant) => {
      return merchant.merchantAccountNumber === value
    })

    if (merchant) {
      this.marketplaceInfo.merchantId = merchant.merchantId
      this.marketplaceInfo.merchantAccountNumber =
        merchant.merchantAccountNumber
    }
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

  async makeWalletApiCall() {
    this.loading = true

    try {
      const res = await this.$marketplaceApi.getWallet()
      if (res.number) {
        this.marketplaceInfo.walletAccountNumber = res.number
      }
    } catch (error) {
      this.$emit('showError', error)
    } finally {
      this.loading = false
    }
  }
}
</script>
