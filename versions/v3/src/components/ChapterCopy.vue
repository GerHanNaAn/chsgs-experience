<script setup>
import { computed } from 'vue'

const props = defineProps({
  stop: { type: Object, required: true },
  opacity: { type: Number, default: 1 },
  reduced: { type: Boolean, default: false },
})
const emit = defineEmits(['start', 'watch'])

const isEntrance = computed(() => props.stop.index === 0 || props.stop.id === 'entrance')
const isFilm = computed(() => props.stop.id === 'film')
const isClients = computed(() => props.stop.id === 'clients')
const titleLines = computed(() => {
  if (props.stop.titleLines) return props.stop.titleLines
  if (isEntrance.value && props.stop.title === 'ЧелябинскСпецГражданСтрой') {
    return ['Челябинск', 'СпецГражданСтрой']
  }
  return String(props.stop.title || '').split('\n')
})
const highlights = computed(() => (props.stop.highlights || []).slice(0, 3))
const isVisible = computed(() => props.opacity > 0.04)
</script>

<template>
  <article
    class="chapter-copy"
    :class="{ 'chapter-copy--hero': isEntrance, 'chapter-copy--reduced': reduced }"
    :style="{ opacity: Math.max(0, Math.min(1, opacity)), pointerEvents: isVisible ? 'auto' : 'none' }"
    :aria-hidden="!isVisible"
    :inert="!isVisible || undefined"
  >
    <div class="chapter-copy__eyebrow">
      <span class="chapter-copy__number">{{ stop.number || String(stop.index + 1).padStart(2, '0') }}</span>
      <span class="chapter-copy__dash" aria-hidden="true"></span>
      <span>{{ stop.chapter || stop.short }}</span>
    </div>

    <component :is="isEntrance ? 'h1' : 'h2'" class="chapter-copy__title">
      <span v-for="(line, index) in titleLines" :key="index" class="chapter-copy__title-line">{{ line }}</span>
    </component>

    <div class="chapter-copy__rule" aria-hidden="true"><span></span></div>
    <p class="chapter-copy__body">{{ stop.body }}</p>

    <dl v-if="highlights.length" class="chapter-copy__facts" :class="{ 'chapter-copy__facts--single': highlights.length === 1 }">
      <div v-for="fact in highlights" :key="fact.label" class="chapter-copy__fact">
        <dt>{{ fact.label }}</dt>
        <dd>{{ fact.value }}</dd>
      </div>
    </dl>

    <button v-if="isEntrance" class="chapter-copy__action" data-guide type="button" @click="emit('start')">
      <span>Пройти по заводу</span><span class="chapter-copy__arrow" aria-hidden="true">↗</span>
    </button>
    <button v-else-if="isFilm" class="chapter-copy__action chapter-copy__action--film" data-guide type="button" @click="emit('watch')">
      <span class="chapter-copy__play" aria-hidden="true">▷</span><span>Смотреть фильм</span><span class="chapter-copy__arrow" aria-hidden="true">↗</span>
    </button>
    <a
      v-else-if="isClients && (stop.catalogUrl || stop.sourceUrl)"
      class="chapter-copy__action"
      data-guide
      :href="stop.catalogUrl || stop.sourceUrl"
      target="_blank"
      rel="noopener noreferrer"
    ><span>{{ stop.catalogUrl ? 'Продукция завода' : 'Подробнее о ЧСГС' }}</span><span class="chapter-copy__arrow" aria-hidden="true">↗</span><span class="chapter-copy__sr"> (откроется в новой вкладке)</span></a>
  </article>
</template>

<style scoped>
.chapter-copy {
  width: 530px;
  color: #edf0ef;
  font-family: 'Jura', sans-serif;
  will-change: opacity;
}
.chapter-copy__eyebrow { display: flex; align-items: center; gap: 14px; min-height: 16px; margin-bottom: 30px; color: #91979e; font-size: 11px; font-weight: 600; letter-spacing: 1.7px; line-height: 1.5; text-transform: uppercase; }
.chapter-copy__number { color: #f1e719; font-variant-numeric: tabular-nums; }
.chapter-copy__dash { width: 27px; height: 1px; background: #59616c; }
.chapter-copy__title { margin: 0; font-size: 45px; font-weight: 400; line-height: 1.17; letter-spacing: -1.1px; text-transform: uppercase; text-wrap: balance; }
.chapter-copy__title-line { display: block; }
.chapter-copy--hero .chapter-copy__title { font-size: 52px; line-height: 1.18; letter-spacing: -1.5px; text-transform: none; }
.chapter-copy__rule { width: 100%; height: 1px; margin: 28px 0 25px; background: linear-gradient(90deg, #4c515c66, transparent 90%); }
.chapter-copy__rule span { display: block; width: 42px; height: 2px; background: #f1e719; }
.chapter-copy__body { max-width: 475px; margin: 0; color: #b3b9c0; font-family: Inter, Arial, sans-serif; font-size: 15px; font-weight: 400; line-height: 1.8; text-wrap: pretty; }
.chapter-copy__facts { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 21px; margin: 31px 0 0; padding: 0; }
.chapter-copy__facts--single { grid-template-columns: 230px; }
.chapter-copy__fact { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; min-width: 0; }
.chapter-copy__fact dt { order: 2; max-width: 145px; color: #8f979f; font-family: Arial, sans-serif; font-size: 11px; line-height: 1.5; }
.chapter-copy__fact dd { order: 1; margin: 0; color: #e8ebe9; font-size: 31px; font-weight: 400; line-height: 1.15; white-space: nowrap; }
.chapter-copy__action { display: inline-flex; align-items: center; justify-content: space-between; gap: 30px; min-width: 228px; height: 54px; margin-top: 32px; padding: 0 18px; border: 1px solid #6d727a70; border-radius: 0; background: #090c14a6; color: #e9eced; font: 600 11px/1 'Jura', sans-serif; letter-spacing: 1.2px; text-decoration: none; text-transform: uppercase; cursor: pointer; transition: color .3s, border-color .3s, background .3s; }
.chapter-copy__action:hover { color: #f5ed1e; border-color: #e3dd2366; background: #1c1e16a6; }
.chapter-copy__action:focus-visible { outline: 1px solid #f1e719; outline-offset: 5px; }
.chapter-copy__arrow { color: #f1e719; font: 25px/1 Arial, sans-serif; }
.chapter-copy__action--film { gap: 17px; }
.chapter-copy__action--film .chapter-copy__arrow { margin-left: 16px; }
.chapter-copy__play { color: #f1e719; font: 26px/1 Arial, sans-serif; }
.chapter-copy__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.chapter-copy--reduced { will-change: auto; }
.chapter-copy--reduced .chapter-copy__action { transition: none; }
@media (prefers-reduced-motion: reduce) { .chapter-copy { will-change: auto; } .chapter-copy__action { transition: none; } }
</style>
