<template>
  <v-layout>
    <v-row>
      <v-col cols="12" md="4">
        <v-menu>
          <template #activator="{ on }">
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
            v-model="formData.iban"
            label="IBAN"
            hint="International Bank Account Number (IBAN) that identifies the account."
          />

          <v-text-field
            v-model="formData.billingDetails.name"
            label="Billing Name"
          />

          <v-text-field
            v-model="formData.billingDetails.line1"
            label="Billing Address Line 1"
          />

          <v-text-field
            v-model="formData.billingDetails.line2"
            label="Billing Address Line 2"
          />

          <v-text-field
            v-model="formData.billingDetails.postalCode"
            label="Billing Postalcode"
          />

          <v-text-field
            v-model="formData.billingDetails.city"
            label="Billing City"
          />

          <v-text-field
            v-model="formData.billingDetails.district"
            label="Billing District"
            hint="State / County / Province / Region portion of the address. US and Canada use the two-letter code for the subdivision"
          />

          <v-text-field
            v-model="formData.billingDetails.country"
            label="Billing Country Code"
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
import { v4 as uuidv4 } from 'uuid'
import { getLive } from '@/lib/apiTarget'
import { exampleSepaAccounts } from '@/lib/sepaTestData'
import { CreateSepaAccountPayload } from '@/lib/sepaApi'
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
export default class CreateSepaClass extends Vue {
  formData = {
    iban: '',
    billingDetails: {
      name: '',
      city: '',
      country: '',
      line1: '',
      line2: '',
      district: '',
      postalCode: '',
    },
  }

  rules = {
    isNumber: (v: string) =>
      v === '' || !isNaN(parseInt(v)) || 'Please enter valid number',
    required: (v: string) => !!v || 'Field is required',
  }

  prefillItems = exampleSepaAccounts
  error = {}
  loading = false
  showError = false
  expiryLabels = {
    month: 'Expiry Month',
    year: 'Expiry Year',
  }

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
    const { iban, ...data } = this.formData
    const { billingDetails } = data

    const payload: CreateSepaAccountPayload = {
      idempotencyKey: uuidv4(),
      iban,
      billingDetails: {
        name: billingDetails.name,
        line1: billingDetails.line1,
        line2: billingDetails.line2,
        city: billingDetails.city,
        district: billingDetails.district,
        country: billingDetails.country,
        postalCode: billingDetails.postalCode,
      },
    }
    try {
      await this.$sepaApi.createSepaAccount(payload)
    } catch (error) {
      this.error = error
      this.showError = true
    } finally {
      this.loading = false
    }
  }
}
</script>
