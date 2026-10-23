<script setup>
import { computed } from 'vue'
import { departments, activeDepartment } from '../data/route.js'
const props = defineProps({ position: Number })
defineEmits(['navigate'])
const active = computed(() => activeDepartment(props.position))
</script>
<template><div class="department-navigation">
  <nav class="department-links" aria-label="Отделы завода"><button v-for="item in departments" :key="item.id" :aria-current="active === item.id ? 'location' : undefined" @click="$emit('navigate', item.position)">{{ item.label }}<i>{{ active === item.id ? '●' : '↗' }}</i></button></nav>
  <span class="current-location">{{ active === 'stock' ? 'ВЫ НА СКЛАДЕ МЕТАЛЛА' : active === 'products' ? 'ВЫ В РАЗДЕЛЕ ПРОДУКЦИИ' : 'ВЫ В ПРОИЗВОДСТВЕ' }}</span>
</div></template>
<style scoped>
.department-navigation{position:absolute;z-index:20;right:64px;top:123px;width:730px}.department-links{display:flex;gap:30px}.department-links button{display:flex;align-items:center;gap:15px;flex:1;border-bottom:1px solid #566d8159;padding:17px 0;font-size:13px;text-align:left;white-space:nowrap}.department-links i{margin-left:auto;font-size:13px;font-style:normal;color:var(--muted)}.department-links [aria-current]{border-color:var(--accent);color:var(--accent)}.department-links [aria-current] i{color:var(--accent);font-size:6px}.current-location{display:block;text-align:right;padding-top:18px;font-size:7px;letter-spacing:.14em;color:var(--muted)}
</style>
