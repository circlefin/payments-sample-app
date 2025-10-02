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

          <v-text-field
            v-model="formData.signature"
            :rules="[required]"
            label="Signature"
            placeholder="Enter signature string"
          />

          <v-select
            v-model="formData.fundingMode"
            :items="fundingModeOptions"
            :rules="[required, validateNetMode]"
            label="Funding Mode"
          />

          <v-select
            v-model="formData.permit2Type"
            :items="permit2TypeOptions"
            :rules="[required]"
            label="Permit2 Type"
          />

          <!-- Single Trade Witness Fields -->
          <div v-if="formData.permit2Type === 'single'">
            <v-divider class="my-4" />
            <h3 class="subtitle-1 mb-2">Single Trade Witness Permit2</h3>

            <v-text-field
              v-model="formData.single.permitted.token"
              :rules="[required]"
              label="Token Address"
              placeholder="0x1c7d4b196cb0c7b01d743fbc6116a902379c7238"
            />

            <v-text-field
              v-model.number="formData.single.permitted.amount"
              :rules="[required, numberRule]"
              label="Amount"
              type="number"
              placeholder="570000"
            />

            <v-text-field
              v-model="formData.single.spender"
              :rules="[required]"
              label="Spender Address"
              placeholder="0x1f91886C7028986aD885ffCee0e40b75C9cd5aC1"
            />

            <v-text-field
              v-model.number="formData.single.nonce"
              :rules="[required, numberRule]"
              label="Nonce"
              type="number"
              placeholder="60410883"
            />

            <v-text-field
              v-model.number="formData.single.deadline"
              :rules="[required, numberRule]"
              label="Deadline"
              type="number"
              placeholder="1757608742"
            />

            <v-text-field
              v-model.number="formData.single.witness.id"
              :rules="[required, numberRule]"
              label="Witness ID"
              type="number"
              placeholder="24"
            />
          </div>

          <!-- Batch Trade Witness Fields -->
          <div v-if="formData.permit2Type === 'batch'">
            <v-divider class="my-4" />
            <h3 class="subtitle-1 mb-2">Batch Trade Witness Permit2</h3>

            <!-- Permitted Tokens Section -->
            <div class="mb-4">
              <div class="d-flex justify-space-between align-center mb-2">
                <h4 class="subtitle-2">Permitted Tokens</h4>
                <v-btn
                  size="small"
                  color="primary"
                  variant="outlined"
                  @click="addPermittedToken"
                >
                  Add Token
                </v-btn>
              </div>

              <div
                v-for="(token, index) in formData.batch.permittedTokens"
                :key="index"
                class="mb-3 pa-3 border rounded"
              >
                <div class="d-flex justify-space-between align-center mb-2">
                  <span class="subtitle-2">Token {{ index + 1 }}</span>
                  <v-btn
                    v-if="formData.batch.permittedTokens.length > 1"
                    size="small"
                    color="error"
                    variant="text"
                    icon="mdi-delete"
                    @click="removePermittedToken(index)"
                  />
                </div>

                <v-text-field
                  v-model="token.token"
                  :rules="[required]"
                  label="Token Address"
                  placeholder="0x1c7d4b196cb0c7b01d743fbc6116a902379c7238"
                  class="mb-2"
                />

                <v-text-field
                  v-model.number="token.amount"
                  :rules="[required, numberRule]"
                  label="Amount"
                  type="number"
                  placeholder="570000"
                />
              </div>
            </div>

            <v-text-field
              v-model="formData.batch.spender"
              :rules="[required]"
              label="Spender Address"
              placeholder="0x1f91886C7028986aD885ffCee0e40b75C9cd5aC1"
            />

            <v-text-field
              v-model.number="formData.batch.nonce"
              :rules="[required, numberRule]"
              label="Nonce"
              type="number"
              placeholder="60410883"
            />

            <v-text-field
              v-model.number="formData.batch.deadline"
              :rules="[required, numberRule]"
              label="Deadline"
              type="number"
              placeholder="1757608742"
            />

            <v-text-field
              v-model="formData.batch.witnessIds"
              :rules="[required]"
              label="Witness IDs"
              placeholder="24,25,26"
              hint="Enter comma-separated numbers"
              persistent-hint
            />
          </div>

          <v-btn
            variant="flat"
            class="mb-7 mt-4"
            color="primary"
            :loading="loading"
            :disabled="!validForm || loading"
            block
            @click.prevent="makeApiCall"
          >
            Fund CPS Trade
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
import type {
  CpsFundPayload,
  SingleTradeWitnessPermit2,
  BatchTradeWitnessPermit2,
} from '~/lib/stablefxTradesApi'

