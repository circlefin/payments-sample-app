<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="4">
        <v-form>
          <v-text-field
            v-model="formData.idempotencyKey"
            label="Idempotency Key (auto-generated if empty)"
          />
          <v-text-field v-model="formData.address" label="Address" />
          <v-select
            v-model="formData.chain"
            :items="supportedChains"
            label="Blockchain"
          />
          <v-text-field
            v-model="formData.addressTag"
            label="Address Tag (optional)"
          />
          <v-text-field v-model="formData.email" label="Email (optional)" />
          <v-text-field v-model="formData.bns" label="BNS (optional)" />
          <v-text-field
            v-model="formData.nickname"
            label="Nickname (optional)"
          />
          <v-text-field
            v-model="formData.walletId"
            label="Wallet ID (optional)"
          />

          <v-divider class="my-4" />
          <v-alert type="info" density="compact" variant="tonal" class="mb-3">
            Identity and Ownership below are required for SG legal entities
          </v-alert>
          <div class="text-subtitle-2 mb-2">Identity (optional)</div>
          <v-select
            v-model="formData.identityType"
            :items="identityTypes"
            label="Identity Type"
            clearable
          />
          <v-text-field
            v-if="formData.identityType === 'individual'"
            v-model="formData.firstName"
            label="First Name"
          />
          <v-text-field
            v-if="formData.identityType === 'individual'"
            v-model="formData.lastName"
            label="Last Name"
          />
          <v-text-field
            v-if="formData.identityType === 'business'"
            v-model="formData.businessName"
            label="Business Name"
          />
          <v-text-field
            v-if="formData.identityType === 'business'"
            v-model="formData.lei"
            label="LEI (optional)"
          />

          <template v-if="formData.identityType === 'individual'">
            <v-text-field
              v-model="formData.individualDateOfBirth"
              label="Date of Birth (yyyy-MM-dd)"
            />
            <v-text-field
              v-model="formData.individualNationality"
              label="Nationality"
            />
            <v-text-field
              v-model="formData.individualAddressLine1"
              label="Address Line 1"
            />
            <v-text-field
              v-model="formData.individualAddressLine2"
              label="Address Line 2 (optional)"
            />
            <v-text-field v-model="formData.individualCity" label="City" />
            <v-text-field
              v-model="formData.individualDistrict"
              label="District"
            />
            <v-text-field
              v-model="formData.individualPostalCode"
              label="Postal Code"
            />
            <v-text-field
              v-model="formData.individualCountry"
              label="Country"
            />
            <v-text-field
              v-model="formData.individualGovernmentIssuedId"
              label="Government Issued ID"
            />
          </template>

          <template v-if="formData.identityType === 'business'">
            <v-text-field
              v-model="formData.businessDateOfIncorporation"
              label="Date of Incorporation (yyyy-MM-dd)"
            />
            <v-text-field
              v-model="formData.businessAddressLine1"
              label="Address Line 1"
            />
            <v-text-field
              v-model="formData.businessAddressLine2"
              label="Address Line 2 (optional)"
            />
            <v-text-field v-model="formData.businessCity" label="City" />
            <v-text-field
              v-model="formData.businessDistrict"
              label="District"
            />
            <v-text-field
              v-model="formData.businessPostalCode"
              label="Postal Code"
            />
            <v-text-field v-model="formData.businessCountry" label="Country" />
            <v-text-field
              v-model="formData.businessRegistrationNumber"
              label="Business Registration Number"
            />
            <v-text-field
              v-model="formData.businessCountryOfIncorporation"
              label="Country of Incorporation"
            />
            <v-text-field
              v-model="formData.businessIdentificationNumber"
              label="Business Identification Number"
            />
          </template>

          <div class="text-subtitle-2 mb-2">Ownership (optional)</div>
          <v-select
            v-model="formData.ownershipType"
            :items="ownershipTypes"
            label="Ownership Type"
            clearable
          />
          <v-select
            v-if="formData.ownershipType"
            v-model="formData.custodyType"
            :items="custodyTypes"
            label="Custody Type"
          />
          <v-text-field
            v-if="formData.custodyType === 'hosted'"
            v-model="formData.vaspId"
            label="VASP ID"
          />

          <v-btn
            variant="flat"
            class="mb-7"
            color="primary"
            :loading="loading"
            @click.prevent="makeApiCall"
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
import type { CreateRecipientPayload } from '~/lib/beta/addressBookApi'

const store = useMainStore()
const { $addressBookApiBeta } = useNuxtApp()

