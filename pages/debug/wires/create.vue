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
            v-model="formData.accountNumber"
            label="Account Number"
          />

          <v-text-field
            v-model="formData.routingNumber"
            label="Routing Number"
            hint="RTN/BIC/Swift code of the bank associated with the account. Required for US accounts"
          />

          <v-text-field
            v-model="formData.iban"
            label="IBAN"
            hint="International Bank Account Number (IBAN) that identifies the account. Required for accounts outside of the US"
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

          <v-text-field
            v-model="formData.bankAddress.bankName"
            label="Bank Name"
          />

          <v-text-field
            v-model="formData.bankAddress.line1"
            label="Bank Address Line 1"
          />

          <v-text-field
            v-model="formData.bankAddress.line2"
            label="Bank Address Line 2"
          />

          <v-text-field
            v-model="formData.bankAddress.postalCode"
            label="Bank Postalcode"
          />

          <v-text-field
            v-model="formData.bankAddress.city"
            label="Bank Address City"
          />

          <v-text-field
            v-model="formData.bankAddress.district"
            label="Bank Address District"
            hint="State / County / Province / Region portion of the address. US and Canada use the two-letter code for the subdivision"
          />

          <v-text-field
            v-model="formData.bankAddress.country"
            label="Bank Address Country Code"
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
import { exampleWireAccounts } from '@/lib/wiresTestData'
import { CreateWireAccountPayload } from '@/lib/wiresApi'
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
  // data
  formData = {
    accountNumber: '',
    routingNumber: '',
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
    bankAddress: {
      bankName: '',
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

  prefillItems = exampleWireAccounts
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
    const { accountNumber, routingNumber, iban, ...data } = this.formData
    const { billingDetails, bankAddress } = data

    const payload: CreateWireAccountPayload = {
      idempotencyKey: uuidv4(),
      accountNumber,
      routingNumber,
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
      bankAddress: {
        bankName: bankAddress.bankName,
        line1: bankAddress.line1,
        line2: bankAddress.line2,
        city: bankAddress.city,
        district: bankAddress.district,
        country: bankAddress.country,
        postalCode: bankAddress.postalCode,
      },
    }
    try {
      await this.$wiresApi.createWireAccount(payload)
    } catch (error) {
      this.error = error
      this.showError = true
    } finally {
      this.loading = false
    }
  }
}
</script>
