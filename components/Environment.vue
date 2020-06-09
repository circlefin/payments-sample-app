<template>
  <div class="overline mb-4" :class="colorClass">{{ env }} ENVIRONMENT</div>
</template>
<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import { getLive } from '@/lib/apiTarget'

@Component({})
export default class Environment extends Vue {
  data() {
    // No need to make this reactive (for now)
    const isLive = getLive()

    return {
      colorClass: isLive ? 'red--text' : 'green--text',
      env: isLive ? 'LIVE' : 'SANDBOX',
    }
  }
}
</script>
