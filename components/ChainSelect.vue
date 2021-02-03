<template>
  <v-select
    :value="value"
    :items="items"
    :label="label"
    :rules="rules"
    :disabled="disabled"
    validate-on-blur
    @input="onInput"
  ></v-select>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'nuxt-property-decorator'
import chains from '@/lib/chains.json'

@Component({})
export default class ChainSelect extends Vue {
  @Prop({ type: String }) value!: string
  @Prop({ type: String, default: 'Chain' }) label!: string
  @Prop({ type: Boolean, default: false }) disabled!: boolean
  @Prop({ type: Array }) rules!: Array<Function>

  items = chains

  onInput(value: string) {
    this.$emit('input', value)
  }
}
</script>
