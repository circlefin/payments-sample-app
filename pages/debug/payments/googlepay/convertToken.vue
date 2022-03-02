<template>
  <v-layout>
    <v-row>
      <v-col cols="12" md="4">
        <v-form>
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
          <v-select
            v-model="formData.type"
            :items="paymentType"
            label="Payment Type"
          />
          <v-select
            v-model="formData.protocolVersion"
            :items="protocolVersions"
            label="Protocol Version"
          />
          <v-text-field v-model="formData.signature" label="Signature" />
          <v-text-field
            v-model="formData.signedMessage"
            label="Signed Message"
          />

          <v-btn
            depressed
            class="mb-7"
            color="primary"
            :loading="loading"
            @click.prevent="makeApiCall()"
          >
            Convert Token
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
import { onGooglePayLoaded } from '@/lib/googlePay'

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

  // const paymentsClient = new google.payments.api.PaymentsClient({ environment: 'TEST' })
  paymentType = ['Google Pay', 'Apple Pay']
  protocolVersions = ['ECv1']
  required = [(v: string) => !!v || 'Field is required']
  error = {}
  loading = false
  showError = false
  payload = {}

  mounted() {
    const googleScript = document.createElement('script')
    googleScript.setAttribute('src', 'https://pay.google.com/gp/p/js/pay.js')
    document.head.appendChild(googleScript)
    onGooglePayLoaded()
  }

  onErrorSheetClosed() {
    this.error = {}
    this.showError = false
  }

  showAutogenerateButton() {
    return !getLive()
  }

  // autogenerate token info by assigning random strings to each field
  autogenerateToken() {
    this.formData.signature = Math.random().toString(36).substring(2, 12)
    this.formData.signedMessage = Math.random().toString(36).substring(2, 12)
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
    // TODO: implement API call to token converter endpoint once endpoint is finished for google pay
  }
}
</script>
