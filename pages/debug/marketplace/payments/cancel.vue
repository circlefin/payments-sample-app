<template>
  <v-layout>
    <v-row>
      <v-col cols="12" md="4">
        <v-form>
          <v-text-field v-model="formData.paymentId" label="Payment Id" />
          <v-text-field
            v-model="formData.idempotencyKey"
            label="Idempotency Key"
          />
          <v-select
            v-model="formData.reason"
            :items="reasonsList"
            label="Reason"
          />
          <v-btn
            depressed
            class="mb-7"
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
import RequestInfo from '@/components/RequestInfo.vue'
import ErrorSheet from '@/components/ErrorSheet.vue'

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
export default class CancelPaymentClass extends Vue {
  // data
  formData = {
    paymentId: '',
    idempotencyKey: '',
    reason: '',
  }

  reasonsList = ['', 'duplicate', 'fraudulent', 'requested_by_customer']
  required = [(v: string) => !!v || 'Field is required']
  error = {}
  loading = false
  showError = false

  // methods
  onErrorSheetClosed() {
    this.error = {}
    this.showError = false
  }

  async makeApiCall() {
    this.loading = true

    const payload = {
      idempotencyKey: this.formData.idempotencyKey,
      reason: this.formData.reason,
    }

    try {
      await this.$marketplaceApi.cancelPayment(this.formData.paymentId, payload)
    } catch (error) {
      this.error = error
      this.showError = true
    } finally {
      this.loading = false
    }
  }
}
</script>
