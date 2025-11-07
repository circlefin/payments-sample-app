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

          <v-select
            v-model="formData.fundingMode"
            :items="fundingModeOptions"
            :rules="[required]"
            label="Funding Mode"
            :hint="
              formData.type === 'taker'
                ? 'Takers can only use gross funding mode'
                : ''
            "
            persistent-hint
          />

          <v-text-field
            v-model="formData.contractTradeIds"
            :rules="[required]"
            label="Contract Trade IDs"
            placeholder="Enter comma-separated trade IDs (e.g., id1, id2, id3)"
            hint="Separate multiple trade IDs with commas"
            persistent-hint
          />

          <v-row class="mb-7">
            <v-col cols="12" sm="6">
              <v-btn
                variant="flat"
                color="primary"
                :loading="loading"
                :disabled="!validForm || loading"
                block
                @click.prevent="makeApiCall"
              >
                Get Funding Presign Data
              </v-btn>
            </v-col>
            <v-col cols="12" sm="6">
              <v-btn
                variant="flat"
                color="success"
                :loading="signingLoading"
                :disabled="
                  !hasWalletConfig || !hasPresignResponse || signingLoading
                "
                block
                @click.prevent="signWithCircle"
              >
                Sign With Circle
              </v-btn>
            </v-col>
          </v-row>

          <!-- Configuration Warning -->
          <v-alert
            v-if="!hasWalletConfig"
            type="warning"
            variant="tonal"
            class="mb-4"
            density="compact"
          >
            Please configure your Circle Developer Controlled Wallets
            credentials in the settings panel.
          </v-alert>
        </v-form>

        <!-- Signature Result Section -->
        <v-card v-if="signatureResult" class="mt-6">
          <v-card-title>Signature Result</v-card-title>
          <v-card-text>
            <v-alert
              type="success"
              variant="tonal"
              density="compact"
              class="mb-4"
            >
              Successfully signed with Circle!
            </v-alert>
            <v-text-field
              v-model="signatureResult"
              label="Signature"
              readonly
              variant="outlined"
              append-inner-icon="mdi-content-copy"
              @click:append-inner="copySignature"
            />
            <v-btn
              variant="flat"
              color="secondary"
              class="mt-4"
              block
              @click.prevent="goToFund"
            >
              Proceed to Fund Trade
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
import type { FundingPresignPayload } from '~/lib/stablefxTradesApi'

const store = useMainStore()
const { $stablefxTradesApi, $circleWalletsApi } = useNuxtApp()
const router = useRouter()

const validForm = ref(false)
const formData = reactive({
  contractTradeIds: '',
  fundingMode: '' as 'gross' | 'net' | '',
  type: '' as 'maker' | 'taker' | '',
})

const typeOptions = [
  { title: 'Maker', value: 'maker' },
  { title: 'Taker', value: 'taker' },
]

const fundingModeOptions = computed(() => {
  // Takers can only use gross funding mode
  if (formData.type === 'taker') {
    return [{ title: 'Gross', value: 'gross' }]
  }
  // Makers can use both gross and net
  return [
    { title: 'Gross', value: 'gross' },
    { title: 'Net', value: 'net' },
  ]
})

const error = ref<any>({})
const loading = ref(false)
const showError = ref(false)
const signingLoading = ref(false)
const signatureResult = ref('')

const payload = computed(() => store.getRequestPayload)
const response = computed(() => store.getRequestResponse)
const requestUrl = computed(() => store.getRequestUrl)

// Check if we have a presign response with typed data
const hasPresignResponse = computed(() => {
  if (!response.value) return false

  // Check different possible response structures
  return (
    (response.value.data && response.value.data.typedData) ||
    response.value.typedData ||
    (response.value.data && Object.keys(response.value.data).length > 0)
  )
})

// Check if wallet configuration is complete
const hasWalletConfig = computed(() => {
  return store.getWalletApiKey && store.getEntitySecret && store.getWalletId
})

const required = (v: string) => !!v || 'Field is required'

// Watch for type changes and reset funding mode if taker is selected with net mode
watch(
  () => formData.type,
  (newType) => {
    if (newType === 'taker' && formData.fundingMode === 'net') {
      formData.fundingMode = ''
    }
  },
)

const onErrorSheetClosed = () => {
  error.value = {}
  showError.value = false
}

const makeApiCall = async () => {
  loading.value = true
  signatureResult.value = '' // Clear previous signature result

  try {
    // Parse comma-separated trade IDs and trim whitespace
    const contractTradeIds = formData.contractTradeIds
      .split(',')
      .map((id) => id.trim())
      .filter((id) => id !== '')

    const payloadData: FundingPresignPayload = {
      contractTradeIds,
      fundingMode: formData.fundingMode as 'gross' | 'net',
      type: formData.type as 'maker' | 'taker',
    }

    await $stablefxTradesApi.getFundingPresignData(payloadData)
  } catch (err) {
    error.value = err
    showError.value = true
  } finally {
    loading.value = false
  }
}

const signWithCircle = async () => {
  if (!hasWalletConfig.value) {
    error.value = {
      message:
        'Please configure your Circle Developer Controlled Wallets credentials in the settings panel.',
    }
    showError.value = true
    return
  }

  if (!hasPresignResponse.value) {
    error.value = {
      message: 'Please get funding presign data first before signing.',
    }
    showError.value = true
    return
  }

  signingLoading.value = true

  try {
    // Extract typed data from the presign response - handle different structures
    let typedData = response.value.data?.typedData || response.value.typedData

    // If no typedData found, use the entire data object
    if (!typedData && response.value.data) {
      typedData = response.value.data
    }

    if (!typedData) {
      error.value = {
        message:
          'No typed data found in the funding presign response. Please ensure the presign data contains valid typed data.',
      }
      showError.value = true
      return
    }

    // Convert typed data to string format expected by Circle API
    const typedDataString = JSON.stringify(typedData)

    // Sign the typed data using Circle API
    const signResult = await $circleWalletsApi.signTypedDataComplete(
      store.getWalletId,
      typedDataString,
      store.getEntitySecret,
      store.getWalletApiKey,
    )
    // Extract just the signature from the response
    const signature =
      signResult?.data?.signature ||
      signResult?.signature ||
      'No signature found'
    signatureResult.value = signature
  } catch (err) {
    error.value = err
    showError.value = true
  } finally {
    signingLoading.value = false
  }
}

const copySignature = async () => {
  try {
    await navigator.clipboard.writeText(signatureResult.value)
  } catch (err) {
    error.value = { message: 'Failed to copy signature.' }
    showError.value = true
  }
}

const goToFund = () => {
  // Extract typed data from the presign response
  let typedData = response.value.data?.typedData || response.value.typedData

  if (!typedData && response.value.data) {
    typedData = response.value.data
  }

  // Extract permit2 data from the typed data message
  const permit2Data = typedData?.message
    ? JSON.stringify(typedData.message, null, 2)
    : ''

  router.push({
    path: '/debug/stablefx/fund',
    query: {
      type: formData.type,
      signature: signatureResult.value,
      fundingMode: formData.fundingMode,
      permit2Data: permit2Data,
    },
  })
}
</script>
