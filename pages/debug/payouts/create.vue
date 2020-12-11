<template>
  <v-layout>
    <v-row>
      <v-col cols="12" md="4">
        <v-form>
          <v-text-field v-model="formData.amount" label="Amount" />

          <v-text-field
            v-model="formData.sourceWalletId"
            label="Optional source Wallet Id"
          />

          <v-text-field
            v-model="formData.destination"
            label="Fiat Account Id"
          />

          <v-select
            v-model="formData.destinationType"
            :items="destinationType"
            label="Fiat Account Type"
          />

          <v-text-field
            v-model="formData.beneficiaryEmail"
            label="Beneficiary Email"
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
import { Component, Vue } from 'nuxt-property-decorator'
import { mapGetters } from 'vuex'
import { v4 as uuidv4 } from 'uuid'
import RequestInfo from '@/components/RequestInfo.vue'
import ErrorSheet from '@/components/ErrorSheet.vue'
import { CreatePayoutPayload } from '@/lib/payoutsApi'
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
export default class CreatePayoutClass extends Vue {
  formData = {
    sourceWalletId: '',
    idempotencyKey: '',
    amount: '0.00',
    destination: '',
    destinationType: 'wire', // Default to wire
    beneficiaryEmail: '',
  }

  required = [(v: string) => !!v || 'Field is required']
  destinationType = ['wire', 'ach']
  error = {}
  loading = false
  showError = false
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
    const payload: CreatePayoutPayload = {
      idempotencyKey: uuidv4(),
      amount: amountDetail,
      destination: {
        id: this.formData.destination,
        type: this.formData.destinationType,
      },
      metadata: {
        beneficiaryEmail: this.formData.beneficiaryEmail,
      },
    }
    if (this.formData.sourceWalletId) {
      payload.source = {
        id: this.formData.sourceWalletId,
        type: 'wallet',
      }
    }
    try {
      await this.$payoutsApi.createPayout(payload)
    } catch (error) {
      this.error = error
      this.showError = true
    } finally {
      this.loading = false
    }
  }
}
</script>
