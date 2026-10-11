<template>
  <div class="fm-list">
    <div v-if="items.length === 0" class="fm-empty">
      <h3>No activity yet</h3>
      <p>Money you send or receive will show up here.</p>
    </div>

    <div v-for="item in items" :key="item.id" class="fm-list-item">
      <v-icon aria-hidden="true">
        {{
          item.direction === 'sent' ? 'mdi-arrow-top-right' : 'mdi-arrow-bottom-left'
        }}
      </v-icon>
      <div class="fm-who">
        <strong>
          {{ item.direction === 'sent' ? 'Sent to' : 'Received from' }}
          {{ item.counterparty ? shortAddress(item.counterparty) : 'a wallet' }}
        </strong>
        <span>{{ formatDate(item.date) }} · {{ stateLabel(item.state) }}</span>
      </div>
      <span :class="item.direction === 'received' ? 'fm-amount-in' : ''">
        {{ item.direction === 'sent' ? '−' : '+' }}{{ formatUsdc(item.amount) }}
        USDC
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  formatDate,
  formatUsdc,
  shortAddress,
  stateLabel,
} from '~/composables/useWallet'
import type { ActivityItem } from '~/composables/useWallet'

defineProps({
  items: { type: Array as () => ActivityItem[], required: true },
})
</script>
