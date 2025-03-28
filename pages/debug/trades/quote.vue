<template>
  <v-layout>
    <v-row>
      <v-col cols="12" md="4">
        <v-form v-model="validForm">
          <v-select
            v-model="formData.type"
            :items="['tradable', 'reference']"
            label="Type"
          />
          <v-text-field
            v-model="formData.from.amount"
            :rules="[required, isNumber]"
            label="From amount"
          />
          <v-select
            v-model="formData.from.currency"
            :items="currencies"
            label="From currency"
          />
          <v-select
            v-model="formData.to.currency"
            :items="toCurrencyMap.get(formData.from.currency)"
            label="To currency"
          />
          <v-btn
            depressed
            class="mb-7"
            color="primary"
            :loading="loading"
            :disabled="!validForm || loading"
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
      isMarketplace: 'isMarketplace',
    }),
  },
})
export default class CreateQuoteClass extends Vue {
  validForm: boolean = false
  formData = {
    type: 'tradable',
    from: {
      amount: null,
      currency: 'USDC',
    },
    to: {
      currency: '',
    },
  }

  required = (v: string) => !!v || 'Field is required'
  isNumber = (v: string) =>
    v === '' || !isNaN(parseInt(v)) || 'Please enter valid number'

  error = {}
  loading = false
  showError = false
  currencies = ['USDC', 'EURC', 'MXN', 'BRL']
  toCurrencyMap = new Map([
    ['USDC', ['EURC', 'MXN', 'BRL']],
    ['EURC', ['USDC']],
    ['MXN', ['USDC']],
    ['BRL', ['USDC']],
  ])

  onErrorSheetClosed() {
    this.error = {}
    this.showError = false
  }

  async makeApiCall() {
    this.loading = true

    try {
      await this.$tradesApi.createQuote(this.formData)
    } catch (error) {
      this.error = error
      this.showError = true
    } finally {
      this.loading = false
    }
  }
}
</script>
