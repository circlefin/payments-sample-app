<template>
  <v-layout>
    <v-row>
      <v-col cols="12" md="4">
        <v-btn
          depressed
          class="mb-7"
          color="primary"
          :loading="loading"
          :disabled="loading"
          @click.prevent="makeApiCall"
        >
          Make api call
        </v-btn>
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

<script setup lang="ts">
const store = useMainStore()
const { $cpsTradesApi } = useNuxtApp()

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
  loading.value = true
  try {
    await $cpsTradesApi.getTrades()
  } catch (err) {
    error.value = err
    showError.value = true
  } finally {
    loading.value = false
  }
}
</script>
