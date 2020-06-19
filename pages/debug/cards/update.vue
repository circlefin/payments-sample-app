<template>
  <v-layout>
    <v-row>
      <v-col cols="12" md="4">
        <v-form>
          <v-text-field v-model="formData.cardId" label="Card Id" />

          <v-text-field v-model="formData.cardNumber" label="Card Number" />

          <v-text-field v-model="formData.cvv" label="CVV" />

          <v-text-field v-model="formData.expiry.month" label="Expiry Month" />

          <v-text-field v-model="formData.expiry.year" label="Expiry Year" />

          <v-text-field
            v-model="formData.name"
            hint="Full name of the card holder"
            label="Full Name"
          />

          <v-text-field v-model="formData.line1" label="Address Line 1" />

          <v-text-field v-model="formData.line2" label="Address Line 2" />

          <v-text-field v-model="formData.postalCode" label="Postalcode" />

          <v-text-field v-model="formData.city" label="City" />

          <v-text-field
            v-model="formData.district"
            label="District"
            hint="State / County / Province / Region portion of the address. US and Canada use the two-letter code for the subdivision"
          />

          <v-text-field v-model="formData.country" label="Country Code" />

          <v-text-field
            v-model="formData.phoneNumber"
            hint="Phone number of the user in E.164 format"
            label="Phone"
          />

          <v-text-field v-model="formData.email" label="Email" />
          <v-btn
            depressed
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
import openPGP from '@/lib/openpgp'
import RequestInfo from '@/components/RequestInfo.vue'
import ErrorSheet from '@/components/ErrorSheet.vue'
import ExpiryInput from '@/components/ExpiryInput.vue'
import { getLive } from '@/lib/apiTarget'

@Component({
  components: {
    RequestInfo,
    ErrorSheet,
    ExpiryInput,
  },
  computed: {
    ...mapGetters({
      payload: 'getRequestPayload',
      response: 'getRequestResponse',
      requestUrl: 'getRequestUrl',
    }),
  },
})
export default class UpdateCardsClass extends Vue {
  // data
  formData = {
    name: '',
    email: '',
    cardId: '',
    cardNumber: '',
    cvv: '',
    city: '',
    country: '',
    line1: '',
    line2: '',
    district: '',
    postalCode: '',
    phoneNumber: '',
    expiry: {
      month: '',
      year: '',
    },
  }

  rules = {
    required: (v: string) => !!v || 'Field is required',
    isNumber: (v: string) => !isNaN(parseInt(v)) || 'Please enter valid number',
  }

  error = {}
  loading = false
  showError = false
  expiryLabels = {
    month: 'Expiry Month',
    year: 'Expiry Year',
  }

  isSandbox: Boolean = !getLive()

  onErrorSheetClosed() {
    this.error = {}
    this.showError = false
  }

  async makeApiCall() {
    this.loading = true
    const {
      cardId,
      cardNumber,
      email,
      phoneNumber,
      cvv,
      ...data
    } = this.formData
    const { expiry, ...billingDetails } = data

    const cardDetails: {
      number: string
      cvv?: string
    } = {
      number: cardNumber.trim().replace(/\D/g, ''),
      cvv,
    }

    const payload = {
      billingDetails,
      expMonth: parseInt(expiry.month),
      expYear: 2000 + parseInt(expiry.year),
      keyId: '',
      encryptedData: '',
      metadata: {
        email,
        phoneNumber,
        sessionId: 'xxx',
        ipAddress: '172.33.222.1',
      },
    }
    try {
      const publicKey = await this.$cardsApi.getPCIPublicKey()
      const encryptedData = await openPGP.encrypt(cardDetails, publicKey)
      const { encryptedMessage, keyId } = encryptedData
      payload.keyId = keyId
      payload.encryptedData = encryptedMessage
      await this.$cardsApi.updateCard(cardId, payload)
    } catch (error) {
      this.error = error
      this.showError = true
    } finally {
      this.loading = false
    }
  }
}
</script>
