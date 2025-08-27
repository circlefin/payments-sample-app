<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="4">
        <v-form>
          <v-text-field v-model="formData.sourceId" label="Source Account Id" />
          <v-select
            v-model="formData.sourceType"
            :items="sourceType"
            label="Source Account Type"
          />
          <v-text-field v-model="formData.amount" label="Amount" />

          <v-checkbox
            v-if="formData.sourceType != 'ach'"
            v-model="formData.autoCapture"
            label="Auto capture"
          />

          <v-select
            v-if="formData.sourceType == 'card'"
            v-model="formData.verification"
            :items="verificationMethods"
            label="Verification Method"
          />

          <v-text-field
            v-if="showCvv"
            v-model="formData.cvv"
            :label="`${cvvLabel}`"
          />

          <v-text-field
            v-if="formData.sourceType != 'payment_token'"
            v-model="formData.verificationSuccessUrl"
            label="VerificationSuccessUrl"
          />

          <v-text-field
            v-if="formData.sourceType != 'payment_token'"
            v-model="formData.verificationFailureUrl"
            label="VerificationFailureUrl"
          />

          <v-text-field
            v-model="formData.description"
            hint="Payment Description"
            label="Description"
          />

          <v-text-field
            v-model="formData.channel"
            hint="Channel"
            label="Channel"
          />

          <v-text-field
            v-model="formData.phoneNumber"
            hint="Phone number of the user in E.164 format"
            label="Phone"
          />

          <v-text-field v-model="formData.email" label="Email" />

          <v-btn
            variant="flat"
            class="mb-7"
            color="primary"
            :loading="loading"
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
import { v4 as uuidv4 } from 'uuid'
import openPGP from '@/lib/openpgp'
import type { CreateCardPaymentPayload } from '@/lib/paymentsApi'

const store = useMainStore()
const { $paymentsApi } = useNuxtApp()

const showCvv = ref(true)
const cvvLabel = ref('CVV')
const formData = reactive({
  sourceId: '',
  sourceType: 'card',
  verification: 'cvv',
  amount: '0.00',
  autoCapture: true,
  cvv: '',
  description: '',
  channel: '',
  verificationSuccessUrl: '',
  verificationFailureUrl: '',
  phoneNumber: '',
  email: '',
})

const verificationMethods = ['none', 'cvv', 'three_d_secure']
const sourceType = ['card', 'ach', 'payment_token']
const error = ref<any>({})
const loading = ref(false)
const showError = ref(false)

const payload = computed(() => store.getRequestPayload)
const response = computed(() => store.getRequestResponse)
const requestUrl = computed(() => store.getRequestUrl)

watch(
  () => formData.verification,
  (val: string) => {
    if (val === 'none') {
      showCvv.value = false
    }
    if (val === 'cvv') {
      showCvv.value = true
      cvvLabel.value = 'CVV'
    }
    if (val === 'three_d_secure') {
      showCvv.value = true
      cvvLabel.value = 'CVV (Optional)'
    }
  },
  { immediate: true },
)

watch(
  () => formData.sourceType,
  (val: string) => {
    if (val === 'card') {
      formData.verification = 'cvv'
    } else {
      formData.verification = 'none'
    }
  },
  { immediate: true },
)

const onErrorSheetClosed = () => {
  error.value = {}
  showError.value = false
}

const makeApiCall = async () => {
  loading.value = true
  const amountDetail = {
    amount: formData.amount,
    currency: 'USD',
  }
  const sourceDetails = {
    id: formData.sourceId,
    type: formData.sourceType,
  }
  const payloadData: CreateCardPaymentPayload = {
    idempotencyKey: uuidv4(),
    autoCapture: formData.autoCapture,
    amount: amountDetail,
    source: sourceDetails,
    description: formData.description,
    verificationSuccessUrl: formData.verificationSuccessUrl,
    verificationFailureUrl: formData.verificationFailureUrl,
    metadata: {
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      sessionId: 'xxx',
      ipAddress: '172.33.222.1',
    },
    channel: formData.channel,
  }

  if (formData.sourceType === 'card') {
    payloadData.verification = formData.verification
  }

  try {
    if (
      formData.verification === 'cvv' ||
      (formData.verification === 'three_d_secure' && formData.cvv !== '')
    ) {
      const { cvv } = formData
      const cardDetails = { cvv }

      const publicKeyResponse = await $paymentsApi.getPCIPublicKey()
      const encryptedData = await openPGP.encrypt(
        cardDetails,
        publicKeyResponse.data,
      )
      payloadData.encryptedData = encryptedData.encryptedMessage
      payloadData.keyId = encryptedData.keyId
    }
    await $paymentsApi.createPayment(payloadData)
  } catch (err) {
    error.value = err
    showError.value = true
  } finally {
    loading.value = false
  }
}
</script>
