<template>
  <v-layout>
    <v-row>
      <v-col cols="12" md="5">
        <v-card :loading="loading" class="mx-auto" outlined>
          <v-list-item three-line>
            <v-list-item-content>
              <Environment />
              <v-list-item-title class="headline mb-1">
                Create Trade Flow
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-card-text>
            <v-form v-if="!showTradeStatus" ref="form" v-model="validForm">
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
                class="mt-4"
                depressed
                block
                color="primary"
                :disabled="!validForm || loading"
                @click.prevent="makeApiCall()"
              >
                Create trade
              </v-btn>
            </v-form>
            <TradeStatus
              v-if="showTradeStatus"
              :quote-id="quoteResponse.id"
              :trade-id="tradeId"
              :from="quoteResponse.from"
              :to="quoteResponse.to"
              :rate="quoteResponse.rate"
              @makeNewTrade="onNewTrade"
              @error="onPollingError"
            />
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="5">
        <div class="pa-4">
          <h1 class="headline">Create trade flow</h1>

          <p class="mt-6">
            Creating a trade through Trade API requires first creating a
            tradable quote which is then used to create the trade.
          </p>
          <p>
            This page demonstrates how the overall trade creation flow works by
            doing both simultaneously.
          </p>
          <p class="subtitle-2">
            You can test the form by entering your personal api key in the
            settings on the right.
          </p>
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
export default class CreateTradeFlowClass extends Vue {
  quoteResponse = {}
  tradeId: string = ''
  validForm: boolean = false
  formData = {
    type: 'tradable',
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
  currencies = ['USDC', 'EURC', 'MXN', 'BRL']
  toCurrencyMap = new Map([
    ['USDC', ['EURC', 'MXN', 'BRL']],
    ['EURC', ['USDC']],
    ['MXN', ['USDC']],
    ['BRL', ['USDC']],
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
      this.quoteResponse = await this.$tradesApi.createQuote(this.formData)
      const { id: tradeId } = await this.$tradesApi.createTrade({
        idempotencyKey: uuidv4(),
        quoteId: this.quoteResponse.id,
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
