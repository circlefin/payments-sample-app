<template>
  <v-text-field
    v-model="amountFormatted"
    :rules="rules"
    :label="props.label"
    :prefix="props.prefix"
    :disabled="props.disabled"
  />
</template>

<script setup lang="ts">
import { amountRules } from './amountValidation'

interface Props {
  prefix?: string
  label?: string
  modelValue?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  prefix: '$',
  label: '',
  modelValue: '',
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const amountFormatted = ref('0.00')

const rules = computed(() => [
  amountRules.isRequired,
  amountRules.isNumber,
  amountRules.isCurrency,
  amountRules.positive,
])

const format = (value: string) => {
  if (!value) {
    return ''
  }
  return value
}

watch(
  amountFormatted,
  (value: string) => {
    const formatted = format(value)
    amountFormatted.value = formatted
    emit('update:modelValue', formatted)
  },
  { immediate: true },
)

watch(
  () => props.modelValue,
  (value: string) => {
    amountFormatted.value = format(value)
  },
  { immediate: true },
)
</script>
