<template>
  <v-layout>
    <v-row>
      <v-col cols="12" md="4">
        <v-form>
          <header>Optional filter params:</header>
          <v-text-field v-model="formData.walletId" label="Wallet ID" />
          <v-text-field
            v-model="formData.sourceWalletId"
            label="Source Wallet ID"
          />
          <v-text-field
            v-model="formData.destinationWalletId"
            label="Destination Wallet ID"
          />
          <v-text-field v-model="formData.from" label="From" />
          <v-text-field v-model="formData.to" label="To" />
          <v-text-field v-model="formData.pageSize" label="PageSize" />
          <v-text-field v-model="formData.pageBefore" label="PageBefore" />
          <v-text-field v-model="formData.pageAfter" label="PageAfter" />
          <v-btn
            depressed
            class="mb-7"
            color="primary"
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
export default class FetchTransfersClass extends Vue {
  // data
  formData = {
    walletId: '',
    sourceWalletId: '',
    destinationWalletId: '',
    from: '',
    to: '',
    pageSize: '',
    pageBefore: '',
    pageAfter: '',
  }

  rules = {
    isNumber: (v: string) =>
      v === '' || !isNaN(parseInt(v)) || 'Please enter valid number',
    required: (v: string) => !!v || 'Field is required',
  }

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
    try {
      await this.$transfersApi.getTransfers(
        this.formData.walletId,
        this.formData.sourceWalletId,
        this.formData.destinationWalletId,
        this.formData.from,
        this.formData.to,
        this.formData.pageBefore,
        this.formData.pageAfter,
        this.formData.pageSize
      )
    } catch (error) {
      this.error = error
      this.showError = true
    } finally {
      this.loading = false
    }
  }
}
</script>
