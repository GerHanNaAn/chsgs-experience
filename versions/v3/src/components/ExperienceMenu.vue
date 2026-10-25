<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  stops: { type: Array, default: () => [] },
  activeIndex: { type: Number, default: 0 },
  reduced: { type: Boolean, default: false },
})
const emit = defineEmits(['close', 'select'])
const previewIndex = ref(null)
const preview = computed(() => props.stops[previewIndex.value ?? props.activeIndex] || props.stops[0])
watch(() => props.open, () => { previewIndex.value = null })

function select(stop, index) {
  emit('select', stop.index ?? index)
}
</script>

<template>
  <Transition name="experience-menu" :css="!reduced">
    <section
      v-if="open"
      class="experience-menu"
      :class="{ 'experience-menu--reduced': reduced }"
      role="dialog"
      aria-modal="true"
      aria-labelledby="experience-menu-title"
      data-experience-menu
    >
      <div class="experience-menu__shell">
        <button class="experience-menu__close" type="button" data-guide @click="emit('close')">
          <span>Закрыть</span><span class="experience-menu__close-line" aria-hidden="true"></span><span class="experience-menu__close-icon" aria-hidden="true"></span>
        </button>

        <aside v-if="preview" class="experience-menu__preview" aria-hidden="true">
          <p class="experience-menu__eyebrow">ЧСГС / Завод полного цикла</p>
          <div class="experience-menu__preview-index">{{ preview.number || String((preview.index ?? activeIndex) + 1).padStart(2, '0') }}</div>
          <div class="experience-menu__preview-caption">{{ preview.place || preview.short }}</div>
          <div class="experience-menu__route">
            <span
              v-for="(stop, index) in stops"
              :key="stop.id"
              class="experience-menu__route-point"
              :class="{ 'is-active': (previewIndex ?? activeIndex) === index, 'is-past': index < (previewIndex ?? activeIndex) }"
            >{{ stop.number || String(index + 1).padStart(2, '0') }}</span>
          </div>
        </aside>

        <nav class="experience-menu__navigation" aria-label="Разделы экскурсии">
          <h2 id="experience-menu-title">Маршрут по заводу</h2>
          <ol class="experience-menu__list">
            <li v-for="(stop, index) in stops" :key="stop.id" :style="{ '--entry-delay': `${100 + index * 38}ms` }">
              <button
                type="button"
                class="experience-menu__link"
                :class="{ 'is-current': (stop.index ?? index) === activeIndex }"
                :aria-current="(stop.index ?? index) === activeIndex ? 'location' : undefined"
                data-guide
                @click="select(stop, index)"
                @mouseenter="previewIndex = stop.index ?? index"
                @mouseleave="previewIndex = null"
                @focus="previewIndex = stop.index ?? index"
                @blur="previewIndex = null"
              >
                <span class="experience-menu__link-title">{{ stop.short || stop.title }}</span>
                <span class="experience-menu__link-marker" aria-hidden="true"></span>
                <span class="experience-menu__link-number">{{ stop.number || String(index + 1).padStart(2, '0') }}</span>
              </button>
            </li>
          </ol>
          <p class="experience-menu__note">Выберите раздел и продолжите экскурсию</p>
        </nav>

        <div class="experience-menu__footer"><span>ЧелябинскСпецГражданСтрой</span><span>Группа компаний «ЛД»</span></div>
      </div>
    </section>
  </Transition>
</template>

