<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import * as T from 'three'
import { createViewport } from '../three/runtime/createViewport.js'
import { buildBlockout } from '../three/blockout/buildBlockout.js'
import { sampleBlockoutCamera, blockoutIndex } from '../data/blockout.js'

const props = defineProps({ position: Number, reduced: Boolean, active: Boolean })
const emit = defineEmits(['ready', 'failed'])
const host = ref(null)
let viewport, firstFrame = true
onMounted(() => {
  try {
    const scene = new T.Scene(); scene.fog = new T.Fog('#111a21', 65, 170)
    const camera = new T.PerspectiveCamera(35, 1, .1, 260)
    scene.add(new T.HemisphereLight('#d6e1e5', '#29343c', 2.2))
    const sun = new T.DirectionalLight('#fff4d9', 3.1)
    sun.position.set(-35, 65, 45); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048)
    Object.assign(sun.shadow.camera, { left: -55, right: 55, top: 55, bottom: -55, near: .1, far: 150 })
    sun.shadow.bias = -.001; sun.shadow.normalBias = .08; sun.shadow.camera.updateProjectionMatrix()
    scene.add(sun, sun.target)
    scene.add(buildBlockout().root)
    let renderedPosition = props.position
    const eye = new T.Vector3(), aim = new T.Vector3()
    viewport = createViewport(host.value, {
      scene, camera, active: () => props.active, label: 'Прототип территории ЧСГС из простых объёмов. Прокрутка перемещает камеру между корпусами.',
      update(dt) {
        renderedPosition += (props.position - renderedPosition) * (props.reduced ? 1 : 1 - Math.exp(-dt * 11))
        if (Math.abs(props.position - renderedPosition) < .0001) renderedPosition = props.position
        const pose = sampleBlockoutCamera(props.reduced ? blockoutIndex(renderedPosition) : renderedPosition)
        eye.fromArray(pose.eye); aim.fromArray(pose.aim); camera.position.copy(eye); camera.lookAt(aim)
        const shadowX = Math.round(eye.x / 8) * 8
        if (sun.target.position.x !== shadowX || firstFrame) {
          sun.position.set(shadowX - 35, 65, 45); sun.target.position.set(shadowX, 0, -8)
          viewport.renderer.shadowMap.needsUpdate = true
        }
        host.value.dataset.camera = JSON.stringify(pose.eye.map(v => +v.toFixed(3)))
        host.value.dataset.cameraPosition = renderedPosition.toFixed(4)
        return renderedPosition !== props.position
      },
      onRendered() { if (firstFrame) { firstFrame = false; emit('ready') } },
    })
    viewport.renderer.shadowMap.enabled = true; viewport.renderer.shadowMap.type = T.PCFShadowMap
    viewport.renderer.shadowMap.autoUpdate = false; viewport.renderer.shadowMap.needsUpdate = true
  } catch (error) { console.error('Factory blockout', error); emit('failed') }
})
watch(() => [props.position, props.active, props.reduced], () => viewport?.request())
onBeforeUnmount(() => viewport?.dispose())
</script>
<template><div ref="host" class="blockout-canvas" /></template>
<style scoped>
.blockout-canvas{position:absolute;inset:0}.blockout-canvas :deep(canvas){display:block;width:100%;height:100%;opacity:0;transition:opacity .35s}.blockout-canvas[data-rendered=true] :deep(canvas){opacity:1}
</style>
