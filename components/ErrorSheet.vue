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

<script setup lang="ts">
interface Error {
  status?: string
  message?: string
  data?: {
    code: number
    message: string
  }
}

interface Props {
  error?: Error
  showError?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  error: () => ({}),
  showError: false,
})

const emit = defineEmits<{
  onChange: [value: boolean]
}>()

const status = ref('')
const message = ref('')

const bottomSheetValue = computed({
  get: () => props.showError,
  set: (value: boolean) => emit('onChange', value),
})

watch(
  () => props.error,
  (error: Error) => {
    status.value = error?.status || ''

    if (error?.data) {
      message.value = error.data.message || ''
    } else {
      message.value = error?.message || ''
    }
  },
  { immediate: true },
)
</script>
