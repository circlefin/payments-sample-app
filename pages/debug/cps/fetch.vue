<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="4">
        <v-form>
          <header>Optional filter params:</header>
          <v-select
            v-model="formData.statuses"
            :items="statusOptions"
            label="Status"
            clearable
          />
          <v-select
            v-model="formData.type"
            :items="typeOptions"
            label="Type"
            clearable
          />
          <v-text-field
            v-model="formData.startCreateDateInclusive"
            label="Start Create Date (Inclusive)"
          />
          <v-text-field
            v-model="formData.endCreateDateInclusive"
            label="End Create Date (Inclusive)"
          />
          <v-text-field v-model="formData.pageSize" label="PageSize" />
          <v-text-field v-model="formData.pageBefore" label="PageBefore" />
          <v-text-field v-model="formData.pageAfter" label="PageAfter" />
          <v-btn
            variant="flat"
            class="mb-7"
            color="primary"
            :loading="loading"
            :disabled="loading"
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
      @on-change="onErrorSheetClosed"
    />
  </v-container>
</template>

<script setup lang="ts">
const store = useMainStore()
const { $cpsTradesApi } = useNuxtApp()

const statusOptions = [
  'pending',
  'confirmed',
  'pending_settlement',
  'complete',
  'failed',
  'terminated',
  'breaching',
  'breached',
  'taker_funded',
  'maker_funded',
]

const typeOptions = ['taker', 'maker']

const formData = reactive({
  startCreateDateInclusive: '',
  endCreateDateInclusive: '',
  statuses: '',
  type: '',
  pageSize: '',
  pageBefore: '',
  pageAfter: '',
})

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
    await $cpsTradesApi.getTrades(
      formData.startCreateDateInclusive,
      formData.endCreateDateInclusive,
      formData.statuses,
      formData.type,
      formData.pageAfter,
      formData.pageBefore,
      formData.pageSize,
    )
  } catch (err) {
    error.value = err
    showError.value = true
  } finally {
    loading.value = false
  }
}
</script>
