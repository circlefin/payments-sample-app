<template>
  <v-layout>
    <v-row>
      <v-col cols="12" md="4">
        <v-form>
          <v-text-field
            v-model="formData.account.accountNumber"
            label="ACH Account Number"
          />

          <v-text-field
            v-model="formData.account.routingNumber"
            label="ACH Account Routing Number"
          />

          <v-text-field
            v-model="formData.account.description"
            label="ACH Account Description"
          />

          <v-text-field
            v-model="formData.balance.amount"
            label="ACH Account Balance"
          />

          <v-btn
            depressed
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
import { getLive } from '@/lib/apiTarget'
import { CreateMockACHBankAccount } from '@/lib/mocksApi'
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
export default class CreateCardClass extends Vue {
  formData = {
    account: {
      accountNumber: '',
      routingNumber: '',
      description: '',
    },
    balance: {
      amount: '0.00',
      currency: 'USD',
    },
  }

  error = {}
  loading = false
  showError = false

  isSandbox: Boolean = !getLive()
  onErrorSheetClosed() {
    this.error = {}
    this.showError = false
  }

  async makeApiCall() {
    this.loading = true

    const payload: CreateMockACHBankAccount = {
      account: {
        accountNumber: this.formData.account.accountNumber,
        routingNumber: this.formData.account.routingNumber,
        description: this.formData.account.description,
      },
      balance: {
        amount: this.formData.balance.amount,
        currency: this.formData.balance.currency,
      },
    }
    try {
      await this.$mocksApi.createMockACHBankAccount(payload)
    } catch (error) {
      this.error = error
      this.showError = true
    } finally {
      this.loading = false
    }
  }
}
</script>
