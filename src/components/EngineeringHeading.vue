<script setup>
import { computed } from 'vue'
const props = defineProps({ text: String, intro: Boolean, id: String })
const words = computed(() => {
  let count = 0
  const source = props.intro ? ['Челябинск', 'СпецГражданСтрой'] : props.text.split(' ')
  return source.map(word => [...word].map(char => ({ char, delay: Math.min(count++ * 9, 340) })))
})
</script>
<template>
  <h1 :id="id" class="engineering-heading" :class="{ 'intro-heading': intro }" :aria-label="text"><template v-for="(word, i) in words" :key="i"><br v-if="intro && i"/><span v-else-if="i" aria-hidden="true">{{ ' ' }}</span><span class="heading-word" aria-hidden="true"><span v-for="(letter, j) in word" :key="j" class="heading-letter" :style="{ '--delay': letter.delay + 'ms' }">{{ letter.char }}</span></span></template></h1>
</template>
<style scoped>
.engineering-heading{font-family:Jura,Inter,sans-serif;font-weight:400;text-transform:uppercase;font-size:43px;line-height:1.35;letter-spacing:.045em;margin:0;min-height:120px}.heading-word{display:inline-block;white-space:nowrap}.heading-letter{display:inline-block;animation:letter-resolve .65s var(--delay) both}.intro-heading{font-size:43px;letter-spacing:.055em;line-height:1.5;min-height:129px}@keyframes letter-resolve{0%{opacity:0;transform:translateY(12px);filter:blur(3px)}35%{opacity:.35;transform:translateY(-2px)}100%{opacity:1;transform:translateY(0);filter:blur(0)}}@media(prefers-reduced-motion:reduce){.heading-letter{animation:none}}
</style>
