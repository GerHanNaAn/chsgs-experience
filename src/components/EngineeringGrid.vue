<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { captionOpacity } from '../data/blockout.js'
import { guideAxis, retargetGuides, advanceGuides } from '../motion/damped.js'

const props = defineProps({ position: Number, focus: Object, ready: Boolean, reduced: Boolean })
const opening = ref(true)
const svg = ref(null), viewport = ref({ width: 1920, height: 1080 })
let observer
let timer
let frame = 0, previous = 0, disposed = false
watch(() => props.ready, ready => { if (ready) timer = setTimeout(() => { opening.value = false }, props.reduced ? 0 : 1400) }, { immediate: true })
onMounted(() => {
  observer = new ResizeObserver(() => { viewport.value = { width: svg.value.clientWidth, height: svg.value.clientHeight } })
  observer.observe(svg.value)
})
onBeforeUnmount(() => { disposed = true; clearTimeout(timer); cancelAnimationFrame(frame); observer?.disconnect() })
const step = 373, xOffset = 27, yOffset = -20
const travel = computed(() => 1 - captionOpacity(props.position))
const parallax = computed(() => props.reduced ? 0 : props.position * 17)
// DOM rectangles are in viewport CSS pixels. Convert through the SVG's own
// screen matrix so translations or CSS transforms cannot offset the guides.
const localFocus = computed(() => {
  const matrix = svg.value?.getScreenCTM()?.inverse()
  // Recompute the matrix when the SVG's measured viewport changes.
  void viewport.value
  if (!props.focus || !matrix) return null
  const topLeft = new DOMPoint(props.focus.left, props.focus.top).matrixTransform(matrix)
  const bottomRight = new DOMPoint(props.focus.right, props.focus.bottom).matrixTransform(matrix)
  return { left: topLeft.x, right: bottomRight.x, top: topLeft.y, bottom: bottomRight.y }
})
const verticalHomes = computed(() => Array.from({ length: Math.ceil(viewport.value.width / step) + 1 }, (_, i) => xOffset + i * step))
const horizontalHomes = computed(() => Array.from({ length: Math.ceil(viewport.value.height / step) + 2 }, (_, i) => yOffset + i * step - parallax.value))
const xAxis = guideAxis(verticalHomes.value), yAxis = guideAxis(horizontalHomes.value)
const verticals = ref([]), horizontals = ref([])
function publishLines() {
  const lines = axis => axis.lines.map((line, i) => ({ value: line.value, active: axis.focused && (i === axis.pair || i === axis.pair + 1) }))
  verticals.value = lines(xAxis); horizontals.value = lines(yAxis)
}
function animate(time) {
  frame = 0
  const dt = Math.min(previous ? (time - previous) / 1000 : 1 / 60, .05)
  const movingX = advanceGuides(xAxis, dt, props.reduced), movingY = advanceGuides(yAxis, dt, props.reduced)
  publishLines(); previous = time
  if (movingX || movingY) frame = requestAnimationFrame(animate)
  else previous = 0
}
watch([verticalHomes, horizontalHomes, localFocus, () => props.reduced], () => {
  const focus = localFocus.value
  retargetGuides(xAxis, verticalHomes.value, focus ? [focus.left, focus.right] : null)
  retargetGuides(yAxis, horizontalHomes.value, focus ? [focus.top, focus.bottom] : null)
  if (props.reduced) { cancelAnimationFrame(frame); frame = 0; previous = 0; advanceGuides(xAxis, 0, true); advanceGuides(yAxis, 0, true); publishLines() }
  else if (!disposed && !frame) frame = requestAnimationFrame(animate)
}, { immediate: true })
publishLines()
const cells = Array.from({ length: 24 }, (_, i) => ({ col: i % 6, row: Math.floor(i / 6), index: i }))
function cellOpacity(cell) {
  if (props.reduced || travel.value < .02) return 0
  const local = props.position % 1
  const phase = Math.sin(Math.PI * Math.max(0, Math.min(1, (local - cell.col * .045 - cell.row * .025) / .6)))
  return Math.max(0, phase) * travel.value * (cell.index % 4 === 0 ? .14 : .045)
}
</script>
<template>
  <div class="engineering-grid" :class="{ focused: !!focus, opening: opening && ready && !reduced }" aria-hidden="true" :data-grid-step="step">
    <div class="engineering-cells"><i v-for="cell in cells" :key="cell.index" :style="{ left: (xOffset + cell.col * step) + 'px', top: (yOffset + cell.row * step) + 'px', width: step + 'px', height: step + 'px', opacity: cellOpacity(cell), '--delay': (cell.col * 90 + cell.row * 55) + 'ms' }" /></div>
    <svg ref="svg">
      <defs><linearGradient id="grid-vertical" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" :y2="viewport.height"><stop offset="0" stop-color="#a5a5be" stop-opacity=".12"/><stop offset=".5" stop-color="#a5a5be" stop-opacity=".07"/><stop offset="1" stop-color="#a5a5be" stop-opacity=".10"/></linearGradient></defs>
      <line v-for="(line, i) in verticals" :key="'v'+i" class="grid-line vertical" :class="{ selected: line.active }" x1="0" x2="0" y1="0" :y2="viewport.height" :style="{ transform: `translateX(${line.value}px)` }" />
      <line v-for="(line, i) in horizontals" :key="'h'+i" class="grid-line horizontal" :class="{ selected: line.active }" x1="0" :x2="viewport.width" y1="0" y2="0" :style="{ transform: `translateY(${line.value}px)` }" />
    </svg>
  </div>
</template>
<style scoped>
.engineering-grid{position:absolute;inset:0;z-index:2;pointer-events:none;overflow:hidden}.engineering-grid svg{position:absolute;inset:0;width:100%;height:100%}.grid-line{stroke-width:1;vector-effect:non-scaling-stroke;transition:stroke .35s,stroke-opacity .35s}.vertical{stroke:url(#grid-vertical)}.horizontal{stroke:#a5a5be;stroke-opacity:.08}.grid-line.selected{stroke:#c4c5d0;stroke-opacity:.25}.engineering-cells{position:absolute;inset:0}.engineering-cells i{position:absolute;background:#606274}.opening .engineering-cells i{background:#070810;animation:grid-unveil .65s var(--delay) both}.opening .engineering-cells i:nth-child(7n){background:#232321}@keyframes grid-unveil{0%{opacity:1}100%{opacity:0}}@media(prefers-reduced-motion:reduce){.grid-line{transition:none}.engineering-cells{display:none}}
</style>
