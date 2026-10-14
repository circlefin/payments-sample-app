<template>
  <div class="fm-wrap fm-app-main">
    <h1 class="fm-page-title">Send USDC</h1>

    <p v-if="loading" role="status" class="fm-balance-label">Loading…</p>

    <div v-else-if="!wallet" class="fm-list">
      <div class="fm-empty">
        <h3>Create your wallet first</h3>
        <p class="mb-4">You need a wallet before you can send money.</p>
        <v-btn to="/wallet" color="primary" variant="flat">Go to my wallet</v-btn>
      </div>
    </div>

    <div v-else-if="result" class="fm-list">
      <div class="fm-empty">
        <h3>Transfer started</h3>
        <p class="mb-4">
          {{ formatUsdc(sentAmount) }} USDC is on its way to
          {{ shortAddress(sentTo) }}. It can take a minute to complete.
        </p>
        <v-btn to="/activity" color="primary" variant="flat" class="mr-2">
          See activity
        </v-btn>
        <v-btn variant="outlined" color="secondary" @click="again">
          Send another
        </v-btn>
      </div>
    </div>

    <template v-else>
      <p class="fm-balance-label">
        Available: <strong>{{ formatUsdc(usdc) }} USDC</strong>
      </p>

      <v-alert
        v-if="error"
        type="error"
        variant="tonal"
        class="my-4"
        role="alert"
      >
        {{ error }}
      </v-alert>

      <v-form class="fm-form mt-4" @submit.prevent="review">
        <v-text-field
          v-model="to"
          label="Recipient wallet address"
          placeholder="0x…"
          autocomplete="off"
          autocapitalize="off"
          spellcheck="false"
        />
        <v-text-field
          v-model="amount"
          label="Amount (USDC)"
          inputmode="decimal"
          autocomplete="off"
          placeholder="0.00"
        />
        <v-btn
          type="submit"
          size="x-large"
          color="primary"
          variant="flat"
          class="mt-2"
        >
          Review
        </v-btn>
      </v-form>
    </template>

    <v-dialog v-model="confirming" max-width="440" :persistent="sending">
      <v-card class="pa-4">
        <h2 class="fm-display" style="font-size: 1.5rem">Confirm transfer</h2>
        <div class="mt-4">
          <div class="fm-slip-row">
            <span>Amount</span>
            <span>{{ formatUsdc(amount) }} USDC</span>
          </div>
          <div class="fm-slip-row">
            <span>To</span>
            <span>{{ to.trim() }}</span>
          </div>
          <div class="fm-slip-row">
            <span>Network</span>
            <span>{{ wallet ? networkName(wallet.blockchain) : '' }}</span>
          </div>
        </div>
        <p class="fm-notice">
          Transfers cannot be undone.
          {{
            mode.live
              ? 'This sends real money, so check the address and network carefully.'
              : 'Check the address carefully.'
          }}
        </p>
        <v-alert
          v-if="confirmError"
          type="error"
          variant="tonal"
          class="mt-3"
          role="alert"
        >
          {{ confirmError }}
        </v-alert>
        <div class="d-flex justify-end ga-2 mt-4">
          <v-btn variant="text" color="secondary" :disabled="sending" @click="confirming = false">
            Cancel
          </v-btn>
          <v-btn color="primary" variant="flat" :loading="sending" @click="send">
            Send now
          </v-btn>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'dash', middleware: 'auth' })
useHead({ title: 'Send USDC' })

const { api } = useAuth()
const { mode, loadMode } = useAppMode()
loadMode()
const { wallet, usdc, loadWallet, loadBalance } = useWallet()

const loading = ref(true)
const to = ref('')
const amount = ref('')
const error = ref('')
const confirmError = ref('')
const confirming = ref(false)
const sending = ref(false)
const result = ref(false)
const sentTo = ref('')
const sentAmount = ref('')

// One id per transfer attempt. If a request is retried, Circle sees the same
// id and does not send the money twice. It changes when the details change.
const requestId = ref(crypto.randomUUID())
watch([to, amount], () => {
  requestId.value = crypto.randomUUID()
})

function review() {
  error.value = ''
  const address = to.value.trim()
  const value = amount.value.trim()

  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    error.value = 'Enter a valid wallet address. It starts with 0x and is 42 characters long.'
    return
  }
  if (wallet.value && address.toLowerCase() === wallet.value.address.toLowerCase()) {
    error.value = 'That is your own wallet address.'
    return
  }
  if (!/^\d+(\.\d{1,6})?$/.test(value) || Number(value) <= 0) {
    error.value = 'Enter an amount greater than 0, with up to 6 decimals.'
    return
  }
  if (Number(value) > Number(usdc.value)) {
    error.value = 'Your balance is too low for this amount.'
    return
  }

  confirmError.value = ''
  confirming.value = true
}

async function send() {
  confirmError.value = ''
  sending.value = true
  try {
    await api('/api/transfer', {
      method: 'POST',
      body: {
        to: to.value.trim(),
        amount: amount.value.trim(),
        requestId: requestId.value,
      },
    })
    sentTo.value = to.value.trim()
    sentAmount.value = amount.value.trim()
    confirming.value = false
    result.value = true
    await loadBalance().catch(() => undefined)
  } catch (err: any) {
    confirmError.value = errorText(err)
  } finally {
    sending.value = false
  }
}

function again() {
  to.value = ''
  amount.value = ''
  result.value = false
  requestId.value = crypto.randomUUID()
}

onMounted(async () => {
  try {
    await loadWallet()
    await loadBalance()
  } catch (err: any) {
    error.value = errorText(err)
  } finally {
    loading.value = false
  }
})
</script>
