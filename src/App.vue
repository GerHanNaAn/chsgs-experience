<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import BlockoutScene from './scenes/BlockoutScene.vue'
import EngineeringGrid from './components/EngineeringGrid.vue'
import EngineeringHeading from './components/EngineeringHeading.vue'
import { useBlockoutRoute } from './composables/useBlockoutRoute.js'
import { blockoutSections, blockoutEnd, overviewMetrics, captionOpacity, scrollScreens, blockoutIndex } from './data/blockout.js'
import { assetUrl } from './three/runtime/assetUrl.js'

const { position, reduced, goTo } = useBlockoutRoute()
const ready = ref(false), failed = ref(false), menu = ref(false), menuRoot = ref(null), menuButton = ref(null)
const renderedPosition = ref(0), focusBounds = ref(null)
const visualPosition = computed(() => ready.value && !failed.value ? renderedPosition.value : position.value)
const index = computed(() => blockoutIndex(visualPosition.value))
const section = computed(() => blockoutSections[index.value])
const opacity = computed(() => reduced.value ? 1 : captionOpacity(visualPosition.value))
const traveling = computed(() => opacity.value < .25)
watch(traveling, moving => { if (moving) focusBounds.value = null })
function navigate(i) { menu.value = false; focusBounds.value = null; goTo(i) }
function focusControl(event) {
  const control = event.target.closest('button,a')
  if (!control || control.disabled) return
  const { left, right, top, bottom } = control.getBoundingClientRect()
  focusBounds.value = { left, right, top, bottom }
}
function blurControl(event) { if (!event.relatedTarget?.closest?.('button,a')) focusBounds.value = null }
let previousOverflow = ''
watch(menu, async open => {
  if (open) { previousOverflow = document.documentElement.style.overflow; document.documentElement.style.overflow = 'hidden'; await nextTick(); menuRoot.value?.querySelector('button')?.focus() }
  else { document.documentElement.style.overflow = previousOverflow; await nextTick(); menuButton.value?.focus({ preventScroll: true }) }
})
function key(event) {
  if (event.key === 'Escape' && menu.value) menu.value = false
  if (menu.value && event.key === 'Tab') {
    const buttons = [...menuRoot.value.querySelectorAll('button')], first = buttons[0], last = buttons.at(-1)
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
  }
}
onMounted(() => window.addEventListener('keydown', key))
onBeforeUnmount(() => { window.removeEventListener('keydown', key); if (menu.value) document.documentElement.style.overflow = previousOverflow })
</script>

