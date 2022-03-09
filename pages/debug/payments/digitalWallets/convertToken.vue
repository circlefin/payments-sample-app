<template>
  <v-layout>
    <v-row>
      <v-col cols="12" md="4">
        <v-form>
          <v-select
            v-model="formData.type"
            :items="paymentType"
            label="Payment Type"
            @change="onPaymentTypeChange()"
          />
          <v-text-field v-model="formData.amount" label="Amount" />
          <v-btn
            v-if="displayAutogenerateButton"
            outlined
            small
            depressed
            class="mb-7"
            :loading="loading"
            @click.prevent="autogenerateToken()"
          >
            Autogenerate token
          </v-btn>
          <div v-if="displayGooglePayButton" id="google-pay-button"></div>
          <v-card
            v-if="tokensGenerated"
            max-width="400"
            class="body-1 px-6 py-8 mb-4"
          >
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
          <v-text-field
            v-if="tokensGenerated"
            v-model="formData.protocolVersion"
            label="Protocol Version"
          />
          <v-text-field
            v-if="tokensGenerated"
            v-model="formData.signature"
            label="Signature"
          />
          <v-text-field
            v-if="tokensGenerated"
            v-model="formData.signedMessage"
            label="Signed Message"
          />
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
  getPaymentDataRequest,
  PaymentToken,
  PaymentRequestConfig,
  DEFAULT_CONFIG,
} from '~/lib/googlePay'
import ButtonOptions = google.payments.api.ButtonOptions
import PaymentData = google.payments.api.PaymentData
import {
  checkoutKey,
  merchantId,
  merchantName,
} from '~/server-middleware/googlePaySecrets'

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
    protocolVersion: '',
    signature: '',
    signedMessage: '',
    amount: '0.00',
  }

  paymentType = ['Google Pay', 'Apple Pay']
  error = {}
  loading = false
  showError = false
  tokensGenerated = false
  displayAutogenerateButton = !getLive()
  displayGooglePayButton = this.formData.type === 'Google Pay' && getLive()

  buttonOptions: ButtonOptions = {
    onClick: this.onGooglePayButtonClicked,
    allowedPaymentMethods: [DEFAULT_CONFIG.allowedPaymentMethods],
  }

  // Production environment is not yet enabled for googlepay - will uncomment lines 129-131 when it is
  getGooglePayEnvironment() {
    return DEFAULT_CONFIG.environment.test
    // return getLive() && !getIsStaging()
    //   ? DEFAULT_CONFIG.environment.prod
    //   : DEFAULT_CONFIG.environment.test
  }

  mounted() {
    onGooglePayLoaded(this.buttonOptions, this.getGooglePayEnvironment())
  }

  onErrorSheetClosed() {
    this.error = {}
    this.showError = false
  }

  onPaymentTypeChange() {
    this.tokensGenerated = false
    if (getLive()) {
      switch (this.formData.type) {
        case 'Google Pay':
          this.displayGooglePayButton = true
          break
        case 'Apple Pay':
          this.displayGooglePayButton = false
          break
      }
    }
  }

  // autogenerate token info by assigning random strings to each field
  autogenerateToken() {
    this.formData.signature = Math.random().toString(36).substring(2, 12)
    this.formData.signedMessage = Math.random().toString(36).substring(2, 12)
    this.tokensGenerated = true
  }

  onGooglePayButtonClicked() {
    const environment = this.getGooglePayEnvironment()
    const paymentsClient = getGooglePaymentsClient(environment)
    const paymentDataConfig: PaymentRequestConfig = {
      amount: this.formData.amount,
      environment,
      merchantId,
      merchantName,
      checkoutKey,
    }
    paymentsClient
      .loadPaymentData(getPaymentDataRequest(paymentDataConfig))
      .then((paymentData: PaymentData) => {
        const paymentTokenString =
          paymentData.paymentMethodData.tokenizationData.token // payment token as JSON string
        const paymentToken: PaymentToken = JSON.parse(paymentTokenString) // payment token as object with keys protocolVersion, signature, and signedMessage
        this.formData.protocolVersion = paymentToken.protocolVersion
        this.formData.signature = paymentToken.signature
        this.formData.signedMessage = paymentToken.signedMessage
        this.tokensGenerated = true
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
  }
}
</script>
