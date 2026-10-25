<script setup>
import { computed, ref, watch, onBeforeUnmount } from 'vue'
import { captionOpacity } from '../data/blockout.js'

const props = defineProps({ position: Number, focus: Object, ready: Boolean, reduced: Boolean })
const opening = ref(true)
let timer
watch(() => props.ready, ready => { if (ready) timer = setTimeout(() => { opening.value = false }, props.reduced ? 0 : 1400) }, { immediate: true })
onBeforeUnmount(() => clearTimeout(timer))
const step = 373, xOffset = 27, yOffset = -20
const travel = computed(() => 1 - captionOpacity(props.position))
const parallax = computed(() => props.reduced ? 0 : props.position * 17)
function fitLines(values, low, high) {
  if (!props.focus) return values.map(value => ({ value, active: false }))
  const center = (low + high) / 2
  let before = values.findLastIndex(value => value <= center)
  before = Math.max(0, Math.min(values.length - 2, before))
  return values.map((value, i) => ({ value: i === before ? low - 8 : i === before + 1 ? high + 8 : value, active: i === before || i === before + 1 }))
}
const verticals = computed(() => fitLines(Array.from({ length: 6 }, (_, i) => xOffset + i * step), props.focus?.left, props.focus?.right))
const horizontals = computed(() => fitLines(Array.from({ length: 5 }, (_, i) => yOffset + i * step - parallax.value), props.focus?.top, props.focus?.bottom))
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
    <svg viewBox="0 0 1920 1080" preserveAspectRatio="none">
      <defs><linearGradient id="grid-vertical" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="1080"><stop offset="0" stop-color="#a5a5be" stop-opacity=".12"/><stop offset=".5" stop-color="#a5a5be" stop-opacity=".07"/><stop offset="1" stop-color="#a5a5be" stop-opacity=".10"/></linearGradient></defs>
      <line v-for="(line, i) in verticals" :key="'v'+i" class="grid-line vertical" :class="{ selected: line.active }" x1="0" x2="0" y1="0" y2="1080" :style="{ transform: `translateX(${line.value}px)` }" />
      <line v-for="(line, i) in horizontals" :key="'h'+i" class="grid-line horizontal" :class="{ selected: line.active }" x1="0" x2="1920" y1="0" y2="0" :style="{ transform: `translateY(${line.value}px)` }" />
    </svg>
  </div>
</template>
<style scoped>
.engineering-grid{position:absolute;inset:0;z-index:2;pointer-events:none;overflow:hidden}.engineering-grid svg{position:absolute;inset:0;width:100%;height:100%}.grid-line{stroke-width:1;vector-effect:non-scaling-stroke;transition:transform .65s cubic-bezier(.2,.7,.15,1),stroke .35s}.vertical{stroke:url(#grid-vertical)}.horizontal{stroke:#a5a5be;stroke-opacity:.08}.grid-line.selected{stroke:#c4c5d0;stroke-opacity:.25}.engineering-cells{position:absolute;inset:0}.engineering-cells i{position:absolute;background:#606274}.opening .engineering-cells i{background:#070810;animation:grid-unveil .65s var(--delay) both}.opening .engineering-cells i:nth-child(7n){background:#232321}@keyframes grid-unveil{0%{opacity:1}100%{opacity:0}}@media(prefers-reduced-motion:reduce){.grid-line{transition:none}.engineering-cells{display:none}}
</style>
