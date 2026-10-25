<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({ ready: Boolean, reduced: Boolean })
const emit = defineEmits(['complete'])
const revealing = ref(false), settled = ref(false), fontsReady = ref(false)
const tiles = Array.from({ length: 240 }, (_, i) => {
  const x = i % 20, y = Math.floor(i / 20)
  const noise = ((i * 37 + 13) % 29) / 29
  return { delay: Math.round((x * .62 + y * .38) * 36 + noise * 170), accent: (i * 17 + 7) % 47 === 0 }
})
let minimumTimer, finishTimer, previousOverflow
watch(() => props.ready && fontsReady.value && (settled.value || props.reduced), (ready) => {
  if (!ready || revealing.value) return
  revealing.value = true
  finishTimer = setTimeout(() => emit('complete'), props.reduced ? 180 : 1600)
})
onMounted(async () => {
  previousOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  minimumTimer = setTimeout(() => { settled.value = true }, 1100)
  await document.fonts.ready
  fontsReady.value = true
})
onBeforeUnmount(() => {
  clearTimeout(minimumTimer); clearTimeout(finishTimer)
  document.body.style.overflow = previousOverflow
})
</script>

<template>
  <div class="opening-mosaic" :class="{ revealing }" role="status" aria-live="polite" aria-label="Подготавливаем экскурсию по заводу">
    <div class="opening-tiles" aria-hidden="true">
      <i v-for="(tile, i) in tiles" :key="i" :class="{ accent: tile.accent }" :style="{ '--delay': tile.delay + 'ms', '--pulse': (i % 11) * 160 + 'ms' }" />
    </div>
    <div class="opening-signature">
      <span class="opening-eyebrow">ГРУППА ЛД / ЧЕЛЯБИНСК</span>
      <strong>ЧСГС<span>↗</span></strong>
      <span class="opening-caption">ЗАВОД. ИЗНУТРИ.</span>
      <div class="opening-status"><i /><span>{{ ready ? 'ТЕРРИТОРИЯ ГОТОВА' : 'ПРОРИСОВЫВАЕМ ТЕРРИТОРИЮ' }}</span></div>
    </div>
    <span class="opening-coordinate" aria-hidden="true">01 / ВХОД В ПРОСТРАНСТВО</span>
  </div>
</template>

<style scoped>
.opening-mosaic{position:fixed;inset:0;z-index:150;isolation:isolate;color:#ecf1f4;cursor:wait}
.opening-tiles{position:absolute;inset:0;display:grid;grid-template-columns:repeat(20,1fr);grid-template-rows:repeat(12,1fr)}
.opening-tiles>i{position:relative;background:#080d16;border-right:1px solid #1d2c3c;border-bottom:1px solid #1d2c3c;transform-origin:center;will-change:opacity,transform}
.opening-tiles>i:after{content:'';position:absolute;inset:0;background:#263a50;opacity:0;animation:tile-breathe 2.8s var(--pulse) infinite}
.opening-tiles>.accent:after{background:#ffea00;animation:accent-breathe 3s var(--pulse) infinite}
.opening-signature{position:absolute;left:50%;top:48%;transform:translate(-50%,-50%);width:600px;text-align:center;transition:opacity .3s,filter .3s}
.opening-eyebrow{font-size:10px;letter-spacing:.28em;color:#8f9eaf}
.opening-signature strong{display:block;margin:28px 0 17px;font-size:126px;line-height:1;letter-spacing:-.08em;font-weight:400}
.opening-signature strong>span{display:inline-block;color:#ffea00;font-size:68px;vertical-align:top;margin:5px 0 0 22px;letter-spacing:0}
.opening-caption{font-size:13px;letter-spacing:.42em;color:#d4dde7}
.opening-status{margin-top:70px;display:flex;justify-content:center;align-items:center;gap:13px;font-size:9px;letter-spacing:.16em;color:#8f9eaf}
.opening-status>i{width:5px;height:5px;background:#ffea00;animation:status-breathe 1s infinite alternate}
.opening-coordinate{position:absolute;bottom:44px;left:64px;color:#607186;font-size:9px;letter-spacing:.18em;transition:opacity .2s}
.revealing{cursor:default;pointer-events:none}.revealing .opening-signature{opacity:0;filter:blur(5px)}.revealing .opening-coordinate{opacity:0}
.revealing .opening-tiles>i{animation:tile-open .65s calc(120ms + var(--delay)) cubic-bezier(.25,.7,.25,1) both}
.revealing .opening-tiles>i:after{animation:none;opacity:0}
@keyframes tile-open{0%{opacity:1;transform:scale(1)}45%{opacity:.85}100%{opacity:0;transform:scale(.12)}}
@keyframes tile-breathe{0%,100%{opacity:0}50%{opacity:.22}}
@keyframes accent-breathe{0%,100%{opacity:.03}50%{opacity:.25}}
@keyframes status-breathe{to{opacity:.25}}
@media(prefers-reduced-motion:reduce){.opening-tiles>i:after,.opening-status>i{animation:none}.revealing .opening-tiles>i{animation:none;opacity:0}.opening-signature,.opening-coordinate{transition:opacity .15s}}
</style>
