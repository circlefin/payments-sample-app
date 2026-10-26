<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="4">
        <v-form>
          <v-text-field v-model="formData.minApy" label="Min APY" />
          <v-text-field v-model="formData.minTvl" label="Min TVL" />
          <v-select
            v-model="formData.sortBy"
            :items="sortByOptions"
            label="Sort By"
          />
          <v-text-field
            v-model="formData.pageSize"
            label="PageSize (100-500)"
          />
          <v-text-field v-model="formData.page" label="Page" />
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
const { $daaEarnApi } = useNuxtApp()

const formData = reactive({
  minApy: '',
  minTvl: '',
  sortBy: '',
  pageSize: '',
  page: '',
})

const sortByOptions = ['', 'apy', 'tvl', 'name']
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
    await $daaEarnApi.getVaults(
      formData.minApy,
      formData.minTvl,
      formData.sortBy,
      formData.pageSize,
      formData.page,
    )
  } catch (err) {
    error.value = err
    showError.value = true
  } finally {
    loading.value = false
  }
}
</script>
