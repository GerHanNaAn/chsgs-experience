<script setup>
defineProps({ content: Object })
</script>
<template>
  <div class="section-copy">
    <p>{{ content.body }}</p>
    <dl v-if="content.highlights.length" :style="{ '--columns': content.highlights.length }">
      <div v-for="item in content.highlights" :key="item.label"><dt>{{ item.label }}</dt><dd>{{ item.value }}</dd></div>
    </dl>
  </div>
</template>
<style scoped>
.section-copy{margin-top:26px;max-width:520px}.section-copy p{font-size:15px;line-height:1.8;color:#b8b8c4;margin:0;text-wrap:pretty}.section-copy dl{display:grid;grid-template-columns:repeat(var(--columns),minmax(0,1fr));gap:24px;margin:27px 0 0;padding:20px 0 0;border-top:1px solid #83839830}.section-copy dl>div{display:flex;flex-direction:column-reverse;gap:9px}.section-copy dd{font-family:Jura,Inter,sans-serif;font-size:32px;line-height:1.1;color:#fff000;margin:0;white-space:nowrap}.section-copy dt{font-size:11px;line-height:1.6;color:#9696a7;max-width:150px}
</style>
