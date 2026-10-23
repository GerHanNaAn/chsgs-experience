<script setup>
import { ref } from 'vue'
import { useMachineViewport } from '../composables/useMachineViewport.js'
import { buildCnc } from '../three/cnc/buildCnc.js'
import { smooth } from '../data/route.js'
import MachineStatus from '../components/MachineStatus.vue'
const props = defineProps({ active: Boolean, position: Number, reduced: Boolean })
const host = ref(null)
const { failed, status } = useMachineViewport(host, props, {
  build: buildCnc, animate: true, label: 'Пятиосевой станок с ЧПУ: корпус открывается, видны поворотный стол, наклонная головка и обработка заготовки.',
  cameraPose(position) { const t = smooth(3.05, 3.55, position); return { eye: [10 - t * 5.5, 7 - t * 2.7, 14 - t * 7.2], aim: [0, 2.9 + t * .4, 0] } },
  diagnostics(host, state) { host.dataset.inside = state.inside.toFixed(3); host.dataset.door = state.door.toFixed(3); host.dataset.toolRotation = state.toolRotation.toFixed(2) },
})
</script>
<template><section class="scene-root cnc-scene"><div ref="host" class="scene-canvas" /><MachineStatus :status="status" :hint="position < 3.3 ? 'ЕЩЁ СКРОЛЛ — ВНУТРЬ СТАНКА' : 'ДАЛЬШЕ — ФОРМОВОЧНЫЙ ПРЕСС'" /><p v-if="failed" class="scene-loading">3D недоступно · обработка с ЧПУ</p></section></template>
