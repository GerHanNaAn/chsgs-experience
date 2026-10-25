<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as T from 'three'
import { createViewport } from '../three/runtime/createViewport.js'
import { buildLaser } from '../three/laser/buildLaser.js'
const props = defineProps({ active: Boolean, reduced: Boolean })
const host = ref(null), status = ref('ЛАЗЕРНАЯ РЕЗКА'), failed = ref(false), sparkCount = ref(0)
let viewport, time = 0
onMounted(() => {
  const scene = new T.Scene(), camera = new T.PerspectiveCamera(36, 1, .1, 100)
  camera.position.set(10, 10, 12); camera.lookAt(0, 1, 0)
  const laser = buildLaser(); scene.add(laser.root)
  const floor = new T.GridHelper(60, 60, 0x1d324a, 0x122237); floor.position.y = -1.1; scene.add(floor)
  try {
    viewport = createViewport(host.value, {
      scene, camera, label: 'Демонстрация лазерной резки кольца из металлического листа', active: () => props.active,
      resize(w, h) { camera.setViewOffset(w, h, -w * .17, 0, w, h) },
      update(dt) { time += dt; const state = laser.update(time, props.reduced); sparkCount.value = state.sparks; status.value = state.release > 0 ? 'КОНТУР ГОТОВ' : state.cutting ? 'РЕЗКА КОНТУРА' : 'ПОЗИЦИОНИРОВАНИЕ'; return !props.reduced },
    })
  } catch (e) { failed.value = true; console.error(e) }
})
watch(() => [props.active, props.reduced], () => viewport?.request())
onBeforeUnmount(() => viewport?.dispose())
</script>

<template><div class="scene-root laser-scene" :data-sparks="sparkCount"><div ref="host" class="scene-canvas" /><p v-if="failed" class="scene-loading">3D недоступно · лазерная резка</p><div class="laser-status"><i /><span>{{ status }}</span><small>ДЕМОНСТРАЦИЯ ПРОЦЕССА</small></div></div></template>
<style scoped>
.laser-status{position:absolute;right:90px;bottom:170px;font-size:10px;letter-spacing:.15em;display:flex;gap:12px;align-items:center}.laser-status i{width:5px;height:5px;background:var(--accent);box-shadow:0 0 15px #ffe400}.laser-status small{color:var(--muted);font-size:9px;margin-left:30px}
</style>
