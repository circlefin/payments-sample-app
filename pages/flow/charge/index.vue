<template>
  <v-layout>
    <v-row>
      <v-col cols="12" md="5">
        <v-card :loading="loading" class="mx-auto" outlined>
          <v-list-item three-line>
            <v-list-item-content>
              <Environment />
              <v-list-item-title class="headline mb-1">
                Pay with card
              </v-list-item-title>
            </v-list-item-content>
            <v-menu v-if="!showPaymentStatus">
              <template #activator="{ on }">
                <v-btn
                  v-if="isSandbox"
                  class="mt-n8"
                  small
                  color="blue-grey lighten-1"
                  dark
                  v-on="on"
                >
                  Prefill form
                </v-btn>
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
          </v-list-item>
          <v-card-text>
            <v-form v-if="!showPaymentStatus" ref="form" v-model="validForm">
              <MarketplaceInfoFields
                v-if="isMarketplace"
                v-model="marketplaceInfo"
                @show-error="showMarketplaceInfoError"
              />

              <AmountInput
                v-model="formData.amount"
                label="Amount"
                :disabled="loading"
              />

              <CardInput
                v-model="formData.cardData.cardNumber"
                label="Card Number"
                :disabled="loading"
              />

              <v-row>
                <v-col cols="12" md="6">
                  <CVVInput
                    v-model="formData.cardData.cvv"
                    :rules="[rules.isNumber]"
                    default-label="CVV"
                    :disabled="loading"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <ExpiryInput
                    v-model="formData.cardData.expiry"
                    :labels="expiryLabels"
                    :required="true"
                  />
                </v-col>
              </v-row>

              <v-text-field
                v-model="formData.description"
                hint="Payment Description"
                label="Description"
                :disabled="loading"
              />

              <v-text-field
                v-model="formData.channel"
                hint="Channel"
                label="Channel"
                :disabled="loading"
              />

              <div class="my-4 subtitle-1 black--text">Billing Details</div>

              <v-text-field
                v-model="formData.cardData.name"
                :rules="[rules.required]"
                hint="Full name of the card holder"
                label="Cardholder name"
                :disabled="loading"
              />

              <v-text-field
                v-model="formData.cardData.line1"
                :rules="[rules.required]"
                label="Address Line 1"
                :disabled="loading"
              />

              <v-text-field
                v-model="formData.cardData.line2"
                label="Address Line 2"
              />

              <v-text-field
                v-model="formData.cardData.postalCode"
                :rules="[rules.required]"
                label="Postalcode"
                :disabled="loading"
              />

              <v-text-field
                v-model="formData.cardData.city"
                :rules="[rules.required]"
                label="City"
                :disabled="loading"
              />

              <v-text-field
                v-model="formData.cardData.district"
                :rules="[rules.required]"
                label="District"
                :disabled="loading"
                hint="State / County / Province / Region portion of the address. US and Canada use the two-letter code for the subdivision"
              />

              <CountrySelect
                v-model="formData.cardData.country"
                :rules="[rules.required]"
                label="Country Code"
                :disabled="loading"
              />

              <v-text-field
                v-model="formData.cardData.phoneNumber"
                hint="Phone number of the user in E.164 format"
                label="Phone"
                :disabled="loading"
              />

              <v-text-field
                v-model="formData.cardData.email"
                :rules="[rules.required]"
                label="Email"
                :disabled="loading"
              />

              <v-btn
                class="mt-4"
                depressed
                block
                color="primary"
                :disabled="!validForm || loading"
                @click.prevent="chargeCard()"
              >
                Make payment
              </v-btn>
            </v-form>
            <PaymentStatus
              v-if="showPaymentStatus"
              :payment-id="payment && payment.id"
              @makeNewPayment="onNewPayment"
              @error="onPollingError"
            />
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="5">
        <div class="pa-4">
          <h1 class="headline">Charge a card - One-off payment</h1>

          <p class="mt-6">
            To accept a card payment using the Circle Payments API you need to
            collect card details and billing information from the end user
            similar to the payments form shown on the left.
          </p>
          <p>
            If you are accepting a one-off payment (that is, your product does
            not need to support accepting multiple future payments for this
            card), then you don't need so store the card id as a reference to
            this end -user's card when creating the card.
          </p>
          <p>
            For implementation details please see our
            <a
              href="https://developers.circle.com/docs/accept-card-payments-online"
              rel="noopener"
              target="_blank"
            >
              API guide.
            </a>
          </p>
          <p class="subtitle-2">
            You can test the form by entering your personal api key in the
            settings on the right (Caution: When using a production api key it
            will charge your card).
          </p>
        </div>
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
import { v4 as uuidv4 } from 'uuid'
import openPGP from '@/lib/openpgp'
import { getLive } from '@/lib/apiTarget'
import { exampleCards } from '@/lib/cardTestData'
import { CreateCardPayload } from '@/lib/cardsApi'
import { CreateCardPaymentPayload } from '@/lib/paymentsApi'
import {
  CreateMarketplaceCardPaymentPayload,
  MarketplaceInfo,
} from '@/lib/marketplaceApi'
import CardInput from '@/components/CardInput.vue'
import CVVInput from '@/components/CVVInput.vue'
import ErrorSheet from '@/components/ErrorSheet.vue'
import Environment from '@/components/Environment.vue'
import ExpiryInput from '@/components/ExpiryInput.vue'
import AmountInput from '@/components/AmountInput.vue'
import CountrySelect from '@/components/CountrySelect.vue'
import PaymentStatus from '@/components/PaymentStatus.vue'
import MarketplaceInfoFields from '@/components/MarketplaceInfoFields.vue'

