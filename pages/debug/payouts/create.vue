<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="4">
        <v-form>
          <v-text-field v-model="formData.amount" label="Amount" />

          <v-select
            v-model="formData.currency"
            :items="Array.from(supportedCryptoPayoutCurrencyPairs.keys())"
            label="Currency"
            @change="onCurrencyChange"
          />

          <v-select
            v-model="formData.toCurrency"
            :items="supportedCryptoPayoutCurrencyPairs.get(formData.currency)"
            label="To Currency"
          />

          <v-text-field
            v-model="formData.sourceWalletId"
            label="Optional Source Wallet Id"
          />

          <v-text-field v-model="formData.destination" label="Destination" />

          <v-select
            v-model="formData.destinationType"
            :items="destinationType"
            label="Destination Type"
            @change="onDestinationTypeChange"
          />

          <v-text-field
            v-model="formData.beneficiaryEmail"
            label="Beneficiary Email"
          />

          <br />

          <div v-if="sourceWalletIdNotEmpty()">
            <header>Optional Identity:</header>
            <br />

            <v-select
              v-model="formData.identityType"
              :items="identityTypes"
              label="Identity Type"
            />

            <v-text-field
              v-model="formData.identityName"
              label="Identity Name"
            />

            <v-text-field
              v-model="formData.identityAddressLine1"
              label="Identity Address Line 1"
            />

            <v-text-field
              v-model="formData.identityAddressLine2"
              label="Identity Address Line 2"
            />

            <v-text-field
              v-model="formData.identityAddressCity"
              label="Identity Address City"
            />

            <v-text-field
              v-model="formData.identityAddressDistrict"
              label="Identity Address District"
            />

            <v-text-field
              v-model="formData.identityAddressPostalCode"
              label="Identity Address Postal Code"
            />

            <v-text-field
              v-model="formData.identityAddressCountry"
              label="Identity Address Country"
            />
          </div>

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
import type { CreatePayoutPayload } from '~/lib/payoutsApi'

const store = useMainStore()
const { $payoutsApi } = useNuxtApp()

const formData = reactive({
  sourceWalletId: '',
  idempotencyKey: '',
  amount: '0.00',
  currency: 'USD',
  toCurrency: 'USD',
  destination: '',
  destinationType: 'address_book',
  beneficiaryEmail: '',
  identityType: 'individual',
  identityName: '',
  identityAddressLine1: '',
  identityAddressLine2: '',
  identityAddressCity: '',
  identityAddressDistrict: '',
  identityAddressPostalCode: '',
  identityAddressCountry: '',
})

const required = [(v: string) => !!v || 'Field is required']
const destinationType = ['address_book']
const blockchainDestinationTypes = new Set(['address_book'])
const identityTypes = ['individual', 'business']
const supportedCryptoPayoutCurrencyPairs = new Map([
  ['USD', ['USD', 'BTC', 'ETH', 'MATIC']],
  ['BTC', ['USD', 'BTC']],
  ['ETH', ['USD', 'ETH']],
  ['MATIC', ['USD', 'MATIC']],
  ['FLOW', ['FLOW']],
  ['MANA', ['MANA']],
  ['EUR', ['EUR']],
])

const error = ref<any>({})
const loading = ref(false)
const showError = ref(false)

const payload = computed(() => store.getRequestPayload)
const response = computed(() => store.getRequestResponse)
const requestUrl = computed(() => store.getRequestUrl)

const sourceWalletIdNotEmpty = () => {
  return formData.sourceWalletId.length > 0
}

const hasIdentity = () => {
  return (
    formData.identityAddressLine1 ||
    formData.identityAddressLine2 ||
    formData.identityAddressCity ||
    formData.identityAddressDistrict ||
    formData.identityAddressPostalCode ||
    formData.identityAddressCountry ||
    formData.identityName
  )
}

const onCurrencyChange = () => {
  const supportedToCurrencies = supportedCryptoPayoutCurrencyPairs.get(
    formData.currency,
  )
  formData.toCurrency = supportedToCurrencies ? supportedToCurrencies[0] : ''
}

const onDestinationTypeChange = () => {
  formData.currency = Array.from(supportedCryptoPayoutCurrencyPairs.keys())[0]
  onCurrencyChange()
  resetIdentities()
}

const resetIdentities = () => {
  formData.identityAddressLine1 = ''
  formData.identityAddressLine2 = ''
  formData.identityAddressCountry = ''
  formData.identityAddressCity = ''
  formData.identityAddressDistrict = ''
  formData.identityName = ''
  formData.identityAddressPostalCode = ''
}

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
  const identityAddressObject = {
    line1: formData.identityAddressLine1,
    line2: formData.identityAddressLine2,
    city: formData.identityAddressCity,
    district: formData.identityAddressDistrict,
    postalCode: formData.identityAddressPostalCode,
    country: formData.identityAddressCountry,
  }
  const identityObject = {
    type: formData.identityType,
    name: formData.identityName,
    addresses: [identityAddressObject],
  }

  const identities = hasIdentity() && {
    identities: [identityObject],
  }

  const sourceObject = {
    id: formData.sourceWalletId,
    type: 'wallet',
    ...identities,
  }

  const payloadData: CreatePayoutPayload = {
    idempotencyKey: uuidv4(),
    amount: amountDetail,
    destination: {
      id: formData.destination,
      type: formData.destinationType,
    },
  }

  if (formData.sourceWalletId) {
    payloadData.source = sourceObject
  }

  if (blockchainDestinationTypes.has(formData.destinationType)) {
    payloadData.toAmount = toAmountDetail
  }

  if (formData.beneficiaryEmail) {
    payloadData.metadata = {
      beneficiaryEmail: formData.beneficiaryEmail,
    }
  }

  try {
    await $payoutsApi.createPayout(payloadData)
  } catch (err) {
    error.value = err
    showError.value = true
  } finally {
    loading.value = false
  }
}
</script>
