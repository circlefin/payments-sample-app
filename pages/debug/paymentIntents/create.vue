<template>
  <v-layout>
    <v-row>
      <v-col cols="12" md="4">
        <v-form v-model="isFormValid">
          <v-text-field
            v-if="transientIntentSelected"
            v-model="formData.amount"
            label="Payment Intent Amount"
            :rules="[rules.isNumber, rules.validDecimal, rules.required]"
          />

          <v-select
            v-model="formData.currency"
            :items="supportedCurrencies"
            label="Payment Currency"
            @change="onCurrencyChange"
          />

          <v-select
            v-if="currencySelected"
            v-model="formData.blockchain"
            :items="supportedChains"
            :rules="[rules.required]"
            label="Blockchain"
          />

          <v-select
            v-if="currencySelected"
            v-model="formData.settlementCurrency"
            :items="supportedCurrencies"
            :rules="[rules.required]"
            label="Settlement Currency"
          />

          <header>Optional params:</header>

          <v-select
            v-model="formData.type"
            :items="intentTypes"
            label="Payment Intent Type"
            @change="onIntentTypeChange"
          />
          <v-text-field
            v-if="currencySelected && transientIntentSelected"
            v-model="formData.expiresOn"
            label="Expires On"
          />

          <v-btn
            v-if="currencySelected"
            depressed
            class="mb-7"
            color="primary"
            :loading="loading"
            :disabled="!isFormValid"
            @click.prevent="makeApiCall"
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
import { v4 as uuidv4 } from 'uuid'
import RequestInfo from '@/components/RequestInfo.vue'
import ErrorSheet from '@/components/ErrorSheet.vue'
import {
  CreateContinuousPaymentIntentPayload,
  CreateTransientPaymentIntentPayload,
} from '@/lib/paymentIntentsApi'
import { isNumber, required, validDecimal } from '@/helpers/validation'

interface CurrencyBlockchainPair {
  currency: string
  blockchains: string[]
}

@Component({
  components: {
    RequestInfo,
    ErrorSheet,
  },
  computed: {
    ...mapGetters({
      payload: 'getRequestPayload',
      response: 'getRequestResponse',
      requestUrl: 'getRequestUrl',
      isMarketplace: 'isMarketplace',
    }),
  },
  data: () => ({
    isFormValid: false,
  }),
})
export default class CreatePaymentIntentClass extends Vue {
  formData = {
    idempotencyKey: '',
    amount: '',
    currency: '',
    settlementCurrency: '',
    blockchain: '',
    expiresOn: '',
    type: 'transient',
  }

  // validation rules
  rules = {
    isNumber,
    required,
    validDecimal,
  }

  error = {}
  loading = false
  showError = false
  currencyBlockchainPairs: CurrencyBlockchainPair[] = []
  supportedCurrencies = ['']
  supportedChains = ['']
  currencySelected = false
  transientIntentSelected = true
  continuousIntentSelected = false
  intentTypes = ['continuous', 'transient']

  async mounted() {
    this.currencyBlockchainPairs =
      await this.$cryptoPaymentMetadataApi.getSupportedCurrencyAndBlockchainCombinations()
    this.supportedCurrencies = this.currencyBlockchainPairs.map((obj) => {
      return obj.currency
    })
  }

  onErrorSheetClosed() {
    this.error = {}
    this.showError = false
  }

  onCurrencyChange() {
    this.supportedChains =
      this.currencyBlockchainPairs.find(
        ({ currency }) => currency === this.formData.currency
      )?.blockchains ?? []
    this.formData.blockchain = ''
    this.currencySelected = true
  }

  onIntentTypeChange() {
    if (this.formData.type === 'continuous') {
      this.continuousIntentSelected = true
      this.transientIntentSelected = false
    } else if (this.formData.type === 'transient') {
      this.continuousIntentSelected = false
      this.transientIntentSelected = true
    }
  }

  async makeApiCall() {
    this.loading = true
    const blockchainPaymentMethod = {
      type: 'blockchain',
      chain: this.formData.blockchain,
    }
    if (this.transientIntentSelected) {
      const amountDetail = {
        amount: this.formData.amount,
        currency: this.formData.currency,
      }

      const payload: CreateTransientPaymentIntentPayload = {
        idempotencyKey: uuidv4(),
        amount: amountDetail,
        settlementCurrency: this.formData.settlementCurrency,
        paymentMethods: [blockchainPaymentMethod],
        expiresOn: this.formData.expiresOn,
      }
      try {
        await this.$paymentIntentsApi.createTransientPaymentIntent(payload)
      } catch (error) {
        this.error = error
        this.showError = true
      } finally {
        this.loading = false
      }
    } else if (this.continuousIntentSelected) {
      const payload: CreateContinuousPaymentIntentPayload = {
        idempotencyKey: uuidv4(),
        currency: this.formData.currency,
        settlementCurrency: this.formData.settlementCurrency,
        paymentMethods: [blockchainPaymentMethod],
        type: this.formData.type,
      }
      try {
        await this.$paymentIntentsApi.createContinuousPaymentIntent(payload)
      } catch (error) {
        this.error = error
        this.showError = true
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
