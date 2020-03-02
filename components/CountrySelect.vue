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
import countries from '@/lib/countries.json'

@Component({})
export default class CountrySelect extends Vue {
  @Prop({ type: String }) value!: string
  @Prop({ type: String, default: 'Country' }) label!: string
  @Prop({ type: Boolean, default: false }) disabled!: boolean
  @Prop({ type: Array, default: false }) rules!: Array<Function>

  items = countries

  onInput(value: string) {
    this.$emit('input', value)
  }
}
</script>
