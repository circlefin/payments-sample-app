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
              formData.type === 'taker' && formData.fundingMode === 'gross'
                ? 'Takers can only use gross or delegate funding mode'
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

          <template v-if="formData.fundingMode === 'delegate'">
            <v-text-field
              v-model="formData.funderAddress"
              :rules="[required]"
              label="Funder Address"
              placeholder="0x..."
              hint="The LLC funder programmable wallet address"
              persistent-hint
            />
            <v-text-field
              v-model="formData.recipientAddress"
              :rules="[required]"
              label="Recipient Address"
              placeholder="0x..."
              hint="The LLC escrow programmable wallet address"
              persistent-hint
            />
          </template>

          <v-row class="mb-7 mt-2">
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

        <!-- Delegate signing progress -->
        <v-card
          v-if="signingLoading && formData.fundingMode === 'delegate'"
          class="mt-6"
        >
          <v-card-title>Signing Progress</v-card-title>
          <v-card-text>
            <p class="mb-2">{{ signingProgressText }}</p>
            <v-progress-linear
              :model-value="signingProgress"
              color="primary"
              height="8"
              rounded
            />
          </v-card-text>
        </v-card>

        <!-- Delegate batch results -->
        <v-card
          v-if="
            formData.fundingMode === 'delegate' &&
            delegateBatch.length > 0 &&
            !signingLoading
          "
          class="mt-6"
        >
          <v-card-title>Batch Results</v-card-title>
          <v-card-text>
            <v-list density="compact">
              <v-list-item
                v-for="entry in delegateBatch"
                :key="entry.contractTradeId"
              >
                <v-list-item-title>{{
                  entry.contractTradeId
                }}</v-list-item-title>
                <template #append>
                  <v-chip
                    v-if="entry.traderSignature && entry.funderSignature"
                    color="success"
                    size="small"
                  >
                    Signed
                  </v-chip>
                  <v-chip v-else color="warning" size="small">
                    Presign only
                  </v-chip>
                </template>
              </v-list-item>
            </v-list>
            <v-btn
              v-if="allDelegateSigned"
              variant="flat"
              color="secondary"
              class="mt-4"
              block
              @click.prevent="goToFund"
            >
              Proceed to Fund Trades
            </v-btn>
          </v-card-text>
        </v-card>

        <!-- Non-delegate signature result -->
        <v-card
          v-if="signatureResult && formData.fundingMode !== 'delegate'"
          class="mt-6"
        >
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
import type { DelegateFundingEntry } from '~/stores/main'

const store = useMainStore()
const { $stablefxTradesApi, $circleWalletsApi } = useNuxtApp()
const router = useRouter()

const validForm = ref(false)
const formData = reactive({
  contractTradeIds: '',
  fundingMode: '' as 'gross' | 'net' | 'delegate' | '',
  type: '' as 'maker' | 'taker' | '',
  funderAddress: '',
  recipientAddress: '',
})

const typeOptions = [
  { title: 'Maker', value: 'maker' },
  { title: 'Taker', value: 'taker' },
]

const fundingModeOptions = computed(() => {
  if (formData.type === 'taker') {
    return [
      { title: 'Gross', value: 'gross' },
      { title: 'Delegate', value: 'delegate' },
    ]
  }
  return [
    { title: 'Gross', value: 'gross' },
    { title: 'Net', value: 'net' },
    { title: 'Delegate', value: 'delegate' },
  ]
})

const error = ref<any>({})
const loading = ref(false)
const showError = ref(false)
const signingLoading = ref(false)
const signatureResult = ref('')
const signingProgressText = ref('')
const signingProgress = ref(0)

const delegateBatch = computed<DelegateFundingEntry[]>(
  () => store.getDelegateFundingBatch,
)

const allDelegateSigned = computed(
  () =>
    delegateBatch.value.length > 0 &&
    delegateBatch.value.every(
      (e) => !!e.traderSignature && !!e.funderSignature,
    ),
)

const payload = computed(() => store.getRequestPayload)
const response = computed(() => store.getRequestResponse)
const requestUrl = computed(() => store.getRequestUrl)

