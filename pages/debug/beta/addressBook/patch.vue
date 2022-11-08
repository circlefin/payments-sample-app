<template>
  <v-layout>
    <v-row>
      <v-col cols="12" md="4">
        <v-form>
          <v-text-field v-model="formData.recipientId" label="Recipient Id" />
          <v-text-field v-model="formData.email" label="Email" />
          <v-text-field v-model="formData.bns" label="bns" />
          <v-text-field v-model="formData.nickname" label="Nickname" />
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
import RequestInfo from '~/components/RequestInfo.vue'
import ErrorSheet from '~/components/ErrorSheet.vue'
import { PatchRecipientPayload } from '~/lib/beta/addressBookApi'
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
      isMarketplace: 'isMarketplace',
    }),
  },
})
export default class PatchRecipientClass extends Vue {
  formData = {
    email: '',
    bns: '',
    nickname: '',
    recipientId: '',
  }

  required = [(v: string) => !!v || 'Field is required']

  error = {}
  loading = false
  showError = false

  onErrorSheetClosed() {
    this.error = {}
    this.showError = false
  }

  async makeApiCall() {
    this.loading = true
    const payload: PatchRecipientPayload = {
      metadata: {
        email: this.formData.email,
        bns: this.formData.bns,
        nickname: this.formData.nickname,
      },
    }
    try {
      await this.$addressBookApiBeta.patchRecipient(
        this.formData.recipientId,
        payload
      )
    } catch (error) {
      this.error = error
      this.showError = true
    } finally {
      this.loading = false
    }
  }
}
</script>

<style scoped></style>
