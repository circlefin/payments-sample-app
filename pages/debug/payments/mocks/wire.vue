<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="4">
        <v-form>
          <v-text-field v-model="formData.trackingRef" label="Tracking Ref" />
          <v-text-field v-model="formData.memo" label="Memo" />
          <v-text-field
            v-model="formData.accountNumber"
            label="Account Number"
          />
          <v-select
            v-model="formData.currency"
            :items="currencyTypes"
            label="Currency"
          />
          <v-text-field v-model="formData.amount" label="Amount" />
          <v-select v-model="formData.rail" :items="rails" label="Rail" />
          <v-btn
            v-if="isSandbox"
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
import { getIsInternal, getLive } from '../../../../lib/apiTarget'
import type { CreateMockPushPaymentPayload } from '~/lib/mocksApi'

const store = useMainStore()
const { $mocksApi } = useNuxtApp()

const formData = reactive({
  trackingRef: '',
  memo: '',
  accountNumber: '',
  amount: '0.00',
  currency: 'USD',
  rail: 'wire',
})

const currencyTypes = ['USD', 'EUR', 'SGD', 'MXN']
const rails = getIsInternal()
  ? ['wire', 'rtgs', 'spei', 'sepa', 'sepa_instant']
  : ['wire', 'rtgs', 'spei', 'sepa']

const isSandbox = !getLive()
const required = [(v: string) => !!v || 'Field is required']
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
  const payloadData: CreateMockPushPaymentPayload = {
    trackingRef: formData.trackingRef,
    memo: formData.memo,
    beneficiaryBank: {
      accountNumber: formData.accountNumber,
    },
    amount: amountDetail,
    rail: formData.rail,
  }

  try {
    await $mocksApi.createMockWirePayment(payloadData)
  } catch (err) {
    error.value = err
    showError.value = true
  } finally {
    loading.value = false
  }
}
</script>
