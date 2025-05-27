<template>
  <div>
    <h3>Thank you, we received your trade request.</h3>
    <br />
    <p>
      <b>Quote id:</b> {{ quoteId }}
      <br />
      <b>Rate:</b> {{ rate }} <br />
      <b>From amount:</b> {{ from.currency + ' ' + from.amount }} <br />
      <b>To amount:</b> {{ to.currency + ' ' + to.amount }} <br />
    </p>
    <p>
      <b>Trade id:</b> {{ tradeId }} <br />
      <b>Trade status:</b> {{ tradeStatus }}
    </p>
    <div v-if="polling" class="text-center">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
      <br /><br />
      <v-btn depressed small @click.prevent="stopPolling()">
        Stop polling
      </v-btn>
    </div>
    <div v-else class="text-center mt-8">
      <v-btn depressed small @click.prevent="newTrade()">
        Make a new trade
      </v-btn>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'nuxt-property-decorator'
import { mapGetters } from 'vuex'

interface Amount {
  currency: string
  amount: number
}

@Component({
  computed: {
    ...mapGetters({
      isMarketplace: 'isMarketplace',
    }),
  },
})
export default class TradeStatus extends Vue {
  @Prop({ type: String, default: '' })
  quoteId!: string

  @Prop({ type: String, default: '' })
  tradeId!: string

  @Prop({ type: Object, default: {} })
  from!: Amount

  @Prop({ type: Object, default: {} })
  to!: Amount

  @Prop({ type: Number, default: {} })
  rate!: number

  tradeStatus: string = ''
  stopPollingStatuses = ['confirmed', 'pending_settlement', 'failed']
  polling: boolean = false
  pollingId: number = 0

  stopPolling() {
    clearInterval(this.pollingId)
    this.polling = false
    this.$emit('finished')
  }

  pollForTrade(id: string) {
    this.polling = true
    this.pollingId = window.setInterval(() => {
      this.getTrade(id)
    }, 3000)
  }

  newTrade() {
    this.$emit('makeNewTrade')
  }

  async getTrade(tradeId: string) {
    try {
      const { status } = await this.$tradesApi.getTrade(tradeId)
      this.tradeStatus = status
      if (this.stopPollingStatuses.includes(status)) {
        this.stopPolling()
      }
    } catch (error) {
      this.stopPolling()
      this.$emit('error', error)
    }
  }

  mounted() {
    if (this.tradeId) {
      this.pollForTrade(this.tradeId)
    }
  }

  beforeDestroy() {
    this.stopPolling()
  }
}
</script>
