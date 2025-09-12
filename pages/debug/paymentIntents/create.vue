<template>
  <v-container>
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
            @update:model-value="onCurrencyChange"
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
            @update:model-value="onIntentTypeChange"
          />
          <v-text-field
            v-if="currencySelected && transientIntentSelected"
            v-model="formData.expiresOn"
            label="Expires On"
          />

          <v-text-field
            v-model="formData.merchantWalletId"
            label="Merchant Wallet Id"
          />

          <v-btn
            variant="flat"
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
      @on-change="onErrorSheetClosed"
    />
  </v-container>
</template>

<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid'
import type {
  CreateContinuousPaymentIntentPayload,
  CreateTransientPaymentIntentPayload,
} from '@/lib/paymentIntentsApi'
import { isNumber, required, validDecimal } from '@/helpers/validation'

interface CurrencyBlockchainPair {
  currency: string
  blockchains: string[]
}

const store = useMainStore()
const { $cryptoPaymentMetadataApi, $paymentIntentsApi } = useNuxtApp()

const isFormValid = ref(false)
const formData = reactive({
  idempotencyKey: '',
  amount: '',
  currency: '',
  merchantWalletId: '',
  settlementCurrency: '',
  blockchain: '',
  expiresOn: '',
  type: 'transient',
})

const rules = {
  isNumber,
  required,
  validDecimal,
}

const error = ref<any>({})
const loading = ref(false)
const showError = ref(false)
const currencyBlockchainPairs = ref<CurrencyBlockchainPair[]>([])
const supportedCurrencies = ref([''])
const supportedChains = ref([''])
const currencySelected = ref(false)
const transientIntentSelected = ref(true)
const continuousIntentSelected = ref(false)
const intentTypes = ['continuous', 'transient']

const payload = computed(() => store.getRequestPayload)
const response = computed(() => store.getRequestResponse)
const requestUrl = computed(() => store.getRequestUrl)

onMounted(async () => {
  currencyBlockchainPairs.value =
    await $cryptoPaymentMetadataApi.getSupportedCurrencyAndBlockchainCombinations()
  supportedCurrencies.value = currencyBlockchainPairs.value.map((obj) => {
    return obj.currency
  })
})

const onErrorSheetClosed = () => {
  error.value = {}
  showError.value = false
}

const onCurrencyChange = () => {
  supportedChains.value =
    currencyBlockchainPairs.value.find(
      ({ currency }) => currency === formData.currency,
    )?.blockchains ?? []
  formData.blockchain = ''
  currencySelected.value = true
}

const onIntentTypeChange = () => {
  if (formData.type === 'continuous') {
    continuousIntentSelected.value = true
    transientIntentSelected.value = false
  } else if (formData.type === 'transient') {
    continuousIntentSelected.value = false
    transientIntentSelected.value = true
  }
}

const makeApiCall = async () => {
  loading.value = true
  const blockchainPaymentMethod = {
    type: 'blockchain',
    chain: formData.blockchain,
  }
  if (transientIntentSelected.value) {
    const amountDetail = {
      amount: formData.amount,
      currency: formData.currency,
    }

    const payloadData: CreateTransientPaymentIntentPayload = {
      idempotencyKey: uuidv4(),
      amount: amountDetail,
      settlementCurrency: formData.settlementCurrency,
      paymentMethods: [blockchainPaymentMethod],
      expiresOn: formData.expiresOn,
    }

    if (formData.merchantWalletId !== '') {
      payloadData.merchantWalletId = formData.merchantWalletId
    }

    try {
      await $paymentIntentsApi.createTransientPaymentIntent(payloadData)
    } catch (err) {
      error.value = err
      showError.value = true
    } finally {
      loading.value = false
    }
  } else if (continuousIntentSelected.value) {
    const payloadData: CreateContinuousPaymentIntentPayload = {
      idempotencyKey: uuidv4(),
      currency: formData.currency,
      settlementCurrency: formData.settlementCurrency,
      paymentMethods: [blockchainPaymentMethod],
      type: formData.type,
    }

    if (formData.merchantWalletId !== '') {
      payloadData.merchantWalletId = formData.merchantWalletId
    }

    try {
      await $paymentIntentsApi.createContinuousPaymentIntent(payloadData)
    } catch (err) {
      error.value = err
      showError.value = true
    } finally {
      loading.value = false
    }
  }
}
</script>
