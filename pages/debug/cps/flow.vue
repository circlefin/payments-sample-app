<template>
  <v-layout>
    <v-row>
      <v-col cols="12" md="4">
        <v-form v-model="validForm">
          <v-text-field
            v-model="formData.from.amount"
            :rules="[isNumber]"
            label="From amount (Must be present if to amount is not)"
          />
          <v-select
            v-model="formData.from.currency"
            :items="currencies"
            label="From currency"
          />
          <v-text-field
            v-model="formData.to.amount"
            :rules="[isNumber]"
            label="To amount (Must be present if from amount is not)"
          />
          <v-select
            v-model="formData.to.currency"
            :items="toCurrencyMap.get(formData.from.currency)"
            :rules="[required]"
            label="To currency"
          />
          <v-btn
            depressed
            class="mb-7"
            color="primary"
            :loading="loading"
            :disabled="!validForm || loading"
            @click.prevent="makeApiCall"
          >
            Create CPS Quote and Trade
          </v-btn>
          <v-btn
            v-if="!showTradeStatus"
            depressed
            class="mb-7 ml-3"
            color="secondary"
            @click.prevent="onNewTrade"
          >
            New CPS Trade
          </v-btn>
        </v-form>
      </v-col>
      <v-col cols="12" md="8">
        <RequestInfo
          :url="requestUrl"
          :payload="payload"
          :response="response"
        />
        <div v-if="showTradeStatus">
          <v-divider class="my-4" />
          <h3>CPS Trade Status</h3>
          <TradeStatus
            :trade-id="tradeId"
            :api-service="$cpsTradesApi"
            @error="onPollingError"
          />
        </div>
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
import { v4 as uuidv4 } from 'uuid'
import RequestInfo from '@/components/RequestInfo.vue'
import ErrorSheet from '@/components/ErrorSheet.vue'
import TradeStatus from '@/components/TradeStatus.vue'

@Component({
  components: {
    RequestInfo,
    ErrorSheet,
    TradeStatus,
  },
  computed: {
    ...mapGetters({
      payload: 'getRequestPayload',
      response: 'getRequestResponse',
      requestUrl: 'getRequestUrl',
      isMarketplace: 'isMarketplace',
    }),
  },
})
export default class CreateCpsTradeFlowClass extends Vue {
  quoteResponse = {
    id: '',
    from: { currency: '', amount: '' },
    to: { currency: '', amount: '' },
    rate: '',
  }

  tradeId: string = ''
  validForm: boolean = false
  formData = {
    from: {
      amount: '',
      currency: 'USDC',
    },
    to: {
      amount: '',
      currency: '',
    },
  }

  showTradeStatus: boolean = false

  required = (v: string) => !!v || 'Field is required'

  isNumber = (v: string) =>
    !v || v === '' || !isNaN(parseInt(v)) || 'Please enter valid number'

  error = {}
  loading = false
  showError = false
  currencies = ['USDC', 'EURC']
  toCurrencyMap = new Map([
    ['USDC', ['EURC']],
    ['EURC', ['USDC']],
  ])

  onErrorSheetClosed() {
    this.error = {}
    this.showError = false
  }

  onNewTrade() {
    this.showTradeStatus = false
  }

  onPollingError(error: any) {
    this.error = error
    this.showError = true
  }

  async makeApiCall() {
    this.loading = true

    try {
      this.quoteResponse = await this.$cpsTradesApi.createQuote(this.formData)
      const { id: tradeId } = await this.$cpsTradesApi.createTrade({
        idempotencyKey: uuidv4(),
        quoteId: this.quoteResponse.id,
        fulfill: true,
      })
      this.tradeId = tradeId
      this.showTradeStatus = true
    } catch (error) {
      this.error = error
      this.showError = true
    } finally {
      this.loading = false
    }
  }
}
</script>