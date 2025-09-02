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

const ruleFunctions = {
  positive: (v: string) => {
    return parseFloat(v) > 0 || 'Please enter a positive amount'
  },
  isCurrency: (v: string) => {
    const amount = v.trim()
    return /^[0-9]+(.[0-9]{1,2})?$/.test(amount) || 'Please enter valid amount'
  },
  isNumber: (v: string) => {
    return !isNaN(parseInt(v)) || 'Please enter valid amount'
  },
  isRequired: (v: string) => {
    return v.trim() !== '' || 'Please enter an amount'
  },
}

const rules = computed(() => [
  ruleFunctions.isRequired,
  ruleFunctions.isNumber,
  ruleFunctions.isCurrency,
  ruleFunctions.positive,
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
