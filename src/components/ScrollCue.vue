<script setup>defineProps({ label: { type: String, default: 'ПРОКРУТИТЕ, ЧТОБЫ ИССЛЕДОВАТЬ' } }); defineEmits(['next'])</script>
<template><button class="scroll-cue" @click="$emit('next')"><span class="arrow"><i /></span><span>{{ label }}</span></button></template>
<style scoped>
.scroll-cue{display:flex;gap:20px;align-items:center;font-size:9px;letter-spacing:.15em;color:var(--accent);padding:15px 0}.arrow{height:46px;width:28px;position:relative;overflow:hidden}.arrow i{position:absolute;width:1px;height:28px;background:var(--accent);left:13px;top:1px;animation:discover 2s infinite ease-in-out}.arrow i:after,.arrow i:before{content:'';height:8px;width:1px;position:absolute;background:var(--accent);bottom:0;transform-origin:bottom}.arrow i:before{transform:rotate(45deg)}.arrow i:after{transform:rotate(-45deg)}@keyframes discover{0%,100%{transform:translateY(0);opacity:.6}60%{transform:translateY(10px);opacity:1}}@media(prefers-reduced-motion:reduce){.arrow i{animation:none}}
</style>
