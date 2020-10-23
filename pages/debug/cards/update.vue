<template>
  <v-layout>
    <v-row>
      <v-col cols="12" md="4">
        <v-form>
          <v-text-field v-model="formData.cardId" label="Card Id" />

          <v-text-field v-model="formData.cvv" label="CVV" />

          <v-text-field v-model="formData.expiry.month" label="Expiry Month" />

          <v-text-field v-model="formData.expiry.year" label="Expiry Year" />

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
import { getLive } from '@/lib/apiTarget'

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
export default class UpdateCardsClass extends Vue {
  // data
  formData = {
    cardId: '',
    cvv: '',
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
    const { cardId, cvv, expiry } = this.formData

    const cardDetails: {
      cvv?: string
    } = {
      cvv,
    }

    const payload = {
      expMonth: parseInt(expiry.month),
      expYear: parseInt(expiry.year),
      keyId: '',
      encryptedData: '',
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
