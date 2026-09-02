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
            :rules="[required, validateNetMode]"
            label="Funding Mode"
          />

          <!-- Delegate mode: batch from store -->
          <template
            v-if="
              (formData.fundingMode === 'delegate' ||
                formData.fundingMode === 'net_delegate') &&
              hasDelegateBatch
            "
          >
            <v-alert type="info" variant="tonal" density="compact" class="mb-4">
              {{ delegateBatch.length }} trade(s) loaded from presign. Click
              "Fund All Delegate Trades" to submit each one.
            </v-alert>

            <v-list density="compact" class="mb-4">
              <v-list-item
                v-for="entry in delegateBatch"
                :key="entry.contractTradeId"
              >
                <v-list-item-title>
                  {{ entry.contractTradeId }}
                </v-list-item-title>
                <template #append>
                  <v-chip
                    v-if="batchFundResults[entry.contractTradeId] === 'success'"
                    color="success"
                    size="small"
                  >
                    Funded
                  </v-chip>
                  <v-chip
                    v-else-if="
                      batchFundResults[entry.contractTradeId] === 'error'
                    "
                    color="error"
                    size="small"
                  >
                    Error
                  </v-chip>
                  <v-chip v-else color="default" size="small">Pending</v-chip>
                </template>
              </v-list-item>
            </v-list>

            <v-btn
              variant="flat"
              class="mb-7"
              color="primary"
              :loading="loading"
              :disabled="loading || batchFundComplete"
              block
              @click.prevent="fundDelegateBatch"
            >
              Fund All Delegate Trades
            </v-btn>
          </template>

          <!-- Delegate mode: manual entry -->
          <template
            v-else-if="
              (formData.fundingMode === 'delegate' ||
                formData.fundingMode === 'net_delegate') &&
              !hasDelegateBatch
            "
          >
            <v-text-field
              v-model="formData.signature"
              :rules="[required]"
              label="Trader Signature"
              placeholder="Enter trader signature string"
            />

            <v-textarea
              v-model="formData.permit2DataMessage"
              :rules="[required, isValidJSON]"
              label="Trader Permit2 Message (JSON)"
              rows="8"
              auto-grow
              hint="Paste the trader's DelegateFundingAuthorization permit message JSON"
            />

            <v-text-field
              v-model="formData.funderSignature"
              :rules="[required]"
              label="Funder Signature"
              placeholder="Enter funder signature string"
            />

            <v-textarea
              v-model="formData.funderPermit2DataMessage"
              :rules="[required, isValidJSON]"
              label="Funder Permit2 Message (JSON)"
              rows="6"
              auto-grow
              hint="Paste the funder's DelegateFundingWitness permit message JSON"
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
              Fund Trade
            </v-btn>
          </template>

          <!-- Gross / net mode -->
          <template v-else>
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
              Fund Trade
            </v-btn>
          </template>
        </v-form>

        <!-- Success Message -->
        <v-card v-if="fundingSuccess" class="mt-6">
          <v-card-text>
            <v-alert type="success" variant="tonal" class="mb-4">
              Trade(s) funded successfully!
            </v-alert>
            <v-btn
              variant="flat"
              color="secondary"
              block
              @click.prevent="goToGetTrades"
            >
              View All Trades
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
import type { StableFXFundPayload } from '~/lib/stablefxTradesApi'
import type { DelegateFundingEntry } from '~/stores/main'

const store = useMainStore()
const { $stablefxTradesApi } = useNuxtApp()
const route = useRoute()
const router = useRouter()

const validForm = ref(false)
const fundingSuccess = ref(false)
const formData = reactive({
  type:
    (route.query.type as 'maker' | 'taker') || ('' as 'maker' | 'taker' | ''),
  signature: (route.query.signature as string) || '',
  fundingMode:
    (route.query.fundingMode as
      | 'gross'
      | 'net'
      | 'delegate'
      | 'net_delegate') ||
    ('' as 'gross' | 'net' | 'delegate' | 'net_delegate' | ''),
  permit2DataMessage: (route.query.permit2Data as string) || '',
  funderSignature: '',
  funderPermit2DataMessage: '',
})

const batchFundResults = ref<Record<string, 'success' | 'error' | 'pending'>>(
  {},
)

