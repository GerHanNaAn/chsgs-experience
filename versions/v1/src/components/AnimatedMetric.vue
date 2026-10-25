<script setup>defineProps({ value: String, prefix: String, suffix: String, label: String, delay: Number })</script>
<template><div class="metric" :style="{ '--delay': (delay || 0) + 'ms' }"><div><small v-if="prefix">{{ prefix }}</small><strong>{{ value }}</strong><small v-if="suffix">{{ suffix }}</small></div><p>{{ label }}</p></div></template>
<style scoped>
.metric{min-width:145px}
.metric{animation:metric-in .85s both;animation-delay:var(--delay)}.metric>div{display:flex;align-items:baseline;gap:9px}.metric strong{font-size:43px;font-weight:400;letter-spacing:-.055em;white-space:nowrap}.metric small{font-size:18px;color:var(--accent)}.metric p{color:var(--muted);font-size:10px;margin-top:12px;white-space:nowrap}@keyframes metric-in{from{opacity:0;transform:translateY(22px);filter:blur(5px)}to{opacity:1;transform:translateY(0);filter:blur(0)}}@media(prefers-reduced-motion:reduce){.metric{animation:none}}
</style>