<template>
  <div class="blockout-scroll" :style="{ height: `${(blockoutEnd * scrollScreens + 1) * 100}vh` }" aria-hidden="true" />
  <main class="blockout" :data-section="section.id" :data-position="position.toFixed(4)" :data-traveling="traveling" @pointerover="focusControl" @pointerout="blurControl" @focusin="focusControl" @focusout="blurControl" @pointerleave="focusBounds = null">
    <BlockoutScene :position="position" :reduced="reduced" :active="!menu" @ready="ready = true" @failed="failed = true" @progress="renderedPosition = $event" />
    <div class="blockout-shade" aria-hidden="true" />
    <EngineeringGrid :position="visualPosition" :focus="focusBounds" :ready="ready || failed" :reduced="reduced" />
    <div class="blockout-shell" :inert="menu || undefined">
      <header class="blockout-header">
        <button class="blockout-brand" aria-label="К главному въезду" @click="navigate(0)"><img :src="assetUrl('brand/ld-logo.svg')" alt="ЛД" /><span>ЧСГС<small>ЧЕЛЯБИНСКСПЕЦГРАЖДАНСТРОЙ</small></span></button>
        <span class="blockout-header-caption">ЗАВОД ПОЛНОГО ЦИКЛА</span>
        <button ref="menuButton" class="blockout-menu-button" :aria-expanded="menu" aria-controls="blockout-menu" @click="menu = true">Разделы <span class="menu-lines" aria-hidden="true"><i/><i/><i/></span></button>
      </header>
      <section class="blockout-copy" :class="{ 'blockout-intro': index === 0 }" :style="{ opacity }" :inert="traveling || undefined" :aria-labelledby="`heading-${section.id}`">
        <p class="blockout-kicker">ЧСГС / {{ section.short }}</p>
        <EngineeringHeading :id="`heading-${section.id}`" :key="section.id" :text="section.title" :intro="index === 0" />
        <template v-if="index === 0"><p class="blockout-lead">Системообразующий завод.<br>Производство стальных шаровых кранов.</p><button class="blockout-action" @click="navigate(1)">Пройти по территории <span>→</span></button></template>
        <a v-else-if="index === blockoutEnd" class="blockout-action" href="https://xn--d1an.xn--p1ai/catalog/" target="_blank" rel="noreferrer">Открыть каталог ЛД <span>↗</span></a>
        <span v-else class="blockout-section-rule" aria-hidden="true" />
      </section>
      <section v-if="index === 0" class="blockout-metrics" :style="{ opacity }" aria-labelledby="scale-title"><h2 id="scale-title">Масштаб завода в цифрах</h2><dl><div v-for="metric in overviewMetrics" :key="metric.label"><dt>{{ metric.label }}</dt><dd><small>{{ metric.prefix || '\u00a0' }}</small>{{ metric.value }}</dd></div></dl></section>
      <span v-if="!ready && !failed" class="blockout-loading" role="status">Подготавливаем территорию…</span>
      <p v-if="failed" class="blockout-fallback" role="status">3D недоступно в этом браузере.<br>Заголовки и переходы между разделами доступны.</p>
      <div class="blockout-location" :style="{ opacity }" aria-hidden="true"><span>{{ section.number }}</span>{{ section.place }}</div>
      <footer class="blockout-footer">
        <button class="blockout-scroll-cue" @click="navigate(index < blockoutEnd ? index + 1 : 0)"><span>{{ index < blockoutEnd ? '↓' : '↑' }}</span>{{ index < blockoutEnd ? 'Прокрутите, чтобы продолжить' : 'Вернуться к началу' }}</button>
        <nav class="blockout-stops" aria-label="Маршрут по заводу"><button v-for="item in blockoutSections" :key="item.id" :aria-label="`${item.number}. ${item.title}`" :title="item.short" :aria-current="index === item.index ? 'step' : undefined" @click="navigate(item.index)"><span>{{ item.number }}</span><i /></button></nav>
        <span class="blockout-footer-place">ЧЕЛЯБИНСК <i>↗</i></span>
      </footer>
    </div>
    <div class="blockout-counter" aria-hidden="true"><strong>{{ section.number }}</strong><span/><small>{{ String(blockoutSections.length).padStart(2,'0') }}</small></div>
    <div class="blockout-arrows" :inert="menu || undefined"><button :disabled="index === 0" aria-label="Предыдущий раздел" @click="navigate(index - 1)"><span>←</span></button><button :disabled="index === blockoutEnd" aria-label="Следующий раздел" @click="navigate(index + 1)"><span>→</span></button></div>
    <Transition name="blockout-menu"><div v-if="menu" id="blockout-menu" ref="menuRoot" class="blockout-route-menu" role="dialog" aria-modal="true" aria-label="Разделы экскурсии"><div class="blockout-menu-top"><span>ЧСГС / МАРШРУТ ПО ТЕРРИТОРИИ</span><button @click="menu = false">Закрыть <span>×</span></button></div><nav aria-label="Разделы ЧСГС"><button v-for="item in blockoutSections" :key="item.id" :aria-current="index === item.index ? 'location' : undefined" @click="navigate(item.index)"><span>{{ item.number }}</span><strong>{{ item.title }}</strong><i>↗</i></button></nav></div></Transition>
    <div class="blockout-progress" :style="{ transform: `scaleX(${position / blockoutEnd})` }" aria-hidden="true" />
  </main>
</template>
