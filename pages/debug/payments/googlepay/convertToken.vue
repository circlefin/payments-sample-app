<template>
  <v-layout>
    <v-row>
      <v-col cols="12" md="4">
        <v-form>
          <v-btn
            depressed
            class="mb-7"
            color="primary"
            :loading="loading"
            @click.prevent="autogenerateToken()"
          >
            Autogenerate token
          </v-btn>

          <v-select
            v-model="formData.type"
            :items="paymentType"
            label="Payment Type"
          />
          <v-text-field v-model="formData.signature" label="Signature" />
          <v-text-field
            v-model="formData.signedMessage"
            label="Signed Message"
          />

          <v-btn
            depressed
            class="mb-7"
            color="primary"
            :loading="loading"
            @click.prevent="makeApiCall()"
          >
            Convert Token
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
    }),
  },
})
export default class ConvertToken extends Vue {
  formData = {
    type: 'Google Pay',
    signature: '',
    signedMessage: '',
  }

  paymentType = ['Google Pay', 'Apple Pay']
  required = [(v: string) => !!v || 'Field is required']
  error = {}
  loading = false
  showError = false

  onErrorSheetClosed() {
    this.error = {}
    this.showError = false
  }

  // autogenerate token info by assigning random strings to each field
  autogenerateToken() {
    this.formData.signature = Math.random().toString(36).substring(2, 12)
    this.formData.signedMessage = Math.random().toString(36).substring(2, 12)
  }

  makeApiCall() {
    const type = this.formData.type === 'Google Pay' ? 'googlepay' : 'applepay'
    let payload = null

    switch (type) {
      case 'googlepay':
        payload = {
          type,
          token_data: {
            protocolVersion: 'ECv1',
            signature: this.formData.signature,
            signedMessage: this.formData.signedMessage,
          },
        }
        break
      case 'applepay':
        payload = {
          type,
          token_data: 'TODO: implement apply pay payload',
        }
    }

    console.log(payload)
    // TODO: implement API call to token converter endpoint once endpoint is finished for google pay
  }
}
</script>
