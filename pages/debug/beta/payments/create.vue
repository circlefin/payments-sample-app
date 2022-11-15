<template>
  <v-layout>
    <v-row>
      <v-col cols="12" md="4">
        <v-form>
          <v-text-field
            v-model="formData.paymentIntentId"
            hint="Payment Intent Id"
            label="Payment Intent Id"
          />

          <v-text-field v-model="formData.amount" label="Amount" />
          <v-select
            v-model="formData.currency"
            :items="currency"
            label="Currency"
          />

          <v-text-field
            v-model="formData.sourceAddress"
            label="Source Address"
          />
          <v-select
            v-model="formData.sourceType"
            :items="sourceType"
            label="Source Type"
          />

          <v-text-field
            v-model="formData.destinationAddress"
            label="Destination Address"
          />
          <v-select
            v-model="formData.destinationChain"
            :items="destinationChain"
            label="Destination Chain"
          />

          <v-select
            v-model="formData.protocolType"
            :items="protocolType"
            label="Protocol Type"
          />

          <v-text-field
            v-model="formData.validAfter"
            hint="Signature ValidAfter"
            label="Signature ValidAfter"
          />

          <v-text-field
            v-model="formData.validBefore"
            hint="Signature validBefore"
            label="Signature validBefore"
          />

          <v-text-field
            v-model="formData.metaTxNonce"
            hint="Meta transaction nonce"
            label="Meta transaction nonce"
          />

          <v-text-field
            v-model="formData.recoverIdV"
            hint="ECDSA recoverIdV"
            label="ECDSA recoverIdV"
          />

          <v-text-field
            v-model="formData.pointR"
            hint="ECDSA pointR"
            label="ECDSA pointR"
          />

          <v-text-field
            v-model="formData.proofS"
            hint="ECDSA proofS"
            label="ECDSA proofS"
          />

          <v-btn
            depressed
            class="mb-7"
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
import { CreateCryptoPaymentPayload } from '~/lib/beta/paymentsApi'

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
export default class CreatePaymentClass extends Vue {
  formData = {
    paymentIntentId: '',
    amount: '0.00',
    currency: 'USD',
    sourceAddress: '',
    sourceType: 'blockchain',
    destinationAddress: '',
    destinationChain: '',
    protocolType: 'TransferWithAuthorization',
    validAfter: '0',
    validBefore: '',
    metaTxNonce: '',
    recoverIdV: '',
    pointR: '',
    proofS: '',
  }

  sourceType = ['blockchain']
  currency = ['USD']
  destinationChain = ['ETH']
  protocolType = ['TransferWithAuthorization']
  required = [(v: string) => !!v || 'Field is required']
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
      recoverIdV: this.formData.recoverIdV,
      pointR: this.formData.pointR,
      proofS: this.formData.proofS,
    }
    const payload: CreateCryptoPaymentPayload = {
      idempotencyKey: uuidv4(),
      paymentIntentId: this.formData.paymentIntentId,
      amount: amountDetail,
      source: sourceDetails,
      destination: destinationDetails,
      protocolMetadata: protocolMetadataDetails,
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
