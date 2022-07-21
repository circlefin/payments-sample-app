<template>
  <v-layout>
    <v-row>
      <v-col cols="12" md="4">
        <v-form>
          <v-text-field
            v-model="formData.accountNumber"
            label="Account Number"
          />
          <v-select
            v-model="formData.currency"
            :items="currencyTypes"
            label="Currency"
          />
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
import { v4 as uuidv4 } from 'uuid'
import { CreateSenAccountPayload } from '@/lib/businessAccount/senAccountsApi'
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
export default class CreateSenBusinessAccountClass extends Vue {
  // data
  formData = {
    accountNumber: '',
    currency: '',
  }

  currencyTypes = ['USD', 'EUR']
  required = [(v: string) => !!v || 'Field is required']
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

    const payload: CreateSenAccountPayload = {
      idempotencyKey: uuidv4(),
      accountNumber: this.formData.accountNumber,
      currency: this.formData.currency,
    }

    try {
      await this.$senAccountsApi.createSenBusinessAccount(payload)
    } catch (error) {
      this.error = error
      this.showError = true
    } finally {
      this.loading = false
    }
  }
}
</script>
