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
            @click.prevent="autogenerateTokens()"
          >
            Autogenerate token
          </v-btn>
          <div v-if="displayGooglePayButton" id="google-pay-button"></div>
          <v-btn
            v-if="displayApplePayButton && isApplePayAvailable"
            elevation="24"
            dark
            class="apple-pay-button apple-pay-button-text-pay"
            @click.prevent="onApplePayButtonClicked()"
          >
          </v-btn>
          <v-p v-if="displayApplePayButton && !isApplePayAvailable">
            Apple Pay not available.
          </v-p>
          <v-card
            v-if="displayGoogleTokens"
            id="google-pay-tokens"
            max-width="400"
            class="body-1 px-6 py-8 mb-4"
          >
            <h2 class="title">Token Information</h2>
            <p class="font-weight-light mt-2">
              Protocol Version: {{ googlePayTokenData.protocolVersion }}
            </p>
            <p class="font-weight-light mt-2">
              Signature: {{ googlePayTokenData.signature }}
            </p>
            <p class="font-weight-light mt-2">
              Signed Message: {{ googlePayTokenData.signedMessage }}
            </p>
          </v-card>
          <v-card
            v-if="displayAppleTokens"
            id="apple-pay-tokens"
            max-width="400"
            class="body-1 px-6 py-8 mb-4"
          >
            <h2 class="title">Token Information</h2>
            <p class="font-weight-light mt-2">
              Version: {{ applePayTokenData.version }}
            </p>
            <p class="font-weight-light mt-2">
              Data: {{ applePayTokenData.data }}
            </p>
            <p class="font-weight-light mt-2">
              Signature: {{ applePayTokenData.signature }}
            </p>
            <p class="font-weight-light mt-2">
              Header: {{ applePayTokenData.header }}
            </p>
          </v-card>
          <!-- 3 text fields below for debugging only - to be removed once resolved -->
          <v-text-field
            v-if="displayGoogleTokens"
            v-model="googlePayTokenData.protocolVersion"
            label="Protocol Version"
          />
          <v-text-field
            v-if="displayGoogleTokens"
            v-model="googlePayTokenData.signature"
            label="Signature"
          />
          <v-text-field
            v-if="displayGoogleTokens"
            v-model="googlePayTokenData.signedMessage"
            label="Signed Message"
          />
          <v-btn
            v-if="displayGoogleTokens || displayAppleTokens"
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
  DEFAULT_CONFIG as DEFAULT_APPLE_PAY_CONFIG,
  applePayAvailable,
  startApplePaySessionFrontendPay,
  PaymentToken as ApplePayTokenData,
} from '~/lib/applePay'
import {
  DEFAULT_CONFIG as DEFAULT_GOOGLE_PAY_CONFIG,
  getGooglePaymentsClient,
  getPaymentDataRequest,
  onGooglePayLoaded,
  PaymentRequestConfig,
  PaymentToken as GooglePayTokenData,
} from '~/lib/googlePay'
import {
  checkoutKey,
  merchantId,
  merchantName,
} from '~/server-middleware/googlePaySecrets'
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
    amount: '0.00',
  }

  googlePayTokenData = {} as GooglePayTokenData
  applePayTokenData = {} as ApplePayTokenData

  paymentType = ['Google Pay', 'Apple Pay']
  error = {}
  loading = false
  showError = false
  displayGoogleTokens = false
  displayAppleTokens = false
  displayAutogenerateButton = !getLive()
  displayGooglePayButton = this.formData.type === 'Google Pay' && getLive()
  displayApplePayButton = this.formData.type === 'Apple Pay' && getLive()
  isApplePayAvailable = false

  buttonOptions: ButtonOptions = {
    onClick: this.onGooglePayButtonClicked,
    allowedPaymentMethods: [DEFAULT_GOOGLE_PAY_CONFIG.allowedPaymentMethods],
  }

  // Production environment is not yet enabled for googlepay - will uncomment lines 129-131 when it is
  getGooglePayEnvironment() {
    return DEFAULT_GOOGLE_PAY_CONFIG.environment.test
    // return getLive() && !getIsStaging()
    //   ? DEFAULT_GOOGLE_PAY_CONFIG.environment.prod
    //   : DEFAULT_GOOGLE_PAY_CONFIG.environment.test
  }

  mounted() {
    onGooglePayLoaded(this.buttonOptions, this.getGooglePayEnvironment())
  }

  onErrorSheetClosed() {
    this.error = {}
    this.showError = false
  }

  onPaymentTypeChange() {
    this.displayGoogleTokens = false
    this.displayAppleTokens = false
    if (getLive()) {
      switch (this.formData.type) {
        case 'Google Pay':
          this.displayGooglePayButton = true
          this.displayApplePayButton = false
          break
        case 'Apple Pay':
          this.displayGooglePayButton = false
          this.displayApplePayButton = true
          this.isApplePayAvailable = applePayAvailable()
          break
      }
    }
  }

  randomString() {
    return Math.random().toString(36).substring(2, 12)
  }

  // autogenerate token info by assigning random strings to each field
  autogenerateTokens() {
    if (this.formData.type === 'Google Pay') {
      this.googlePayTokenData.protocolVersion = 'ECv1'
      this.googlePayTokenData.signature = this.randomString()
      this.googlePayTokenData.signedMessage = this.randomString()
      this.displayGoogleTokens = true
    } else if (this.formData.type === 'Apple Pay') {
      this.applePayTokenData.version = 'EC_v1'
      this.applePayTokenData.data = this.randomString()
      this.applePayTokenData.signature = this.randomString()
      this.applePayTokenData.header = {
        ephemeralPublicKey: this.randomString(),
        publicKeyHash: this.randomString(),
        transactionId: this.randomString(),
      }
      this.displayAppleTokens = true
    }
  }

  onApplePayButtonClicked() {
    startApplePaySessionFrontendPay(
      DEFAULT_APPLE_PAY_CONFIG.payments,
      this.applePayTokenData
    )
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
        const paymentToken: GooglePayTokenData = JSON.parse(paymentTokenString) // payment token as object with keys protocolVersion, signature, and signedMessage
        this.googlePayTokenData.protocolVersion = paymentToken.protocolVersion
        this.googlePayTokenData.signature = paymentToken.signature
        this.googlePayTokenData.signedMessage = paymentToken.signedMessage
        this.displayGoogleTokens = true
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
          protocolVersion: this.googlePayTokenData.protocolVersion,
          signature: this.googlePayTokenData.signature,
          signedMessage: this.googlePayTokenData.signedMessage,
        }
        break
      case 'applepay':
        tokenData = {
          version: this.applePayTokenData.version,
          data: this.applePayTokenData.data,
          signature: this.applePayTokenData.signature,
          header: this.applePayTokenData.header,
        }
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

<style scoped>
@import '~/assets/applePayButton.css';
</style>
