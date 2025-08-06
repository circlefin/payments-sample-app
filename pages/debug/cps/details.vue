<template>
  <v-layout>
    <v-row>
      <v-col cols="12" md="4">
        <v-form v-model="validForm">
          <v-text-field
            v-model="formData.tradeId"
            :rules="[required]"
            label="CPS Trade ID"
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
export default class GetCpsTradeDetailsClass extends Vue {
  validForm: boolean = false
  formData = {
    tradeId: '',
  }

  required = (v: string) => !!v || 'Field is required'
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
      await this.$cpsTradesApi.getTrade(this.formData.tradeId)
    } catch (error) {
      this.error = error
      this.showError = true
    } finally {
      this.loading = false
    }
  }
}
</script>