const store = useMainStore()
const { $stablefxTradesApi } = useNuxtApp()

const validForm = ref(false)
const formData = reactive({
  type: '' as 'maker' | 'taker' | '',
  signature: '',
  fundingMode: '' as 'gross' | 'net' | '',
  permit2Type: '' as 'single' | 'batch' | '',
  single: {
    permitted: {
      token: '',
      amount: 0,
    },
    spender: '',
    nonce: 0,
    deadline: 0,
    witness: {
      id: 0,
    },
  },
  batch: {
    permittedTokens: [
      {
        token: '',
        amount: 0,
      },
    ],
    spender: '',
    nonce: 0,
    deadline: 0,
    witnessIds: '',
  },
})

const typeOptions = [
  { title: 'Maker', value: 'maker' },
  { title: 'Taker', value: 'taker' },
]

const fundingModeOptions = [
  { title: 'Gross', value: 'gross' },
  { title: 'Net', value: 'net' },
]

const permit2TypeOptions = [
  { title: 'Single Trade Witness', value: 'single' },
  { title: 'Batch Trade Witness', value: 'batch' },
]

const error = ref<any>({})
const loading = ref(false)
const showError = ref(false)

const payload = computed(() => store.getRequestPayload)
const response = computed(() => store.getRequestResponse)
const requestUrl = computed(() => store.getRequestUrl)

const required = (v: string | number) => !!v || 'Field is required'
const numberRule = (v: number) =>
  (!isNaN(v) && v > 0) || 'Must be a positive number'

const validateNetMode = (v: string) => {
  if (v === 'net' && formData.type !== 'maker') {
    return 'Net funding mode is only available for makers'
  }
  return true
}

const onErrorSheetClosed = () => {
  error.value = {}
  showError.value = false
}

const addPermittedToken = () => {
  formData.batch.permittedTokens.push({
    token: '',
    amount: 0,
  })
}

const removePermittedToken = (index: number) => {
  if (formData.batch.permittedTokens.length > 1) {
    formData.batch.permittedTokens.splice(index, 1)
  }
}

const makeApiCall = async () => {
  loading.value = true

  try {
    let permit2: SingleTradeWitnessPermit2 | BatchTradeWitnessPermit2

    if (formData.permit2Type === 'single') {
      permit2 = {
        permitted: {
          token: formData.single.permitted.token,
          amount: formData.single.permitted.amount,
        },
        spender: formData.single.spender,
        nonce: formData.single.nonce,
        deadline: formData.single.deadline,
        witness: {
          id: formData.single.witness.id,
        },
      }
    } else {
      // Use the permitted tokens array directly
      const permittedTokens = formData.batch.permittedTokens.map((token) => ({
        token: token.token,
        amount: token.amount,
      }))

      // Parse witness IDs
      const witnessIds = formData.batch.witnessIds
        .split(',')
        .map((id) => parseInt(id.trim()))
        .filter((id) => !isNaN(id))

      permit2 = {
        permitted: permittedTokens,
        spender: formData.batch.spender,
        nonce: formData.batch.nonce,
        deadline: formData.batch.deadline,
        witness: {
          ids: witnessIds,
        },
      }
    }

    const payloadData: CpsFundPayload = {
      type: formData.type as 'maker' | 'taker',
      signature: formData.signature,
      fundingMode: formData.fundingMode as 'gross' | 'net',
      permit2,
    }

    await $stablefxTradesApi.fund(payloadData)
  } catch (err) {
    error.value = err
    showError.value = true
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.border {
  border: 1px solid rgba(0, 0, 0, 0.12);
}
.rounded {
  border-radius: 4px;
}
</style>
