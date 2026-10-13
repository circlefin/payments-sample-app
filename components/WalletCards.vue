<template>
  <div class="mo-stack" role="group" aria-label="Wallet summary">
    <div class="mo-tab mo-tab-in">
      <span>Received this month</span>
      <strong>+{{ formatUsdc(received) }}</strong>
    </div>
    <div class="mo-tab mo-tab-out">
      <span>Sent this month</span>
      <strong>−{{ formatUsdc(sent) }}</strong>
    </div>
    <div class="mo-tab mo-tab-wait">
      <span>Still processing</span>
      <strong>{{ formatUsdc(pending) }}</strong>
    </div>

    <div class="mo-front">
      <div class="mo-front-top">
        <span class="mo-chip">
          {{ count }} {{ count === 1 ? 'transfer' : 'transfers' }} this month
        </span>
        <span class="mo-net" :class="net >= 0 ? 'up' : 'down'">
          {{ net >= 0 ? '+' : '−' }}{{ formatUsdc(Math.abs(net)) }} net
        </span>
      </div>

      <p class="mo-label">Wallet balance</p>
      <p class="mo-balance" aria-live="polite">
        {{ formatUsdc(balance) }}<small>USDC</small>
      </p>

      <NuxtLink to="/receive" class="mo-plus" aria-label="Add USDC to your wallet">
        +
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatUsdc } from '~/composables/useWallet'

defineProps({
  balance: { type: String, required: true },
  received: { type: Number, required: true },
  sent: { type: Number, required: true },
  pending: { type: Number, required: true },
  count: { type: Number, required: true },
  net: { type: Number, required: true },
})
</script>
