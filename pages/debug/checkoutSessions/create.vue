<template>
  <v-layout>
    <v-row>
      <v-col cols="12" md="4">
        <v-form>
          <v-text-field
            v-model="formData.successUrl"
            label="Success URL(Optional)"
          />

          <v-text-field
            v-model="formData.amount"
            label="Checkout Session Amount"
          />

          <v-select
            v-model="formData.currency"
            :items="supportedCurrencies"
            label="Checkout Session Currency"
            @change="onCurrencyChange"
          />

          <v-btn
            v-if="currencySelected"
            depressed
            class="mb-7"
            color="primary"
            :loading="loading"
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
import RequestInfo from '@/components/RequestInfo.vue'
import ErrorSheet from '@/components/ErrorSheet.vue'
import { CreateCheckoutSessionPayload } from '~/lib/checkoutSessionsApi'

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
})
export default class CreateCheckoutSessionClass extends Vue {
  formData = {
    successUrl: null,
    amount: '0.00',
    currency: '',
  }

  required = [(v: string) => !!v || 'Field is required']
  error = {}
  loading = false
  showError = false
  supportedCurrencies = ['USD', 'ETH', 'BTC']
  currencySelected = false

  onErrorSheetClosed() {
    this.error = {}
    this.showError = false
  }

  onCurrencyChange() {
    this.currencySelected = true
  }

  async makeApiCall() {
    this.loading = true
    const amountDetail = {
      amount: this.formData.amount,
      currency: this.formData.currency,
    }
    const successUrl = this.formData.successUrl

    const payload: CreateCheckoutSessionPayload = {
      amount: amountDetail,
    }
    if (successUrl) {
      payload.successUrl = successUrl
    }

    try {
      await this.$checkoutSessionsApi.createCheckoutSession(payload)
    } catch (error) {
      this.error = error
      this.showError = true
    } finally {
      this.loading = false
    }
  }
}
</script>
