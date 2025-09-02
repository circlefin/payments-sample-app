<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="4">
        <v-form>
          <ChainSelect v-model="formData.chain" label="Chain" />

          <v-text-field v-model="formData.address" label="Recipient address" />

          <v-text-field v-model="formData.currency" label="Currency" />

          <v-text-field
            v-if="hasAddressTagSupport(formData.chain)"
            v-model="formData.addressTag"
            label="Address Tag"
            hint="The secondary identifier for a blockchain address which can be text, id, or hash format."
          />
          <v-text-field v-model="formData.description" label="Description" />

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
import type { CreateRecipientAddressPayload } from '@/lib/businessAccount/addressesApi'
import chains from '@/lib/chains.json'

const store = useMainStore()
const { $businessAccountAddressesApi } = useNuxtApp()

const formData = reactive({
  address: '',
  chain: '',
  currency: '',
  description: '',
  addressTag: '',
})

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

const hasAddressTagSupport = (chain: string) => {
  return chains.find((_chain) => {
    return _chain.value === chain && _chain.addressTagSupport
  })
}

const makeApiCall = async () => {
  loading.value = true
  const { address, chain, currency, description, addressTag } = formData
  const payloadData: CreateRecipientAddressPayload = {
    idempotencyKey: uuidv4(),
    address,
    chain,
    currency,
    description,
  }

  if (hasAddressTagSupport(chain)) {
    payloadData.addressTag = addressTag
  }
  try {
    await $businessAccountAddressesApi.createRecipientAddress(payloadData)
  } catch (err) {
    error.value = err
    showError.value = true
  } finally {
    loading.value = false
  }
}
</script>
