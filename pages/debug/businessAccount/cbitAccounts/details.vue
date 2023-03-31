<template>
  <v-layout>
    <v-row>
      <v-col cols="12" md="4">
        <v-form ref="form" lazy-validation>
          <v-text-field
            v-model="formData.accountId"
            label="Account Id"
            :rules="requiredRules"
            required
          />
          <v-btn
            depressed
            class="mb-7"
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
export default class FetchCbitBusinessAccountDetailsClass extends Vue {
  // data
  formData = {
    accountId: '',
  }

  requiredRules = [(v: string) => !!v || 'Field is required']
  error = {} as any
  loading = false
  showError = false
  // methods
  onErrorSheetClosed() {
    this.error = {}
    this.showError = false
  }

  async makeApiCall() {
    const form = this.$refs.form as any
    if (form.validate()) {
      this.loading = true
      try {
        await this.$cbitAccountsApi.getCbitBusinessAccountById(
          this.formData.accountId
        )
      } catch (error) {
        this.error = error
        this.showError = true
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