<style scoped>
.experience-menu { position: fixed; inset: 0; z-index: 40; color: #eef0ee; background: linear-gradient(90deg, #080b1338 5%, #080b1399 42%, #080b13ed 78%); font-family: 'Jura', sans-serif; }
.experience-menu__shell { position: relative; width: 1440px; height: 100%; margin: 0 auto; }
.experience-menu__close { position: absolute; top: 32px; right: 0; display: flex; align-items: center; gap: 20px; height: 50px; padding: 0 2px 0 15px; border: 0; background: transparent; color: #bbc1c8; font: 600 10px/1 'Jura', sans-serif; letter-spacing: 1.5px; text-transform: uppercase; cursor: pointer; transition: color .3s; }
.experience-menu__close-line { width: 38px; height: 1px; background: #666e78; }
.experience-menu__close-icon { position: relative; width: 20px; height: 20px; }
.experience-menu__close-icon::before, .experience-menu__close-icon::after { position: absolute; top: 9px; left: 1px; width: 19px; height: 1px; content: ''; background: currentColor; transform: rotate(45deg); }
.experience-menu__close-icon::after { transform: rotate(-45deg); }
.experience-menu__close:hover { color: #f1e620; }
.experience-menu__close:focus-visible { outline: 1px solid #f1e620; outline-offset: 4px; }
.experience-menu__preview { position: absolute; top: 365px; left: 0; width: 370px; }
.experience-menu__eyebrow { margin: 0 0 32px; color: #8f98a2; font-size: 10px; font-weight: 600; line-height: 1.5; letter-spacing: 1.7px; text-transform: uppercase; }
.experience-menu__preview-index { margin-bottom: 20px; color: #e8df24; font-size: 72px; font-weight: 300; line-height: 1; letter-spacing: -2px; font-variant-numeric: tabular-nums; }
.experience-menu__preview-caption { max-width: 325px; color: #c5cbd0; font-size: 26px; font-weight: 400; line-height: 1.3; }
.experience-menu__route { display: flex; width: 324px; margin-top: 48px; border-top: 1px solid #58617266; }
.experience-menu__route-point { position: relative; flex: 1; padding-top: 18px; color: #5c6673; font-size: 9px; font-weight: 600; font-variant-numeric: tabular-nums; transition: color .3s; }
.experience-menu__route-point::before { position: absolute; top: -3px; left: 2px; width: 5px; height: 5px; content: ''; background: #48515e; transition: background .3s; }
.experience-menu__route-point.is-past { color: #8a929c; }
.experience-menu__route-point.is-active { color: #ede421; }
.experience-menu__route-point.is-active::before { background: #ede421; }
.experience-menu__navigation { position: absolute; top: 215px; left: 760px; width: 590px; }
.experience-menu__navigation h2 { margin: 0 0 28px; color: #78828e; font-size: 10px; font-weight: 600; line-height: 1.5; letter-spacing: 1.9px; text-transform: uppercase; }
.experience-menu__list { margin: 0; padding: 0; list-style: none; }
.experience-menu__link { position: relative; display: flex; align-items: center; gap: 23px; width: 100%; min-height: 69px; padding: 14px 0; border: 0; border-radius: 0; background: transparent; color: #747e8a; text-align: left; font-family: inherit; cursor: pointer; transition: color .4s; }
.experience-menu__link-title { flex: 1; font-size: 27px; font-weight: 400; line-height: 1.3; letter-spacing: 1.3px; text-transform: uppercase; text-wrap: balance; }
.experience-menu__link-number { min-width: 24px; color: #d6cf25; font-size: 10px; line-height: 1.5; letter-spacing: 1px; font-variant-numeric: tabular-nums; opacity: .55; transition: opacity .4s; }
.experience-menu__link-marker { width: 26px; height: 1px; background: #e8df27; opacity: 0; transform: scaleX(.2); transform-origin: right; transition: opacity .4s, transform .5s cubic-bezier(.22, 1, .36, 1); }
.experience-menu__link:hover, .experience-menu__link:focus-visible, .experience-menu__link.is-current { color: #f0f1ed; }
.experience-menu__link:hover .experience-menu__link-marker, .experience-menu__link:focus-visible .experience-menu__link-marker, .experience-menu__link.is-current .experience-menu__link-marker { opacity: 1; transform: scaleX(1); }
.experience-menu__link:hover .experience-menu__link-number, .experience-menu__link:focus-visible .experience-menu__link-number, .experience-menu__link.is-current .experience-menu__link-number { opacity: 1; }
.experience-menu__link:focus-visible { outline: 1px solid #ded720; outline-offset: 4px; }
.experience-menu__note { margin: 32px 0 0; color: #5f6975; font-family: Arial, sans-serif; font-size: 11px; line-height: 1.5; }
.experience-menu__footer { position: absolute; right: 0; bottom: 48px; left: 0; display: flex; justify-content: space-between; color: #65707b; font-size: 9px; line-height: 1.5; letter-spacing: 1.2px; text-transform: uppercase; }
.experience-menu-enter-active { transition: opacity .55s; }
.experience-menu-leave-active { transition: opacity .35s; }
.experience-menu-enter-from, .experience-menu-leave-to { opacity: 0; }
.experience-menu__list li { clip-path: inset(0); }
.experience-menu-enter-active .experience-menu__list li { transition: opacity .7s, clip-path .85s cubic-bezier(.22, 1, .36, 1); transition-delay: var(--entry-delay); }
.experience-menu-enter-from .experience-menu__list li { opacity: 0; clip-path: inset(0 100% 0 0); }
.experience-menu-enter-active .experience-menu__preview { transition: opacity .7s .15s, transform .8s .15s; }
.experience-menu-enter-from .experience-menu__preview { opacity: 0; transform: translateY(10px); }
.experience-menu--reduced *, .experience-menu--reduced *::before { transition: none !important; }
@media (prefers-reduced-motion: reduce) { .experience-menu, .experience-menu *, .experience-menu *::before { transition: none !important; } }
</style>
