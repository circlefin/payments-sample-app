<template>
  <div>
    <h3>Thank you, we received your trade request.</h3>
    <br />
    <p>
      <b>Quote id:</b> {{ quoteId }}
      <br />
      <b>Rate:</b> {{ rate }} <br />
      <b>From amount:</b> {{ from.currency + ' ' + from.amount }} <br />
      <b>To amount:</b> {{ to.currency + ' ' + to.amount }} <br />
    </p>
    <p>
      <b>Trade id:</b> {{ tradeId }} <br />
      <b>Trade status:</b> {{ tradeStatus }}<br />
      <b>Instant payment:</b> {{ fulfill }}
    </p>
    <div v-if="polling" class="text-center">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
      <br /><br />
      <v-btn variant="flat" size="small" @click.prevent="stopPolling()">
        Stop polling
      </v-btn>
    </div>
    <div v-else class="text-center mt-8">
      <v-btn variant="flat" size="small" @click.prevent="newTrade()">
        Make a new trade
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Amount {
  currency: string
  amount: number
}

interface Props {
  quoteId?: string
  tradeId?: string
  from?: Amount
  to?: Amount
  rate?: number
  fulfill?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  quoteId: '',
  tradeId: '',
  from: () => ({ currency: '', amount: 0 }),
  to: () => ({ currency: '', amount: 0 }),
  rate: 0,
  fulfill: false,
})

const emit = defineEmits<{
  finished: []
  makeNewTrade: []
  error: [error: any]
}>()

const { $tradesApi } = useNuxtApp()

const tradeStatus = ref('')
const stopPollingStatuses = ['confirmed', 'pending_settlement', 'failed']
const polling = ref(false)
const pollingId = ref(0)

const stopPolling = () => {
  clearInterval(pollingId.value)
  polling.value = false
  emit('finished')
}

const pollForTrade = (id: string) => {
  polling.value = true
  pollingId.value = window.setInterval(() => {
    getTrade(id)
  }, 3000)
}

const newTrade = () => {
  emit('makeNewTrade')
}

const getTrade = async (tradeId: string) => {
  try {
    const response = await $tradesApi.getTrade(tradeId)
    const { status } = response.data
    tradeStatus.value = status
    if (stopPollingStatuses.includes(status)) {
      stopPolling()
    }
  } catch (error) {
    stopPolling()
    emit('error', error)
  }
}

onMounted(() => {
  if (props.tradeId) {
    pollForTrade(props.tradeId)
  }
})

onBeforeUnmount(() => {
  stopPolling()
})
</script>
