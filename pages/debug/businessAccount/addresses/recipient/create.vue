<template>
  <v-layout>
    <v-row>
      <v-col cols="12" md="4">
        <v-form>
          <ChainSelect v-model="formData.chain" label="Chain" />

          <v-text-field v-model="formData.address" label="Recipient address" />

          <v-text-field v-model="formData.currency" label="Currency" />

          <v-text-field
            v-if="hasAddressTagSupport(formData.chain)"
            v-model="formData.addressTag"
            label="Address Tag"
            hint="The secondary identifier for a blockchain address which can be text, id, or hash format."
          />
          <v-text-field v-model="formData.description" label="Description" />

          <v-btn
            depressed
            class="mb-7"
            color="primary"
            :loading="loading"
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
import { v4 as uuidv4 } from 'uuid'
import RequestInfo from '@/components/RequestInfo.vue'
import ErrorSheet from '@/components/ErrorSheet.vue'
import { CreateRecipientAddressPayload } from '@/lib/businessAccount/addressesApi'
import ChainSelect from '@/components/ChainSelect.vue'
import chains from '@/lib/chains.json'

@Component({
  components: {
    RequestInfo,
    ErrorSheet,
    ChainSelect,
  },
  computed: {
    ...mapGetters({
      payload: 'getRequestPayload',
      response: 'getRequestResponse',
      requestUrl: 'getRequestUrl',
    }),
  },
})
export default class CreateRecipientAddressClass extends Vue {
  formData = {
    address: '',
    chain: '',
    currency: '',
    description: '',
    addressTag: '',
  }

  error = {}
  loading = false
  showError = false
  chains = chains

  onErrorSheetClosed() {
    this.error = {}
    this.showError = false
  }

  hasAddressTagSupport(chain: string) {
    return this.chains.find((_chain) => {
      return _chain.value === chain && _chain.addressTagSupport
    })
  }

  async makeApiCall() {
    this.loading = true
    const { address, chain, currency, description, addressTag } = this.formData
    const payload: CreateRecipientAddressPayload = {
      idempotencyKey: uuidv4(),
      address,
      chain,
      currency,
      description,
    }

    if (this.hasAddressTagSupport(chain)) {
      payload.addressTag = addressTag
    }
    try {
      await this.$businessAccountAddressesApi.createRecipientAddress(payload)
    } catch (error) {
      this.error = error
      this.showError = true
    } finally {
      this.loading = false
    }
  }
}
</script>
