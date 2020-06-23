<template>
  <v-layout>
    <v-row>
      <v-col cols="12" md="4">
        <v-form>
          <v-row align="center">
            <v-col>
              <v-text-field
                v-model="formData.source.id"
                label="Source Wallet Id"
              />
            </v-col>
            <v-col>
              <v-btn
                :loading="loading"
                outlined
                small
                @click.prevent="makeWalletApiCall"
              >
                Get master wallet id
              </v-btn>
            </v-col>
          </v-row>

          <v-text-field v-model="formData.amount" label="Amount" />

          <v-select
            v-model="formData.destination.type"
            :items="destinationTypes"
            label="Destination Type"
          />

          <v-text-field
            v-if="isWalletTransfer"
            v-model="formData.destination.id"
            label="Destination Wallet Id"
          />

          <v-text-field
            v-if="!isWalletTransfer"
            v-model="formData.destination.address"
            label="Blockchain Address"
          />

          <v-text-field
            v-if="!isWalletTransfer"
            v-model="formData.destination.chain"
            hint="For example ETH"
            label="Blockchain Id"
          />

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
import RequestInfo from '@/components/RequestInfo.vue'
import ErrorSheet from '@/components/ErrorSheet.vue'
import {
  CreateTransferPayload,
  BlockchainDestination,
  WalletDestination,
} from '@/lib/transfersApi'

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
      isMarketplace: 'isMarketplace',
    }),
  },
})
export default class CreateTransferClass extends Vue {
  isWalletTransfer = true
  formData = {
    idempotencyKey: '',
    source: {
      id: '',
    },
    amount: '0.00',
    destination: {
      type: 'wallet',
      address: '',
      chain: '',
      id: '',
    },
  }

  destinationTypes = ['wallet', 'blockchain']
  required = [(v: string) => !!v || 'Field is required']
  error = {}
  loading = false
  showError = false

  @Watch('formData.destination.type', { immediate: true })
  onChildChanged(val: string) {
    if (val === 'wallet') {
      this.isWalletTransfer = true
    }
    if (val === 'blockchain') {
      this.isWalletTransfer = false
    }
  }

  onErrorSheetClosed() {
    this.error = {}
    this.showError = false
  }

  async makeWalletApiCall() {
    this.loading = true

    try {
      const res = await this.$walletsApi.getMasterWallet()
      if (res.payments.masterWalletId) {
        this.formData.source.id = res.payments.masterWalletId
      }
    } catch (error) {
      this.$emit('showError', error)
    } finally {
      this.loading = false
    }
  }

  async makeApiCall() {
    this.loading = true

    const amountDetail = {
      amount: this.formData.amount,
      currency: 'USD',
    }
    let destination: BlockchainDestination | WalletDestination
    if (this.isWalletTransfer) {
      destination = {
        type: 'wallet',
        id: this.formData.destination.id,
      }
    } else {
      destination = {
        type: 'blockchain',
        address: this.formData.destination.address,
        chain: this.formData.destination.chain,
      }
    }

    const payload: CreateTransferPayload = {
      idempotencyKey: uuidv4(),
      source: {
        type: 'wallet',
        id: this.formData.source.id,
      },
      amount: amountDetail,
      destination,
    }

    try {
      await this.$transfersApi.createTransfer(payload)
    } catch (error) {
      this.error = error
      this.showError = true
    } finally {
      this.loading = false
    }
  }
}
</script>
