<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as T from 'three'
import { createViewport, disposeTree } from '../three/runtime/createViewport.js'
import { buildFactory } from '../three/factory/buildFactory.js'
import { smooth } from '../data/route.js'

const props = defineProps({ active: Boolean, position: Number, reduced: Boolean })
const emit = defineEmits(['select'])
const host = ref(null), loading = ref(true), failed = ref(false), labels = ref([]), hovered = ref('')
let viewport, factory, camera, disposed = false
const raycaster = new T.Raycaster(), pointer = new T.Vector2()
function hit(event) {
  if (!factory || !camera) return ''
  const rect = host.value.getBoundingClientRect()
  pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, 1 - (event.clientY - rect.top) / rect.height * 2)
  raycaster.setFromCamera(pointer, camera)
  return raycaster.intersectObjects(factory.pickables, false)[0]?.object.userData.zone || ''
}
function move(event) { hovered.value = hit(event) }
function select(event) { const zone = hit(event); if (zone) emit('select', zone) }
const abort = new AbortController()
onMounted(async () => {
  const scene = new T.Scene(); camera = new T.PerspectiveCamera(35, 1, .1, 350)
  const eye = new T.Vector3(48, 43, -75), aim = new T.Vector3(0, 0, 0)
  camera.position.copy(eye); camera.lookAt(aim)
  try {
    viewport = createViewport(host.value, {
      scene, camera, active: () => props.active,
      label: 'Каркасная территория завода ЧСГС',
      resize(w, h) { camera.setViewOffset(w, h, -w * .10, 0, w, h) },
      update(dt) {
        const warehouse = smooth(6, 6.4, props.position) * (1 - smooth(9.9, 10.5, props.position))
        const desiredEye = new T.Vector3(48, 43, -75).lerp(new T.Vector3(30, 24, -43), warehouse)
        const desiredAim = new T.Vector3(0, 0, 0).lerp(new T.Vector3(9, 1, -9), warehouse)
        const metal = smooth(10.25, 11.1, props.position)
        desiredEye.lerp(new T.Vector3(24, 17, 27), metal); desiredAim.lerp(new T.Vector3(5, 1, 16), metal)
        const production = smooth(.65, 1.55, props.position) * (1 - smooth(5.75, 6.25, props.position))
        desiredEye.lerp(new T.Vector3(-9, 8, -14), production); desiredAim.lerp(new T.Vector3(-9, 2, -5), production)
        const flight = smooth(6.35, 6.85, props.position) * (1 - smooth(9.9, 10.35, props.position))
        desiredEye.lerp(new T.Vector3(12, 3.3, -26), flight)
        desiredAim.lerp(new T.Vector3(12, 2, -15), flight)
        const rate = props.reduced ? 1 : 1 - Math.exp(-dt * 5)
        eye.lerp(desiredEye, rate); aim.lerp(desiredAim, rate)
        camera.position.copy(eye); camera.lookAt(aim); camera.zoom = 1 + .28 * warehouse
        camera.setViewOffset(host.value.clientWidth, host.value.clientHeight, -host.value.clientWidth * .10 * (1 - flight), 0, host.value.clientWidth, host.value.clientHeight)
        camera.updateProjectionMatrix(); camera.updateMatrixWorld()
        let lightingMoving = false
        if (factory) {
          for (const [id, material] of Object.entries(factory.materials)) {
            const chosen = hovered.value || (metal > .3 ? 'metal' : warehouse > .3 ? 'warehouse' : production > .3 ? 'production' : '')
            const highlighted = id !== 'site' && id === chosen
            material.uniforms.uLine.value.set(highlighted ? '#ffea00' : '#6687a4')
            material.uniforms.uStrength.value = highlighted ? .9 : .46
            const target = highlighted ? 1 : 0
            material.uniforms.uHighlight.value += (target - material.uniforms.uHighlight.value) * rate
            lightingMoving ||= Math.abs(target - material.uniforms.uHighlight.value) > .002
            factory.lines[id].color.set(highlighted ? '#ffea00' : '#9bb4ce'); factory.lines[id].opacity = highlighted ? .8 : .33
          }
          labels.value = factory.locations.map(location => {
            const p = location.position.clone().project(camera)
            return { ...location, x: (p.x + 1) * host.value.clientWidth / 2, y: (1 - p.y) * host.value.clientHeight / 2 }
          })
        }
        return lightingMoving || eye.distanceTo(desiredEye) > .003 || aim.distanceTo(desiredAim) > .003
      },
    })
    factory = await buildFactory(abort.signal)
    if (disposed) { disposeTree(factory.root); return }
    scene.add(factory.root); loading.value = false; viewport.request()
  } catch (e) { if (e.name !== 'AbortError') { failed.value = true; console.error(e) } }
})
watch(() => [props.active, props.position, props.reduced, hovered.value], () => viewport?.request())
onBeforeUnmount(() => { disposed = true; abort.abort(); viewport?.dispose() })
</script>

<template>
  <div class="factory-scene scene-root" :data-hovered-zone="hovered">
    <div ref="host" class="scene-canvas" :style="{ cursor: hovered ? 'pointer' : 'default' }" @pointermove="move" @pointerleave="hovered = ''" @click="select" />
    <p v-if="loading || failed" class="scene-loading">{{ failed ? '3D недоступно. Разделы доступны в меню.' : 'Прорисовываем территорию…' }}</p>
    <div v-if="!loading && position < 1.1" class="map-labels">
      <button v-for="point in labels" :key="point.id" :style="{ left: point.x + 'px', top: point.y + 'px' }" class="map-label" :class="{ highlighted: hovered === point.id }" @pointerenter="hovered = point.id" @pointerleave="hovered = ''" @focus="hovered = point.id" @blur="hovered = ''" @click="emit('select', point.id)">
        <span class="map-pin" /><span>{{ point.label }} <b>↗</b></span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.map-label.highlighted{color:var(--accent)}.map-label.highlighted .map-pin{background:var(--accent);box-shadow:0 0 15px #ffea0050}.map-label.highlighted>span:last-child{border-color:var(--accent)}
.map-labels{position:absolute;inset:0;pointer-events:none}.map-label{position:absolute;display:flex;align-items:center;gap:12px;transform:translate(-15px,-55px);white-space:nowrap;font-size:12px;color:#d4e0eb;pointer-events:auto}.map-pin{width:9px;height:9px;border:1px solid var(--accent);position:relative;background:var(--bg);transform:rotate(45deg)}.map-pin:after{content:'';position:absolute;top:8px;left:8px;width:1px;height:35px;background:#7d8999;transform:rotate(-45deg);transform-origin:top}.map-label>span:last-child{border-bottom:1px solid #657184;padding:11px 0;background:#080d16b8}.map-label b{color:var(--accent);margin-left:12px;font-weight:400}.map-label:hover{color:var(--accent)}
</style>