interface FormData {
  amount: string
  cardData: {
    cardNumber: string
    cvv: string
    expiry: {
      month: string
      year: string
    }
    name: string
    country: string
    district: string
    line1: string
    line2: string
    city: string
    postalCode: string
    phoneNumber: string
    email: string
  }
  description: string
  channel: string
}

@Component({
  components: {
    AmountInput,
    ErrorSheet,
    Environment,
    CardInput,
    ExpiryInput,
    CountrySelect,
    CVVInput,
    PaymentStatus,
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
export default class ChargeFlowClass extends Vue {
  validForm: boolean = false
  formData: FormData = {
    amount: '0.00',
    cardData: {
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
    },
    description: '',
    channel: '',
  }

  rules = {
    isNumber: (v: string) =>
      v === '' || !isNaN(parseInt(v)) || 'Please enter valid number',
    required: (v: string) => !!v || 'Field is required',
  }

  error: object = {}
  loading: boolean = false
  showError: boolean = false
  showPaymentStatus: boolean = false
  expiryLabels = {
    month: 'Expiry Month',
    year: 'Expiry Year',
  }

  payment = null
  prefillItems = exampleCards
  isSandbox: Boolean = !getLive()
  isMarketplace!: boolean
  marketplaceInfo: MarketplaceInfo = {
    walletId: '',
    merchantId: '',
    merchantWalletId: '',
  }

  prefillForm(index: number) {
    this.formData.cardData = this.prefillItems[index].formData

    this.$nextTick(() => {
      const vuetifyForm: any = this.$refs.form
      vuetifyForm.validate()
    })
  }

  onErrorSheetClosed() {
    this.error = {}
    this.showError = false
  }

  onPollingError(error: any) {
    this.error = error
    this.showError = true
  }

  onNewPayment() {
    this.showPaymentStatus = false
  }

  showMarketplaceInfoError(error: object) {
    this.error = error
    this.showError = true
  }

  async chargeCard() {
    try {
      const card = await this.makeCreateCardCall()
      if (card && card.id) {
        await this.makeChargeCall(card.id)
      }
    } catch (error) {
      this.error = error
      this.showError = true
    } finally {
      this.loading = false
    }
  }

  async makeCreateCardCall() {
    this.loading = true

    const payload: CreateCardPayload = {
      idempotencyKey: uuidv4(),
      expMonth: parseInt(this.formData.cardData.expiry.month),
      expYear: parseInt(this.formData.cardData.expiry.year),
      keyId: '',
      encryptedData: '',
      billingDetails: {
        line1: this.formData.cardData.line1,
        line2: this.formData.cardData.line2,
        city: this.formData.cardData.city,
        district: this.formData.cardData.district,
        postalCode: this.formData.cardData.postalCode,
        country: this.formData.cardData.country,
        name: this.formData.cardData.name,
      },
      metadata: {
        phoneNumber: this.formData.cardData.phoneNumber,
        email: this.formData.cardData.email,
        sessionId: 'xxx',
        ipAddress: '172.33.222.1',
      },
    }

    try {
      const publicKey = await this.$cardsApi.getPCIPublicKey()
      const cardDetails = {
        number: this.formData.cardData.cardNumber.replace(/\s/g, ''),
        cvv: this.formData.cardData.cvv,
      }

      const encryptedData = await openPGP.encrypt(cardDetails, publicKey)
      const { encryptedMessage, keyId } = encryptedData

      payload.keyId = keyId
      payload.encryptedData = encryptedMessage

      return await this.$cardsApi.createCard(payload)
    } catch (error) {
      this.error = error
      this.showError = true
    } finally {
      this.loading = false
    }
  }

  async makeChargeCall(cardId: string) {
    this.loading = true

    const amountDetail = {
      amount: this.formData.amount,
      currency: 'USD',
    }
    const sourceDetails = {
      id: cardId,
      type: 'card',
    }

    const payload: CreateCardPaymentPayload = {
      idempotencyKey: uuidv4(),
      amount: amountDetail,
      verification: 'cvv',
      source: sourceDetails,
      description: this.formData.description,
      channel: this.formData.channel,
      metadata: {
        phoneNumber: this.formData.cardData.phoneNumber,
        email: this.formData.cardData.email,
        sessionId: 'xxx',
        ipAddress: '172.33.222.1',
      },
    }

    try {
      const cardDetails = { cvv: this.formData.cardData.cvv }

      const publicKey = await this.$paymentsApi.getPCIPublicKey()
      const encryptedData = await openPGP.encrypt(cardDetails, publicKey)

      payload.encryptedData = encryptedData.encryptedMessage
      payload.keyId = encryptedData.keyId

      if (this.isMarketplace) {
        const marketPlacePayload: CreateMarketplaceCardPaymentPayload = {
          marketplaceInfo: this.marketplaceInfo,
          ...payload,
        }
        this.payment = await this.$marketplaceApi.createPayment(
          marketPlacePayload
        )
      } else {
        this.payment = await this.$paymentsApi.createPayment(payload)
      }
      this.showPaymentStatus = true
    } catch (error) {
      this.error = error
      this.showError = true
    } finally {
      this.loading = false
    }
  }
}
</script>
