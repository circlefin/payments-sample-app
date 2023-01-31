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
            v-model="formData.endUserAddress"
            :rules="[rules.required]"
            label="End User Address"
          />
          <header>Optional params:</header>
          <v-text-field
            v-model="formData.amount"
            label="Amount"
            :rules="[rules.isNumber, rules.validDecimal]"
          />
          <v-text-field v-model="formData.currency" label="Currency" />
          <v-btn
            depressed
            class="mb-7"
            color="primary"
            :disabled="!isFormValid"
            @click.prevent="makeApiCall()"
          >
            Make api call
          </v-btn>
          <v-btn
            v-if="showMetaMaskButton"
            depressed
            class="mb-7"
            color="primary"
            @click.prevent="sendResponseToMetaMask()"
          >
            Send response to MetaMask
          </v-btn>
          <v-text-field
            v-if="formData.rawSignature.length"
            v-model="formData.rawSignature"
            label="ECDSA rawSignature"
            readonly
          >
            <router-link
              slot="append"
              :to="{
                path: '/debug/payments/crypto/create',
                query: getCreatePaymentQueryParams(),
              }"
              class="subtitle-2 text-right"
            >
              Create crypto payment
            </router-link>
          </v-text-field>
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
import RequestInfo from '@/components/RequestInfo.vue'
import ErrorSheet from '@/components/ErrorSheet.vue'
import { sendPresignedDataToMetaMask } from '~/lib/walletConnect'
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
    }),
  },
  data: () => ({
    isFormValid: false,
  }),
})
export default class FetchPresignData extends Vue {
  error = {}
  loading = false
  showError = false
  showMetaMaskButton = false

  formData = {
    paymentIntentId: '',
    endUserAddress: '',
    amount: '',
    currency: '',
    rawSignature: '',
  }

  // validation rules
  rules = {
    isNumber,
    required,
    validDecimal,
    isUUID,
  }

  // methods
  onErrorSheetClosed() {
    this.error = {}
    this.showError = false
  }

  getTypedData() {
    return this.$store.getters.getRequestResponse.typedData
  }

  getCreatePaymentQueryParams() {
    const { paymentIntentId, rawSignature } = this.formData
    const {
      message,
      totalAmount,
      networkFee,
      primaryType: protocolType,
    } = this.getTypedData()
    return {
      paymentIntentId,
      amount: totalAmount.amount,
      currency: totalAmount.currency,
      sourceAddress: message.from,
      destinationAddress: message.to,
      feeQuoteId: networkFee?.quoteId,
      protocolType,
      validAfter: message.validAfter,
      validBefore: message.validBefore,
      metaTxNonce: message.nonce,
      rawSignature,
    }
  }

  async makeApiCall() {
    this.loading = true
    try {
      await this.$paymentsApi.getPresignData(
        this.formData.paymentIntentId,
        this.formData.endUserAddress,
        this.formData.amount,
        this.formData.currency
      )
    } catch (error) {
      this.error = error
      this.showError = true
    } finally {
      this.loading = false
      this.showMetaMaskButton =
        Object.keys(this.$store.getters.getRequestResponse).length > 0
    }
  }

  async sendResponseToMetaMask() {
    try {
      this.formData.rawSignature = await sendPresignedDataToMetaMask(
        this.getTypedData()
      )
    } catch (error) {
      this.error = error
      this.showError = true
    }
  }
}
</script>
