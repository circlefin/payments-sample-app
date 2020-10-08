<template>
  <v-layout>
    <v-row>
      <v-col cols="12" md="4">
        <v-form>
          <v-text-field v-model="formData.amount" label="Amount" />

          <v-select
            v-model="formData.destination.type"
            :items="destinationTypes"
            label="Destination Type"
          />

          <v-text-field
            v-if="isWithdrawalTransfer"
            v-model="formData.destination.id"
            label="Blockchain Withdrawal Id"
          />

          <v-text-field
            v-if="!isWithdrawalTransfer"
            v-model="formData.destination.address"
            label="Blockchain Address"
          />

          <v-text-field
            v-if="!isWithdrawalTransfer"
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
  WithdrawalDestination,
} from '@/lib/businessAccount/transfersApi'

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
export default class CreateTransferClass extends Vue {
  isFiatAccount = true
  formData = {
    idempotencyKey: '',
    amount: '0.00',
    destination: {
      type: 'account',
      address: '',
      chain: '',
      id: '',
    },
  }

  destinationTypes = ['account', 'address']
  required = [(v: string) => !!v || 'Field is required']
  error = {}
  loading = false
  showError = false

  @Watch('formData.destination.type', { immediate: true })
  onChildChanged(val: string) {
    if (val === 'account') {
      this.isFiatAccount = true
    }
    if (val === 'address') {
      this.isFiatAccount = false
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
      currency: 'USD',
    }
    let destination: BlockchainDestination | WithdrawalDestination
    if (this.isFiatAccount) {
      destination = {
        type: 'account',
        address: this.formData.destination.address,
        chain: this.formData.destination.chain,
      }
    } else {
      destination = {
        type: 'address',
        addressId: this.formData.destination.id,
      }
    }

    const payload: CreateTransferPayload = {
      idempotencyKey: uuidv4(),
      amount: amountDetail,
      destination,
    }

    try {
      await this.$businessAccountTransfersApi.createTransfer(payload)
    } catch (error) {
      this.error = error
      this.showError = true
    } finally {
      this.loading = false
    }
  }
}
</script>
