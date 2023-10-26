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
  <v-bottom-sheet v-model="bottomSheetValue">
    <v-sheet class="text-center" height="200px">
      <v-btn class="mt-6" @click="bottomSheetValue = !bottomSheetValue">
        close
      </v-btn>
      <br />
      <br />
      <p v-if="status">Status: {{ status }}</p>
      <p v-if="message">Message: {{ message }}</p>
    </v-sheet>
  </v-bottom-sheet>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'nuxt-property-decorator'

interface Error {
  status?: string
  message?: string
  data?: {
    code: number
    message: string
  }
}

@Component
export default class ErrorSheet extends Vue {
  @Prop({ type: Object, default: () => {} })
  error!: Error

  @Prop({ type: Boolean })
  showError!: boolean

  status = ''
  message = ''

  get bottomSheetValue() {
    return this.showError
  }

  set bottomSheetValue(bottomSheetValue) {
    this.$emit('onChange', bottomSheetValue)
  }

  @Watch('error', { immediate: true })
  onErrorChange(error: Error) {
    this.status = error.status || ''

    if (error.data) {
      this.message = error.data.message || ''
    } else {
      this.message = error.message || ''
    }
  }
}
</script>
