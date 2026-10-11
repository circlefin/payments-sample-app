<template>
  <div class="fm-wrap fm-app-main">
    <h1 class="fm-page-title">Activity</h1>

    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      class="my-4"
      role="alert"
    >
      {{ error }}
    </v-alert>

    <p v-if="loading" role="status" class="fm-balance-label">Loading activity…</p>

    <div v-else-if="!wallet" class="fm-list">
      <div class="fm-empty">
        <h3>No wallet yet</h3>
        <p class="mb-4">Create a wallet to start sending and receiving.</p>
        <v-btn to="/wallet" color="primary" variant="flat">Go to my wallet</v-btn>
      </div>
    </div>

    <template v-else>
      <v-btn
        variant="outlined"
        color="secondary"
        class="mb-4"
        :loading="refreshing"
        @click="refresh"
      >
        Refresh
      </v-btn>
      <WalletTxList :items="activity" />
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'app', middleware: 'auth' })
useHead({ title: 'Activity' })

const { wallet, activity, loadWallet, loadActivity } = useWallet()

const loading = ref(true)
const refreshing = ref(false)
const error = ref('')

async function refresh() {
  error.value = ''
  refreshing.value = true
  try {
    await loadActivity()
  } catch (err: any) {
    error.value = errorText(err)
  } finally {
    refreshing.value = false
  }
}

onMounted(async () => {
  try {
    await loadWallet()
    await loadActivity()
  } catch (err: any) {
    error.value = errorText(err)
  } finally {
    loading.value = false
  }
})
</script>
