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
          <v-select
            v-model="formData.tenor"
            :items="tenorOption"
            :rules="[required]"
            label="Settlement Tenor"
          />
          <v-btn
            depressed
            class="mb-7"
            color="primary"
            :loading="loading"
            :disabled="!validForm || loading"
            @click.prevent="makeApiCall"
          >
            Make api call
          </v-btn>
          <v-btn
            v-if="quoteId"
            depressed
            class="mb-7 ml-3"
            color="secondary"
            @click.prevent="goToCreateTrade"
          >
            Create Trade from Quote
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
  </v-layout>
</template>

<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid'
import { getAPIHostname } from '~/lib/apiTarget'

const store = useMainStore()
const { $stablefxTradesApi } = useNuxtApp()
const router = useRouter()

const validForm = ref(false)
const quoteId = ref('')
const formData = reactive({
  from: {
    amount: '',
    currency: 'USDC',
  },
  to: {
    amount: '',
    currency: '',
  },
  tenor: '',
})

const tenorOption = [
  { title: 'Instant Settlement', value: 'instant' },
  { title: 'Hourly Settlement', value: 'hourly' },
  { title: 'Daily Settlement', value: 'daily' },
]

const error = ref<any>({})
const loading = ref(false)
const showError = ref(false)
const currencies = ['USDC', 'EURC']
const toCurrencyMap = new Map([
  ['USDC', ['EURC']],
  ['EURC', ['USDC']],
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
    tenor: formData.tenor,
  }

  try {
    store.setRequestPayload(payloadData)
    store.setRequestUrl(`${getAPIHostname()}/v1/stablefx/quotes`)

    const response = await $stablefxTradesApi.createQuote(payloadData)

    // Extract quote ID from response
    if ((response as any)?.id) {
      quoteId.value = (response as any).id
    }
  } catch (err) {
    error.value = err
    showError.value = true
  } finally {
    loading.value = false
  }
}

const goToCreateTrade = () => {
  const idempotencyKey = uuidv4()
  router.push({
    path: '/debug/stablefx/create',
    query: {
      quoteId: quoteId.value,
      idempotencyKey: idempotencyKey,
    },
  })
}
</script>
