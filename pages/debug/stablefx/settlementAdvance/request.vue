<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="4">
        <v-form v-model="validForm">
          <v-text-field
            v-model="formData.idempotencyKey"
            :rules="[required]"
            hint="Unique key for this advance"
            label="Idempotency Key"
          />
          <v-text-field
            v-model="formData.tradeId"
            :rules="[required]"
            label="Trade ID"
          />
          <v-text-field
            v-model="formData.signature"
            :rules="[required]"
            label="Signature"
            placeholder="Enter signature string"
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
            Request Advance
          </v-btn>
          <v-btn
            v-if="advanceId"
            variant="flat"
            class="mb-7"
            color="secondary"
            block
            @click.prevent="goToAdvanceDetails"
          >
            Proceed to Get Advance By ID
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
import { v4 as uuidv4 } from 'uuid'
import type { RequestSettlementAdvancePayload } from '~/lib/stablefxTradesApi'

const store = useMainStore()
const { $stablefxTradesApi } = useNuxtApp()
const route = useRoute()
const router = useRouter()

const validForm = ref(false)
const advanceId = ref('')
const formData = reactive({
  idempotencyKey: (route.query.idempotencyKey as string) || uuidv4(),
  tradeId: (route.query.tradeId as string) || '',
  signature: (route.query.signature as string) || '',
  permit2DataMessage: (route.query.permit2Data as string) || '',
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
  advanceId.value = ''

  try {
    const permit2 = JSON.parse(formData.permit2DataMessage)

    const payloadData: RequestSettlementAdvancePayload = {
      idempotencyKey: formData.idempotencyKey,
      tradeId: formData.tradeId,
      permit2,
      signature: formData.signature,
    }

    const result =
      await $stablefxTradesApi.requestSettlementAdvance(payloadData)

    if ((result as any)?.advanceId) {
      advanceId.value = (result as any).advanceId
    }
  } catch (err) {
    error.value = err
    showError.value = true
  } finally {
    loading.value = false
  }
}

const goToAdvanceDetails = () => {
  router.push({
    path: '/debug/stablefx/settlementAdvance/details',
    query: {
      advanceId: advanceId.value,
    },
  })
}
</script>
