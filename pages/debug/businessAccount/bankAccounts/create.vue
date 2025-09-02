<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="4">
        <v-menu>
          <template #activator="{ props }">
            <div class="d-flex flex-row-reverse">
              <v-btn
                v-if="isSandbox"
                size="small"
                color="blue-grey-lighten-1"
                dark
                v-bind="props"
              >
                Prefill form
              </v-btn>
            </div>
          </template>
          <v-list>
            <v-list-item
              v-for="(item, index) in prefillItems"
              :key="index"
              @click="prefillForm(index)"
            >
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>

        <v-form>
          <v-text-field
            v-model="formData.beneficiaryName"
            label="Beneficiary Name"
            hint="Full name of the bank account holder"
          />

          <v-text-field
            v-model="formData.accountNumber"
            label="Account Number"
          />

          <v-text-field
            v-model="formData.routingNumber"
            label="Routing Number"
            hint="RTN/BIC/Swift code of the bank associated with the account. Required for US accounts"
          />

          <v-text-field
            v-model="formData.iban"
            label="IBAN"
            hint="International Bank Account Number (IBAN) that identifies the account. Required for accounts outside of the US"
          />

          <v-text-field
            v-model="formData.ffcMemo"
            label="FFC Memo"
            hint="FFC Memo"
          />

          <v-text-field
            v-model="formData.billingDetails.name"
            label="Billing Name"
          />

          <v-text-field
            v-model="formData.billingDetails.line1"
            label="Billing Address Line 1"
          />

          <v-text-field
            v-model="formData.billingDetails.line2"
            label="Billing Address Line 2"
          />

          <v-text-field
            v-model="formData.billingDetails.postalCode"
            label="Billing Postalcode"
          />

          <v-text-field
            v-model="formData.billingDetails.city"
            label="Billing City"
          />

          <v-text-field
            v-model="formData.billingDetails.district"
            label="Billing District"
            hint="State / County / Province / Region portion of the address. US and Canada use the two-letter code for the subdivision"
          />

          <v-text-field
            v-model="formData.billingDetails.country"
            label="Billing Country Code"
          />

          <v-text-field
            v-model="formData.bankAddress.bankName"
            label="Bank Name"
          />

          <v-text-field
            v-model="formData.bankAddress.line1"
            label="Bank Address Line 1"
          />

          <v-text-field
            v-model="formData.bankAddress.line2"
            label="Bank Address Line 2"
          />

          <v-text-field
            v-model="formData.bankAddress.postalCode"
            label="Bank Postalcode"
          />

          <v-text-field
            v-model="formData.bankAddress.city"
            label="Bank Address City"
          />

          <v-text-field
            v-model="formData.bankAddress.district"
            label="Bank Address District"
            hint="State / County / Province / Region portion of the address. US and Canada use the two-letter code for the subdivision"
          />

          <v-text-field
            v-model="formData.bankAddress.country"
            label="Bank Address Country Code"
          />

          <v-text-field
            v-model="formData.intermediaryBank.identifier"
            label="Intermediary Bank Identifier"
          />

          <v-text-field
            v-model="formData.intermediaryBank.type"
            label="Intermediary Bank Identitifer Type"
            hint="ABA for US domestic accounts, BIC for international"
          />

          <v-text-field
            v-model="formData.intermediaryBank.countryCode"
            label="Intermediary Bank Country Code"
          />
          <v-btn
            variant="flat"
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
      @on-change="onErrorSheetClosed"
    />
  </v-container>
</template>

<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid'
import { getLive } from '@/lib/apiTarget'
import { exampleBankAccounts } from '@/lib/businessAccount/bankAccountsTestData'
import type { CreateWireAccountPayload } from '@/lib/businessAccount/bankAccountsApi'

const store = useMainStore()
const { $bankAccountsApi } = useNuxtApp()

// data
const formData = reactive({
  beneficiaryName: '',
  accountNumber: '',
  routingNumber: '',
  iban: '',
  ffcMemo: '',
  billingDetails: {
    name: '',
    city: '',
    country: '',
    line1: '',
    line2: '',
    district: '',
    postalCode: '',
  },
  bankAddress: {
    bankName: '',
    city: '',
    country: '',
    line1: '',
    line2: '',
    district: '',
    postalCode: '',
  },
  intermediaryBank: {
    identifier: '',
    type: '',
    countryCode: '',
  },
})

const rules = {
  isNumber: (v: string) =>
    v === '' || !isNaN(parseInt(v)) || 'Please enter valid number',
  required: (v: string) => !!v || 'Field is required',
}

const prefillItems = exampleBankAccounts
const error = ref<any>({})
const loading = ref(false)
const showError = ref(false)
const expiryLabels = {
  month: 'Expiry Month',
  year: 'Expiry Year',
}

const isSandbox = !getLive()

// computed
const payload = computed(() => store.getRequestPayload)
const response = computed(() => store.getRequestResponse)
const requestUrl = computed(() => store.getRequestUrl)

// methods
const onErrorSheetClosed = () => {
  error.value = {}
  showError.value = false
}

const prefillForm = (index: number) => {
  Object.assign(formData, prefillItems[index].formData)
}

const makeApiCall = async () => {
  loading.value = true
  const {
    beneficiaryName,
    accountNumber,
    routingNumber,
    iban,
    ffcMemo,
    ...data
  } = formData
  const { billingDetails, bankAddress, intermediaryBank } = data

  const payload: CreateWireAccountPayload = {
    idempotencyKey: uuidv4(),
    beneficiaryName,
    accountNumber,
    routingNumber,
    iban,
    ffcMemo,
    billingDetails: {
      name: billingDetails.name,
      line1: billingDetails.line1,
      line2: billingDetails.line2,
      city: billingDetails.city,
      district: billingDetails.district,
      country: billingDetails.country,
      postalCode: billingDetails.postalCode,
    },
    bankAddress: {
      bankName: bankAddress.bankName,
      line1: bankAddress.line1,
      line2: bankAddress.line2,
      city: bankAddress.city,
      district: bankAddress.district,
      country: bankAddress.country,
      postalCode: bankAddress.postalCode,
    },
  }

  if (intermediaryBank.identifier.length > 0) {
    payload.intermediaryBank = {
      identifier: intermediaryBank.identifier,
      type: intermediaryBank.type,
      countryCode: intermediaryBank.countryCode,
    }
  }

  try {
    await $bankAccountsApi.createBankAccount(payload)
  } catch (err) {
    error.value = err
    showError.value = true
  } finally {
    loading.value = false
  }
}
</script>
