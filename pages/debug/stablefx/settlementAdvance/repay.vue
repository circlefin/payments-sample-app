<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="4">
        <v-form v-model="validForm">
          <v-text-field
            v-model="formData.idempotencyKey"
            :rules="[required]"
            hint="Unique key for this repayment"
            label="Idempotency Key"
          />
          <v-text-field
            v-model="formData.currency"
            :rules="[required]"
            hint="Settlement advance currency code (e.g., USDC)"
            label="Currency"
          />
          <v-text-field
            v-model="formData.amount"
            :rules="[required]"
            hint="Numeric amount with up to six decimal places"
            label="Amount"
          />
          <v-btn
            variant="flat"
            class="mb-7"
            color="primary"
            :loading="loading"
            :disabled="!validForm || loading"
            @click.prevent="makeApiCall"
          >
            Repay Advance
          </v-btn>
          <v-btn
            v-if="repaymentId"
            variant="flat"
            class="mb-7 ml-3"
            color="secondary"
            @click.prevent="goToRepayment"
          >
            Proceed to Get Repayment
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
import type { RepaySettlementAdvancePayload } from '~/lib/stablefxTradesApi'

const store = useMainStore()
const { $stablefxTradesApi } = useNuxtApp()
const router = useRouter()

const validForm = ref(false)
const repaymentId = ref('')
const formData = reactive({
  idempotencyKey: uuidv4(),
  currency: '',
  amount: '',
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
  repaymentId.value = ''

  try {
    const payloadData: RepaySettlementAdvancePayload = {
      idempotencyKey: formData.idempotencyKey,
      amount: {
        currency: formData.currency,
        amount: formData.amount,
      },
    }

    const result = await $stablefxTradesApi.repaySettlementAdvance(payloadData)

    if ((result as any)?.id) {
      repaymentId.value = (result as any).id
    }
  } catch (err) {
    error.value = err
    showError.value = true
  } finally {
    loading.value = false
  }
}

const goToRepayment = () => {
  router.push({
    path: '/debug/stablefx/settlementAdvance/repayment',
    query: {
      repaymentId: repaymentId.value,
    },
  })
}
</script>
