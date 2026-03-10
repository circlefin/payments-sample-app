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
            label="Source Wallet Id (optional)"
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
            label="Beneficiary Email (optional)"
          />

          <v-divider class="my-4" />
          <v-alert type="info" density="compact" variant="tonal" class="mb-5">
            Purpose of Transfer below is required for SG legal entities
          </v-alert>
          <v-select
            v-model="formData.purposeOfTransfer"
            :items="purposeOfTransferOptions"
            label="Purpose of Transfer (optional)"
            clearable
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
      @on-change="onErrorSheetClosed"
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
  purposeOfTransfer: '',
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
const purposeOfTransferOptions = [
  'PMT000 - Other',
  'PMT001 - Invoice payments',
  'PMT002 - Payment for services',
  'PMT003 - Payment for software',
  'PMT004 - Payment for imported goods',
  'PMT005 - Travel services',
  'PMT006 - Transfer to own account',
  'PMT007 - Repayment of loans',
  'PMT008 - Payroll',
  'PMT009 - Payment of property rental',
  'PMT010 - Information Service Charges',
  'PMT011 - Advertising & Public relations-related expenses',
  'PMT012 - Royalty fees, trademark fees, patent fees, and copyright fees',
  'PMT013 - Fees for brokers, front end fee, commitment fee, guarantee fee and custodian fee',
  'PMT014 - Fees for advisors, technical assistance, and academic knowledge',
  'PMT015 - Representative office expenses',
  'PMT016 - Tax Payment',
  'PMT017 - Transportation fees for goods',
  'PMT018 - Construction costs/expenses',
  'PMT019 - Insurance Premium',
  'PMT020 - General Goods Trades - Offline trade',
  'PMT021 - Insurance Claims Payment',
  'PMT022 - Remittance payments to friends/family',
  'PMT023 - Education-related student expenses',
  'PMT024 - Medical Treatment',
  'PMT025 - Donations',
  'PMT026 - Mutual Fund Investment',
  'PMT027 - Currency Exchange',
  'PMT028 - Advance Payments for Goods',
  'PMT029 - Merchant Settlement',
  'PMT030 - Repatriation Fund Settlement',
].map((item) => {
  const code = item.split(' - ')[0]
  return { title: item, value: code }
})
const supportedCryptoPayoutCurrencyPairs = new Map([
  ['USD', ['USD']],
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

  if (formData.purposeOfTransfer) {
    payloadData.purposeOfTransfer = formData.purposeOfTransfer
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
