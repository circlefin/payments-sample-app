<template>
  <v-layout>
    <v-row>
      <v-col cols="12" md="4">
        <v-form>
          <MarketplaceInfoFields
            v-model="marketplaceInfo"
            @show-error="showMarketplaceInfoError"
          />

          <v-text-field v-model="formData.sourceId" label="Source Account Id" />

          <v-select
            v-model="formData.sourceType"
            :items="sourceType"
            label="Source Account Type"
          />

          <v-text-field v-model="formData.amount" label="Amount" />

          <v-checkbox
            v-if="formData.sourceType == 'card'"
            v-model="formData.autoCapture"
            label="Auto capture"
          />

          <v-select
            v-if="formData.sourceType == 'card'"
            v-model="formData.verification"
            :items="verificationMethods"
            label="Verification Method"
          />

          <v-text-field v-if="cvvRequired" v-model="formData.cvv" label="CVV" />

          <v-text-field
            v-model="formData.description"
            hint="Payment Description"
            label="Description"
          />

          <v-text-field
            v-model="formData.channel"
            hint="Channel"
            label="Channel"
          />

          <v-text-field
            v-model="formData.phoneNumber"
            hint="Phone number of the user in E.164 format"
            label="Phone"
          />

          <v-text-field v-model="formData.email" label="Email" />

          <v-btn
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
import { Component, Vue, Watch } from 'nuxt-property-decorator'
import { mapGetters } from 'vuex'
import { v4 as uuidv4 } from 'uuid'
import openPGP from '@/lib/openpgp'
import {
  CreateMarketplaceCardPaymentPayload,
  MarketplaceInfo,
} from '@/lib/marketplaceApi'
import RequestInfo from '@/components/RequestInfo.vue'
import ErrorSheet from '@/components/ErrorSheet.vue'
import MarketplaceInfoFields from '@/components/MarketplaceInfoFields.vue'

@Component({
  components: {
    RequestInfo,
    ErrorSheet,
    MarketplaceInfoFields,
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
  isMarketplace!: boolean
  marketplaceInfo: MarketplaceInfo = {
    walletId: '',
    merchantId: '',
    merchantWalletId: '',
  }

  cvvRequired = true
  formData = {
    sourceId: '',
    sourceType: 'card', // Default to card
    autoCapture: true,
    verification: 'cvv',
    amount: '0.00',
    cvv: '',
    description: '',
    channel: '',
    phoneNumber: '',
    email: '',
  }

  verificationMethods = ['none', 'cvv']
  sourceType = ['card', 'ach']
  required = [(v: string) => !!v || 'Field is required']
  error = {}
  loading = false
  showError = false

  mounted() {
    if (!this.isMarketplace) {
      return this.$nuxt.error({
        statusCode: 404,
        message: 'This endpoint is only vailable for marketplaces',
      })
    }
  }

  @Watch('formData.verification', { immediate: true })
  onChildChanged(val: string) {
    if (val === 'none') {
      this.cvvRequired = false
    }
    if (val === 'cvv') {
      this.cvvRequired = true
    }
  }

  @Watch('formData.sourceType', { immediate: true })
  onSourceTypeChanged(val: string) {
    if (val === 'card') {
      this.formData.verification = 'cvv'
    }
    if (val === 'ach') {
      this.formData.verification = 'none'
    }
  }

  onErrorSheetClosed() {
    this.error = {}
    this.showError = false
  }

  showMarketplaceInfoError(error: object) {
    this.error = error
    this.showError = true
  }

  async makeApiCall() {
    this.loading = true

    const amountDetail = {
      amount: this.formData.amount,
      currency: 'USD',
    }
    const sourceDetails = {
      id: this.formData.sourceId,
      type: this.formData.sourceType,
    }

    const payload: CreateMarketplaceCardPaymentPayload = {
      idempotencyKey: uuidv4(),
      autoCapture: this.formData.autoCapture ? undefined : false,
      amount: amountDetail,
      source: sourceDetails,
      description: this.formData.description,
      metadata: {
        email: this.formData.email,
        phoneNumber: this.formData.phoneNumber,
        sessionId: 'xxx',
        ipAddress: '172.33.222.1',
      },
      marketplaceInfo: this.marketplaceInfo,
      channel: this.formData.channel,
    }

    if (this.formData.sourceType === 'card') {
      payload.verification = this.formData.verification
    }

    try {
      if (this.cvvRequired) {
        const { cvv } = this.formData
        const cardDetails = { cvv }

        const publicKey = await this.$paymentsApi.getPCIPublicKey()
        const encryptedData = await openPGP.encrypt(cardDetails, publicKey)
        payload.encryptedData = encryptedData.encryptedMessage
        payload.keyId = encryptedData.keyId
      }

      await this.$marketplaceApi.createPayment(payload)
    } catch (error) {
      this.error = error
      this.showError = true
    } finally {
      this.loading = false
    }
  }
}
</script>
