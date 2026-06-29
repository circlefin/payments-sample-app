<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="4">
        <v-form v-model="validForm">
          <v-text-field
            v-model="formData.tradeId"
            :rules="[required]"
            label="Trade ID"
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
                Get Presign Data
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
              @click.prevent="goToRequestAdvance"
            >
              Proceed to Request Advance
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
import type { SettlementAdvancePresignPayload } from '~/lib/stablefxTradesApi'

const store = useMainStore()
const { $stablefxTradesApi, $circleWalletsApi } = useNuxtApp()
const route = useRoute()
const router = useRouter()

const validForm = ref(false)
const formData = reactive({
  tradeId: (route.query.tradeId as string) || '',
})

const error = ref<any>({})
const loading = ref(false)
const showError = ref(false)
const signingLoading = ref(false)
const signatureResult = ref('')

const payload = computed(() => store.getRequestPayload)
const response = computed(() => store.getRequestResponse)
const requestUrl = computed(() => store.getRequestUrl)

// Extract the maker permit typed data from the presign response
const getTypedData = () => {
  if (!response.value) return undefined
  return (
    response.value.makerPermitTypedData ||
    response.value.data?.makerPermitTypedData
  )
}

const hasPresignResponse = computed(() => !!getTypedData())

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
    const payloadData: SettlementAdvancePresignPayload = {
      tradeId: formData.tradeId,
    }
    await $stablefxTradesApi.getSettlementAdvancePresignData(payloadData)
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

  const typedData = getTypedData()
  if (!typedData) {
    error.value = {
      message: 'Please get presign data first before signing.',
    }
    showError.value = true
    return
  }

  signingLoading.value = true

  try {
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

const goToRequestAdvance = () => {
  const typedData = getTypedData()
  const permit2Data = typedData?.message
    ? JSON.stringify(typedData.message, null, 2)
    : ''

  router.push({
    path: '/debug/stablefx/settlementAdvance/request',
    query: {
      tradeId: formData.tradeId,
      signature: signatureResult.value,
      permit2Data: permit2Data,
    },
  })
}
</script>
