<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="4">
        <v-form v-model="validForm">
          <v-text-field
            v-model="formData.tradeId"
            :rules="[required]"
            label="Trade ID"
          />
          <v-select
            v-model="formData.type"
            :items="['maker', 'taker']"
            :rules="[required]"
            label="Trader Type"
          />
          <v-text-field
            v-model="formData.address"
            :rules="[required]"
            label="Address"
          />
          <v-text-field
            v-if="formData.type === 'taker'"
            v-model="formData.details.recipient"
            :rules="formData.type === 'taker' ? [required] : []"
            label="Recipient Address"
          />
          <v-text-field
            v-model="formData.details.deadline"
            :rules="[required, isNumber]"
            label="Deadline (seconds since epoch)"
            type="number"
          />
          <v-text-field
            v-model="formData.details.nonce"
            :rules="[required, isNumber]"
            label="Nonce"
            type="number"
          />
          <v-text-field
            v-model="formData.fee"
            :rules="[required, isNumber]"
            label="Fee"
            type="number"
          />
          <v-divider class="my-4" />
          <h4>Consideration Details</h4>
          <v-text-field
            v-model="formData.details.consideration.quoteId"
            :rules="[required]"
            label="Quote ID"
          />
          <v-text-field
            v-model="formData.details.consideration.base"
            :rules="[required]"
            label="Base Token Address (ERC-20)"
          />
          <v-text-field
            v-model="formData.details.consideration.quote"
            :rules="[required]"
            label="Quote Token Address (ERC-20)"
          />
          <v-text-field
            v-model="formData.details.consideration.quoteAmount"
            :rules="[required, isNumber]"
            label="Quote Amount"
            type="number"
          />
          <v-text-field
            v-model="formData.details.consideration.baseAmount"
            :rules="[required, isNumber]"
            label="Base Amount"
            type="number"
          />
          <v-text-field
            v-model="formData.details.consideration.maturity"
            :rules="[required, isNumber]"
            label="Settlement Maturity (seconds since epoch)"
            type="number"
          />
          <v-text-field
            v-model="formData.signature"
            :rules="[required]"
            label="Signature"
          />
          <v-btn
            variant="flat"
            class="mb-7"
            color="primary"
            :loading="loading"
            :disabled="!validForm || loading"
            @click.prevent="makeApiCall"
          >
            Register Signature
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
import type { CreatePiFXSignaturePayload } from '~/lib/cpsTradesApi'

const store = useMainStore()
const { $cpsTradesApi } = useNuxtApp()

const validForm = ref(false)
const formData = reactive({
  tradeId: '',
  type: '',
  address: '',
  details: {
    recipient: '',
    deadline: '',
    nonce: '',
    consideration: {
      quoteId: '',
      base: '',
      quote: '',
      quoteAmount: '',
      baseAmount: '',
      maturity: '',
    },
  },
  fee: '',
  signature: '',
})

const error = ref<any>({})
const loading = ref(false)
const showError = ref(false)

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

  try {
    const details: any = {
      deadline: parseInt(formData.details.deadline),
      nonce: parseInt(formData.details.nonce),
      fee: parseInt(formData.fee),
      consideration: {
        quoteId: formData.details.consideration.quoteId,
        base: formData.details.consideration.base,
        quote: formData.details.consideration.quote,
        quoteAmount: parseInt(formData.details.consideration.quoteAmount),
        baseAmount: parseInt(formData.details.consideration.baseAmount),
        maturity: parseInt(formData.details.consideration.maturity),
      },
    }

    // Only include recipient if type is taker
    if (formData.type === 'taker') {
      details.recipient = formData.details.recipient
    }

    const payloadData: CreatePiFXSignaturePayload = {
      tradeId: formData.tradeId,
      type: formData.type,
      address: formData.address,
      details,
      signature: formData.signature,
    }

    await $cpsTradesApi.registerSignature(payloadData)
  } catch (err) {
    error.value = err
    showError.value = true
  } finally {
    loading.value = false
  }
}
</script>
