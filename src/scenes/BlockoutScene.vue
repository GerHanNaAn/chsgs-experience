<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import * as T from 'three'
import { createViewport } from '../three/runtime/createViewport.js'
import { buildBlockout } from '../three/blockout/buildBlockout.js'
import { sampleBlockoutCamera, blockoutIndex } from '../data/blockout.js'
import { damp } from '../motion/damped.js'

const props = defineProps({ position: Number, reduced: Boolean, active: Boolean })
const emit = defineEmits(['ready', 'failed', 'progress'])
const host = ref(null)
let viewport, firstFrame = true
const pointer = { x: 0, y: 0 }, driftX = { value: 0, velocity: 0 }, driftY = { value: 0, velocity: 0 }
function resetPointer() { pointer.x = 0; pointer.y = 0; viewport?.request() }
function movePointer(event) {
  if (event.pointerType === 'touch' || props.reduced || !props.active) return
  const rect = host.value.getBoundingClientRect()
  pointer.x = T.MathUtils.clamp((event.clientX - rect.left) / rect.width * 2 - 1, -1, 1)
  pointer.y = T.MathUtils.clamp(1 - (event.clientY - rect.top) / rect.height * 2, -1, 1)
  viewport?.request()
}
function leaveWindow(event) { if (!event.relatedTarget) resetPointer() }
onMounted(() => {
  try {
    const scene = new T.Scene()
    const camera = new T.PerspectiveCamera(35, 1, .1, 260)
    const factory = buildBlockout(); scene.add(factory.root)
    let renderedPosition = props.position
    let entrance = 0
    const eye = new T.Vector3(), aim = new T.Vector3(), right = new T.Vector3(), up = new T.Vector3()
    viewport = createViewport(host.value, {
      scene, camera, active: () => props.active, label: 'Прототип территории ЧСГС из простых объёмов. Прокрутка перемещает камеру между корпусами.',
      update(dt) {
        renderedPosition += (props.position - renderedPosition) * (props.reduced ? 1 : 1 - Math.exp(-dt * 11))
        if (Math.abs(props.position - renderedPosition) < .0001) renderedPosition = props.position
        const pose = sampleBlockoutCamera(props.reduced ? blockoutIndex(renderedPosition) : renderedPosition)
        eye.fromArray(pose.eye); aim.fromArray(pose.aim); camera.position.copy(eye); camera.lookAt(aim)
        let drifting = false
        if (props.reduced) { driftX.value = driftY.value = driftX.velocity = driftY.velocity = 0 }
        else {
          const movingX = damp(driftX, pointer.x, dt, 7), movingY = damp(driftY, pointer.y, dt, 7)
          drifting = movingX || movingY
          right.set(1, 0, 0).applyQuaternion(camera.quaternion); up.set(0, 1, 0).applyQuaternion(camera.quaternion)
          eye.addScaledVector(right, driftX.value * .45).addScaledVector(up, driftY.value * .24)
          aim.addScaledVector(right, driftX.value * .13).addScaledVector(up, driftY.value * .07)
          camera.position.copy(eye); camera.lookAt(aim)
        }
        entrance = props.reduced ? 1 : Math.min(1, entrance + dt * 1.35)
        factory.update(renderedPosition, entrance)
        emit('progress', renderedPosition)
        host.value.dataset.camera = JSON.stringify(eye.toArray().map(v => +v.toFixed(3)))
        host.value.dataset.pointerDrift = JSON.stringify([driftX.value, driftY.value].map(v => +v.toFixed(4)))
        host.value.dataset.cameraPosition = renderedPosition.toFixed(4)
        return renderedPosition !== props.position || entrance < 1 || drifting
      },
      onRendered() { if (firstFrame) { firstFrame = false; emit('ready') } },
    })
    window.addEventListener('pointermove', movePointer, { passive: true })
    window.addEventListener('pointerout', leaveWindow, { passive: true })
    window.addEventListener('blur', resetPointer)
  } catch (error) { console.error('Factory blockout', error); emit('failed') }
})
watch(() => [props.position, props.active, props.reduced], () => { if (!props.active || props.reduced) resetPointer(); viewport?.request() })
onBeforeUnmount(() => {
  window.removeEventListener('pointermove', movePointer); window.removeEventListener('pointerout', leaveWindow); window.removeEventListener('blur', resetPointer)
  viewport?.dispose()
})
</script>
<template><div ref="host" class="blockout-canvas" /></template>
<style scoped>
.blockout-canvas{position:absolute;inset:0}.blockout-canvas :deep(canvas){display:block;width:100%;height:100%;opacity:0;transition:opacity .35s}.blockout-canvas[data-rendered=true] :deep(canvas){opacity:1}
</style>
