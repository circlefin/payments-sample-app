<template>
  <div class="request-info">
    <div v-show="url">
      <v-card class="pa-4 px-6 mb-2">
        {{ url }}
      </v-card>
    </div>
    <v-expansion-panels multiple v-model="openPanels">
      <v-expansion-panel>
        <v-expansion-panel-title>Payload</v-expansion-panel-title>
        <v-expansion-panel-text>
          <div class="json-prettier">
            <vue-json-pretty :data="payload" />
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
      <v-expansion-panel>
        <v-expansion-panel-title>Response</v-expansion-panel-title>
        <v-expansion-panel-text>
          <div class="json-prettier">
            <vue-json-pretty :data="response" />
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script setup lang="ts">
// @ts-ignore
import VueJsonPretty from 'vue-json-pretty'
import 'vue-json-pretty/lib/styles.css'

interface Props {
  url?: string
  payload?: any
  response?: any
}

const props = withDefaults(defineProps<Props>(), {
  url: '',
  payload: () => ({}),
  response: () => ({}),
})

const store = useMainStore()

const openPanels = computed(() => {
  if (props.url !== '') {
    return [0, 1]
  }
  return []
})

onMounted(() => {
  store.clearRequestData()
})
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
