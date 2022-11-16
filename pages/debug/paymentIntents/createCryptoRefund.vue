<template>
  <v-layout>
    <v-row>
      <v-col cols="12" md="4">
        <v-form>
          <v-text-field
            v-model="formData.paymentIntentId"
            label="Payment Intent ID"
          />

          <v-text-field
            v-model="formData.fromCurrency"
            label="Source Currency"
          />

          <v-text-field v-model="formData.toAmount" label="Refund Amount" />

          <v-text-field v-model="formData.toCurrency" label="Refund Currency" />

          <v-text-field
            v-model="formData.address"
            label="Destination Address"
          />

          <v-text-field
            v-model="formData.blockchain"
            label="Destination Blockchain"
          />

          <header>Optional Identity:</header>
          <br />

          <v-select
            v-model="formData.identityType"
            :items="identityTypes"
            label="Identity Type"
          />

          <v-text-field v-model="formData.identityName" label="Identity Name" />

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

          <v-btn
            v-if="!!formData.paymentIntentId"
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
import RequestInfo from '@/components/RequestInfo.vue'
import ErrorSheet from '@/components/ErrorSheet.vue'
import { CreateCryptoRefundPayload } from '@/lib/paymentIntentsApi'

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
export default class CreatePaymentIntentClass extends Vue {
  formData = {
    paymentIntentId: '',
    idempotencyKey: '',
    fromCurrency: '',
    toAmount: '',
    toCurrency: '',
    blockchain: '',
    address: '',
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
  error = {}
  loading = false
  showError = false
  identityTypes = ['individual', 'business']

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

  onErrorSheetClosed() {
    this.error = {}
    this.showError = false
  }

  async makeApiCall() {
    this.loading = true
    const fromAmountDetail = {
      currency: this.formData.fromCurrency,
    }
    const toAmountDetail = {
      amount: this.formData.toAmount,
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

    const payload: CreateCryptoRefundPayload = {
      idempotencyKey: uuidv4(),
      destination: {
        chain: this.formData.blockchain,
        address: this.formData.address,
      },
      amount: fromAmountDetail,
      toAmount: toAmountDetail,
      ...identities,
    }
    try {
      await this.$paymentIntentsApi.createCryptoRefund(
        this.formData.paymentIntentId,
        payload
      )
    } catch (error) {
      this.error = error
      this.showError = true
    } finally {
      this.loading = false
    }
  }
}
</script>
