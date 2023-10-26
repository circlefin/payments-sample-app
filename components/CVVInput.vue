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
// eslint-disable-next-line import/named
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
