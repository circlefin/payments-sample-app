<template>
  <div>
    <h3>Thank you, we received your payment.</h3>
    <br />
    <p v-if="paymentResponse.id">
      <b>Payment id:</b> {{ paymentResponse.id }}
      <br />
      <b>Payment status:</b> {{ paymentResponse.status }}
    </p>
    <div v-if="polling" class="text-center">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
      <br /><br />
      <v-btn variant="flat" size="small" @click.prevent="stopPolling()">
        Stop polling
      </v-btn>
    </div>
    <div v-else class="text-center mt-8">
      <v-btn variant="flat" size="small" @click.prevent="newPayment()">
        Make a new payment
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  paymentId?: string
}

const props = withDefaults(defineProps<Props>(), {
  paymentId: '',
})

const emit = defineEmits<{
  finished: []
  makeNewPayment: []
  error: [error: any]
}>()

const store = useMainStore()
const { $paymentsApi } = useNuxtApp()

const paymentResponse = ref({
  id: '',
  status: '',
})

const polling = ref(false)
const pollingId = ref(0)

const stopPolling = () => {
  clearInterval(pollingId.value)
  polling.value = false
  emit('finished')
}

const pollForPaymentsDetail = (id: string) => {
  polling.value = true
  pollingId.value = window.setInterval(() => {
    getPayment(id)
  }, 3000)
}

const newPayment = () => {
  emit('makeNewPayment')
}

const getPayment = async (paymentId: string) => {
  try {
    const apiResponse = await $paymentsApi.getPaymentById(paymentId)

    const payment = apiResponse.data
    if (payment.status === 'confirmed' || payment.status === 'failed') {
      stopPolling()
    }
    paymentResponse.value = payment
  } catch (error) {
    stopPolling()
    emit('error', error)
  }
}

onMounted(() => {
  if (props.paymentId) {
    pollForPaymentsDetail(props.paymentId)
  }
})

onBeforeUnmount(() => {
  stopPolling()
})
</script>
