<script setup>
import { ref } from 'vue'
import { useMachineViewport } from '../composables/useMachineViewport.js'
import { buildPress } from '../three/press/buildPress.js'
import { smooth } from '../data/route.js'
import MachineStatus from '../components/MachineStatus.vue'
const props = defineProps({ active: Boolean, position: Number, reduced: Boolean })
const host = ref(null)
const { failed, status } = useMachineViewport(host, props, {
  build: buildPress, animate: false, label: 'Формовочный пресс: подача трубной заготовки, сжатие в шаровую форму и раскрытие пресса.',
  cameraPose(position) { const t = smooth(4.2, 4.65, position); return { eye: [12 - t * 2.5, 8 - t * 2.5, 16 - t * 4], aim: [0, 3.3, 0] } },
  diagnostics(host, state) { host.dataset.form = state.form.toFixed(3); host.dataset.head = state.headY.toFixed(3); host.dataset.insertion = state.insertion.toFixed(3); host.dataset.phase = state.label },
})
</script>
<template><section class="scene-root press-scene"><div ref="host" class="scene-canvas" /><MachineStatus :status="status" :hint="position > 5.7 ? 'ДАЛЬШЕ — ВЫХОД ИЗ ПРОИЗВОДСТВА' : 'ПРОКРУТКА УПРАВЛЯЕТ ПРЕССОМ'" /><p v-if="failed" class="scene-loading">3D недоступно · формовка</p></section></template>
