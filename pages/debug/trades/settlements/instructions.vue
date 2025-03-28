<template>
  <v-layout>
    <v-row>
      <v-col cols="12" md="4">
        <v-form>
          <v-select
            v-model="selectedCurrency"
            :items="currencies"
            label="Currency"
          />
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
export default class FetchSettlementInstructionsClass extends Vue {
  error = {}
  loading = false
  showError = false
  currencies = ['MXN', 'BRL']
  selectedCurrency = 'MXN'

  // methods
  onErrorSheetClosed() {
    this.error = {}
    this.showError = false
  }

  get isMarketplace() {
    return this.$store.getters.isMarketplace
  }

  async makeApiCall() {
    this.loading = true
    try {
      await this.$tradesApi.getSettlementInstructions(this.selectedCurrency)
    } catch (error) {
      this.error = error
      this.showError = true
    } finally {
      this.loading = false
    }
  }
}
</script>
