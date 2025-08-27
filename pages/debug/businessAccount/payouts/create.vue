<template>
  <v-container>
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
            variant="flat"
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
  </v-container>
</template>

<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid'
import type { CreatePayoutPayload } from '@/lib/businessAccount/payoutsApi'

const store = useMainStore()
const { $businessAccountPayoutsApi } = useNuxtApp()

const formData = reactive({
  idempotencyKey: '',
  amount: '0.00',
  destination: '',
  destinationType: 'wire',
  currency: 'USD',
  toCurrency: '',
})

const error = ref<any>({})
const loading = ref(false)
const showError = ref(false)

const payload = computed(() => store.getRequestPayload)
const response = computed(() => store.getRequestResponse)
const requestUrl = computed(() => store.getRequestUrl)

const required = [(v: string) => !!v || 'Field is required']
const destinationType = ['wire', 'cbit', 'xpay', 'rtp', 'rtgs', 'sepa', 'pix']
const wireCurrencyTypes = ['USD', 'EUR']
const cbitCurrencyTypes = ['USD']
const xpayCurrencyTypes = ['USD']
const rtpCurrencyTypes = ['USD']
const rtgsCurrencyTypes = ['USD', 'EUR']
const sepaCurrencyTypes = ['EUR']
const pixCurrencyTypes = ['USD']
const fxCurrencyTypes = ['', 'SGD', 'MXN']
const pixFxCurrencyTypes = ['BRL']

const currencyTypes = new Map([
  ['wire', wireCurrencyTypes],
  ['cbit', cbitCurrencyTypes],
  ['xpay', xpayCurrencyTypes],
  ['rtp', rtpCurrencyTypes],
  ['rtgs', rtgsCurrencyTypes],
  ['sepa', sepaCurrencyTypes],
  ['pix', pixCurrencyTypes],
])

const toCurrencyTypes = new Map([
  ['USDwire', fxCurrencyTypes],
  ['USDpix', pixFxCurrencyTypes],
])

const onErrorSheetClosed = () => {
  error.value = {}
  showError.value = false
}

const makeApiCall = async () => {
  loading.value = true
  const amountDetail = {
    amount: formData.amount,
    currency: formData.currency,
  }
  const toAmountDetail = {
    currency: formData.toCurrency,
  }
  const payloadData: CreatePayoutPayload = {
    idempotencyKey: uuidv4(),
    amount: amountDetail,
    destination: {
      id: formData.destination,
      type: formData.destinationType,
    },
    ...(toAmountDetail.currency && { toAmount: toAmountDetail }),
  }
  try {
    await $businessAccountPayoutsApi.createPayout(payloadData)
  } catch (err) {
    error.value = err
    showError.value = true
  } finally {
    loading.value = false
  }
}
</script>
