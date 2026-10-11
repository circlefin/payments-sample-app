<template>
  <div class="fm-wrap fm-app-main">
    <h1 class="fm-page-title">Receive USDC</h1>

    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      class="my-4"
      role="alert"
    >
      {{ error }}
    </v-alert>

    <p v-if="loading" role="status" class="fm-balance-label">Loading…</p>

    <div v-else-if="!wallet" class="fm-list">
      <div class="fm-empty">
        <h3>Create your wallet first</h3>
        <p class="mb-4">You need a wallet to get an address.</p>
        <v-btn to="/wallet" color="primary" variant="flat">Go to my wallet</v-btn>
      </div>
    </div>

    <template v-else>
      <p class="fm-lede">
        Share this address with the person paying you. Anyone can send USDC to
        it.
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

      <p class="fm-notice">
        Network: <strong>{{ networkName(wallet.blockchain) }}</strong>. Only
        send USDC on this network to this address, or it may be lost.
      </p>

      <v-btn to="/wallet" variant="outlined" color="secondary" class="mt-6">
        Back to my wallet
      </v-btn>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'app', middleware: 'auth' })
useHead({ title: 'Receive USDC' })

const { wallet, loadWallet } = useWallet()
const { copied, copy } = useCopy()

const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    await loadWallet()
  } catch (err: any) {
    error.value = errorText(err)
  } finally {
    loading.value = false
  }
})
</script>
