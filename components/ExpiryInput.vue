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
    ref="expiry"
    v-model="vModel"
    v-mask="'## / ####'"
    placeholder="01 / 2023"
    type="tel"
    label="Expiry"
    :required="required"
    :disabled="disabled"
    :rules="[validate]"
    validate-on-blur
    name="cc-exp"
    autocomplete="cc-exp"
    @input="onInput"
  />
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'nuxt-property-decorator'
// eslint-disable-next-line import/named
import { mask } from 'vue-the-mask'

@Component({
  directives: {
    mask,
  },
})
export default class ExpiryInput extends Vue {
  @Prop({ type: Object, default: { month: '', year: '' } }) labels!: {
    month: string
    year: string
  }

  @Prop({ type: Object, default: { month: '', year: '' } }) value!: {
    month: string
    year: string
  }

  @Prop({ type: Boolean, default: false }) disabled!: boolean
  @Prop({ type: Boolean, default: false }) required!: boolean

  expiry = {
    month: '',
    year: '',
  }

  vModel = ''

  onInput(value: string) {
    const split = value.split(' / ')
    this.expiry.month = split[0]
    this.expiry.year = split[1]
    this.$emit('input', this.expiry)
  }

  @Watch('value', { immediate: true })
  onValueChange(expiry: { month: string; year: string }) {
    this.expiry = expiry
  }

  @Watch('expiry', { immediate: true })
  onExpiryChange(expiry: { month: string; year: string }) {
    this.vModel = `${expiry.month} / ${expiry.year}`
  }

  data() {
    return {
      validate: () => {
        const expMonth = parseInt(this.expiry.month)
        const expYear = parseInt(this.expiry.year)
        // checks for NaN and non-zero at the same time
        if (!expMonth || !expYear) {
          return 'Please enter a valid date'
        }
        if (expMonth > 12) {
          return 'Please enter a valid month'
        }

        if (expYear < 1000) {
          return 'Year has to be 4 digits'
        }

        const expiryDate = new Date(expYear, expMonth)
        if (isNaN(expiryDate.getFullYear())) {
          return 'Please enter a valid date'
        }

        if (expiryDate < new Date()) {
          return 'Date has expired'
        }
        return true
      },
    }
  }
}
</script>
