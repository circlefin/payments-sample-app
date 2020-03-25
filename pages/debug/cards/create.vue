<template>
  <v-layout>
    <v-row>
      <v-col cols="12" md="4">
        <v-menu>
          <template v-slot:activator="{ on }">
            <div class="d-flex flex-row-reverse">
              <v-btn
                v-if="isSandbox"
                small
                color="blue-grey lighten-1"
                dark
                v-on="on"
              >
                Prefill form
              </v-btn>
            </div>
          </template>
          <v-list>
            <v-list-item
              v-for="(item, index) in prefillItems"
              :key="index"
              @click="prefillForm(index)"
            >
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>

        <v-form>
          <v-text-field v-model="formData.cardNumber" label="Card Number" />

          <v-select
            v-model="formData.verificationMethod"
            :items="verificationMethods"
            label="Verification Method"
          />

          <v-text-field v-model="formData.cvv" label="CVV" />

          <v-text-field v-model="formData.expiry.month" label="Expiry Month" />

          <v-text-field v-model="formData.expiry.year" label="Expiry Year" />

          <v-text-field v-model="formData.name" label="Full name" />

          <v-text-field v-model="formData.line1" label="Address Line 1" />

          <v-text-field v-model="formData.line2" label="Address Line 2" />

          <v-text-field v-model="formData.postalCode" label="Postalcode" />

          <v-text-field v-model="formData.city" label="City" />

          <v-text-field v-model="formData.district" label="District" />

          <v-text-field v-model="formData.country" label="Country Code" />

          <v-text-field v-model="formData.phone" label="Phone" />

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
import { Component, Vue, Watch } from 'nuxt-property-decorator'
import { mapGetters } from 'vuex'
import uuidv4 from 'uuid/v4'
import openPGP from '@/lib/openpgp'
import { getLive } from '@/lib/apiTarget'
import { exampleCards } from '@/lib/cardTestData'
import { CreateCardPayload } from '@/lib/cardsApi'
import RequestInfo from '@/components/RequestInfo.vue'
import ErrorSheet from '@/components/ErrorSheet.vue'
import CardInput from '@/components/CardInput.vue'
import CVVInput from '@/components/CVVInput.vue'
import ExpiryInput from '@/components/ExpiryInput.vue'

@Component({
  components: {
    RequestInfo,
    ErrorSheet,
    CardInput,
    ExpiryInput,
    CVVInput
  },
  computed: {
    ...mapGetters({
      payload: 'getRequestPayload',
      response: 'getRequestResponse',
      requestUrl: 'getRequestUrl'
    })
  }
})
export default class CreateCardClass extends Vue {
  @Watch('formData.verificationMethod', { immediate: true })
  onChildChanged(val: string) {
    if (val === 'none') {
      this.cvvRequired = false
    }
    if (val === 'cvv') {
      this.cvvRequired = true
    }
  }

  // data
  cvvRequired = true
  formData = {
    cardNumber: '',
    cvv: '',
    expiry: {
      month: '',
      year: ''
    },
    name: '',
    country: '',
    district: '',
    line1: '',
    line2: '',
    city: '',
    postalCode: '',
    phone: '',
    verificationMethod: 'cvv',
    email: ''
  }
  verificationMethods = ['none', 'cvv', 'avs']
  rules = {
    isNumber: (v: string) =>
      v === '' || !isNaN(parseInt(v)) || 'Please enter valid number',
    required: (v: string) => !!v || 'Field is required'
  }
  prefillItems = exampleCards
  error = {}
  loading = false
  showError = false
  expiryLabels = {
    month: 'Expiry Month',
    year: 'Expiry Year'
  }
  isSandbox: Boolean = !getLive()

  onErrorSheetClosed() {
    this.error = {}
    this.showError = false
  }

  prefillForm(index: number) {
    this.formData = exampleCards[index].formData
  }
  async makeApiCall() {
    this.loading = true

    const { cardNumber, cvv, ...data } = this.formData
    const cardDetails = {
      number: cardNumber.trim().replace(/\D/g, ''),
      cvv
    }
    const { expiry, verificationMethod, ...billingDetails } = data

    const payload: CreateCardPayload = {
      refId: uuidv4(),
      expMonth: parseInt(expiry.month),
      expYear: parseInt(expiry.year),
      verificationMethod,
      keyId: '',
      encryptedData: '',
      billingDetails,
      metadata: {
        session: { sessionId: 'xxx', ipAddress: '172.33.222.1' }
      }
    }

    try {
      if (this.cvvRequired) {
        const publicKey = await this.$cardsApi.getPCIPublicKey()
        const encryptedData = await openPGP.encrypt(cardDetails, publicKey)
        const { encryptedMessage, keyId } = encryptedData

        payload.keyId = keyId
        payload.encryptedData = encryptedMessage
      }

      await this.$cardsApi.createCard(payload)
    } catch (error) {
      this.error = error
      this.showError = true
    } finally {
      this.loading = false
    }
  }
}
</script>
