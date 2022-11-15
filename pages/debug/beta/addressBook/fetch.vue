<template>
  <v-layout>
    <v-row>
      <v-col cols="12" md="4">
        <v-form>
          <header>Optional filter params:</header>
          <v-text-field v-model="formData.address" label="Address" />
          <v-select
            v-model="formData.chain"
            :items="supportedChains"
            label="Blockchain"
          />
          <v-text-field v-model="formData.email" label="Email" />
          <v-text-field v-model="formData.status" label="Status" />
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

<script>
import { Component, Vue } from 'nuxt-property-decorator'
import { mapGetters } from 'vuex'
import RequestInfo from '~/components/RequestInfo'
import ErrorSheet from '~/components/ErrorSheet'

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
export default class FetchRecipientClass extends Vue {
  formData = {
    address: '',
    chain: '',
    email: '',
    status: '',
    from: '',
    to: '',
    pageSize: '',
    pageBefore: '',
    pageAfter: '',
  }

  supportedChains = ['BTC', 'ETH', 'FLOW', 'MATIC']

  error = {}
  loading = false
  showError = false

  onErrorSheetClosed() {
    this.error = {}
    this.showError = false
  }

  async makeApiCall() {
    this.loading = true
    try {
      await this.$addressBookApiBeta.getRecipients(
        this.formData.address,
        this.formData.chain,
        this.formData.email,
        this.formData.status,
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

<style scoped></style>
