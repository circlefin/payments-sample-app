<template>
  <v-layout>
    <v-row>
      <v-col cols="12" md="4">
        <v-form>
          <v-text-field v-model="formData.trackingRef" label="Tracking Ref" />
          <v-text-field
            v-model="formData.accountNumber"
            label="Account Number"
          />
          <v-text-field v-model="formData.amount" label="Amount" />
          <v-select
            v-model="formData.currency"
            :items="currencyTypes"
            label="Currency"
          />
          <v-btn
            v-if="isSandbox"
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
import { getLive } from '../../../../lib/apiTarget'
import RequestInfo from '../../../../components/RequestInfo.vue'
import ErrorSheet from '../../../../components/ErrorSheet.vue'
import { CreateMockPushPaymentPayload } from '@/lib/mocksApi'
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
export default class CreateMockIncomingSenClass extends Vue {
  formData = {
    trackingRef: '',
    accountNumber: '',
    amount: '0.00',
    currency: '',
  }

  currencyTypes = ['USD', 'EUR']
  isSandbox: Boolean = !getLive()
  required = [(v: string) => !!v || 'Field is required']
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
      currency: this.formData.currency,
    }
    const payload: CreateMockPushPaymentPayload = {
      trackingRef: this.formData.trackingRef,
      beneficiaryBank: {
        accountNumber: this.formData.accountNumber,
      },
      amount: amountDetail,
    }

    try {
      await this.$mocksApi.createMockSenPayment(payload)
    } catch (error) {
      this.error = error
      this.showError = true
    } finally {
      this.loading = false
    }
  }
}
</script>
