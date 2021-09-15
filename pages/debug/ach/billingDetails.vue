<template>
  <v-layout>
    <v-row>
      <v-col cols="12" md="4">
        <v-form>
          <v-text-field v-model="formData.accountId" label="ACH Account Id" />

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
import { UpdateACHAccountPayload } from '@/lib/achApi'
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
export default class CreateACHAccountClass extends Vue {
  // data
  formData = {
    accountId: '',
    billingDetails: {
      city: '',
      country: '',
      line1: '',
      line2: '',
      district: '',
      postalCode: '',
    },
  }

  error = {}
  loading = false
  showError = false

  onErrorSheetClosed() {
    this.error = {}
    this.showError = false
  }

  async makeApiCall() {
    this.loading = true
    const { accountId, billingDetails } = this.formData
    const payload: UpdateACHAccountPayload = {
      billingDetails: {
        line1: billingDetails.line1,
        line2: billingDetails.line2,
        city: billingDetails.city,
        district: billingDetails.district,
        country: billingDetails.country,
        postalCode: billingDetails.postalCode,
      },
    }
    try {
      await this.$achApi.updateACHAccount(payload, accountId)
    } catch (error) {
      this.error = error
      this.showError = true
    } finally {
      this.loading = false
    }
  }
}
</script>
