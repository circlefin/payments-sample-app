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
const signingLoading = ref(false)
const signatureResult = ref('')

const payload = computed(() => store.getRequestPayload)
const response = computed(() => store.getRequestResponse)
const requestUrl = computed(() => store.getRequestUrl)

// Check if we have a presign response with typed data
const hasPresignResponse = computed(() => {
  return response.value && response.value.data && response.value.data.typedData
})

// Check if wallet configuration is complete
const hasWalletConfig = computed(() => {
  return store.getWalletApiKey && store.getEntitySecret && store.getWalletId
})

const required = (v: string) => !!v || 'Field is required'

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

const signWithCircle = async () => {
  if (!hasWalletConfig.value || !hasPresignResponse.value) {
    console.log('Missing wallet config or presign response')
    return
  }

  signingLoading.value = true

  try {
    // Extract typed data from the presign response
    const typedData = response.value.data.typedData
    console.log('Typed data to sign:', typedData)

    // Convert typed data to string format expected by Circle API
    const typedDataString = JSON.stringify(typedData)

    // Sign the typed data using Circle API
    const signResult = await $circleWalletsApi.signTypedDataComplete(
      store.getWalletId,
      typedDataString,
      store.getEntitySecret,
      store.getWalletApiKey,
    )

    console.log('Sign result:', signResult)

    // Extract just the signature from the response
    const signature =
      signResult?.data?.signature ||
      signResult?.signature ||
      'No signature found'
    signatureResult.value = signature
  } catch (err) {
    console.error('Error signing with Circle:', err)
    error.value = err
    showError.value = true
  } finally {
    signingLoading.value = false
  }
}

const copySignature = async () => {
  try {
    await navigator.clipboard.writeText(signatureResult.value)
    console.log('Signature copied to clipboard')
  } catch (err) {
    console.error('Failed to copy signature:', err)
  }
}
</script>
