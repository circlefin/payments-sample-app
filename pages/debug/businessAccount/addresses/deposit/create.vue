<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="4">
        <v-form>
          <v-select
            v-model="formData.currency"
            :items="currencyTypes"
            label="Currency"
          />

          <ChainSelect v-model="formData.chain" label="Chain" />

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
import type { CreateDepositAddressPayload } from '@/lib/businessAccount/addressesApi'

const store = useMainStore()
const { $businessAccountAddressesApi } = useNuxtApp()

const formData = reactive({
  currency: '',
  chain: '',
})

const currencyTypes = ['USD']
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
  const { currency, chain } = formData
  const payloadData: CreateDepositAddressPayload = {
    idempotencyKey: uuidv4(),
    currency,
    chain,
  }
  try {
    await $businessAccountAddressesApi.createDepositAddress(payloadData)
  } catch (err) {
    error.value = err
    showError.value = true
  } finally {
    loading.value = false
  }
}
</script>
