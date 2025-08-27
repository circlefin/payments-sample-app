<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="4">
        <v-form>
          <v-text-field v-model="formData.trackingRef" label="Tracking Ref" />
          <v-text-field
            v-model="formData.accountNumber"
            label="Account Number"
          />
          <v-text-field v-model="formData.amount" label="Amount" />
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
import { getLive } from '../../../../lib/apiTarget'
import type { CreateMockPixPushPaymentPayload } from '~/lib/mocksApi'

const store = useMainStore()
const { $mocksApi } = useNuxtApp()

const formData = reactive({
  trackingRef: '',
  accountNumber: '',
  amount: '0.00',
  currency: 'BRL',
})

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
  const payloadData: CreateMockPixPushPaymentPayload = {
    trackingRef: formData.trackingRef,
    accountNumber: formData.accountNumber,
    amount: amountDetail,
  }
  try {
    await $mocksApi.createMockPixPyament(payloadData)
  } catch (err) {
    error.value = err
    showError.value = true
  } finally {
    loading.value = false
  }
}
</script>
