<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="4">
        <v-form>
          <header>Optional filter params:</header>
          <v-text-field v-model="formData.address" label="Address" />
          <v-select
            v-model="formData.chain"
            :items="supportedChains"
            label="Blockchain"
          />
          <v-text-field v-model="formData.email" label="Email" />
          <v-text-field v-model="formData.status" label="Status" />
          <v-text-field v-model="formData.from" label="From" />
          <v-text-field v-model="formData.to" label="To" />
          <v-text-field v-model="formData.pageSize" label="PageSize" />
          <v-text-field v-model="formData.pageBefore" label="PageBefore" />
          <v-text-field v-model="formData.pageAfter" label="PageAfter" />
          <v-btn
            variant="flat"
            class="mb-7"
            color="primary"
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
const store = useMainStore()
const { $addressBookApiBeta } = useNuxtApp()

const formData = reactive({
  address: '',
  chain: '',
  email: '',
  status: '',
  from: '',
  to: '',
  pageSize: '',
  pageBefore: '',
  pageAfter: '',
})

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
  try {
    await $addressBookApiBeta.getRecipients(
      formData.address,
      formData.chain,
      formData.email,
      formData.status,
      formData.from,
      formData.to,
      formData.pageBefore,
      formData.pageAfter,
      formData.pageSize,
    )
  } catch (err) {
    error.value = err
    showError.value = true
  } finally {
    loading.value = false
  }
}
</script>

<style scoped></style>
