<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="4">
        <v-form>
          <v-text-field v-model="formData.accountId" label="Account Id" />
          <v-text-field
            v-model="formData.currency"
            label="Currency (Optional)"
          />
          <v-btn
            variant="flat"
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
  </v-container>
</template>

<script setup lang="ts">
const store = useMainStore()
const { $bankAccountsApi } = useNuxtApp()

// data
const formData = reactive({
  accountId: '',
  currency: '',
})

const required = [(v: string) => !!v || 'Field is required']
const error = ref<any>({})
const loading = ref(false)
const showError = ref(false)

// computed
const payload = computed(() => store.getRequestPayload)
const response = computed(() => store.getRequestResponse)
const requestUrl = computed(() => store.getRequestUrl)

// methods
const onErrorSheetClosed = () => {
  error.value = {}
  showError.value = false
}

const makeApiCall = async () => {
  loading.value = true

  try {
    await $bankAccountsApi.getBankAccountInstructions(
      formData.accountId,
      formData.currency,
    )
  } catch (err) {
    error.value = err
    showError.value = true
  } finally {
    loading.value = false
  }
}
</script>
