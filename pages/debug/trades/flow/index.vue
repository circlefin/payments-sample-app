<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="5">
        <v-card :loading="loading" class="mx-auto" outlined>
          <v-list-item three-line>
            <v-list-item-content>
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
              <v-checkbox v-model="fulfill" label="Fulfill" />
              <v-btn
                class="mt-4"
                variant="flat"
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
              :fulfill="fulfill"
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
  </v-container>
</template>

<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid'

const store = useMainStore()
const { $tradesApi } = useNuxtApp()

const quoteResponse = ref({
  id: '',
  from: { currency: '', amount: 0 },
  to: { currency: '', amount: 0 },
  rate: 0,
})

const fulfill = ref(true)
const tradeId = ref('')
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

const currencies = ['USDC', 'EURC', 'MXN', 'BRL']
const toCurrencyMap = new Map([
  ['USDC', ['EURC', 'MXN', 'BRL']],
  ['EURC', ['USDC']],
  ['MXN', ['USDC']],
  ['BRL', ['USDC']],
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
      ...formData,
      from: {
        ...formData.from,
        amount: formData.from.amount ? Number(formData.from.amount) : undefined,
      },
      to: {
        ...formData.to,
        amount: formData.to.amount ? Number(formData.to.amount) : undefined,
      },
    }

    const quoteApiResponse = await $tradesApi.createQuote(quotePayload)
    quoteResponse.value = quoteApiResponse.data

    const tradeApiResponse = await $tradesApi.createTrade({
      idempotencyKey: uuidv4(),
      quoteId: quoteResponse.value.id,
      fulfill: fulfill.value,
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
