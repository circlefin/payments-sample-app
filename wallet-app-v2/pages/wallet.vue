<template>
  <div class="fm-wrap fm-app-main">
    <h1 class="fm-page-title">My wallet</h1>

    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      class="my-4"
      role="alert"
    >
      {{ error }}
    </v-alert>

    <p v-if="loading" role="status" class="fm-balance-label">Loading your wallet…</p>

    <div v-else-if="!wallet" class="fm-list">
      <div class="fm-empty">
        <h3>Create your wallet</h3>
        <p class="mb-4">
          One tap gives you a USDC wallet and an address you can share to get
          paid.
        </p>
        <v-btn
          size="x-large"
          color="primary"
          variant="flat"
          :loading="creating"
          @click="create"
        >
          Create wallet
        </v-btn>
      </div>
    </div>

    <template v-else>
      <p class="fm-balance-label">USDC balance</p>
      <p class="fm-balance" aria-live="polite">
        {{ formatUsdc(usdc) }}<small>USDC</small>
      </p>

      <div class="fm-address-box">
        <code>{{ wallet.address }}</code>
        <v-btn
          size="small"
          variant="tonal"
          :prepend-icon="copied ? 'mdi-check' : 'mdi-content-copy'"
          @click="copy(wallet.address)"
        >
          {{ copied ? 'Copied' : 'Copy' }}
        </v-btn>
      </div>
      <p class="fm-notice">{{ networkName(wallet.blockchain) }}</p>

      <div class="fm-cta-row">
        <v-btn size="large" to="/send" color="primary" variant="flat">
          Send
        </v-btn>
        <v-btn size="large" to="/receive" variant="outlined" color="secondary">
          Receive
        </v-btn>
        <v-btn
          size="large"
          variant="text"
          color="secondary"
          :loading="refreshing"
          @click="refresh"
        >
          Refresh
        </v-btn>
      </div>

      <p class="fm-notice">
        Need test USDC? Get some free from the
        <a href="https://faucet.circle.com" target="_blank" rel="noopener">
          Circle faucet</a
        >. Choose the network shown above and paste your address.
      </p>

      <h2 class="fm-section-title">Recent activity</h2>
      <WalletTxList :items="activity.slice(0, 5)" />
      <p v-if="activity.length > 5" class="mt-3">
        <NuxtLink to="/activity">See all activity</NuxtLink>
      </p>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'app', middleware: 'auth' })
useHead({ title: 'My wallet' })

const {
  wallet,
  usdc,
  activity,
  loadWallet,
  loadBalance,
  loadActivity,
  createWallet,
} = useWallet()
const { copied, copy } = useCopy()

const loading = ref(true)
const creating = ref(false)
const refreshing = ref(false)
const error = ref('')

async function loadAll() {
  await loadWallet()
  await Promise.all([loadBalance(), loadActivity()])
}

async function create() {
  error.value = ''
  creating.value = true
  try {
    await createWallet()
  } catch (err: any) {
    error.value = errorText(err)
  } finally {
    creating.value = false
  }
}

async function refresh() {
  error.value = ''
  refreshing.value = true
  try {
    await loadAll()
  } catch (err: any) {
    error.value = errorText(err)
  } finally {
    refreshing.value = false
  }
}

onMounted(async () => {
  try {
    await loadAll()
  } catch (err: any) {
    error.value = errorText(err)
  } finally {
    loading.value = false
  }
})
</script>
