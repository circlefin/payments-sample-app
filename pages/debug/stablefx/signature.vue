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
          <v-select
            v-model="formData.type"
            :items="['maker', 'taker']"
            :rules="[required]"
            label="Trader Type"
          />
          <v-text-field
            v-model="formData.address"
            :rules="[required]"
            label="Address"
          />
          <v-text-field
            v-model="formData.signature"
            :rules="[required]"
            label="Signature"
          />
          <v-textarea
            v-model="formData.typedDataMessage"
            :rules="[required, isValidJSON]"
            label="Typed Data Message (JSON)"
            rows="15"
            auto-grow
            hint="Paste the typedData.message JSON object here"
          />
          <v-btn
            variant="flat"
            class="mb-7"
            color="primary"
            :loading="loading"
            :disabled="!validForm || loading"
            @click.prevent="makeApiCall"
          >
            Register Signature
          </v-btn>
          <v-btn
            v-if="registrationSuccess"
            variant="flat"
            class="mb-7 ml-3"
            color="secondary"
            @click.prevent="goToTradeDetails"
          >
            Proceed to Get Trade By ID
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
import type { CreatePiFXSignaturePayload } from '~/lib/stablefxTradesApi'

const store = useMainStore()
const { $stablefxTradesApi } = useNuxtApp()
const route = useRoute()
const router = useRouter()

const validForm = ref(false)
const registrationSuccess = ref(false)
const formData = reactive({
  tradeId: (route.query.tradeId as string) || '',
  type: (route.query.type as string) || '',
  address: '',
  signature: (route.query.signature as string) || '',
  typedDataMessage: (route.query.typedDataMessage as string) || '',
})

const error = ref<any>({})
const loading = ref(false)
const showError = ref(false)

const payload = computed(() => store.getRequestPayload)
const response = computed(() => store.getRequestResponse)
const requestUrl = computed(() => store.getRequestUrl)

const required = (v: string) => !!v || 'Field is required'
const isValidJSON = (v: string) => {
  if (!v) return 'Field is required'
  try {
    JSON.parse(v)
    return true
  } catch (e) {
    return 'Please enter valid JSON'
  }
}

const onErrorSheetClosed = () => {
  error.value = {}
  showError.value = false
}

const makeApiCall = async () => {
  loading.value = true
  registrationSuccess.value = false

  try {
    // Parse the typed data message JSON
    const parsedMessage = JSON.parse(formData.typedDataMessage)
    
    const payloadData: CreatePiFXSignaturePayload = {
      tradeId: formData.tradeId,
      type: formData.type,
      address: formData.address,
      details: parsedMessage,
      signature: formData.signature,
    }

    await $stablefxTradesApi.registerSignature(payloadData)
    registrationSuccess.value = true
  } catch (err) {
    error.value = err
    showError.value = true
  } finally {
    loading.value = false
  }
}

const goToTradeDetails = () => {
  router.push({
    path: '/debug/stablefx/details',
    query: {
      tradeId: formData.tradeId,
      type: formData.type,
    },
  })
}
</script>
