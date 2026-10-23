<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as T from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { createViewport, disposeTree } from '../three/runtime/createViewport.js'
import { assetUrl } from '../three/runtime/assetUrl.js'
import { buildHeroValve } from '../three/valve/buildHeroValve.js'

const props = defineProps({ active: Boolean, position: Number, reduced: Boolean })
const host = ref(null), failed = ref(false), ready = ref(false)
let viewport, model, environment, disposed = false
const pointer = new T.Vector2(), abort = new AbortController()
function move(event) { if (!props.reduced) pointer.set(event.clientX / innerWidth - .5, event.clientY / innerHeight - .5); viewport?.request() }
function leave() { pointer.set(0, 0); viewport?.request() }
onMounted(async () => {
  const scene = new T.Scene(), camera = new T.PerspectiveCamera(33, 1, .01, 100)
  camera.position.set(3.8, 2.4, 5.5); camera.lookAt(0, 0, 0)
  scene.add(new T.HemisphereLight(0xe6f2ff, 0x17223b, 2))
  const key = new T.DirectionalLight(0xf3f5ff, 5); key.position.set(2, 4, 5); scene.add(key)
  const rim = new T.DirectionalLight(0x8aacff, 3); rim.position.set(-4, 1, -2); scene.add(rim)
  try {
    viewport = createViewport(host.value, {
      scene, camera, active: () => props.active,
      label: 'Настоящая модель шарового крана ЧСГС DN400',
      resize(w, h) { camera.setViewOffset(w, h, -w * .18, -h * .015, w, h) },
      update(dt) {
        if (!model) return false
        const y = -.15 + pointer.x * .14 + props.position * .5
        const x = pointer.y * .04
        const rate = props.reduced ? 1 : 1 - Math.exp(-dt * 4)
        model.rotation.y += (y - model.rotation.y) * rate
        model.rotation.x += (x - model.rotation.x) * rate
        return Math.abs(model.rotation.y - y) > .0001 || Math.abs(model.rotation.x - x) > .0001
      },
    })
    const pmrem = new T.PMREMGenerator(viewport.renderer), room = new RoomEnvironment()
    environment = pmrem.fromScene(room, .025); scene.environment = environment.texture
    room.dispose(); pmrem.dispose()
    const result = await buildHeroValve(abort.signal)
    if (disposed) { disposeTree(result.root); return }
    model = result.root; model.scale.setScalar(1.05); scene.add(model)
    ready.value = true; viewport.request()
  } catch (e) { if (e.name !== 'AbortError') { failed.value = true; console.error(e) } }
  window.addEventListener('pointermove', move, { passive: true }); document.documentElement.addEventListener('pointerleave', leave)
})
watch(() => [props.active, props.position, props.reduced], () => viewport?.request())
onBeforeUnmount(() => { disposed = true; abort.abort(); viewport?.dispose(); environment?.dispose(); window.removeEventListener('pointermove', move); document.documentElement.removeEventListener('pointerleave', leave) })
</script>

<template>
  <div class="hero-scene scene-root"><div ref="host" class="scene-canvas" />
    <img v-if="!ready" class="hero-draft" :src="assetUrl('valve/products/dn400-pp/draft.svg')" alt="Чертёж крана DN400" />
    <span v-if="failed" class="scene-loading">Трёхмерная модель недоступна · показан чертёж</span>
    <div class="hero-model-id"><span>LD ENERGY</span><strong>DN400</strong><small>СТАЛЬНОЙ ШАРОВОЙ КРАН</small><i /></div>
  </div>
</template>

<style scoped>
.hero-model-id{position:absolute;right:98px;bottom:185px;display:flex;flex-direction:column;gap:8px;font-size:11px;letter-spacing:.18em}.hero-model-id strong{font-weight:400;font-size:28px;letter-spacing:.04em}.hero-model-id small{font-size:9px;color:var(--muted)}.hero-model-id i{height:1px;background:#657184;width:190px;position:absolute;top:25px;right:225px}.hero-draft{position:absolute;left:53%;top:15%;height:70%;width:32%;object-fit:contain;opacity:.6}
</style>
