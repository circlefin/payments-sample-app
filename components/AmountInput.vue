<template>
  <v-text-field
    v-model="amountFormatted"
    :rules="rules"
    :label="label"
    :prefix="prefix"
    :disabled="disabled"
  />
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'nuxt-property-decorator'

@Component({})
export default class AmountInput extends Vue {
  @Prop({ type: String, default: '$' }) prefix!: string
  @Prop({ type: String, default: '' }) label!: string
  @Prop({ type: String, default: '' }) value!: string
  @Prop({ type: Boolean, default: false }) disabled!: boolean

  amountFormatted: string = '0.00'

  ruleFunctions = {
    positive: (v: string) => {
      return parseFloat(v) > 0 || 'Please enter a positive amount'
    },
    isCurrency: (v: string) => {
      const amount = v.trim()
      return (
        /^[0-9]+(.[0-9]{1,2})?$/.test(amount) || 'Please enter valid amount'
      )
    },
    isNumber: (v: string) => {
      return !isNaN(parseInt(v)) || 'Please enter valid amount'
    },
    isRequired: (v: string) => {
      return v.trim() !== '' || 'Please enter an amount'
    },
  }

  get rules() {
    return [
      this.ruleFunctions.isRequired,
      this.ruleFunctions.isNumber,
      this.ruleFunctions.isCurrency,
      this.ruleFunctions.positive,
    ]
  }

  @Watch('amountFormatted', { immediate: true })
  amountFormattedChange(value: string) {
    this.amountFormatted = this.format(value)
    this.$emit('input', this.amountFormatted)
  }

  @Watch('value', { immediate: true })
  valueChange(value: string) {
    this.amountFormatted = this.format(value)
  }

  format(value: string) {
    if (!value) {
      return ''
    }

    return value
  }
}
</script>
