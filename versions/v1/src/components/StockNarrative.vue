<script setup>
import { smooth } from '../data/route.js'
defineProps({ position: Number })
</script>
<template><aside class="stock-narrative" aria-label="От склада к производству">
  <p class="stock-note note-one" :style="{ opacity: smooth(11.05, 11.33, position), transform: `translateY(${(1-smooth(11.05,11.33,position))*24}px)` }"><span>ЗАПАС / УСТОЙЧИВОСТЬ</span>Запас металла помогает<br>сглаживать колебания<br>закупочных цен.</p>
  <p class="stock-note note-two" :style="{ opacity: smooth(11.45, 11.75, position), transform: `translateY(${(1-smooth(11.45,11.75,position))*24}px)` }"><span>МАТЕРИАЛ / В ДВИЖЕНИИ</span>От приёмки сырья —<br>к стабильному ритму<br>производства.</p>
</aside></template>
<style scoped>
.stock-narrative{position:absolute;inset:0;z-index:5;pointer-events:none}.stock-note{position:absolute;font-size:18px;line-height:1.6;letter-spacing:-.02em;padding:10px 0 0 20px;border-left:1px solid var(--accent);background:linear-gradient(90deg,#080d16c0,transparent)}.stock-note span{display:block;font-size:8px;letter-spacing:.16em;color:var(--accent);margin-bottom:17px}.note-one{left:64px;top:570px;width:350px}.note-two{right:70px;top:235px;width:265px}
</style>
