<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import * as T from 'three'
import { createViewport } from '../runtime/createViewport.js'
import { buildCampus } from '../three/buildCampus.js'
import { stops, sampleCamera as sampleBlockoutCamera, chapterIndex as blockoutIndex, scrollView } from '../data/route.js'
import { damp } from '../motion/damped.js'
import { flightView as navigationView, flightPose as sampleDirectFlight } from '../motion/flight.js'
import { ease as easeFlight } from '../data/route.js'

const props = defineProps({ position: Number, reduced: Boolean, active: Boolean, navigation: Object })
const emit = defineEmits(['ready', 'failed', 'progress'])
const host = ref(null)
let viewport, firstFrame = true
let basePose = sampleBlockoutCamera(props.position)
defineExpose({ capturePose: () => ({ eye: [...basePose.eye], aim: [...basePose.aim], fov: 36 }) })
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
    const scene = new T.Scene(); scene.fog = new T.Fog('#080b12', 80, 190)
    const camera = new T.PerspectiveCamera(36, 1, .1, 260)
    const factory = buildCampus(stops); scene.add(factory.root)
    let renderedPosition = props.position
    let entrance = 0
    let lastFlight = null, bridge = null
    const eye = new T.Vector3(), aim = new T.Vector3(), right = new T.Vector3(), up = new T.Vector3()
    viewport = createViewport(host.value, {
      scene, camera, active: () => props.active, label: 'Территория ЧСГС. Прокрутка перемещает камеру между проходной, производством и корпусами завода.',
      update(dt) {
        const flight = props.reduced ? null : props.navigation, view = flight ? navigationView(flight) : null
        let pose
        if (flight) {
          bridge = null; lastFlight = flight.id; renderedPosition = view.position
          pose = sampleDirectFlight(flight)
        } else {
          if (lastFlight !== null && !props.reduced) bridge = { pose: basePose, elapsed: 0 }
          lastFlight = null
          renderedPosition += (props.position - renderedPosition) * (props.reduced ? 1 : 1 - Math.exp(-dt * 11))
          if (Math.abs(props.position - renderedPosition) < .0001) renderedPosition = props.position
          pose = sampleBlockoutCamera(props.reduced ? blockoutIndex(renderedPosition) : renderedPosition)
          if (bridge && !props.reduced) {
            bridge.elapsed += dt
            const blend = easeFlight(bridge.elapsed / .45)
            const mix = (a, b) => a.map((v, i) => v + (b[i] - v) * blend)
            pose = { eye: mix(bridge.pose.eye, pose.eye), aim: mix(bridge.pose.aim, pose.aim), fov: 36 }
            if (bridge.elapsed >= .45) bridge = null
          } else bridge = null
        }
        basePose = pose
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
        factory.update(view || scrollView(renderedPosition))
        emit('progress', renderedPosition)
        host.value.dataset.camera = JSON.stringify(eye.toArray().map(v => +v.toFixed(3)))
        host.value.dataset.pointerDrift = JSON.stringify([driftX.value, driftY.value].map(v => +v.toFixed(4)))
        host.value.dataset.cameraPosition = renderedPosition.toFixed(4)
        host.value.dataset.navigation = flight ? `${flight.fromIndex + 1}-${flight.to + 1}` : ''
        return (flight ? flight.progress < 1 : renderedPosition !== props.position) || !!bridge || entrance < 1 || drifting
      },
      onRendered() {
        if (viewport) host.value.dataset.drawCalls = viewport.renderer.info.render.calls
        if (firstFrame) { firstFrame = false; emit('ready') }
      },
    })
    window.addEventListener('pointermove', movePointer, { passive: true })
    window.addEventListener('pointerout', leaveWindow, { passive: true })
    window.addEventListener('blur', resetPointer)
  } catch (error) { console.error('Factory campus', error); emit('failed') }
})
watch(() => [props.position, props.active, props.reduced, props.navigation], () => { if (!props.active || props.reduced) resetPointer(); viewport?.request() })
onBeforeUnmount(() => {
  window.removeEventListener('pointermove', movePointer); window.removeEventListener('pointerout', leaveWindow); window.removeEventListener('blur', resetPointer)
  viewport?.dispose()
})
</script>
<template><div ref="host" class="blockout-canvas" /></template>
<style scoped>
.blockout-canvas{position:absolute;inset:0}.blockout-canvas :deep(canvas){display:block;width:100%;height:100%;opacity:0;transition:opacity .35s}.blockout-canvas[data-rendered=true] :deep(canvas){opacity:1}
</style>
