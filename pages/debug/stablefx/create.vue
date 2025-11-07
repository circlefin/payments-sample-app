<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="4">
        <v-form v-model="validForm">
          <v-text-field
            v-model="formData.quoteId"
            :rules="[required]"
            hint="ID of FX quote to trade on"
            label="Quote ID"
          />
          <v-text-field
            v-model="formData.idempotencyKey"
            :rules="[required]"
            hint="Unique key for this trade"
            label="Idempotency Key"
          />
          <v-btn
            variant="flat"
            class="mb-7"
            color="primary"
            :loading="loading"
            :disabled="!validForm || loading"
            @click.prevent="makeApiCall"
          >
            Make api call
          </v-btn>
          <v-btn
            v-if="tradeId"
            variant="flat"
            class="mb-7 ml-3"
            color="secondary"
            @click.prevent="goToPresign"
          >
            Proceed to Presign
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
import type { CreateStableFXTradePayload } from '~/lib/stablefxTradesApi'

const store = useMainStore()
const { $stablefxTradesApi } = useNuxtApp()
const route = useRoute()
const router = useRouter()

const validForm = ref(false)
const tradeId = ref('')
const formData = reactive({
  quoteId: (route.query.quoteId as string) || '',
  idempotencyKey: (route.query.idempotencyKey as string) || uuidv4(),
})
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

  const payloadData: CreateStableFXTradePayload = {
    idempotencyKey: formData.idempotencyKey,
    quoteId: formData.quoteId,
  }

  try {
    const response = await $stablefxTradesApi.createTrade(payloadData)

    // Extract trade ID from response
    if ((response as any)?.id) {
      tradeId.value = (response as any).id
    }
  } catch (err) {
    error.value = err
    showError.value = true
  } finally {
    loading.value = false
  }
}

const goToPresign = () => {
  router.push({
    path: '/debug/stablefx/presign',
    query: {
      tradeId: tradeId.value,
    },
  })
}
</script>
