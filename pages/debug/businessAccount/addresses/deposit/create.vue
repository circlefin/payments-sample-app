<template>
  <v-layout>
    <v-row>
      <v-col cols="12" md="4">
        <v-form>
          <v-select
            v-model="formData.currency"
            :items="currencyTypes"
            label="Currency"
          />

          <ChainSelect v-model="formData.chain" label="Chain" />

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
import { CreateDepositAddressPayload } from '@/lib/businessAccount/addressesApi'
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
export default class CreateDepositAddressClass extends Vue {
  formData = {
    currency: '',
    chain: '',
  }

  currencyTypes = ['USD']
  error = {}
  loading = false
  showError = false
  onErrorSheetClosed() {
    this.error = {}
    this.showError = false
  }

  async makeApiCall() {
    this.loading = true
    const { currency, chain } = this.formData
    const payload: CreateDepositAddressPayload = {
      idempotencyKey: uuidv4(),
      currency,
      chain,
    }
    try {
      await this.$businessAccountAddressesApi.createDepositAddress(payload)
    } catch (error) {
      this.error = error
      this.showError = true
    } finally {
      this.loading = false
    }
  }
}
</script>
