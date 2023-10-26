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
  <div class="overline mb-4" :class="colorClass">{{ env }} ENVIRONMENT</div>
</template>
<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import { getLive } from '@/lib/apiTarget'

@Component({})
export default class Environment extends Vue {
  data() {
    // No need to make this reactive (for now)
    const isLive = getLive()

    return {
      colorClass: isLive ? 'red--text' : 'green--text',
      env: isLive ? 'LIVE' : 'SANDBOX',
    }
  }
}
</script>