const typeOptions = [
  { title: 'Maker', value: 'maker' },
  { title: 'Taker', value: 'taker' },
]

const fundingModeOptions = [
  { title: 'Gross', value: 'gross' },
  { title: 'Net', value: 'net' },
  { title: 'Delegate', value: 'delegate' },
  { title: 'Net Delegate', value: 'net_delegate' },
]

const error = ref<any>({})
const loading = ref(false)
const showError = ref(false)

const payload = computed(() => store.getRequestPayload)
const response = computed(() => store.getRequestResponse)
const requestUrl = computed(() => store.getRequestUrl)

const delegateBatch = computed<DelegateFundingEntry[]>(
  () => store.getDelegateFundingBatch,
)

const hasDelegateBatch = computed(() => delegateBatch.value.length > 0)

const batchFundComplete = computed(
  () =>
    delegateBatch.value.length > 0 &&
    delegateBatch.value.every(
      (e: DelegateFundingEntry) =>
        batchFundResults.value[e.contractTradeId] === 'success' ||
        batchFundResults.value[e.contractTradeId] === 'error',
    ),
)

const required = (v: string | number) => !!v || 'Field is required'
const isValidJSON = (v: string) => {
  if (!v) return 'Field is required'
  try {
    JSON.parse(v)
    return true
  } catch {
    return 'Please enter valid JSON'
  }
}

const validateNetMode = (v: string) => {
  if ((v === 'net' || v === 'net_delegate') && formData.type !== 'maker') {
    return 'Net and net_delegate funding modes are only available for makers'
  }
  return true
}

const onErrorSheetClosed = () => {
  error.value = {}
  showError.value = false
}

const makeApiCall = async () => {
  loading.value = true
  fundingSuccess.value = false

  try {
    const permit2 = JSON.parse(formData.permit2DataMessage)

    const fundPayload: StableFXFundPayload = {
      type: formData.type as 'maker' | 'taker',
      signature: formData.signature,
      fundingMode: formData.fundingMode as 'gross' | 'net' | 'delegate',
      permit2,
    }

    if (
      formData.fundingMode === 'delegate' ||
      formData.fundingMode === 'net_delegate'
    ) {
      fundPayload.funderPermit2 = JSON.parse(formData.funderPermit2DataMessage)
      fundPayload.funderSignature = formData.funderSignature
    }

    await $stablefxTradesApi.fund(fundPayload)
    fundingSuccess.value = true
  } catch (err) {
    error.value = err
    showError.value = true
  } finally {
    loading.value = false
  }
}

const fundDelegateBatch = async () => {
  loading.value = true
  fundingSuccess.value = false

  const results: Record<string, 'success' | 'error' | 'pending'> = {}
  for (const entry of delegateBatch.value) {
    results[entry.contractTradeId] = 'pending'
  }
  batchFundResults.value = results

  // Both delegate and net_delegate: the batch permit covers all trades in a single API call.
  // funding-presign stores the same shared typed data on every entry regardless of mode,
  // so one fund call using the first entry is correct for all cases.
  const entry = delegateBatch.value[0]
  try {
    const fundPayload: StableFXFundPayload = {
      type: formData.type as 'maker' | 'taker',
      signature: entry.traderSignature,
      fundingMode: formData.fundingMode as 'delegate' | 'net_delegate',
      permit2: entry.traderTypedData?.message,
      funderPermit2: entry.funderTypedData?.message,
      funderSignature: entry.funderSignature,
    }
    await $stablefxTradesApi.fund(fundPayload)
    const succeeded: Record<string, 'success' | 'error' | 'pending'> = {}
    for (const e of delegateBatch.value) {
      succeeded[e.contractTradeId] = 'success'
    }
    batchFundResults.value = succeeded
    fundingSuccess.value = true
    store.clearDelegateFundingBatch()
  } catch (err) {
    const failed: Record<string, 'success' | 'error' | 'pending'> = {}
    for (const e of delegateBatch.value) {
      failed[e.contractTradeId] = 'error'
    }
    batchFundResults.value = failed
    error.value = err
    showError.value = true
  } finally {
    loading.value = false
  }
}

const goToGetTrades = () => {
  router.push({
    path: '/debug/stablefx/fetch',
    query: {
      type: formData.type,
    },
  })
}
</script>
