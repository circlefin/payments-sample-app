<template>
  <v-layout>
    <v-row>
      <v-col cols="12" md="4">
        <v-form>
          <v-text-field v-model="formData.trackingRef" label="Tracking Ref" />
          <v-text-field v-model="formData.amount" label="Amount" />
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
import { CreateMockWirePaymentPayload } from '@/lib/mocksApi'
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
export default class CreateMockIncomingWireClass extends Vue {
  formData = {
    trackingRef: '',
    amount: '0.00',
  }

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
      currency: 'USD',
    }
    const payload: CreateMockWirePaymentPayload = {
      trackingRef: this.formData.trackingRef,
      amount: amountDetail,
    }

    try {
      await this.$mocksApi.createMockWirePayment(payload)
    } catch (error) {
      this.error = error
      this.showError = true
    } finally {
      this.loading = false
    }
  }
}
</script>
