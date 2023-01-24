<template>
  <v-layout>
    <v-row>
      <v-col cols="12" md="4">
        <v-form>
          <v-text-field v-model="formData.amount" label="Amount" />

          <v-select
            v-model="formData.currency"
            :items="
              isCryptoPayout()
                ? Array.from(supportedCryptoPayoutCurrencyPairs.keys())
                : supportedFiatPayoutCurrencies
            "
            label="Currency"
            @change="onCurrencyChange"
          />

          <v-select
            v-if="isCryptoPayout()"
            v-model="formData.toCurrency"
            :items="supportedCryptoPayoutCurrencyPairs.get(formData.currency)"
            label="To Currency"
          />

          <v-text-field
            v-model="formData.sourceWalletId"
            label="Optional Source Wallet Id"
          />

          <v-text-field v-model="formData.destination" label="Destination" />

          <v-select
            v-model="formData.destinationType"
            :items="destinationType"
            label="Destination Type"
            @change="onDestinationTypeChange"
          />

          <v-text-field
            v-if="!isCryptoPayout()"
            v-model="formData.beneficiaryEmail"
            label="Beneficiary Email"
          />

          <br />

          <div v-if="isCryptoPayout() && sourceWalletIdNotEmpty()">
            <header>Optional Identity:</header>
            <br />

            <v-select
              v-model="formData.identityType"
              :items="identityTypes"
              label="Identity Type"
            />

            <v-text-field
              v-model="formData.identityName"
              label="Identity Name"
            />

            <v-text-field
              v-model="formData.identityAddressLine1"
              label="Identity Address Line 1"
            />

            <v-text-field
              v-model="formData.identityAddressLine2"
              label="Identity Address Line 2"
            />

            <v-text-field
              v-model="formData.identityAddressCity"
              label="Identity Address City"
            />

            <v-text-field
              v-model="formData.identityAddressDistrict"
              label="Identity Address District"
            />

            <v-text-field
              v-model="formData.identityAddressPostalCode"
              label="Identity Address Postal Code"
            />

            <v-text-field
              v-model="formData.identityAddressCountry"
              label="Identity Address Country"
            />
          </div>

          <v-btn
            depressed
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
      @onChange="onErrorSheetClosed"
    />
  </v-layout>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import { mapGetters } from 'vuex'
import { v4 as uuidv4 } from 'uuid'
import RequestInfo from '~/components/RequestInfo.vue'
import ErrorSheet from '~/components/ErrorSheet.vue'
import { CreatePayoutPayload } from '~/lib/payoutsApi'
@Component({
  components: {
    RequestInfo,
    ErrorSheet,
  },
  computed: {
    ...mapGetters({
      payload: 'getRequestPayload',
      response: 'getRequestResponse',
      requestUrl: 'getRequestUrl',
      isMarketplace: 'isMarketplace',
    }),
  },
})
export default class CreatePayoutClass extends Vue {
  formData = {
    sourceWalletId: '',
    idempotencyKey: '',
    amount: '0.00',
    currency: 'USD', // Default to USD
    toCurrency: 'USD', // Default to USD
    destination: '',
    destinationType: 'wire', // Default to wire for payout creation
    beneficiaryEmail: '',
    identityType: 'individual', // Default to individual for identity type
    identityName: '',
    identityAddressLine1: '',
    identityAddressLine2: '',
    identityAddressCity: '',
    identityAddressDistrict: '',
    identityAddressPostalCode: '',
    identityAddressCountry: '',
  }

