<template>
  <div ref="box" class="mo-chart">
    <svg
      :width="width"
      :height="height"
      :viewBox="`0 0 ${width} ${height}`"
      role="img"
      :aria-label="summary"
    >
      <defs>
        <linearGradient id="mo-in-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#4f5fe6" stop-opacity="0.26" />
          <stop offset="100%" stop-color="#4f5fe6" stop-opacity="0" />
        </linearGradient>
      </defs>

      <g v-for="tick in ticks" :key="`tick-${tick.value}`">
        <line
          :x1="LEFT"
          :x2="width - RIGHT"
          :y1="tick.y"
          :y2="tick.y"
          stroke="#d9dcec"
          stroke-dasharray="3 5"
        />
        <text
          :x="LEFT - 10"
          :y="tick.y + 4"
          text-anchor="end"
          font-size="12"
          fill="#5b6078"
        >
          {{ tick.label }}
        </text>
      </g>

      <text
        v-for="label in xLabels"
        :key="`x-${label.index}`"
        :x="label.x"
        :y="height - 8"
        text-anchor="middle"
        font-size="12"
        fill="#5b6078"
      >
        {{ label.text }}
      </text>

      <template v-if="hasData">
        <path :d="inArea" fill="url(#mo-in-fill)" />
        <path
          :d="inLine"
          fill="none"
          stroke="#4f5fe6"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          :d="outLine"
          fill="none"
          stroke="#e07a14"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <circle
          :cx="lastIn.x"
          :cy="lastIn.y"
          r="5"
          fill="#ffffff"
          stroke="#4f5fe6"
          stroke-width="3"
        />
        <circle
          :cx="lastOut.x"
          :cy="lastOut.y"
          r="5"
          fill="#ffffff"
          stroke="#e07a14"
          stroke-width="3"
        />
      </template>
      <text
        v-else
        :x="width / 2"
        :y="TOP + innerHeight / 2"
        text-anchor="middle"
        font-size="14"
        fill="#5b6078"
      >
        No activity in the last {{ labels.length }} weeks yet
      </text>
    </svg>
  </div>
</template>

<script setup lang="ts">
import {
  areaPath,
  axisLabel,
  niceScale,
  smoothPath,
} from '~/utils/activityStats'

const props = defineProps({
  labels: { type: Array as () => string[], required: true },
  received: { type: Array as () => number[], required: true },
  sent: { type: Array as () => number[], required: true },
})

const LEFT = 46
const RIGHT = 24
const TOP = 14
const BOTTOM = 32
const height = 300

// The chart is drawn at the real pixel width of its box, so the text stays a
// readable size on a phone instead of shrinking with the picture.
const box = ref<HTMLElement | null>(null)
const width = ref(560)
let observer: ResizeObserver | null = null

onMounted(() => {
  const el = box.value
  if (!el) {
    return
  }
  const measure = () => {
    const next = Math.floor(el.clientWidth)
    if (next > 120) {
      width.value = next
    }
  }
  measure()
  if (typeof ResizeObserver !== 'undefined') {
    observer = new ResizeObserver(measure)
    observer.observe(el)
  }
})

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect()
  }
})

const innerWidth = computed(() => Math.max(width.value - LEFT - RIGHT, 1))
const innerHeight = height - TOP - BOTTOM

const hasData = computed(
  () =>
    props.received.some((v) => v > 0) || props.sent.some((v) => v > 0),
)

const scale = computed(() =>
  niceScale(Math.max(0, ...props.received, ...props.sent)),
)

function xAt(index: number): number {
  const count = props.labels.length
  if (count < 2) {
    return LEFT + innerWidth.value / 2
  }
  return LEFT + (innerWidth.value * index) / (count - 1)
}

function yAt(value: number): number {
  return TOP + innerHeight - (value / scale.value.max) * innerHeight
}

const ticks = computed(() =>
  [0, 1, 2, 3, 4].map((i) => {
    const value = Math.round(i * scale.value.step * 1e6) / 1e6
    return { value, y: yAt(value), label: axisLabel(value) }
  }),
)

const xLabels = computed(() => {
  const count = props.labels.length
  const everyOther = width.value < 480
  return props.labels
    .map((text, index) => ({ text, index, x: xAt(index) }))
    .filter((item) => !everyOther || (count - 1 - item.index) % 2 === 0)
})

const inPoints = computed(() =>
  props.received.map((v, i) => ({ x: xAt(i), y: yAt(v) })),
)
const outPoints = computed(() =>
  props.sent.map((v, i) => ({ x: xAt(i), y: yAt(v) })),
)

const inLine = computed(() => smoothPath(inPoints.value))
const outLine = computed(() => smoothPath(outPoints.value))
const inArea = computed(() => areaPath(inPoints.value, yAt(0)))

const lastIn = computed(
  () => inPoints.value[inPoints.value.length - 1] || { x: 0, y: 0 },
)
const lastOut = computed(
  () => outPoints.value[outPoints.value.length - 1] || { x: 0, y: 0 },
)

const summary = computed(() => {
  const total = (list: number[]) =>
    list.reduce((sum, v) => sum + v, 0).toFixed(2)
  return `Weekly activity over the last ${props.labels.length} weeks. Received ${total(props.received)} USDC and sent ${total(props.sent)} USDC.`
})
</script>
