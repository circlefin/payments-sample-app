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
            v-model="formData.endUserAddress"
            :rules="[rules.required]"
            label="End User Address"
          />
          <header>Optional params:</header>
          <v-text-field
            v-model="formData.amount"
            label="Amount"
            :rules="[rules.isNumber, rules.validDecimal]"
          />
          <v-text-field v-model="formData.currency" label="Currency" />
          <v-btn
            variant="flat"
            class="mb-7"
            color="primary"
            :disabled="!isFormValid"
            @click.prevent="makeApiCall()"
          >
            Make api call
          </v-btn>
          <v-btn
            v-if="showMetaMaskButton"
            variant="flat"
            class="mb-7"
            color="primary"
            @click.prevent="sendResponseToMetaMask()"
          >
            Send response to MetaMask
          </v-btn>
          <v-text-field
            v-if="formData.rawSignature.length"
            v-model="formData.rawSignature"
            label="ECDSA rawSignature"
            readonly
          >
            <template #append>
              <router-link
                :to="{
                  path: '/debug/payments/crypto/create',
                  query: getCreatePaymentQueryParams(),
                }"
                class="subtitle-2 text-right"
              >
                Create crypto payment
              </router-link>
            </template>
          </v-text-field>
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
import { sendPresignedDataToMetaMask } from '~/lib/walletConnect'
import { isNumber, required, validDecimal, isUUID } from '@/helpers/validation'

const store = useMainStore()
const { $paymentsApi } = useNuxtApp()

const isFormValid = ref(false)
const error = ref<any>({})
const loading = ref(false)
const showError = ref(false)
const showMetaMaskButton = ref(false)

const formData = reactive({
  paymentIntentId: '',
  endUserAddress: '',
  amount: '',
  currency: '',
  rawSignature: '',
})

const rules = {
  isNumber,
  required,
  validDecimal,
  isUUID,
}

const payload = computed(() => store.getRequestPayload)
const response = computed(() => store.getRequestResponse)
const requestUrl = computed(() => store.getRequestUrl)

const onErrorSheetClosed = () => {
  error.value = {}
  showError.value = false
}

const getTypedData = () => {
  return store.getRequestResponse.typedData
}

const getCreatePaymentQueryParams = () => {
  const { paymentIntentId, rawSignature } = formData
  const {
    message,
    totalAmount,
    networkFeeQuote,
    feeChargeModel,
    primaryType: protocolType,
  } = getTypedData()
  return {
    paymentIntentId,
    amount: totalAmount.amount,
    currency: totalAmount.currency,
    sourceAddress: message.from,
    destinationAddress: message.to,
    feeQuoteId: feeChargeModel === 'endUser' ? networkFeeQuote?.quoteId : '',
    protocolType,
    validAfter: message.validAfter,
    validBefore: message.validBefore,
    metaTxNonce: message.nonce,
    rawSignature,
  }
}

const makeApiCall = async () => {
  loading.value = true
  try {
    await $paymentsApi.getPresignData(
      formData.paymentIntentId,
      formData.endUserAddress,
      formData.amount,
      formData.currency,
    )
  } catch (err) {
    error.value = err
    showError.value = true
  } finally {
    loading.value = false
    showMetaMaskButton.value = Object.keys(store.getRequestResponse).length > 0
  }
}

const sendResponseToMetaMask = async () => {
  try {
    formData.rawSignature = await sendPresignedDataToMetaMask(getTypedData())
  } catch (err) {
    error.value = err
    showError.value = true
  }
}
</script>