const hasPresignResponse = computed(() => {
  if (formData.fundingMode === 'delegate') {
    return delegateBatch.value.length > 0
  }
  if (!response.value) return false
  return (
    (response.value.data && response.value.data.typedData) ||
    response.value.typedData ||
    (response.value.data && Object.keys(response.value.data).length > 0)
  )
})

const hasWalletConfig = computed(() => {
  return store.getWalletApiKey && store.getEntitySecret && store.getWalletId
})

const required = (v: string) => !!v || 'Field is required'

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

const parseTradeIds = () =>
  formData.contractTradeIds
    .split(',')
    .map((id) => id.trim())
    .filter((id) => id !== '')

const makeApiCall = async () => {
  loading.value = true
  signatureResult.value = ''
  store.clearDelegateFundingBatch()

  try {
    if (formData.fundingMode === 'delegate') {
      const tradeIds = parseTradeIds()
      const batch: DelegateFundingEntry[] = []

      for (const tradeId of tradeIds) {
        const presignPayload: FundingPresignPayload = {
          contractTradeIds: [tradeId],
          fundingMode: 'delegate',
          type: formData.type as 'maker' | 'taker',
          funderAddress: formData.funderAddress,
          recipientAddress: formData.recipientAddress,
        }
        const resp =
          await $stablefxTradesApi.getFundingPresignData(presignPayload)
        const data = (resp as any)?.data ?? resp
        batch.push({
          contractTradeId: tradeId,
          traderTypedData: data?.traderPermitTypedData ?? null,
          funderTypedData: data?.funderPermitTypedData ?? null,
          traderSignature: '',
          funderSignature: '',
        })
      }

      store.setDelegateFundingBatch(batch)
    } else {
      const contractTradeIds = parseTradeIds()
      const presignPayload: FundingPresignPayload = {
        contractTradeIds,
        fundingMode: formData.fundingMode as 'gross' | 'net',
        type: formData.type as 'maker' | 'taker',
      }
      await $stablefxTradesApi.getFundingPresignData(presignPayload)
    }
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
    if (formData.fundingMode === 'delegate') {
      const batch = [...store.getDelegateFundingBatch]
      const total = batch.length * 2

      for (let i = 0; i < batch.length; i++) {
        const entry = { ...batch[i] }

        signingProgressText.value = `Signing trader permit ${i + 1} of ${batch.length}...`
        signingProgress.value = Math.round(((i * 2) / total) * 100)

        const traderResult = await $circleWalletsApi.signTypedDataComplete(
          store.getWalletId,
          JSON.stringify(entry.traderTypedData),
          store.getEntitySecret,
          store.getWalletApiKey,
        )
        entry.traderSignature =
          traderResult?.data?.signature || traderResult?.signature || ''

        signingProgressText.value = `Signing funder permit ${i + 1} of ${batch.length}...`
        signingProgress.value = Math.round(((i * 2 + 1) / total) * 100)

        const funderWalletId = store.getFunderWalletId || store.getWalletId
        const funderResult = await $circleWalletsApi.signTypedDataComplete(
          funderWalletId,
          JSON.stringify(entry.funderTypedData),
          store.getEntitySecret,
          store.getWalletApiKey,
        )
        entry.funderSignature =
          funderResult?.data?.signature || funderResult?.signature || ''

        batch[i] = entry
      }

      signingProgress.value = 100
      signingProgressText.value = 'All signatures collected.'
      store.setDelegateFundingBatch(batch)
    } else {
      let typedData = response.value.data?.typedData || response.value.typedData
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

      const signResult = await $circleWalletsApi.signTypedDataComplete(
        store.getWalletId,
        JSON.stringify(typedData),
        store.getEntitySecret,
        store.getWalletApiKey,
      )
      signatureResult.value =
        signResult?.data?.signature ||
        signResult?.signature ||
        'No signature found'
    }
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
  if (formData.fundingMode === 'delegate') {
    router.push({
      path: '/debug/stablefx/fund',
      query: {
        type: formData.type,
        fundingMode: 'delegate',
      },
    })
    return
  }

  let typedData = response.value.data?.typedData || response.value.typedData
  if (!typedData && response.value.data) {
    typedData = response.value.data
  }

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
