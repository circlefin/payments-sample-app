<template>
  <v-layout>
    <v-row>
      <v-col cols="12" md="5">
        <v-card :loading="loading" outlined>
          <v-btn
            v-if="!showPaymentStatus"
            depressed
            small
            class="float-right mr-4 mt-4"
            color="primary"
            :disabled="loading"
            @click.prevent="createCardOverlay = !createCardOverlay"
          >
            Add card
          </v-btn>
          <v-list-item three-line>
            <v-list-item-content>
              <Environment />
              <v-list-item-title class="headline mb-1">
                Pay with card
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-card-text>
            <v-form v-if="!showPaymentStatus" v-model="validForm">
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

              <v-select
                v-model="formData.fiatAccountId"
                :rules="[rules.required]"
                :items="cardItems"
                label="Select card"
                :disabled="loading"
                required
              />

              <CVVInput v-model="formData.cvv" :rules="[rules.required]" />

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

              <v-text-field
                v-model="formData.phoneNumber"
                hint="Phone number of the user in E.164 format"
                label="Phone"
                :disabled="loading"
              />

              <v-text-field
                v-model="formData.email"
                :rules="[rules.required]"
                label="Email"
                :disabled="loading"
              />

              <v-btn
                depressed
                block
                class="mt-7"
                color="primary"
                :disabled="!validForm || loading"
                @click.prevent="makeChargeCall()"
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
        <v-overlay :dark="false" :value="createCardOverlay" :opacity="0.46">
          <v-card
            :loading="createCardLoading"
            class="mx-auto pa-4 scrollable"
            width="500"
          >
            <v-btn icon class="float-right" @click="createCardOverlay = false">
              <v-icon>
                mdi-close
              </v-icon>
            </v-btn>
            <h2 class="title">
              Add card
            </h2>
            <v-form>
              <v-text-field
                v-model="cardIdInput"
                placeholder="25f4281e-0a14-4627-907d-3223672a94c2"
                label="Card Id"
              />
              <v-btn
                depressed
                color="primary"
                :disabled="!cardIdInput || createCardLoading"
                @click.prevent="addCardById()"
              >
                Find card
              </v-btn>
            </v-form>

            <p class="separator subtitle-2">
              OR
            </p>

            <v-menu>
              <template v-slot:activator="{ on }">
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
            <CreateCardForm
              :prefill-data="prefillFormData"
              @success="onCreateCardSuccess"
              @loading="onCreateCardLoading"
            />
          </v-card>
        </v-overlay>
        <ErrorSheet
          :error="error"
          :show-error="showError"
          @onChange="onErrorSheetClosed"
        />
      </v-col>
      <v-col cols="12" md="5">
        <div class="pa-4">
          <h1 class="headline">Use existing card</h1>
          <p class="mt-6">
            To accept online payments from the end user you can reuse already
            entered card details.
          </p>
          <p>
            Creating a card will respond with an id value that can be stored on
            your side to refer to this end -user's card in future payment
            requests.
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
            <br /><br />
            For demo purposes card ids are saved in local storage.
          </p>
        </div>
      </v-col>
    </v-row>
  </v-layout>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'nuxt-property-decorator'
import { mapGetters } from 'vuex'
import { v4 as uuidv4 } from 'uuid'
import { exampleCards } from '@/lib/cardTestData'
import openPGP from '@/lib/openpgp'
import { CreateCardPaymentPayload } from '@/lib/paymentsApi'
import {
  CreateMarketplaceCardPaymentPayload,
  MarketplaceInfo,
} from '@/lib/marketplaceApi'
import ErrorSheet from '@/components/ErrorSheet.vue'
import Environment from '@/components/Environment.vue'
import CreateCardForm from '@/components/CreateCardForm.vue'
import AmountInput from '@/components/AmountInput.vue'
import CVVInput from '@/components/CVVInput.vue'
import PaymentStatus from '@/components/PaymentStatus.vue'
import MarketplaceInfoFields from '@/components/MarketplaceInfoFields.vue'
import { getLive } from '@/lib/apiTarget'

interface Card {
  id: string
  value: string
  text: string
}

@Component({
  components: {
    ErrorSheet,
    Environment,
    CreateCardForm,
    AmountInput,
    CVVInput,
    PaymentStatus,
    MarketplaceInfoFields,
  },
  computed: {
    ...mapGetters({
      cards: 'getCards',
      isMarketplace: 'isMarketplace',
    }),
  },
})
export default class CardFlowClass extends Vue {
  isMarketplace!: boolean
  marketplaceInfo: MarketplaceInfo = {
    walletId: '',
    merchantId: '',
    merchantWalletId: '',
  }

  cards!: Card[]
  cardItems: string[] = []
  validForm: boolean = false
  isSandbox: Boolean = !getLive()
  prefillItems = exampleCards
  prefillFormData = {}
  formData = {
    fiatAccountId: '',
    amount: '0.00',
    cvv: '',
    description: '',
    channel: '',
    phoneNumber: '',
    email: '',
  }

  cardIdInput = ''
  rules = {
    required: (v: string) => !!v || 'Field is required',
  }

  required = [(v: string) => !!v || 'Field is required']
  loading: boolean = false
  error: object = {}
  showError: boolean = false
  showPaymentStatus: boolean = false
  createCardOverlay = false
  polling: boolean = false
  pollingId: number = 0
  createCardLoading: boolean = false
  payment = null

  @Watch('cards', { immediate: true })
  onCardsChange() {
    const items = this.cards.map((card) => {
      return card.id
    })

    this.cardItems = items
  }

  onPollingError(error: any) {
    this.error = error
    this.showError = true
  }

  onErrorSheetClosed() {
    this.error = {}
    this.showError = false
  }

  onNewPayment() {
    this.showPaymentStatus = false
  }

  onCreateCardLoading(value: boolean) {
    this.createCardLoading = value
  }

  onCreateCardSuccess() {
    this.createCardOverlay = false
  }

  addCardById() {
    this.$store.dispatch('setCard', {
      id: this.cardIdInput,
    })
    this.createCardOverlay = false
  }

  prefillForm(index: number) {
    this.prefillFormData = this.prefillItems[index].formData
  }

  showMarketplaceInfoError(error: object) {
    this.error = error
    this.showError = true
  }

  async makeChargeCall() {
    this.loading = true

    const amountDetail = {
      amount: this.formData.amount,
      currency: 'USD',
    }
    const sourceDetails = {
      id: this.formData.fiatAccountId,
      type: 'card',
    }

    const payload: CreateCardPaymentPayload = {
      idempotencyKey: uuidv4(),
      amount: amountDetail,
      verification: 'cvv',
      source: sourceDetails,
      description: this.formData.description,
      keyId: '',
      encryptedData: '',
      channel: this.formData.channel,
      metadata: {
        phoneNumber: this.formData.phoneNumber,
        email: this.formData.email,
        sessionId: 'xxx',
        ipAddress: '172.33.222.1',
      },
    }

    try {
      const { cvv } = this.formData
      const cardDetails = { cvv }

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

<style scoped>
.scrollable {
  max-height: 90vh;
  overflow-y: auto;
}
.separator {
  margin: 50px 0;
  text-align: center;
  border-bottom: 1px solid black;
}
</style>
