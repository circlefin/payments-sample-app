<template>
  <v-select
    :model-value="modelValue"
    :items="items"
    :label="label"
    :rules="rules"
    :disabled="disabled"
    validate-on-blur
    @update:model-value="onInput"
  ></v-select>
</template>
<script setup lang="ts">
import countries from '@/lib/countries.json'

interface Props {
  modelValue?: string
  label?: string
  disabled?: boolean
  rules?: Array<(value: any) => boolean | string>
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  label: 'Country',
  disabled: false,
  rules: () => [],
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const items = countries

const onInput = (value: string) => {
  emit('update:modelValue', value)
}
</script>
