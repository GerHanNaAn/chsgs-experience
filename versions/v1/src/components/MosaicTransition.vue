<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'
const props = defineProps({ trigger: Number })
const running = ref(false)
let timer
watch(() => props.trigger, () => { clearTimeout(timer); running.value = true; timer = setTimeout(() => { running.value = false }, 850) })
onBeforeUnmount(() => clearTimeout(timer))
</script>
<template><div v-if="running" :key="trigger" class="mosaic" aria-hidden="true"><i v-for="i in 240" :key="i" :style="{ '--delay': ((i % 20) * 9 + Math.floor(i / 20) * 6) + 'ms' }" /></div></template>
<style scoped>
.mosaic{position:fixed;inset:0;display:grid;grid-template-columns:repeat(20,1fr);grid-template-rows:repeat(12,1fr);z-index:100;pointer-events:none}.mosaic i{background:#101a27;border:1px solid #43546940;opacity:0;animation:mosaic .5s var(--delay) both}.mosaic i:nth-child(31n){background:#c0b71999}@keyframes mosaic{0%{opacity:0;transform:scale(.3)}35%,55%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(.97)}}@media(prefers-reduced-motion:reduce){.mosaic{display:none}}
</style>
