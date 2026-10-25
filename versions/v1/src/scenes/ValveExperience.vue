<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { assetUrl } from '../three/runtime/assetUrl.js'
const emit = defineEmits(['close'])
const iframe = ref(null), root = ref(null), progress = ref(0), state = ref('loading'), locked = ref(false), opening = ref(0)
const chapters = ['Чертёж', 'Объём', 'Детали', 'Материалы', 'Сборка', 'Монтаж', 'Разрез', 'Вода', 'Открытие']
const stops = [.08, .37, .64, .77, 1, 1.64, 1.88, 1.94, 2.04]
const limits = [.19, .38, .65, .84, 1.05, 1.7, 1.9, 1.95]
const current = computed(() => { const index = limits.findIndex(v => progress.value < v); return index === -1 ? 8 : index })
let oldOverflow, oldFocus
function message(type, data = {}) { iframe.value?.contentWindow?.postMessage({ type, ...data }, location.origin) }
function receive(event) {
  if (event.origin !== location.origin || event.source !== iframe.value?.contentWindow) return
  if (event.data?.type === 'chsgs:state') { progress.value = event.data.progress; state.value = event.data.state; locked.value = event.data.locked; opening.value = event.data.opening }
  if (event.data?.type === 'chsgs:close') emit('close')
}
function key(event) { if (event.key === 'Escape') emit('close') }
function goTo(i) { message('chsgs:goto', { progress: stops[i] }); iframe.value?.focus() }
onMounted(() => { oldFocus = document.activeElement; oldOverflow = document.documentElement.style.overflow; document.documentElement.style.overflow = 'hidden'; window.addEventListener('message', receive); window.addEventListener('keydown', key); root.value.focus() })
onBeforeUnmount(() => { message('chsgs:active', { active: false }); document.documentElement.style.overflow = oldOverflow; window.removeEventListener('message', receive); window.removeEventListener('keydown', key); oldFocus?.focus({ preventScroll: true }) })
</script>
<template>
  <div ref="root" class="valve-experience" role="dialog" aria-modal="true" aria-label="Устройство шарового крана DN400" tabindex="-1">
    <iframe ref="iframe" :src="assetUrl('valve/index.html')" title="Интерактивное устройство крана DN400" @load="message('chsgs:active', { active: true })" />
    <header class="valve-header"><button class="text-link" @click="emit('close')"><span>↙</span> К выбору продукции</button><div>LD ENERGY <strong>DN400</strong><small>КШЦФР · ПП · PN25</small></div><button class="close-scene grid-button" aria-label="Закрыть сцену крана" @click="emit('close')">ЗАКРЫТЬ <span>×</span></button></header>
    <div class="valve-phase"><span class="eyebrow">УСТРОЙСТВО / {{ String(current + 1).padStart(2, '0') }}</span><h2>{{ chapters[current] }}</h2></div>
    <footer class="valve-controls"><p>{{ state === 'loading' ? 'Подготавливаем точную модель изделия' : locked ? 'Трубопровод заполняется водой…' : 'Прокручивайте, чтобы продолжить. Можно выбрать этап.' }}</p><nav aria-label="Этапы исследования крана"><button v-for="(chapter, i) in chapters" :key="chapter" :aria-current="i === current ? 'step' : undefined" :disabled="state !== 'ready' || locked" @click="goTo(i)"><span>{{ String(i + 1).padStart(2, '0') }}</span>{{ chapter }}</button></nav></footer>
    <div class="valve-progress" :style="{ transform: `scaleX(${progress / 2.04})` }" />
    <button v-if="progress > 2.025 && opening > .99" class="return-products action-button grid-button" @click="emit('close')">Вернуться ко всей продукции <span>↙</span></button>
  </div>
</template>
<style scoped>
.return-products{position:absolute;right:64px;bottom:210px;background:#080d16dc}.valve-experience{animation:detail-enter .65s both}@keyframes detail-enter{from{opacity:0;transform:translateY(80px)}to{opacity:1;transform:translateY(0)}}
.valve-experience{position:fixed;inset:0;z-index:80;background:var(--bg);outline:0}.valve-experience iframe{border:0;position:absolute;inset:0;width:100%;height:100%}.valve-header{position:absolute;top:0;left:64px;right:64px;height:105px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #62758b33}.valve-header>button{font-size:11px;letter-spacing:.08em}.valve-header>button>span{font-size:22px;margin-right:15px;color:var(--accent)}.valve-header>div{display:flex;align-items:baseline;gap:16px;font-size:10px;letter-spacing:.16em}.valve-header strong{font-size:25px;letter-spacing:0;font-weight:400}.valve-header small{font-size:9px;color:var(--muted)}.close-scene{padding:15px}.close-scene span{margin:0 0 0 20px!important}.valve-phase{position:absolute;left:64px;top:155px;pointer-events:none}.valve-phase h2{font-size:34px;font-weight:400;letter-spacing:-.04em;margin-top:22px}.valve-controls{position:absolute;bottom:42px;left:64px;right:64px}.valve-controls p{font-size:10px;letter-spacing:.03em;color:var(--muted);text-align:center;margin-bottom:25px}.valve-controls nav{display:flex;justify-content:center;gap:0}.valve-controls button{min-width:143px;text-align:left;border-top:1px solid #52667d65;padding:17px 14px;font-size:11px;transition:border-color .2s,color .2s}.valve-controls button span{display:block;font-size:8px;color:var(--muted);margin-bottom:10px}.valve-controls [aria-current]{border-color:var(--accent);color:var(--accent)}.valve-controls button:hover{border-color:var(--accent)}.valve-controls button:disabled{cursor:default;opacity:.5}.valve-progress{position:absolute;bottom:0;left:0;right:0;height:2px;background:var(--accent);transform-origin:left}
</style>
