<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="4">
        <v-form v-model="validForm">
          <v-select
            v-model="formData.traderType"
            :items="traderTypeOptions"
            :rules="[required]"
            label="Trader Type"
          />

          <v-select
            v-model="formData.fundingMode"
            :items="fundingModeOptions"
            :rules="[required]"
            label="Funding Mode"
          />

          <v-text-field
            v-model="formData.contractTradeIds"
            :rules="[required]"
            label="Contract Trade IDs"
            placeholder="Enter comma-separated trade IDs (e.g., id1, id2, id3)"
            hint="Separate multiple trade IDs with commas"
            persistent-hint
          />

          <v-btn
            variant="flat"
            class="mb-7"
            color="primary"
            :loading="loading"
            :disabled="!validForm || loading"
            block
            @click.prevent="makeApiCall"
          >
            Get Funding Presign Data
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
import type { FundingPresignPayload } from '~/lib/stablefxTradesApi'

const store = useMainStore()
const { $stablefxTradesApi } = useNuxtApp()

const validForm = ref(false)
const formData = reactive({
  contractTradeIds: '',
  fundingMode: '' as 'gross' | 'net' | '',
  traderType: '' as 'maker' | 'taker' | '',
})

const traderTypeOptions = [
  { title: 'Maker', value: 'maker' },
  { title: 'Taker', value: 'taker' },
]

const fundingModeOptions = [
  { title: 'Gross', value: 'gross' },
  { title: 'Net', value: 'net' },
]

const error = ref<any>({})
const loading = ref(false)
const showError = ref(false)

const payload = computed(() => store.getRequestPayload)
const response = computed(() => store.getRequestResponse)
const requestUrl = computed(() => store.getRequestUrl)

const required = (v: string) => !!v || 'Field is required'

const onErrorSheetClosed = () => {
  error.value = {}
  showError.value = false
}

const makeApiCall = async () => {
  loading.value = true

  try {
    // Parse comma-separated trade IDs and trim whitespace
    const contractTradeIds = formData.contractTradeIds
      .split(',')
      .map((id) => id.trim())
      .filter((id) => id !== '')

    const payloadData: FundingPresignPayload = {
      contractTradeIds,
      fundingMode: formData.fundingMode as 'gross' | 'net',
      traderType: formData.traderType as 'maker' | 'taker',
    }

    await $stablefxTradesApi.getFundingPresignData(payloadData)
  } catch (err) {
    error.value = err
    showError.value = true
  } finally {
    loading.value = false
  }
}
</script>
