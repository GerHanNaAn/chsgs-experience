<script setup>
import { computed } from 'vue'
import { activeDepartment, stations, galleryStart, galleryStep, clamp } from '../data/route.js'
import { products } from '../data/products.js'
const props = defineProps({ position: Number, chapter: String })
defineEmits(['navigate'])
const department = computed(() => activeDepartment(props.position))
const selected = computed(() => Math.round(clamp((props.position - galleryStart) / galleryStep, 0, products.length - 1)))
const items = computed(() => department.value === 'production' ? stations : department.value === 'products' ? products.map((product, i) => ({
  id: product.id,
  label: product.navLabel || product.label,
  position: galleryStart + i * galleryStep,
})) : [])
const current = computed(() => department.value === 'production' ? props.chapter : products[selected.value]?.id)
</script>
<template>
  <nav v-if="items.length" class="section-navigation" :aria-label="department === 'production' ? 'Станки производства' : 'Виды продукции'">
    <button v-for="item in items" :key="item.id" :aria-current="current === item.id ? 'step' : undefined" @click="$emit('navigate', item.position)"><i />{{ item.label }}</button>
  </nav>
</template>
<style scoped>
.section-navigation{position:absolute;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:25px;padding:15px 22px;background:#080d16dc;border:1px solid #52667a45;white-space:nowrap;backdrop-filter:blur(10px)}.section-navigation button{display:flex;align-items:center;gap:8px;font-size:11px;line-height:1.4;color:#9aaabe;transition:color .2s}.section-navigation i{width:4px;height:4px;background:#5c7086}.section-navigation button:hover,.section-navigation [aria-current]{color:var(--accent)}.section-navigation [aria-current] i{background:var(--accent)}
</style>