  required = [(v: string) => !!v || 'Field is required']
  destinationType = ['wire', 'ach', 'sepa', 'address_book']
  fiatDestinationTypes = new Set(['wire', 'ach', 'sepa'])
  blockchainDestinationTypes = new Set(['address_book'])
  identityTypes = ['individual', 'business']
  supportedFiatPayoutCurrencies = ['USD']
  // TODO: we can probably implement an internal endpoint to get the supported currency pairs
  supportedCryptoPayoutCurrencyPairs = new Map([
    ['USD', ['USD', 'BTC', 'ETH', 'MATIC']],
    ['BTC', ['USD', 'BTC']],
    ['ETH', ['USD', 'ETH']],
    ['MATIC', ['USD', 'MATIC']],
    ['FLOW', ['FLOW']],
    ['MANA', ['MANA']],
    ['EUR', ['EUR']],
  ])

  error = {}
  loading = false
  showError = false

  isCryptoPayout() {
    return this.blockchainDestinationTypes.has(this.formData.destinationType)
  }

  sourceWalletIdNotEmpty() {
    return this.formData.sourceWalletId.length > 0
  }

  hasIdentity() {
    return (
      this.formData.identityAddressLine1 ||
      this.formData.identityAddressLine2 ||
      this.formData.identityAddressCity ||
      this.formData.identityAddressDistrict ||
      this.formData.identityAddressPostalCode ||
      this.formData.identityAddressCountry ||
      this.formData.identityName
    )
  }

  onCurrencyChange() {
    // do nothing if it's not crypto payout
    if (!this.isCryptoPayout()) {
      return
    }
    // else update default toCurrency
    const supportedToCurrencies = this.supportedCryptoPayoutCurrencyPairs.get(
      this.formData.currency
    )
    this.formData.toCurrency = supportedToCurrencies
      ? supportedToCurrencies[0]
      : ''
  }

  onDestinationTypeChange() {
    // update currency to default
    this.formData.currency = this.isCryptoPayout()
      ? Array.from(this.supportedCryptoPayoutCurrencyPairs.keys())[0]
      : this.supportedFiatPayoutCurrencies[0]
    this.onCurrencyChange()
    this.resetIdentities()
  }

  resetIdentities() {
    // reset all identity fields
    this.formData.identityAddressLine1 = ''
    this.formData.identityAddressLine2 = ''
    this.formData.identityAddressCountry = ''
    this.formData.identityAddressCity = ''
    this.formData.identityAddressDistrict = ''
    this.formData.identityName = ''
    this.formData.identityAddressPostalCode = ''
  }

  onErrorSheetClosed() {
    this.error = {}
    this.showError = false
  }

  async makeApiCall() {
    this.loading = true
    const amountDetail = {
      amount: this.formData.amount,
      currency: this.formData.currency,
    }
    const toAmountDetail = {
      currency: this.formData.toCurrency,
    }
    const identityAddressObject = {
      line1: this.formData.identityAddressLine1,
      line2: this.formData.identityAddressLine2,
      city: this.formData.identityAddressCity,
      district: this.formData.identityAddressDistrict,
      postalCode: this.formData.identityAddressPostalCode,
      country: this.formData.identityAddressCountry,
    }
    const identityObject = {
      type: this.formData.identityType,
      name: this.formData.identityName,
      addresses: [identityAddressObject],
    }

    const identities = this.hasIdentity() && {
      identities: [identityObject],
    }

    const sourceObject = {
      id: this.formData.sourceWalletId,
      type: 'wallet',
      ...identities,
    }

    const payload: CreatePayoutPayload = {
      idempotencyKey: uuidv4(),
      amount: amountDetail,
      destination: {
        id: this.formData.destination,
        type: this.formData.destinationType,
      },
    }

    if (this.formData.sourceWalletId) {
      payload.source = sourceObject
    }

    if (this.blockchainDestinationTypes.has(this.formData.destinationType)) {
      payload.toAmount = toAmountDetail
    }

    if (this.formData.beneficiaryEmail) {
      payload.metadata = {
        beneficiaryEmail: this.formData.beneficiaryEmail,
      }
    }

    try {
      await this.$payoutsApi.createPayout(payload)
    } catch (error) {
      this.error = error
      this.showError = true
    } finally {
      this.loading = false
    }
  }
}
</script>
