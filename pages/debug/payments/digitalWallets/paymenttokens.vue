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
          <v-select
            v-if="isLive"
            v-model="formData.merchantType"
            :items="
              displayApplePayForm ? merchantTypeApplePay : merchantTypeGooglePay
            "
            label="Merchant Type"
          />
          <v-text-field
            v-if="displayApplePayForm"
            v-model="applePayFormData.shopName"
            label="Shop Name"
          />
          <v-select
            v-if="displayApplePayForm"
            v-model="applePayFormData.lineItemType"
            :items="lineItemTypeApplePay"
            label="Line Item Type"
          />
          <v-text-field v-model="formData.amount" label="Amount" />
          <v-btn
            v-if="!isLive"
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
            Apple Pay not available on this browser, please make sure you are
            using Safari.
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
import { getLive, getIsStaging } from '~/lib/apiTarget'
import {
  DEFAULT_CONFIG as DEFAULT_APPLE_PAY_CONFIG,
  AUTOGEN_TOKEN_LENGTH as APPLE_PAY_AUTOGEN_TOKEN_LENGTH,
  applePayAvailable,
  startApplePaySessionFrontendPay,
  PaymentToken as ApplePayTokenData,
  PaymentDetails as ApplePayPaymentDetails,
} from '~/lib/applePay'
import {
  DEFAULT_CONFIG as DEFAULT_GOOGLE_PAY_CONFIG,
  AUTOGEN_TOKEN_LENGTH as GOOGLE_PAY_AUTOGEN_TOKEN_LENGTH,
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
    merchantType: 'PayFac',
    amount: '0.00',
  }

  googlePayTokenData = {} as GooglePayTokenData
  applePayTokenData = {} as ApplePayTokenData
  applePayFormData = {} as ApplePayPaymentDetails

  paymentType = ['Google Pay', 'Apple Pay']
  merchantTypeApplePay = ['PayFac', 'Partnership']
  merchantTypeGooglePay = ['PayFac']
  lineItemTypeApplePay = ['final', 'pending']
  error = {}
  loading = false
  showError = false
  displayGoogleTokens = false
  displayAppleTokens = false
  displayGooglePayButton = this.formData.type === 'Google Pay' && getLive()
  displayApplePayButton = this.formData.type === 'Apple Pay' && getLive()
  isApplePayAvailable = false
  displayApplePayForm = this.formData.type === 'Apple Pay'
  isLive = getLive()

  buttonOptions: ButtonOptions = {
    onClick: this.onGooglePayButtonClicked,
    allowedPaymentMethods: [DEFAULT_GOOGLE_PAY_CONFIG.allowedPaymentMethods],
  }

  // Sample app prod env has not been approved by google so need to return test for prod environment for now
  getGooglePayEnvironment() {
    return getIsStaging()
      ? DEFAULT_GOOGLE_PAY_CONFIG.environment.prod
      : DEFAULT_GOOGLE_PAY_CONFIG.environment.test
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
    switch (this.formData.type) {
      case 'Google Pay':
        this.displayApplePayForm = false
        if (getLive()) {
          this.displayGooglePayButton = true
          this.displayApplePayButton = false
        }
        break
      case 'Apple Pay':
        this.displayApplePayForm = true
        if (getLive()) {
          this.displayGooglePayButton = false
          this.displayApplePayButton = true
          this.isApplePayAvailable = applePayAvailable()
        }
        break
    }
  }

  randomString(length: number) {
    // return Math.random().toString(36).substring(2, 10)
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let str = ''
    for (let i = 0; i < length; i++) {
      str += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return str
  }

  // autogenerate token info by assigning random strings to each field
  autogenerateTokens() {
    if (this.formData.type === 'Google Pay') {
      this.displayGoogleTokens = false
      this.googlePayTokenData.protocolVersion = 'ECv1'
      this.googlePayTokenData.signature = this.randomString(
        GOOGLE_PAY_AUTOGEN_TOKEN_LENGTH.signature
      )
      this.googlePayTokenData.signedMessage = this.randomString(
        GOOGLE_PAY_AUTOGEN_TOKEN_LENGTH.signedMessage
      )
      this.displayGoogleTokens = true
    } else if (this.formData.type === 'Apple Pay') {
      this.displayGoogleTokens = false
      this.applePayTokenData.version = 'EC_v1'
      this.applePayTokenData.data = this.randomString(
        APPLE_PAY_AUTOGEN_TOKEN_LENGTH.data
      )
      this.applePayTokenData.signature = this.randomString(
        APPLE_PAY_AUTOGEN_TOKEN_LENGTH.signature
      )
      this.applePayTokenData.header = {
        ephemeralPublicKey: this.randomString(
          APPLE_PAY_AUTOGEN_TOKEN_LENGTH.ephemeralPublicKey
        ),
        publicKeyHash: this.randomString(
          APPLE_PAY_AUTOGEN_TOKEN_LENGTH.publicKeyHash
        ),
        transactionId: this.randomString(
          APPLE_PAY_AUTOGEN_TOKEN_LENGTH.transactionId
        ),
      }
      this.displayAppleTokens = true
    }
  }

  onApplePayButtonClicked() {
    startApplePaySessionFrontendPay(
      {
        currencyCode: DEFAULT_APPLE_PAY_CONFIG.payments.currencyCode,
        countryCode: DEFAULT_APPLE_PAY_CONFIG.payments.countryCode,
        merchantCapabilities:
          DEFAULT_APPLE_PAY_CONFIG.payments.merchantCapabilities,
        supportedNetworks: DEFAULT_APPLE_PAY_CONFIG.payments.supportedNetworks,
        shippingType: DEFAULT_APPLE_PAY_CONFIG.payments.shippingType,
        requiredBillingContactFields:
          DEFAULT_APPLE_PAY_CONFIG.payments.requiredBillingContactFields,
        requiredShippingContactFields:
          DEFAULT_APPLE_PAY_CONFIG.payments.requiredShippingContactFields,
        total: {
          label: this.applePayFormData.shopName,
          amount: this.formData.amount,
          type: this.applePayFormData.lineItemType,
        },
      },
      this.applePayTokenData,
      this.formData.merchantType,
      (): void => {
        this.displayAppleTokens = true
      }
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
    console.log(getPaymentDataRequest(paymentDataConfig))
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
