<template>
  <v-container>
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
            variant="flat"
            class="mb-7"
            color="primary"
            :loading="loading"
            :disabled="!validForm || loading"
            @click.prevent="makeApiCall"
          >
            Create Stable FX Quote and Trade
          </v-btn>
          <v-btn
            v-if="!showTradeStatus"
            variant="flat"
            class="mb-7 ml-3"
            color="secondary"
            @click.prevent="onNewTrade"
          >
            New Stable FX Trade
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
          <h3>Stable FX Trade Status</h3>
          <TradeStatus
            :trade-id="tradeId"
            :api-service="$stablefxTradesApi"
            @error="onPollingError"
          />
        </div>
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
import { v4 as uuidv4 } from 'uuid'

const store = useMainStore()
const { $stablefxTradesApi } = useNuxtApp()

const quoteResponse = ref({
  id: '',
  from: { currency: '', amount: 0 },
  to: { currency: '', amount: 0 },
  rate: 0,
})

const tradeId = ref('')
const validForm = ref(false)
const formData = reactive({
  from: {
    amount: '',
    currency: 'USDC',
  },
  to: {
    amount: '',
    currency: '',
  },
})

const showTradeStatus = ref(false)
const error = ref<any>({})
const loading = ref(false)
const showError = ref(false)

const payload = computed(() => store.getRequestPayload)
const response = computed(() => store.getRequestResponse)
const requestUrl = computed(() => store.getRequestUrl)

const required = (v: string) => !!v || 'Field is required'
const isNumber = (v: string) =>
  !v || v === '' || !isNaN(parseInt(v)) || 'Please enter valid number'

const currencies = ['USDC', 'EURC']
const toCurrencyMap = new Map([
  ['USDC', ['EURC']],
  ['EURC', ['USDC']],
])

const onErrorSheetClosed = () => {
  error.value = {}
  showError.value = false
}

const onNewTrade = () => {
  showTradeStatus.value = false
}

const onPollingError = (err: any) => {
  error.value = err
  showError.value = true
}

const makeApiCall = async () => {
  loading.value = true

  try {
    // Convert string amounts to numbers for API call
    const quotePayload = {
      from: {
        ...formData.from,
        amount: formData.from.amount ? Number(formData.from.amount) : undefined,
      },
      to: {
        ...formData.to,
        amount: formData.to.amount ? Number(formData.to.amount) : undefined,
      },
    }

    const quoteApiResponse = await $stablefxTradesApi.createQuote(quotePayload)
    quoteResponse.value = quoteApiResponse.data

    const tradeApiResponse = await $stablefxTradesApi.createTrade({
      idempotencyKey: uuidv4(),
      quoteId: quoteResponse.value.id,
    })
    tradeId.value = tradeApiResponse.data.id
    showTradeStatus.value = true
  } catch (err) {
    error.value = err
    showError.value = true
  } finally {
    loading.value = false
  }
}
</script>
