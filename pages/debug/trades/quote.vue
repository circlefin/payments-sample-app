<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="4">
        <v-form v-model="validForm">
          <v-select
            v-model="formData.type"
            :items="['tradable', 'reference']"
            label="Type"
          />
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
          <v-select
            v-model="formData.source.type"
            :items="locationTypes"
            label="Source location type (optional)"
            clearable
          />
          <v-text-field
            v-model="formData.source.id"
            label="Source location id (optional)"
          />
          <v-select
            v-model="formData.destination.type"
            :items="locationTypes"
            label="Destination location type (optional)"
            clearable
          />
          <v-text-field
            v-model="formData.destination.id"
            label="Destination location id (optional)"
          />
          <v-btn
            variant="flat"
            class="mb-7"
            color="primary"
            :loading="loading"
            :disabled="!validForm || loading"
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
      @on-change="onErrorSheetClosed"
    />
  </v-container>
</template>

<script setup lang="ts">
import { getAPIHostname } from '~/lib/apiTarget'

const store = useMainStore()
const { $tradesApi } = useNuxtApp()

const validForm = ref(false)
const formData = reactive({
  type: 'tradable',
  from: {
    amount: '',
    currency: 'USDC',
  },
  to: {
    amount: '',
    currency: '',
  },
  source: {
    type: '',
    id: '',
  },
  destination: {
    type: '',
    id: '',
  },
})
const error = ref<any>({})
const loading = ref(false)
const showError = ref(false)
const currencies = ['USDC', 'EURC', 'MXN', 'BRL', 'HKD', 'CNH', 'SGD']
const locationTypes = ['wallet', 'wire', 'pix']
const toCurrencyMap = new Map([
  ['USDC', ['EURC', 'MXN', 'BRL', 'HKD', 'CNH', 'SGD']],
  ['EURC', ['USDC']],
  ['MXN', ['USDC']],
  ['BRL', ['USDC']],
  ['HKD', ['USDC']],
  ['CNH', ['USDC']],
  ['SGD', ['USDC']],
])

const payload = computed(() => store.getRequestPayload)
const response = computed(() => store.getRequestResponse)
const requestUrl = computed(() => store.getRequestUrl)

const required = (v: string) => !!v || 'Field is required'
const isNumber = (v: string) =>
  !v || v === '' || !isNaN(parseInt(v)) || 'Please enter valid number'

const onErrorSheetClosed = () => {
  error.value = {}
  showError.value = false
}

const makeApiCall = async () => {
  loading.value = true

  const payloadData = {
    type: formData.type,
    from: {
      amount: formData.from.amount
        ? parseFloat(formData.from.amount)
        : undefined,
      currency: formData.from.currency,
    },
    to: {
      amount: formData.to.amount ? parseFloat(formData.to.amount) : undefined,
      currency: formData.to.currency,
    },
    source: formData.source.id
      ? { type: formData.source.type, id: formData.source.id }
      : undefined,
    destination: formData.destination.id
      ? { type: formData.destination.type, id: formData.destination.id }
      : undefined,
  }

  try {
    store.setRequestPayload(payloadData)
    store.setRequestUrl(`${getAPIHostname()}/v1/exchange/quotes`)

    const response = await $tradesApi.createQuote(payloadData)
    store.setResponse(response)
  } catch (err) {
    error.value = err
    showError.value = true
  } finally {
    loading.value = false
  }
}
</script>
