<template>
  <div class="overline mb-4" :class="colorClass">{{ env }} ENVIRONMENT</div>
</template>
<script setup lang="ts">
import { getLive } from '@/lib/apiTarget'

const isLive = getLive()
const colorClass = isLive ? 'text-red' : 'text-green'
const env = isLive ? 'LIVE' : 'SANDBOX'
</script>
