<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="4">
        <v-form>
          <v-text-field v-model="formData.amount" label="Amount" />

          <v-text-field v-model="formData.addressId" label="Address ID" />

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
import type { CreateTransferPayload } from '@/lib/businessAccount/transfersApi'

const store = useMainStore()
const { $businessAccountTransfersApi } = useNuxtApp()

const isFiatAccount = true
const formData = reactive({
  idempotencyKey: '',
  amount: '',
  addressId: '',
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

  const amountDetail = {
    amount: formData.amount,
    currency: 'USD',
  }
  const destinationDetail = {
    type: 'verified_blockchain',
    addressId: formData.addressId,
  }

  const payloadData: CreateTransferPayload = {
    idempotencyKey: uuidv4(),
    amount: amountDetail,
    destination: destinationDetail,
  }

  try {
    await $businessAccountTransfersApi.createTransfer(payloadData)
  } catch (err) {
    error.value = err
    showError.value = true
  } finally {
    loading.value = false
  }
}
</script>
