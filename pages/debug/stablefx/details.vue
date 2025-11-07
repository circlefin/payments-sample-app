<template>
  <v-container>
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
            :items="typeOptions"
            label="Type (optional)"
            clearable
          />
          <v-btn
            variant="flat"
            class="mb-7"
            color="primary"
            :loading="loading"
            :disabled="!validForm || loading"
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
const { $stablefxTradesApi } = useNuxtApp()
const route = useRoute()

const validForm = ref(false)
const formData = reactive({
  tradeId: (route.query.tradeId as string) || '',
  type: (route.query.type as string) || '',
})

const typeOptions = [
  { title: 'Taker', value: 'taker' },
  { title: 'Maker', value: 'maker' },
]
const error = ref<any>({})
const loading = ref(false)
const showError = ref(false)

const payload = computed(() => store.getRequestPayload)
const response = computed(() => store.getRequestResponse)
const requestUrl = computed(() => store.getRequestUrl)

const required = (v: string) => !!v || 'Field is required'

const onErrorSheetClosed = () => {
  error.value = {}
  showError.value = false
}

const makeApiCall = async () => {
  loading.value = true

  try {
    await $stablefxTradesApi.getTrade(
      formData.tradeId,
      formData.type || undefined,
    )
  } catch (err) {
    error.value = err
    showError.value = true
  } finally {
    loading.value = false
  }
}
</script>
