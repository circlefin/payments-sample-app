<template>
  <v-layout>
    <v-row>
      <v-col cols="12" md="4">
        <v-form>
          <div v-if="isMarketplace">
            <v-row class="mt-n4">
              <v-col>
                <v-text-field
                  v-model="marketplaceInfo.merchantWalletId"
                  label="Merchant Wallet"
                />
              </v-col>
            </v-row>
            <v-row align="center">
              <v-col>
                <v-text-field
                  v-model="marketplaceInfo.walletId"
                  label="End User wallet"
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
          <v-text-field v-model="formData.settlementId" label="Settlement Id" />
          <v-btn
            depressed
            class="mb-7"
            color="primary"
            :loading="loading"
            @click.prevent="makeApiCall()"
          >
            Make api call
          </v-btn>
        </v-form>
      </v-col>
      <v-col cols="12" md="8">
        <RequestInfo
          :url="requestUrl"
          :payload="payload"
          :response="response"
        />
      </v-col>
    </v-row>
    <ErrorSheet
      :error="error"
      :show-error="showError"
      @onChange="onErrorSheetClosed"
    />
  </v-layout>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import { mapGetters } from 'vuex'
import RequestInfo from '@/components/RequestInfo.vue'
import ErrorSheet from '@/components/ErrorSheet.vue'
import MarketplaceInfoFields from '@/components/MarketplaceInfoFields.vue'

@Component({
  components: {
    RequestInfo,
    ErrorSheet,
    MarketplaceInfoFields
  },
  computed: {
    ...mapGetters({
      payload: 'getRequestPayload',
      response: 'getRequestResponse',
      requestUrl: 'getRequestUrl'
    })
  }
})
export default class FetchSettlementDetailsClass extends Vue {
  // data
  formData = {
    settlementId: ''
  }
  marketplaceInfo = {
    walletId: '',
    merchantWalletId: ''
  }
  required = [(v: string) => !!v || 'Field is required']
  error = {}
  loading = false
  showError = false

  // methods
  onErrorSheetClosed() {
    this.error = {}
    this.showError = false
  }

  get isMarketplace() {
    return this.$store.getters.isMarketplace
  }

  async makeApiCall() {
    this.loading = true
    try {
      await this.$settlementsApi.getSettlementById(
        this.formData.settlementId,
        this.marketplaceInfo.merchantWalletId,
        this.marketplaceInfo.walletId
      )
    } catch (error) {
      this.error = error
      this.showError = true
    } finally {
      this.loading = false
    }
  }

  async makeWalletApiCall() {
    this.loading = true

    try {
      const res = await this.$marketplaceApi.createWallet()
      if (res.walletId) {
        this.marketplaceInfo.walletId = res.walletId
      }
    } catch (error) {
      this.$emit('showError', error)
    } finally {
      this.loading = false
    }
  }
}
</script>
