<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="4">
        <v-form>
          <v-text-field v-model="formData.address" label="Address" />
          <v-select
            v-model="formData.chain"
            :items="supportedChains"
            label="Blockchain"
          />
          <v-text-field v-model="formData.email" label="Email" />
          <v-text-field v-model="formData.bns" label="bns" />
          <v-text-field v-model="formData.nickname" label="Nickname" />
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
import type { CreateRecipientPayload } from '~/lib/beta/addressBookApi'

const store = useMainStore()
const { $addressBookApiBeta } = useNuxtApp()

const formData = reactive({
  idempotencyKey: '',
  address: '',
  chain: '',
  email: '',
  bns: '',
  nickname: '',
})

const required = [(v: string) => !!v || 'Field is required']
const supportedChains = ['BTC', 'ETH', 'FLOW', 'MATIC']
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
  const payloadData: CreateRecipientPayload = {
    idempotencyKey: uuidv4(),
    address: formData.address,
    chain: formData.chain,
    metadata: {
      email: formData.email,
      bns: formData.bns,
      nickname: formData.nickname,
    },
  }
  try {
    await $addressBookApiBeta.createRecipient(payloadData)
  } catch (err) {
    error.value = err
    showError.value = true
  } finally {
    loading.value = false
  }
}
</script>

<style scoped></style>
