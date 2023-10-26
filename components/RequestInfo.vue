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
  <div class="request-info">
    <div v-show="url">
      <v-card class="pa-4 px-6 mb-2">
        {{ url }}
      </v-card>
    </div>
    <v-expansion-panels multiple :value="openPanels">
      <v-expansion-panel>
        <v-expansion-panel-header>Payload</v-expansion-panel-header>
        <v-expansion-panel-content>
          <div class="json-prettier">
            <vue-json-pretty :data="payload" />
          </div>
        </v-expansion-panel-content>
      </v-expansion-panel>
      <v-expansion-panel>
        <v-expansion-panel-header>Response</v-expansion-panel-header>
        <v-expansion-panel-content>
          <div class="json-prettier">
            <vue-json-pretty :data="response" />
          </div>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'nuxt-property-decorator'
// @ts-ignore
import VueJsonPretty from 'vue-json-pretty'
import 'vue-json-pretty/lib/styles.css'

@Component({
  components: {
    VueJsonPretty,
  },
})
export default class RequestInfo extends Vue {
  @Prop({ type: String, default: '' })
  url!: string

  @Prop({ type: Object, default: () => {} })
  payload: any

  @Prop({ type: [Array, Object], default: () => {} })
  response: any

  mounted() {
    this.$store.commit('CLEAR_REQUEST_DATA')
  }

  get openPanels() {
    if (this.url !== '') {
      return [0, 1]
    }
    return []
  }
}
</script>

<style scoped>
.request-info {
  margin-top: 20px;
}
.json-prettier {
  max-width: 700px;
  overflow-x: auto;
}
</style>
