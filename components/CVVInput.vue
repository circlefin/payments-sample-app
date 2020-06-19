<template>
  <v-text-field
    v-mask="vMask"
    :value="value"
    :rules="rules"
    :label="label"
    type="password"
    inputmode="numeric"
    name="cvc"
    autocomplete="cc-csc"
    @input="onInput"
  />
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { mask } from 'vue-the-mask'
import { EventBus } from '@/lib/eventBus.js'

@Component({
  directives: {
    mask,
  },
})
export default class CVVInput extends Vue {
  @Prop({ type: String }) value!: string
  @Prop({ type: Array }) rules!: Array<Function>
  @Prop({ type: String, default: 'CVV' }) defaultLabel!: string

  label = this.defaultLabel

  vMask = '####'

  onInput(value: string) {
    this.$emit('input', value)
  }

  mounted() {
    EventBus.$on('cardSecurity', (code: any) => {
      if (code) {
        this.label = code.name
        this.vMask = '#'.repeat(code.size)
      } else {
        this.label = 'CVV'
        this.vMask = '####'
      }
    })
  }
}
</script>
