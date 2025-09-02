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
      @on-change="onErrorSheetClosed"
    />
  </v-layout>
</template>

<script setup lang="ts">
const store = useMainStore()
const { $xpayAccountsApi } = useNuxtApp()

const formData = reactive({
  accountId: '',
})

const form = ref()
const requiredRules = [(v: string) => !!v || 'Field is required']
const error = ref<any>({})
const loading = ref(false)
const showError = ref(false)

const payload = computed(() => store.getRequestPayload)
const response = computed(() => store.getRequestResponse)
const requestUrl = computed(() => store.getRequestUrl)

const onErrorSheetClosed = () => {
  error.value = {}
  showError.value = false
}

const makeApiCall = async () => {
  if (form.value.validate()) {
    loading.value = true
    try {
      await $xpayAccountsApi.getXpayBusinessAccountById(formData.accountId)
    } catch (err: any) {
      error.value = err
      showError.value = true
    } finally {
      loading.value = false
    }
  }
}
</script>
