<template>
  <div>
    <v-textarea
      v-model="deviceJson"
      label="Device key (device.json, self-custody source)"
      hint="Held in memory only; cleared on reload"
      persistent-hint
      rows="3"
      class="mb-2"
      @update:model-value="onDeviceJsonChange"
    />
    <p v-if="deviceKeyId" class="mb-4">Signing with key {{ deviceKeyId }}</p>
    <p v-if="deviceKeyError" class="mb-4 text-error">
      {{ deviceKeyError }}
    </p>
  </div>
</template>

<script setup lang="ts">
import {
  clearDeviceKey,
  getDeviceKeyId,
  loadDeviceKey,
} from '@/lib/daa/deviceSigner'

const deviceJson = ref('')
const deviceKeyId = ref<string | null>(getDeviceKeyId())
const deviceKeyError = ref('')

const onDeviceJsonChange = async (value: string) => {
  deviceKeyError.value = ''
  if (!value.trim()) {
    clearDeviceKey()
    deviceKeyId.value = null
    return
  }
  try {
    deviceKeyId.value = (await loadDeviceKey(value)).authKeyId
  } catch (e: any) {
    clearDeviceKey()
    deviceKeyId.value = null
    deviceKeyError.value = `Invalid device key: ${e.message}`
  }
}
</script>
