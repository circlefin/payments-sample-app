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
