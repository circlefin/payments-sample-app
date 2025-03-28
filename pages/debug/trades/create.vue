<template>
  <v-layout>
    <v-row>
      <v-col cols="12" md="4">
        <v-form v-model="validForm">
          <v-text-field
            v-model="formData.quoteId"
            :rules="required"
            hint="ID of FX quote to trade on"
            label="Quote ID"
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
import { v4 as uuidv4 } from 'uuid'
import RequestInfo from '@/components/RequestInfo.vue'
import ErrorSheet from '@/components/ErrorSheet.vue'
import { CreateTradePayload } from '~/lib/tradesApi'

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
export default class CreateTradeClass extends Vue {
  validForm: boolean = false
  formData = {
    quoteId: '',
  }

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

    const payload: CreateTradePayload = {
      idempotencyKey: uuidv4(),
      quoteId: this.formData.quoteId,
    }

    try {
      await this.$tradesApi.createTrade(payload)
    } catch (error) {
      this.error = error
      this.showError = true
    } finally {
      this.loading = false
    }
  }
}
</script>
