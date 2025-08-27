<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="4">
        <v-form v-model="isFormValid">
          <v-text-field
            v-model="formData.paymentIntentId"
            :rules="[rules.required, rules.isUUID]"
            label="Payment Intent Id"
          />

          <v-text-field
            v-model="formData.amount"
            label="Amount"
            :rules="[rules.required, rules.isNumber, rules.validDecimal]"
          />
          <v-select
            v-model="formData.currency"
            :items="currency"
            label="Currency"
          />

          <v-text-field
            v-model="formData.sourceAddress"
            :rules="[rules.required]"
            label="Source Address"
          />
          <v-select
            v-model="formData.sourceType"
            :items="sourceType"
            :rules="[rules.required]"
            label="Source Type"
          />

          <v-text-field
            v-model="formData.destinationAddress"
            :rules="[rules.required]"
            label="Destination Address"
          />
          <v-select
            v-model="formData.destinationChain"
            :items="destinationChain"
            label="Destination Chain"
          />

          <v-text-field
            v-model="formData.feeQuoteId"
            label="Fee Quote ID (Required if network fees paid by end user)"
            :rules="[rules.isUUID]"
          />

          <v-select
            v-model="formData.protocolType"
            :items="protocolType"
            label="Protocol Type"
          />

          <v-text-field
            v-model="formData.validAfter"
            label="Signature ValidAfter"
            :rules="[rules.required]"
          />

          <v-text-field
            v-model="formData.validBefore"
            label="Signature validBefore"
            :rules="[rules.required]"
          />

          <v-text-field
            v-model="formData.metaTxNonce"
            label="Meta transaction nonce"
            :rules="[rules.required]"
          />

          <v-text-field
            v-model="formData.rawSignature"
            label="ECDSA rawSignature"
            :rules="[rules.required]"
          />

          <v-btn
            variant="flat"
            class="mb-7"
            color="primary"
            :loading="loading"
            :disabled="!isFormValid"
            @click.prevent="makeApiCall()"
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
import type { CreateCryptoPaymentPayload } from '~/lib/cryptoPaymentsApi'
import { isNumber, required, validDecimal, isUUID } from '@/helpers/validation'

const route = useRoute()
const store = useMainStore()
const { $paymentsApiBeta } = useNuxtApp()

const isFormValid = ref(false)
const formData = reactive({
  paymentIntentId: (route.query.paymentIntentId as string) || '',
  amount: (route.query.amount as string) || '0.00',
  currency: (route.query.currency as string) || 'USD',
  sourceAddress: (route.query.sourceAddress as string) || '',
  sourceType: 'blockchain',
  destinationAddress: (route.query.destinationAddress as string) || '',
  destinationChain: 'ETH',
  feeQuoteId: (route.query.feeQuoteId as string) || '',
  protocolType:
    (route.query.protocolType as string) || 'TransferWithAuthorization',
  validAfter: (route.query.validAfter as string) || '0',
  validBefore: (route.query.validBefore as string) || '',
  metaTxNonce: (route.query.metaTxNonce as string) || '',
  rawSignature: (route.query.rawSignature as string) || '',
})

const rules = {
  isNumber,
  required,
  validDecimal,
  isUUID,
}

const sourceType = ['blockchain']
const currency = ['USD']
const destinationChain = ['ETH']
const protocolType = ['TransferWithAuthorization']
const error = ref<any>({})
const loading = ref(false)
const showError = ref(false)

const payload = computed(() => store.getRequestPayload)
const response = computed(() => store.getRequestResponse)
const requestUrl = computed(() => store.getRequestUrl)

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
  const sourceDetails = {
    address: formData.sourceAddress,
    type: formData.sourceType,
  }
  const destinationDetails = {
    address: formData.destinationAddress,
    chain: formData.destinationChain,
  }
  const protocolMetadataDetails = {
    type: formData.protocolType,
    metaTxNonce: formData.metaTxNonce,
    signatureValidAfter: formData.validAfter,
    signatureValidBefore: formData.validBefore,
    rawSignature: formData.rawSignature,
  }
  const payloadData: CreateCryptoPaymentPayload = {
    idempotencyKey: uuidv4(),
    paymentIntentId: formData.paymentIntentId,
    amount: amountDetail,
    source: sourceDetails,
    destination: destinationDetails,
    protocolMetadata: protocolMetadataDetails,
    quoteId: formData.feeQuoteId,
  }

  try {
    await $paymentsApiBeta.createCryptoPayment(payloadData)
  } catch (err) {
    error.value = err
    showError.value = true
  } finally {
    loading.value = false
  }
}
</script>
