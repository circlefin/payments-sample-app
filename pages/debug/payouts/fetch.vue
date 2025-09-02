<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="4">
        <v-form>
          <header>Optional filter params:</header>
          <v-text-field
            v-model="formData.sourceWalletId"
            label="Source Wallet ID"
          />
          <v-text-field v-model="formData.destination" label="Destination" />
          <v-select
            v-model="formData.destinationType"
            :items="destinationType"
            label="Destination Type"
          />
          <v-select
            v-model="formData.status"
            :items="payoutStatuses"
            label="Status"
          />
          <div>
            <v-text-field
              v-model="formData.sourceCurrency"
              label="Source Currency"
            />
            <v-text-field
              v-model="formData.destinationCurrency"
              label="Destination Currency"
            />
            <v-text-field v-model="formData.chain" label="Chain" />
          </div>
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
      @on-change="onErrorSheetClosed"
    />
  </v-container>
</template>

<script setup lang="ts">
const store = useMainStore()
const { $payoutsApi } = useNuxtApp()

const formData = reactive({
  sourceWalletId: '',
  destination: '',
  destinationType: '',
  sourceCurrency: '',
  destinationCurrency: '',
  chain: '',
  status: '',
  from: '',
  to: '',
  pageSize: '',
  pageBefore: '',
  pageAfter: '',
})

const isNumber = (v: string) =>
  v === '' || !isNaN(parseInt(v)) || 'Please enter valid number'
const required = (v: string) => !!v || 'Field is required'

const destinationType = ['address_book']
const payoutStatuses = ['', 'pending', 'complete', 'failed']
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
    await $payoutsApi.getPayouts(
      formData.sourceWalletId,
      formData.destination,
      formData.destinationType,
      formData.status,
      formData.sourceCurrency,
      formData.destinationCurrency,
      formData.chain,
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
