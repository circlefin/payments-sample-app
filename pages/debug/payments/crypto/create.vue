<template>
  <v-layout>
    <v-row>
      <v-col cols="12" md="4">
        <v-form v-model="isFormValid">
          <v-text-field
            v-model="formData.paymentIntentId"
            :rules="[rules.required, rules.isUUID]"
            label="Payment Intent Id"
          />

          <v-text-field
            v-model="formData.amount"
            label="Amount"
            :rules="[rules.required, rules.isNumber, rules.validDecimal]"
          />
          <v-select
            v-model="formData.currency"
            :items="currency"
            label="Currency"
          />

          <v-text-field
            v-model="formData.sourceAddress"
            :rules="[rules.required]"
            label="Source Address"
          />
          <v-select
            v-model="formData.sourceType"
            :items="sourceType"
            :rules="[rules.required]"
            label="Source Type"
          />

          <v-text-field
            v-model="formData.destinationAddress"
            :rules="[rules.required]"
            label="Destination Address"
          />
          <v-select
            v-model="formData.destinationChain"
            :items="destinationChain"
            label="Destination Chain"
          />

          <v-text-field
            v-model="formData.feeQuoteId"
            label="Fee Quote ID (Required if network fees paid by end user)"
            :rules="[rules.isUUID]"
          />

          <v-select
            v-model="formData.protocolType"
            :items="protocolType"
            label="Protocol Type"
          />

          <v-text-field
            v-model="formData.validAfter"
            label="Signature ValidAfter"
            :rules="[rules.required]"
          />

          <v-text-field
            v-model="formData.validBefore"
            label="Signature validBefore"
            :rules="[rules.required]"
          />

          <v-text-field
            v-model="formData.metaTxNonce"
            label="Meta transaction nonce"
            :rules="[rules.required]"
          />

          <v-text-field
            v-model="formData.rawSignature"
            label="ECDSA rawSignature"
            :rules="[rules.required]"
          />

          <v-btn
            depressed
            class="mb-7"
            color="primary"
            :loading="loading"
            :disabled="!isFormValid"
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
import { CreateCryptoPaymentPayload } from '~/lib/cryptoPaymentsApi'
import { isNumber, required, validDecimal, isUUID } from '@/helpers/validation'

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
  data: () => ({
    isFormValid: false,
  }),
})
export default class CreatePaymentClass extends Vue {
  formData = {
    paymentIntentId: (this.$route.query.paymentIntentId as string) || '',
    amount: (this.$route.query.amount as string) || '0.00',
    currency: (this.$route.query.currency as string) || 'USD',
    sourceAddress: (this.$route.query.sourceAddress as string) || '',
    sourceType: 'blockchain',
    destinationAddress: (this.$route.query.destinationAddress as string) || '',
    destinationChain: 'ETH',
    feeQuoteId: (this.$route.query.feeQuoteId as string) || '',
    protocolType:
      (this.$route.query.protocolType as string) || 'TransferWithAuthorization',
    validAfter: (this.$route.query.validAfter as string) || '0',
    validBefore: (this.$route.query.validBefore as string) || '',
    metaTxNonce: (this.$route.query.metaTxNonce as string) || '',
    rawSignature: (this.$route.query.rawSignature as string) || '',
  }

  // validation rules
  rules = {
    isNumber,
    required,
    validDecimal,
    isUUID,
  }

  sourceType = ['blockchain']
  currency = ['USD']
  destinationChain = ['ETH']
  protocolType = ['TransferWithAuthorization']
  error = {}
  loading = false
  showError = false

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
    const sourceDetails = {
      address: this.formData.sourceAddress,
      type: this.formData.sourceType,
    }
    const destinationDetails = {
      address: this.formData.destinationAddress,
      chain: this.formData.destinationChain,
    }
    const protocolMetadataDetails = {
      type: this.formData.protocolType,
      metaTxNonce: this.formData.metaTxNonce,
      signatureValidAfter: this.formData.validAfter,
      signatureValidBefore: this.formData.validBefore,
      rawSignature: this.formData.rawSignature,
    }
    const payload: CreateCryptoPaymentPayload = {
      idempotencyKey: uuidv4(),
      paymentIntentId: this.formData.paymentIntentId,
      amount: amountDetail,
      source: sourceDetails,
      destination: destinationDetails,
      protocolMetadata: protocolMetadataDetails,
      quoteId: this.formData.feeQuoteId,
    }

    try {
      await this.$paymentsApiBeta.createCryptoPayment(payload)
    } catch (error) {
      this.error = error
      this.showError = true
    } finally {
      this.loading = false
    }
  }
}
</script>
