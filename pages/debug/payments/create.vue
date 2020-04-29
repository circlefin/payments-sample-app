<template>
  <v-layout>
    <v-row>
      <v-col cols="12" md="4">
        <v-form>
          <v-text-field
            v-model="formData.sourceId"
            label="Source Id (Card Id)"
          />

          <v-text-field v-model="formData.amount" label="Amount" />

          <v-text-field v-model="formData.cvv" label="CVV" />

          <v-text-field v-model="formData.phoneNumber" label="Phone" />

          <v-text-field v-model="formData.email" label="Email" />

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
import uuidv4 from 'uuid/v4'
import openPGP from '@/lib/openpgp'
import { CreatePaymentPayload } from '@/lib/paymentsApi'
import RequestInfo from '@/components/RequestInfo.vue'
import ErrorSheet from '@/components/ErrorSheet.vue'

@Component({
  components: {
    RequestInfo,
    ErrorSheet
  },
  computed: {
    ...mapGetters({
      payload: 'getRequestPayload',
      response: 'getRequestResponse',
      requestUrl: 'getRequestUrl',
      isMarketplace: 'isMarketplace'
    })
  }
})
export default class CreatePaymentClass extends Vue {
  isMarketplace!: boolean
  formData = {
    sourceId: '',
    amount: '0.00',
    cvv: '',
    phoneNumber: '',
    email: ''
  }
  required = [(v: string) => !!v || 'Field is required']
  error = {}
  loading = false
  showError = false

  mounted() {
    if (this.isMarketplace) {
      return this.$nuxt.error({
        statusCode: 404,
        message: 'This endpoint is not available for marketplaces'
      })
    }
  }

  onErrorSheetClosed() {
    this.error = {}
    this.showError = false
  }

  async makeApiCall() {
    this.loading = true

    const amountDetail = {
      amount: this.formData.amount,
      currency: 'USD'
    }
    const sourceDetails = {
      id: this.formData.sourceId,
      type: 'card'
    }

    const payload: CreatePaymentPayload = {
      idempotencyKey: uuidv4(),
      amount: amountDetail,
      source: sourceDetails,
      keyId: '',
      encryptedData: '',
      metadata: {
        email: this.formData.email,
        phoneNumber: this.formData.phoneNumber,
        sessionId: 'xxx',
        ipAddress: '172.33.222.1'
      }
    }

    try {
      const { cvv } = this.formData
      const cardDetails = { cvv }

      const publicKey = await this.$paymentsApi.getPCIPublicKey()
      const encryptedData = await openPGP.encrypt(cardDetails, publicKey)

      payload.encryptedData = encryptedData.encryptedMessage
      payload.keyId = encryptedData.keyId

      await this.$paymentsApi.createPayment(payload)
    } catch (error) {
      this.error = error
      this.showError = true
    } finally {
      this.loading = false
    }
  }
}
</script>
