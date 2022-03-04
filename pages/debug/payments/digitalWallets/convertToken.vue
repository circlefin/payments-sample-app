<template>
  <v-layout>
    <v-row>
      <v-col cols="12" md="4">
        <v-form>
          <v-select
            v-model="formData.type"
            :items="paymentType"
            label="Payment Type"
            @change="clearTokens()"
          />
          <v-btn
            v-if="showAutogenerateButton()"
            outlined
            small
            depressed
            class="mb-7"
            :loading="loading"
            @click.prevent="autogenerateToken()"
          >
            Autogenerate token
          </v-btn>
          <div v-if="showGooglePayButton()" id="google-pay-button"></div>
          <v-card v-if="tokensGenerated" class="body-1 px-6 py-8 mb-4">
            <h2 class="title">Token Information</h2>
            <p class="font-weight-light mt-2">
              Protocol Version: {{ formData.protocolVersion }}
            </p>
            <p class="font-weight-light mt-2">
              Signature: {{ formData.signature }}
            </p>
            <p class="font-weight-light mt-2">
              Signed Message: {{ formData.signedMessage }}
            </p>
          </v-card>
          <v-btn
            v-if="tokensGenerated"
            depressed
            class="mb-7"
            color="primary"
            :loading="loading"
            @click.prevent="makeApiCall()"
          >
            Make API Call
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
import RequestInfo from '~/components/RequestInfo.vue'
import ErrorSheet from '~/components/ErrorSheet.vue'
import { getLive } from '~/lib/apiTarget'
import {
  onGooglePayLoaded,
  getGooglePaymentsClient,
  paymentDataRequest,
  PaymentToken,
} from '~/lib/googlePay'
import ButtonOptions = google.payments.api.ButtonOptions
import PaymentData = google.payments.api.PaymentData

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
})
export default class ConvertToken extends Vue {
  formData = {
    type: 'Google Pay',
    protocolVersion: 'ECv1',
    signature: '',
    signedMessage: '',
  }

  paymentType = ['Google Pay', 'Apple Pay']
  error = {}
  loading = false
  showError = false
  tokensGenerated = false

  buttonOptions: ButtonOptions = {
    onClick: this.onGooglePayButtonClicked,
    allowedPaymentMethods: [
      {
        type: 'CARD',
        parameters: {
          allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
          allowedCardNetworks: ['MASTERCARD', 'VISA'],
        },
      },
    ],
    buttonSizeMode: 'fill',
  }

  mounted() {
    onGooglePayLoaded(this.buttonOptions)
  }

  onErrorSheetClosed() {
    this.error = {}
    this.showError = false
  }

  showAutogenerateButton() {
    return !getLive()
  }

  showGooglePayButton() {
    return this.formData.type === 'Google Pay' && getLive()
  }

  clearTokens() {
    this.tokensGenerated = false
  }

  // autogenerate token info by assigning random strings to each field
  autogenerateToken() {
    this.formData.signature = Math.random().toString(36).substring(2, 12)
    this.formData.signedMessage = Math.random().toString(36).substring(2, 12)
    this.tokensGenerated = true
  }

  onGooglePayButtonClicked() {
    const paymentsClient = getGooglePaymentsClient()
    paymentsClient
      .loadPaymentData(paymentDataRequest)
      .then((paymentData: PaymentData) => {
        const paymentTokenString =
          paymentData.paymentMethodData.tokenizationData.token // payment token as JSON string
        const paymentToken: PaymentToken = JSON.parse(paymentTokenString) // payment token as object with keys protocolVersion, signature, and signedMessage
        this.formData.signature = paymentToken.signature
        this.formData.signedMessage = paymentToken.signedMessage
      })
      .catch(function (err: any) {
        console.error(err)
      })
  }

  async makeApiCall() {
    this.loading = true
    const type = this.formData.type === 'Google Pay' ? 'googlepay' : 'applepay'
    let tokenData = null
    switch (type) {
      case 'googlepay':
        tokenData = {
          protocolVersion: this.formData.protocolVersion,
          signature: this.formData.signature,
          signedMessage: this.formData.signedMessage,
        }
        break
      case 'applepay':
        tokenData = { signature: 'TODO: implement apply pay payload' }
    }
    try {
      await this.$walletsApi.convertToken(type, tokenData)
    } catch (error) {
      this.error = error
      this.showError = true
    } finally {
      this.loading = false
    }
    // TODO: implement API call to /tokens endpoint
  }
}
</script>
