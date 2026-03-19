<template>
  <v-layout>
    <v-row>
      <v-col cols="12" md="4">
        <v-form v-model="validForm">
          <v-select
            v-model="formData.type"
            :items="quoteTypeOptions"
            label="Type"
          />
          <v-text-field
            v-model="formData.from.amount"
            :rules="[isNumber]"
            label="From amount (Must be present if to amount is not)"
          />
          <v-select
            v-model="formData.from.currency"
            :items="currencies"
            label="From currency"
          />
          <v-text-field
            v-model="formData.to.amount"
            :rules="[isNumber]"
            label="To amount (Must be present if from amount is not)"
          />
          <v-select
            v-model="formData.to.currency"
            :items="toCurrencyMap.get(formData.from.currency)"
            :rules="[required]"
            label="To currency"
          />
          <v-select
            v-model="formData.tenor"
            :items="tenorOption"
            :rules="[required]"
            label="Settlement Tenor"
          />
          <v-text-field
            v-if="formData.type === 'tradable'"
            v-model="formData.recipientAddress"
            label="Recipient Address"
          />
          <v-btn
            depressed
            class="mb-7"
            color="primary"
            :loading="loading"
            :disabled="!validForm || loading"
            @click.prevent="makeApiCall"
          >
            Make api call
          </v-btn>
          <v-btn
            v-if="quoteId"
            depressed
            class="mb-7 ml-3"
            color="secondary"
            @click.prevent="goToCreateTrade"
          >
            Create Trade from Quote
          </v-btn>
          <v-btn
            v-if="hasTypedDataResponse"
            depressed
            class="mb-7 ml-3"
            color="success"
            :loading="signingLoading"
            :disabled="!hasWalletConfig || signingLoading"
            @click.prevent="signWithCircle"
          >
            Sign Typed Data
          </v-btn>
          <v-alert
            v-if="hasTypedDataResponse && !hasWalletConfig"
            type="warning"
            dense
            outlined
            class="mb-4"
          >
            Please configure Circle wallet credentials in the settings panel to
            sign typed data.
          </v-alert>
        </v-form>
        <v-card v-if="signatureResult" class="mt-3">
          <v-card-title>Signature Result</v-card-title>
          <v-card-text>
            <v-text-field
              v-model="signatureResult"
              label="Signature"
              readonly
              append-icon="mdi-content-copy"
              @click:append="copySignature"
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
  </v-layout>
</template>

<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid'
import type { CreateStableFXQuotePayload } from '~/lib/stablefxTradesApi'
import { getAPIHostname } from '~/lib/apiTarget'

const store = useMainStore()
const { $stablefxTradesApi, $circleWalletsApi } = useNuxtApp()
const router = useRouter()
type StableFXTenor = NonNullable<CreateStableFXQuotePayload['tenor']>
type StableFXQuoteType = NonNullable<CreateStableFXQuotePayload['type']>

const validForm = ref(false)
const quoteId = ref('')
const formData = reactive({
  type: 'tradable' as StableFXQuoteType,
  from: {
    amount: '',
    currency: 'USDC',
  },
  to: {
    amount: '',
    currency: '',
  },
  tenor: '' as '' | StableFXTenor,
  recipientAddress: '',
})

const tenorOption: Array<{ title: string; value: StableFXTenor }> = [
  { title: 'Instant Settlement', value: 'instant' },
  { title: 'Hourly Settlement', value: 'hourly' },
  { title: 'Daily Settlement', value: 'daily' },
]
const quoteTypeOptions: StableFXQuoteType[] = ['tradable', 'reference']

const error = ref<any>({})
const loading = ref(false)
const showError = ref(false)
const signingLoading = ref(false)
const signatureResult = ref('')
const currencies = ['USDC', 'EURC', 'QCAD', 'AUDF']
const toCurrencyMap = new Map([
  ['USDC', ['EURC', 'QCAD', 'AUDF']],
  ['QCAD', ['USDC']],
  ['AUDF', ['USDC']],
  ['EURC', ['USDC']],
])

const payload = computed(() => store.getRequestPayload)
const response = computed(() => store.getRequestResponse)
const requestUrl = computed(() => store.getRequestUrl)
const hasWalletConfig = computed(
  () => store.getWalletApiKey && store.getEntitySecret && store.getWalletId,
)
const hasTypedDataResponse = computed(() => !!getTypedDataFromResponse())

const required = (v: string) => !!v || 'Field is required'
const isNumber = (v: string) =>
  !v || v === '' || !isNaN(parseInt(v)) || 'Please enter valid number'

const onErrorSheetClosed = () => {
  error.value = {}
  showError.value = false
}

const makeApiCall = async () => {
  loading.value = true
  signatureResult.value = ''

  const payloadData: CreateStableFXQuotePayload = {
    type: formData.type,
    from: {
      amount: formData.from.amount
        ? parseFloat(formData.from.amount)
        : undefined,
      currency: formData.from.currency,
    },
    to: {
      amount: formData.to.amount ? parseFloat(formData.to.amount) : undefined,
      currency: formData.to.currency,
    },
    tenor: formData.tenor || undefined,
    recipientAddress:
      formData.type === 'tradable'
        ? formData.recipientAddress.trim() || undefined
        : undefined,
  }

  try {
    store.setRequestPayload(payloadData)
    store.setRequestUrl(`${getAPIHostname()}/v1/stablefx/quotes`)

    const response = await $stablefxTradesApi.createQuote(payloadData)

    // Extract quote ID from response
    if ((response as any)?.id) {
      quoteId.value = (response as any).id
    }
  } catch (err) {
    error.value = err
    showError.value = true
  } finally {
    loading.value = false
  }
}

const getTypedDataFromResponse = () => {
  if (!response.value) {
    return undefined
  }

  return response.value.data?.typedData || response.value.typedData
}

const signWithCircle = async () => {
  if (!hasWalletConfig.value) {
    error.value = {
      message:
        'Please configure Circle wallet credentials in the settings panel before signing.',
    }
    showError.value = true
    return
  }

  const typedData = getTypedDataFromResponse()
  if (!typedData) {
    error.value = {
      message:
        'No typedData found in quote response. Create a quote with typedData before signing.',
    }
    showError.value = true
    return
  }

  signingLoading.value = true
  try {
    const signResult = await $circleWalletsApi.signTypedDataComplete(
      store.getWalletId,
      JSON.stringify(typedData),
      store.getEntitySecret,
      store.getWalletApiKey,
    )

    signatureResult.value =
      signResult?.data?.signature || signResult?.signature || ''
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

const getCreateTradePrefillData = () => {
  const typedData = getTypedDataFromResponse()
  const message = typedData?.message
  const address =
    message?.witness?.recipient || formData.recipientAddress.trim() || undefined

  return {
    address,
    signature: signatureResult.value || undefined,
    message: message ? JSON.stringify(message, null, 2) : undefined,
  }
}

const goToCreateTrade = () => {
  const idempotencyKey = uuidv4()
  const prefill = getCreateTradePrefillData()

  router.push({
    path: '/debug/stablefx/create',
    query: {
      quoteId: quoteId.value,
      idempotencyKey: idempotencyKey,
      address: prefill.address,
      signature: prefill.signature,
      message: prefill.message,
    },
  })
}
</script>
