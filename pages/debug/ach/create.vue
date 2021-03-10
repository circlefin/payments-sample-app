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
            v-model="formData.plaidProcessorToken"
            label="Plaid Processor Token"
          >
            <router-link
              v-if="isSandbox"
              slot="append"
              :to="'/debug/ach/mocks/create'"
              class="subtitle-2 text-right"
            >
              Create plaid token
            </router-link>
          </v-text-field>
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

          <v-text-field v-model="formData.metadata.email" label="Email" />

          <v-text-field
            v-model="formData.metadata.phoneNumber"
            label="Phone"
            hint="Phone number of the user in E.164 format"
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
import { exampleACHBillingDetails } from '@/lib/achTestData'
import { CreateACHAccountPayload } from '@/lib/achApi'
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
    plaidProcessorToken: '',
    billingDetails: {
      name: '',
      city: '',
      country: '',
      line1: '',
      line2: '',
      district: '',
      postalCode: '',
    },
    metadata: {
      email: '',
      phoneNumber: '',
    },
  }

  prefillItems = exampleACHBillingDetails
  error = {}
  loading = false
  showError = false
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
    const { plaidProcessorToken, billingDetails, metadata } = this.formData
    const payload: CreateACHAccountPayload = {
      idempotencyKey: uuidv4(),
      plaidProcessorToken,
      billingDetails: {
        name: billingDetails.name,
        line1: billingDetails.line1,
        line2: billingDetails.line2,
        city: billingDetails.city,
        district: billingDetails.district,
        country: billingDetails.country,
        postalCode: billingDetails.postalCode,
      },
      metadata: {
        email: metadata.email,
        phoneNumber: metadata.phoneNumber,
        sessionId: 'xxx',
        ipAddress: '172.33.222.1',
      },
    }
    try {
      await this.$achApi.createACHAccount(payload)
    } catch (error) {
      this.error = error
      this.showError = true
    } finally {
      this.loading = false
    }
  }
}
</script>
