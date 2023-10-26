<!--
 Copyright 2023 Circle Internet Financial, LTD.  All rights reserved.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.

 SPDX-License-Identifier: Apache-2.0
-->

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
