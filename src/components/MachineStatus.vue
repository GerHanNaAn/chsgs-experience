<script setup>defineProps({ status: String, hint: String })</script>
<template><div class="machine-status"><i /><span>{{ status }}</span><small>{{ hint || 'ПРОДОЛЖАЙТЕ ПРОКРУТКУ' }}</small></div></template>
<style scoped>
.machine-status{position:absolute;right:64px;bottom:180px;display:flex;gap:15px;align-items:center;font-size:9px;letter-spacing:.13em;color:#c3d0db}.machine-status i{width:5px;height:5px;background:var(--accent)}.machine-status small{margin-left:25px;font-size:8px;color:var(--muted)}
</style>
