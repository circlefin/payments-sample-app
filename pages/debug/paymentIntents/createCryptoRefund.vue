<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="4">
        <v-form>
          <v-text-field
            v-model="formData.paymentIntentId"
            label="Payment Intent ID"
          />

          <v-text-field
            v-model="formData.fromCurrency"
            label="Source Currency"
          />

          <v-text-field v-model="formData.toAmount" label="Refund Amount" />

          <v-text-field v-model="formData.toCurrency" label="Refund Currency" />

          <v-text-field
            v-model="formData.address"
            label="Destination Address"
          />

          <v-text-field
            v-model="formData.addressTag"
            label="Address Tag (Optional)"
          />

          <v-text-field
            v-model="formData.blockchain"
            label="Destination Blockchain"
          />

          <v-btn
            v-if="!!formData.paymentIntentId"
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
import type { CreateCryptoRefundPayload } from '@/lib/paymentIntentsApi'

const store = useMainStore()
const { $paymentIntentsApi } = useNuxtApp()

const formData = reactive({
  paymentIntentId: '',
  idempotencyKey: '',
  fromCurrency: '',
  toAmount: '',
  toCurrency: '',
  blockchain: '',
  address: '',
  addressTag: '',
})

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
  const fromAmountDetail = {
    currency: formData.fromCurrency,
  }
  const toAmountDetail = {
    amount: formData.toAmount,
    currency: formData.toCurrency,
  }

  const payloadData: CreateCryptoRefundPayload = {
    idempotencyKey: uuidv4(),
    destination: {
      chain: formData.blockchain,
      address: formData.address,
      addressTag: formData.addressTag,
    },
    amount: fromAmountDetail,
    toAmount: toAmountDetail,
  }
  try {
    await $paymentIntentsApi.createCryptoRefund(
      formData.paymentIntentId,
      payloadData,
    )
  } catch (err) {
    error.value = err
    showError.value = true
  } finally {
    loading.value = false
  }
}
</script>
