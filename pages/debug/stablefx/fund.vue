<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="4">
        <v-form v-model="validForm">
          <v-select
            v-model="formData.type"
            :items="typeOptions"
            :rules="[required]"
            label="Type"
          />

          <v-text-field
            v-model="formData.signature"
            :rules="[required]"
            label="Signature"
            placeholder="Enter signature string"
          />

          <v-select
            v-model="formData.fundingMode"
            :items="fundingModeOptions"
            :rules="[required, validateNetMode]"
            label="Funding Mode"
          />

          <v-textarea
            v-model="formData.permit2DataMessage"
            :rules="[required, isValidJSON]"
            label="Permit2 Typed Data Message (JSON)"
            rows="15"
            auto-grow
            hint="Paste the permit2 message JSON object here"
          />

          <v-btn
            variant="flat"
            class="mb-7 mt-4"
            color="primary"
            :loading="loading"
            :disabled="!validForm || loading"
            block
            @click.prevent="makeApiCall"
          >
            Fund Trade
          </v-btn>
        </v-form>

        <!-- Success Message -->
        <v-card v-if="fundingSuccess" class="mt-6">
          <v-card-text>
            <v-alert type="success" variant="tonal" class="mb-4">
              Trade funded successfully!
            </v-alert>
            <v-btn
              variant="flat"
              color="secondary"
              block
              @click.prevent="goToGetTrades"
            >
              View All Trades
            </v-btn>
          </v-card-text>
        </v-card>
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
import type { StableFXFundPayload } from '~/lib/stablefxTradesApi'

const store = useMainStore()
const { $stablefxTradesApi } = useNuxtApp()
const route = useRoute()
const router = useRouter()

const validForm = ref(false)
const fundingSuccess = ref(false)
const formData = reactive({
  type:
    (route.query.type as 'maker' | 'taker') || ('' as 'maker' | 'taker' | ''),
  signature: (route.query.signature as string) || '',
  fundingMode:
    (route.query.fundingMode as 'gross' | 'net') ||
    ('' as 'gross' | 'net' | ''),
  permit2DataMessage: (route.query.permit2Data as string) || '',
})

const typeOptions = [
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

const required = (v: string | number) => !!v || 'Field is required'
const isValidJSON = (v: string) => {
  if (!v) return 'Field is required'
  try {
    JSON.parse(v)
    return true
  } catch (e) {
    return 'Please enter valid JSON'
  }
}

const validateNetMode = (v: string) => {
  if (v === 'net' && formData.type !== 'maker') {
    return 'Net funding mode is only available for makers'
  }
  return true
}

const onErrorSheetClosed = () => {
  error.value = {}
  showError.value = false
}

const makeApiCall = async () => {
  loading.value = true
  fundingSuccess.value = false

  try {
    // Parse the permit2 data message JSON
    const permit2 = JSON.parse(formData.permit2DataMessage)

    const payloadData: StableFXFundPayload = {
      type: formData.type as 'maker' | 'taker',
      signature: formData.signature,
      fundingMode: formData.fundingMode as 'gross' | 'net',
      permit2,
    }

    await $stablefxTradesApi.fund(payloadData)
    fundingSuccess.value = true
  } catch (err) {
    error.value = err
    showError.value = true
  } finally {
    loading.value = false
  }
}

const goToGetTrades = () => {
  router.push({
    path: '/debug/stablefx/fetch',
    query: {
      type: formData.type,
    },
  })
}
</script>
