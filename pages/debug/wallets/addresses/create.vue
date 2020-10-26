<template>
  <v-layout>
    <v-row>
      <v-col cols="12" md="4">
        <v-form>
          <v-text-field v-model="formData.walletId" label="Wallet Id" />
          <v-text-field
            v-model="formData.idempotencyKey"
            label="Idempotency Key"
          />
          <v-select
            v-model="formData.currency"
            :items="currencyTypes"
            label="Currency"
            hint="Currently, only USD is supported."
          />
          <ChainSelect v-model="formData.chain" label="Chain" />
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
import ChainSelect from '@/components/ChainSelect.vue'

@Component({
  components: {
    RequestInfo,
    ErrorSheet,
    ChainSelect,
  },
  computed: {
    ...mapGetters({
      payload: 'getRequestPayload',
      response: 'getRequestResponse',
      requestUrl: 'getRequestUrl',
    }),
  },
})
export default class CreateAddressClass extends Vue {
  error = {}
  loading = false
  showError = false
  formData = {
    walletId: '',
    idempotencyKey: '',
    currency: '',
    chain: '',
  }

  currencyTypes = ['USD']

  // methods
  onErrorSheetClosed() {
    this.error = {}
    this.showError = false
  }

  async makeApiCall() {
    this.loading = true
    try {
      await this.$addressesApi.createAddress(
        this.formData.walletId,
        this.formData.idempotencyKey,
        this.formData.currency,
        this.formData.chain
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
