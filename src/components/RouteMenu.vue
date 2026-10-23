<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { departments } from '../data/route.js'
defineProps({ current: String })
const emit = defineEmits(['select', 'close'])
const element = ref(null)
let focused
function key(event) {
  if (event.key === 'Escape') emit('close')
  if (event.key === 'Tab') {
    const controls = [...element.value.querySelectorAll('button,a')], first = controls[0], last = controls.at(-1)
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
  }
}
onMounted(() => { focused = document.activeElement; element.value.querySelector('button').focus(); document.addEventListener('keydown', key) })
onBeforeUnmount(() => { document.removeEventListener('keydown', key); focused?.focus({ preventScroll: true }) })
</script>
<template><div id="route-menu" ref="element" class="route-menu" role="dialog" aria-modal="true" aria-label="Навигация по заводу"><div class="menu-intro"><span class="eyebrow">ВЫБЕРИТЕ ОТДЕЛ ЗАВОДА</span><p>Завод.<br>Изнутри.</p><small>Продолжайте прокрутку<br>или переходите прямо к интересующему отделу.</small><button class="text-link" @click="emit('close')">Вернуться к экскурсии ↗</button></div><nav aria-label="Отделы завода в меню"><button v-for="item in departments" :key="item.id" :aria-current="current === item.id ? 'location' : undefined" @click="emit('select', item.position)"><strong>{{ item.label }}</strong><i>↗</i></button></nav><a class="menu-source" href="https://xn--d1an.xn--p1ai/info_ld_plants/chsgs/" target="_blank" rel="noreferrer">ЧСГС на сайте ЛД ↗</a></div></template>
<style scoped>
.route-menu{position:fixed;inset:0;z-index:40;background:#080d16f8;display:grid;grid-template-columns:38% 62%;padding:250px 130px 180px 140px;gap:10px;backdrop-filter:blur(12px)}.menu-intro p{font-size:96px;line-height:1.05;letter-spacing:-.065em;margin:48px 0 30px}.menu-intro small{font-size:15px;line-height:1.8;color:var(--muted)}.menu-intro button{display:block;margin-top:45px;font-size:12px}.route-menu nav{padding-top:16px}.route-menu nav button{display:flex;align-items:center;width:100%;gap:40px;padding:38px 18px;border-bottom:1px solid #283546;text-align:left}.route-menu nav span{font-size:11px;color:var(--muted)}.route-menu nav strong{font-size:52px;font-weight:400;letter-spacing:-.04em;transition:transform .3s}.route-menu nav i{font-size:35px;font-style:normal;margin-left:auto;font-weight:300;color:var(--accent)}.route-menu nav button:hover strong{transform:translateX(15px)}.route-menu nav [aria-current]{color:var(--accent)}.menu-source{position:absolute;right:140px;bottom:80px;font-size:12px;color:var(--muted)}
</style>
