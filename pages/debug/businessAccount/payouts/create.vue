<template>
  <v-layout>
    <v-row>
      <v-col cols="12" md="4">
        <v-form>
          <v-text-field v-model="formData.amount" label="Amount" />

          <v-select
            v-model="formData.currency"
            :items="currencyTypes.get(formData.destinationType)"
            label="Currency"
          />

          <v-select
            v-model="formData.toCurrency"
            :items="
              toCurrencyTypes.get(formData.currency + formData.destinationType)
            "
            label="To Currency (Optional)"
          />

          <v-text-field
            v-model="formData.destination"
            label="Fiat Account Id"
          />

          <v-select
            v-model="formData.destinationType"
            :items="destinationType"
            label="Transfer Type"
          />

          <v-btn
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
import { v4 as uuidv4 } from 'uuid'
import RequestInfo from '@/components/RequestInfo.vue'
import ErrorSheet from '@/components/ErrorSheet.vue'
import { CreatePayoutPayload } from '@/lib/businessAccount/payoutsApi'
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
    }),
  },
})
export default class CreatePayoutClass extends Vue {
  formData = {
    idempotencyKey: '',
    amount: '0.00',
    destination: '',
    destinationType: 'wire', // Default to wire
    currency: 'USD', // Default to USD
    toCurrency: '',
  }

  required = [(v: string) => !!v || 'Field is required']
  destinationType = ['wire', 'cbit', 'xpay', 'rtp', 'rtgs', 'sepa']
  wireCurrencyTypes = ['USD', 'EUR']
  cbitCurrencyTypes = ['USD']
  xpayCurrencyTypes = ['USD']
  rtpCurrencyTypes = ['USD']
  rtgsCurrencyTypes = ['USD', 'EUR']
  sepaCurrencyTypes = ['EUR']
  fxCurrencyTypes = ['', 'SGD', 'MXN']
  currencyTypes = new Map([
    ['wire', this.wireCurrencyTypes],
    ['cbit', this.cbitCurrencyTypes],
    ['xpay', this.xpayCurrencyTypes],
    ['rtp', this.rtpCurrencyTypes],
    ['rtgs', this.rtgsCurrencyTypes],
    ['sepa', this.sepaCurrencyTypes],
  ])

  toCurrencyTypes = new Map([['USDwire', this.fxCurrencyTypes]])

  error = {}
  loading = false
  showError = false
  onErrorSheetClosed() {
    this.error = {}
    this.showError = false
  }

  async makeApiCall() {
    this.loading = true
    const amountDetail = {
      amount: this.formData.amount,
      currency: this.formData.currency,
    }
    const toAmountDetail = {
      currency: this.formData.toCurrency,
    }
    const payload: CreatePayoutPayload = {
      idempotencyKey: uuidv4(),
      amount: amountDetail,
      destination: {
        id: this.formData.destination,
        type: this.formData.destinationType,
      },
      ...(toAmountDetail.currency && { toAmount: toAmountDetail }),
    }
    try {
      await this.$businessAccountPayoutsApi.createPayout(payload)
    } catch (error) {
      this.error = error
      this.showError = true
    } finally {
      this.loading = false
    }
  }
}
</script>
