<template>
  <v-layout>
    <v-row>
      <v-col cols="12" md="4">
        <v-form>
          <header>Optional filter params:</header>
          <v-text-field
            v-model="formData.sourceWalletId"
            label="Source Wallet ID"
          />
          <v-text-field v-model="formData.destination" label="Destination" />
          <v-select
            v-model="formData.destinationType"
            :items="destinationType"
            label="Destination Type"
          />
          <v-select
            v-model="formData.status"
            :items="payoutStatuses"
            label="Status"
          />
          <div v-if="isCryptoPayout()">
            <v-text-field
              v-model="formData.sourceCurrency"
              label="Source Currency"
            />
            <v-text-field
              v-model="formData.destinationCurrency"
              label="Destination Currency"
            />
            <v-text-field v-model="formData.chain" label="Chain" />
          </div>
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
import RequestInfo from '~/components/RequestInfo.vue'
import ErrorSheet from '~/components/ErrorSheet.vue'
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
export default class FetchPayoutsClass extends Vue {
  // data
  formData = {
    sourceWalletId: '',
    destination: '',
    destinationType: '',
    sourceCurrency: '',
    destinationCurrency: '',
    chain: '',
    status: '',
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

  destinationType = ['', 'wire', 'ach', 'sepa', 'address_book']
  fiatDestinationTypes = new Set(['wire', 'ach', 'sepa'])
  blockchainDestinationTypes = new Set(['address_book'])
  payoutStatuses = ['', 'pending', 'complete', 'failed']
  error = {}
  loading = false
  showError = false
  // methods
  isCryptoPayout() {
    return this.blockchainDestinationTypes.has(this.formData.destinationType)
  }

  onErrorSheetClosed() {
    this.error = {}
    this.showError = false
  }

  async makeApiCall() {
    this.loading = true
    const isCryptoPayout = this.isCryptoPayout()
    try {
      await this.$payoutsApi.getPayouts(
        this.formData.sourceWalletId,
        this.formData.destination,
        this.formData.destinationType,
        this.formData.status,
        isCryptoPayout ? this.formData.sourceCurrency : '',
        isCryptoPayout ? this.formData.destinationCurrency : '',
        isCryptoPayout ? this.formData.chain : '',
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
