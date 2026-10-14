<template>
  <div>
    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      class="mb-4"
      role="alert"
    >
      {{ error }}
    </v-alert>

    <p v-if="loading" role="status" class="fm-balance-label">
      Loading your wallet…
    </p>

    <div v-else-if="!wallet" class="mo-card mo-empty-card">
      <h1 class="fm-page-title">Welcome, {{ displayName }}!</h1>
      <p class="fm-lede">
        One tap gives you a USDC wallet and an address you can share to get
        paid.
      </p>
      <v-btn
        size="x-large"
        color="primary"
        variant="flat"
        class="mt-6"
        :loading="creating"
        @click="create"
      >
        Create wallet
      </v-btn>
    </div>

    <div v-else class="mo-grid">
      <section class="mo-g-head">
        <div class="mo-head-text">
          <h1 class="mo-greeting">Welcome back, {{ displayName }}!</h1>
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
        </div>

        <div class="mo-actions">
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
      </section>

      <section class="mo-g-cards">
        <WalletCards
          :balance="usdc"
          :received="stats.received"
          :sent="stats.sent"
          :pending="stats.pending"
          :count="stats.count"
          :net="stats.net"
        />
      </section>

      <section class="mo-card mo-g-overview">
        <div class="mo-card-head">
          <h2>Overview</h2>
          <ul class="mo-legend" aria-label="Chart legend">
            <li><span class="mo-dot mo-dot-in"></span>Received</li>
            <li><span class="mo-dot mo-dot-out"></span>Sent</li>
          </ul>
        </div>
        <OverviewChart
          :labels="series.labels"
          :received="series.received"
          :sent="series.sent"
        />
      </section>

      <section class="mo-card mo-g-month">
        <div class="mo-card-head">
          <h2>This month</h2>
          <span class="mo-muted">{{ monthRange }}</span>
        </div>

        <div class="mo-month-numbers">
          <div>
            <p class="mo-muted"><span class="mo-dot mo-dot-in"></span>Received</p>
            <p class="mo-month-amount">{{ formatUsdc(stats.received) }} USDC</p>
          </div>
          <div>
            <p class="mo-muted"><span class="mo-dot mo-dot-out"></span>Sent</p>
            <p class="mo-month-amount">{{ formatUsdc(stats.sent) }} USDC</p>
          </div>
        </div>

        <div
          class="mo-bar"
          role="img"
          :aria-label="`Received ${inPercent} percent and sent ${outPercent} percent of this month's activity`"
        >
          <div class="mo-bar-in" :style="{ width: inPercent + '%' }"></div>
          <div class="mo-bar-out" :style="{ width: outPercent + '%' }"></div>
        </div>
        <p class="mo-muted">
          Based on your latest 50 transfers. Failed transfers are not counted.
        </p>
      </section>

      <section class="mo-card mo-g-tx">
        <div class="mo-card-head">
          <h2>Transactions</h2>
          <NuxtLink to="/activity">See all</NuxtLink>
        </div>
        <WalletTxList :items="activity.slice(0, 6)" />
      </section>

      <p v-if="mode.loaded && !mode.live" class="fm-notice mo-g-head">
        Need test USDC? Get some free from the
        <a href="https://faucet.circle.com" target="_blank" rel="noopener">
          Circle faucet</a
        >. Choose the network shown above and paste your address.
      </p>
      <p v-else-if="mode.loaded" class="fm-notice mo-g-head">
        To add money, send USDC to the address above. Use the network shown, or
        the funds may be lost.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { errorText, useAuth } from '~/composables/useAuth'
import { useCopy } from '~/composables/useCopy'
import {
  formatUsdc,
  networkName,
  useWallet,
} from '~/composables/useWallet'
import { monthTotals, weeklySeries } from '~/utils/activityStats'

definePageMeta({ layout: 'dash', middleware: 'auth' })
useHead({ title: 'Home' })

const { session } = useAuth()
const { mode, loadMode } = useAppMode()
loadMode()
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
const now = ref(new Date())

// "jane.doe42@mail.com" becomes "Jane"
const displayName = computed(() => {
  const local = (session.value?.email || '').split('@')[0]
  const first = local.split(/[._\-+0-9]+/)[0]
  return first ? first.charAt(0).toUpperCase() + first.slice(1) : 'there'
})

const stats = computed(() => monthTotals(activity.value, now.value))
const series = computed(() => weeklySeries(activity.value, now.value, 8))

const monthRange = computed(() => {
  const year = now.value.getFullYear()
  const month = now.value.getMonth()
  const short = { month: 'short', day: 'numeric' } as const
  const first = new Date(year, month, 1).toLocaleDateString(undefined, short)
  const last = new Date(year, month + 1, 0).toLocaleDateString(undefined, short)
  return `${first} to ${last}, ${year}`
})

const inPercent = computed(() => {
  const total = stats.value.received + stats.value.sent
  return total > 0 ? Math.round((stats.value.received / total) * 100) : 0
})
const outPercent = computed(() => {
  const total = stats.value.received + stats.value.sent
  return total > 0 ? 100 - inPercent.value : 0
})

async function loadAll() {
  now.value = new Date()
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
