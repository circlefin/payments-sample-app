<template>
  <v-layout>
    <v-row>
      <v-col cols="12" md="4">
        <v-form>
          <v-select
            v-on:change="clearTokens()"
            v-model="formData.type"
            :items="paymentType"
            label="Payment Type"
          />
          <v-btn
            v-if="showAutogenerateButton()"
            depressed
            class="mb-7"
            color="primary"
            :loading="loading"
            @click.prevent="autogenerateToken()"
          >
            Autogenerate token
          </v-btn>
          <v-container
            id="google-pay-button"
            v-if="showGooglePayButton()"
          ></v-container>
          <v-card v-if="tokensGenerated" class="body-1 px-6 py-8 mb-4">
            <h1>Token Information</h1>
            <p>Protocol Version: {{ formData.protocolVersion }}</p>
            <p>Signature: {{ formData.signature }}</p>
            <p>Signed Message: {{ formData.signedMessage }}</p>
          </v-card>
          <v-btn
            v-if="tokensGenerated"
            depressed
            class="mb-7"
            color="primary"
            :loading="loading"
            @click.prevent="makeApiCall()"
          >
            POST /tokens
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
import RequestInfo from '@/components/RequestInfo.vue'
import ErrorSheet from '@/components/ErrorSheet.vue'
import { getLive } from '~/lib/apiTarget'
import {
  onGooglePayLoaded,
  getGooglePaymentsClient,
  paymentDataRequest,
  PaymentToken,
} from '@/lib/googlePay'
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
  protocolVersions = ['ECv1']
  required = [(v: string) => !!v || 'Field is required']
  error = {}
  loading = false
  showError = false
  payload = {}
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
        // fill form with googlepay token data
        this.formData.signature = paymentToken.signature
        this.formData.signedMessage = paymentToken.signedMessage
      })
      .catch(function (err: any) {
        console.error(err)
      })
  }

  makeApiCall() {
    const type = this.formData.type === 'Google Pay' ? 'googlepay' : 'applepay'
    let payload = null

    switch (type) {
      case 'googlepay':
        payload = {
          type,
          token_data: {
            protocolVersion: this.formData.protocolVersion,
            signature: this.formData.signature,
            signedMessage: this.formData.signedMessage,
          },
        }
        break
      case 'applepay':
        payload = {
          type,
          token_data: 'TODO: implement apply pay payload',
        }
    }
    this.payload = payload
    // TODO: implement API call to /tokens endpoint
  }
}
</script>
