<script setup>
import { computed } from 'vue'
import { galleryStart, galleryExit } from '../data/route.js'
const props = defineProps({ chapter: Object, position: Number })
defineEmits(['start'])
const copy = computed(() => {
  const records = {
    stock: { title: ['МАТЕРИАЛ.', 'В ДВИЖЕНИИ.'], text: ['Трубы и заготовки.', 'От разгрузки — к производству.'] },
    laser: { title: ['ТОЧНОСТЬ.', 'С ПЕРВОГО', 'ДВИЖЕНИЯ.'], text: ['Контур будущей детали', 'рождается в листе металла.'] },
    cnc: props.position < 3.35 ? { title: ['ПЯТЬ ОСЕЙ.', 'ОДНА ДЕТАЛЬ.'], text: ['Следующий шаг — ближе', 'к процессу обработки.'] } : { title: ['ОБРАБОТКА.', 'ИЗНУТРИ.'], text: ['Инструмент и заготовка', 'двигаются навстречу точной форме.'] },
    press: { title: ['ФОРМА.', 'ПОД ДАВЛЕНИЕМ.'], text: ['Заготовка меняется шаг за шагом.', 'Продолжайте прокрутку.'] },
    products: props.position >= galleryExit ? { title: ['МАТЕРИАЛ.', 'ОСНОВА ВСЕГО.'], text: ['Продолжаем маршрут.', 'Дальше — склад металла и труб.'] } : { title: ['ГОТОВЫЕ', 'РЕШЕНИЯ.'], text: ['Заходим на склад.', 'Продукция выстроится вокруг вас.'] },
  }
  return records[props.chapter.id]
})
</script>
<template><section v-if="position < galleryStart-.15 || position >= galleryExit" :key="chapter.id + (chapter.id === 'cnc' && position > 3.35 ? '-inside' : '')" class="chapter-copy" :class="['copy-'+chapter.id,{ 'factory-intro': chapter.id === 'factory' }]" :aria-label="chapter.label">
  <div class="eyebrow"><span>{{ chapter.number }} /</span> {{ chapter.eyebrow }}</div>
  <template v-if="chapter.id === 'factory'"><h1>Челябинск<wbr>СпецГражданСтрой</h1><p>Выберите участок на карте<br>или прокрутите вниз.</p><button class="action-button grid-button" @click="$emit('start')">Начать экскурсию <span>↓</span></button></template>
  <template v-else><h1><template v-for="(line, i) in copy.title" :key="line"><br v-if="i" />{{ line }}</template></h1><p><template v-for="(line, i) in copy.text" :key="line"><br v-if="i" />{{ line }}</template></p></template>
</section></template>
<style scoped>
.chapter-copy{animation:copy-reveal .5s both}.factory-intro{top:260px;width:600px}.factory-intro h1{font-size:53px;line-height:1.2;letter-spacing:-.055em;text-transform:none;overflow-wrap:normal}.copy-cnc,.copy-press{top:260px;width:570px}.copy-cnc h1{font-size:67px}.copy-press h1{font-size:63px}.copy-stock{top:250px;width:520px}.copy-stock h1{font-size:69px}.factory-intro .action-button{margin-top:32px}@keyframes copy-reveal{from{opacity:0;transform:translateY(18px);filter:blur(3px)}to{opacity:1;transform:translateY(0);filter:blur(0)}}
</style>
