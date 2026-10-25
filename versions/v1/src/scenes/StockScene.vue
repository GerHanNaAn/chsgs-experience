<script setup>
import { ref } from 'vue'
import { useMachineViewport } from '../composables/useMachineViewport.js'
import { buildStockyard } from '../three/stock/buildStockyard.js'
import { smooth } from '../data/route.js'
import MachineStatus from '../components/MachineStatus.vue'
const props = defineProps({ active: Boolean, position: Number, reduced: Boolean })
const host = ref(null)
const { failed, status } = useMachineViewport(host, props, {
  build: buildStockyard, animate: true, label: 'Склад металла: погрузчик забирает трубы с машины, проезжает через ворота и разгружает их в цехе.',
  cameraPose(position) { const t = smooth(11.3, 11.8, position); return { eye: [27 - t * 6, 20 - t * 7, 28 - t * 9], aim: [0, 1.5, -2 - t * 3] } },
  diagnostics(host, state) { host.dataset.phase = state.phase.toFixed(2); host.dataset.carrying = String(state.carrying); host.dataset.gate = state.gate.toFixed(3) },
})
</script>
<template><section class="scene-root stock-scene"><div ref="host" class="scene-canvas" /><MachineStatus :status="status" hint="ПРИЁМКА → СКЛАД → ПРОИЗВОДСТВО" /><p v-if="failed" class="scene-loading">3D недоступно · склад металла</p></section></template>
