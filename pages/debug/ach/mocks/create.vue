<template>
  <v-layout>
    <v-row>
      <v-col cols="12" md="4">
        <v-menu>
          <template v-slot:activator="{ on }">
            <div class="d-flex flex-row-reverse">
              <v-btn
                v-if="isSandbox"
                small
                color="blue-grey lighten-1"
                dark
                v-on="on"
              >
                Prefill form
              </v-btn>
            </div>
          </template>
          <v-list>
            <v-list-item
              v-for="(item, index) in prefillItems"
              :key="index"
              @click="prefillForm(index)"
            >
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
        <v-form>
          <v-text-field
            v-model="formData.account.accountNumber"
            :rules="[rules.required]"
            label="ACH Account Number"
            required
          />

          <v-text-field
            v-model="formData.account.routingNumber"
            :rules="[rules.required]"
            label="ACH Account Routing Number"
            required
          />

          <v-text-field
            v-model="formData.account.description"
            :rules="[rules.required]"
            label="ACH Account Description"
            required
          />

          <v-text-field
            v-model="formData.balance.amount"
            :rules="[rules.required]"
            label="ACH Account Balance"
            required
          />

          <v-btn
            v-if="isSandbox"
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
import { exampleACHAccounts } from '@/lib/achTestData'
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

  rules = {
    required: (v: string) => !!v || 'Field is required',
  }

  error = {}
  loading = false
  showError = false
  prefillItems = exampleACHAccounts

  isSandbox: Boolean = !getLive()

  onErrorSheetClosed() {
    this.error = {}
    this.showError = false
  }

  prefillForm(index: number) {
    this.formData = this.prefillItems[index].formData
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
