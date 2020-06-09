<template>
  <div>
    <div v-if="showError" class="red--text">
      {{ error.message }}
    </div>
    <v-form ref="form" v-model="validForm">
      <CardInput
        v-model="formData.cardNumber"
        :rules="[rules.required]"
        label="Card Number"
        required
      />
      <v-row>
        <v-col cols="12" md="6">
          <CVVInput v-model="formData.cvv" :rules="[rules.isNumber]" />
        </v-col>
        <v-col cols="12" md="6">
          <ExpiryInput
            v-model="formData.expiry"
            :labels="expiryLabels"
            :required="true"
          />
        </v-col>
      </v-row>

      <v-expansion-panels multiple :value="collapsed">
        <v-expansion-panel>
          <v-expansion-panel-header>
            Billing Details
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-text-field
              v-model="formData.name"
              :rules="[rules.required]"
              label="Cardholder name"
              hint="Full name of the card holder"
              required
            />

            <v-text-field
              v-model="formData.line1"
              :rules="[rules.required]"
              label="Address Line 1"
              required
            />

            <v-text-field v-model="formData.line2" label="Address Line 2" />

            <v-text-field
              v-model="formData.postalCode"
              :rules="[rules.required]"
              label="Postalcode"
              required
            />

            <v-text-field
              v-model="formData.city"
              :rules="[rules.required]"
              label="City"
              required
            />

            <v-text-field
              v-model="formData.district"
              :rules="[rules.required]"
              label="District"
              hint="State / County / Province / Region portion of the address. US and Canada use the two-letter code for the subdivision"
              required
            />

            <CountrySelect
              v-model="formData.country"
              :rules="[rules.required]"
              label="Country Code"
              :disabled="loading"
            />

            <v-text-field
              v-model="formData.phoneNumber"
              hint="Phone number of the user in E.164 format"
              label="Phone"
            />

            <v-text-field v-model="formData.email" label="Email" />
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>

      <v-btn
        class="mt-4"
        depressed
        block
        color="primary"
        :disabled="!validForm || loading"
        @click.prevent="makeApiCall"
      >
        Add card
      </v-btn>
    </v-form>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'nuxt-property-decorator'
import { mapGetters } from 'vuex'
import { v4 as uuidv4 } from 'uuid'
import openPGP from '@/lib/openpgp'
import { exampleCards } from '@/lib/cardTestData'
import { CreateCardPayload } from '@/lib/cardsApi'
import RequestInfo from '@/components/RequestInfo.vue'
import ErrorSheet from '@/components/ErrorSheet.vue'
import CardInput from '@/components/CardInput.vue'
import CVVInput from '@/components/CVVInput.vue'
import ExpiryInput from '@/components/ExpiryInput.vue'
import CountrySelect from '@/components/CountrySelect.vue'
import { getLive } from '@/lib/apiTarget'

@Component({
  components: {
    RequestInfo,
    ErrorSheet,
    CardInput,
    CVVInput,
    ExpiryInput,
    CountrySelect,
  },
  computed: {
    ...mapGetters({
      payload: 'getRequestPayload',
      response: 'getRequestResponse',
      requestUrl: 'getRequestUrl',
    }),
  },
})
export default class CreateCardFormClass extends Vue {
  @Prop({ type: Boolean, default: false })
  collapse!: boolean

  @Prop({ type: Object }) prefillData!: object

  // data
  validForm = false
  formData = {
    cardNumber: '',
    cvv: '',
    expiry: {
      month: '',
      year: '',
    },
    name: '',
    country: '',
    district: '',
    line1: '',
    line2: '',
    city: '',
    postalCode: '',
    phoneNumber: '',
    email: '',
  }

  rules = {
    isNumber: (v: string) =>
      v === '' || !isNaN(parseInt(v)) || 'Please enter valid number',
    required: (v: string) => !!v || 'Field is required',
  }

  prefillItems = exampleCards
  error = {}
  loading = false
  showError = false
  expiryLabels = {
    month: 'Expiry Month',
    year: 'Expiry Year',
  }

  isSandbox: Boolean = !getLive()

  prefillForm(index: number) {
    this.formData = exampleCards[index].formData

    this.$nextTick(() => {
      const vuetifyForm: any = this.$refs.form
      vuetifyForm.validate()
    })
  }

  get collapsed() {
    if (this.collapse) {
      return [0, 1]
    }
  }

  @Watch('loading')
  onLoading(value: boolean) {
    this.$emit('loading', value)
  }

  @Watch('prefillData')
  loadPrefillData(value: CreateCardFormClass['formData']) {
    this.formData = value
    this.$nextTick(() => {
      const vuetifyForm: any = this.$refs.form
      vuetifyForm.validate()
    })
  }

  async makeApiCall() {
    this.loading = true

    const { email, phoneNumber, cardNumber, cvv, ...data } = this.formData
    const cardDetails = {
      number: cardNumber.trim().replace(/\D/g, ''),
      cvv,
    }
    const { expiry, ...billingDetails } = data

    const payload: CreateCardPayload = {
      idempotencyKey: uuidv4(),
      expMonth: parseInt(expiry.month),
      expYear: 2000 + parseInt(expiry.year),
      keyId: '',
      encryptedData: '',
      billingDetails,
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

      const card = await this.$cardsApi.createCard(payload)
      if (card) {
        this.$store.dispatch('setCard', {
          id: card.id,
        })
      }
      this.$emit('success', card)
    } catch (error) {
      this.error = error
      this.showError = true
    } finally {
      this.loading = false
    }
  }
}
</script>
