<template>
  <v-layout>
    <v-row>
      <v-col cols="12" md="4">
        <v-form v-model="validForm">
          <v-text-field
            v-model="formData.tradeId"
            :rules="[required]"
            label="Trade ID"
          />
          <v-select
            v-model="formData.type"
            :items="['maker', 'taker']"
            :rules="[required]"
            label="Trader Type"
          />
          <v-text-field
            v-model="formData.address"
            :rules="[required]"
            label="Address"
          />
          <v-text-field
            v-model="formData.details.recipient"
            :rules="[required]"
            label="Recipient Address"
          />
          <v-text-field
            v-model="formData.details.deadline"
            :rules="[required, isNumber]"
            label="Deadline (seconds since epoch)"
            type="number"
          />
          <v-text-field
            v-model="formData.details.nonce"
            :rules="[required, isNumber]"
            label="Nonce"
            type="number"
          />
          <v-divider class="my-4" />
          <h4>Consideration Details</h4>
          <v-text-field
            v-model="formData.details.consideration.quoteId"
            :rules="[required]"
            label="Quote ID"
          />
          <v-text-field
            v-model="formData.details.consideration.base"
            :rules="[required]"
            label="Base Token Address (ERC-20)"
          />
          <v-text-field
            v-model="formData.details.consideration.quote"
            :rules="[required]"
            label="Quote Token Address (ERC-20)"
          />
          <v-text-field
            v-model="formData.details.consideration.quoteAmount"
            :rules="[required, isNumber]"
            label="Quote Amount"
            type="number"
          />
          <v-text-field
            v-model="formData.details.consideration.baseAmount"
            :rules="[required, isNumber]"
            label="Base Amount"
            type="number"
          />
          <v-text-field
            v-model="formData.details.consideration.maturity"
            :rules="[required, isNumber]"
            label="Settlement Maturity (seconds since epoch)"
            type="number"
          />
          <v-text-field
            v-model="formData.signature"
            :rules="[required]"
            label="Signature"
          />
          <v-btn
            depressed
            class="mb-7"
            color="primary"
            :loading="loading"
            :disabled="!validForm || loading"
            @click.prevent="makeApiCall"
          >
            Register Signature
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
import { CreatePiFXSignaturePayload } from '~/lib/cpsTradesApi'

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
export default class RegisterCpsSignatureClass extends Vue {
  validForm: boolean = false
  formData = {
    tradeId: '',
    type: '',
    address: '',
    details: {
      recipient: '',
      deadline: '',
      nonce: '',
      consideration: {
        quoteId: '',
        base: '',
        quote: '',
        quoteAmount: '',
        baseAmount: '',
        maturity: '',
      },
    },
    signature: '',
  }

  required = (v: string) => !!v || 'Field is required'

  isNumber = (v: string) =>
    !v || v === '' || !isNaN(parseInt(v)) || 'Please enter valid number'

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
      const payload: CreatePiFXSignaturePayload = {
        tradeId: this.formData.tradeId,
        type: this.formData.type,
        address: this.formData.address,
        details: {
          recipient: this.formData.details.recipient,
          deadline: parseInt(this.formData.details.deadline),
          nonce: parseInt(this.formData.details.nonce),
          consideration: {
            quoteId: this.formData.details.consideration.quoteId,
            base: this.formData.details.consideration.base,
            quote: this.formData.details.consideration.quote,
            quoteAmount: parseInt(
              this.formData.details.consideration.quoteAmount
            ),
            baseAmount: parseInt(
              this.formData.details.consideration.baseAmount
            ),
            maturity: parseInt(this.formData.details.consideration.maturity),
          },
        },
        signature: this.formData.signature,
      }

      await this.$cpsTradesApi.registerSignature(payload)
    } catch (error) {
      this.error = error
      this.showError = true
    } finally {
      this.loading = false
    }
  }
}
</script>