const formData = reactive({
  idempotencyKey: '',
  address: '',
  chain: '',
  addressTag: '',
  email: '',
  bns: '',
  nickname: '',
  walletId: '',
  identityType: '',
  firstName: '',
  lastName: '',
  businessName: '',
  lei: '',
  individualDateOfBirth: '',
  individualNationality: '',
  individualAddressLine1: '',
  individualAddressLine2: '',
  individualCity: '',
  individualDistrict: '',
  individualPostalCode: '',
  individualCountry: '',
  individualGovernmentIssuedId: '',
  businessDateOfIncorporation: '',
  businessAddressLine1: '',
  businessAddressLine2: '',
  businessCity: '',
  businessDistrict: '',
  businessPostalCode: '',
  businessCountry: '',
  businessRegistrationNumber: '',
  businessCountryOfIncorporation: '',
  businessIdentificationNumber: '',
  ownershipType: '',
  custodyType: '',
  vaspId: '',
})

const required = [(v: string) => !!v || 'Field is required']
const supportedChains = [
  'ETH',
  'MATIC',
  'POLY',
  'SOL',
  'TRX',
  'DOT',
  'PAH',
  'EVMOS',
]
const identityTypes = ['individual', 'business']
const ownershipTypes = ['third_party']
const custodyTypes = ['hosted', 'self_hosted']

const error = ref<any>({})
const loading = ref(false)
const showError = ref(false)

const payload = computed(() => store.getRequestPayload)
const response = computed(() => store.getRequestResponse)
const requestUrl = computed(() => store.getRequestUrl)

const onErrorSheetClosed = () => {
  error.value = {}
  showError.value = false
}

const makeApiCall = async () => {
  loading.value = true
  const payloadData: CreateRecipientPayload = {
    idempotencyKey: formData.idempotencyKey || uuidv4(),
    address: formData.address,
    chain: formData.chain,
    metadata: {
      email: formData.email,
      bns: formData.bns,
      nickname: formData.nickname,
      ...(formData.lei && { lei: formData.lei }),
    },
  }

  if (formData.addressTag) {
    payloadData.addressTag = formData.addressTag
  }

  if (formData.walletId) {
    payloadData.walletId = formData.walletId
  }

  if (formData.identityType) {
    payloadData.identity = {
      type: formData.identityType,
      ...(formData.identityType === 'individual' && {
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
      }),
      ...(formData.identityType === 'business' && {
        businessName: formData.businessName || undefined,
      }),
    }

    if (formData.identityType === 'individual') {
      const individual = {
        dateOfBirth: formData.individualDateOfBirth || undefined,
        nationality: formData.individualNationality || undefined,
        addressLine1: formData.individualAddressLine1 || undefined,
        addressLine2: formData.individualAddressLine2 || undefined,
        city: formData.individualCity || undefined,
        district: formData.individualDistrict || undefined,
        postalCode: formData.individualPostalCode || undefined,
        country: formData.individualCountry || undefined,
        governmentIssuedId: formData.individualGovernmentIssuedId || undefined,
      }
      if (Object.values(individual).some((v) => v !== undefined)) {
        payloadData.identity.individual = individual
      }
    }

    if (formData.identityType === 'business') {
      const business = {
        dateOfIncorporation: formData.businessDateOfIncorporation || undefined,
        addressLine1: formData.businessAddressLine1 || undefined,
        addressLine2: formData.businessAddressLine2 || undefined,
        city: formData.businessCity || undefined,
        district: formData.businessDistrict || undefined,
        postalCode: formData.businessPostalCode || undefined,
        country: formData.businessCountry || undefined,
        businessRegistrationNumber:
          formData.businessRegistrationNumber || undefined,
        countryOfIncorporation:
          formData.businessCountryOfIncorporation || undefined,
        businessIdentificationNumber:
          formData.businessIdentificationNumber || undefined,
      }
      if (Object.values(business).some((v) => v !== undefined)) {
        payloadData.identity.business = business
      }
    }
  }

  if (formData.ownershipType) {
    payloadData.ownership = {
      type: formData.ownershipType,
      custody: {
        type: formData.custodyType,
        ...(formData.vaspId && { vaspId: formData.vaspId }),
      },
    }
  }

  try {
    await $addressBookApiBeta.createRecipient(payloadData)
  } catch (err) {
    error.value = err
    showError.value = true
  } finally {
    loading.value = false
  }
}
</script>

<style scoped></style>
