<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import * as T from 'three'
import { createViewport } from '../three/runtime/createViewport.js'
import { buildBlockout } from '../three/blockout/buildBlockout.js'
import { sampleBlockoutCamera, blockoutIndex } from '../data/blockout.js'

const props = defineProps({ position: Number, reduced: Boolean, active: Boolean })
const emit = defineEmits(['ready', 'failed', 'progress'])
const host = ref(null)
let viewport, firstFrame = true
onMounted(() => {
  try {
    const scene = new T.Scene()
    const camera = new T.PerspectiveCamera(35, 1, .1, 260)
    const factory = buildBlockout(); scene.add(factory.root)
    let renderedPosition = props.position
    let entrance = 0
    const eye = new T.Vector3(), aim = new T.Vector3()
    viewport = createViewport(host.value, {
      scene, camera, active: () => props.active, label: 'Прототип территории ЧСГС из простых объёмов. Прокрутка перемещает камеру между корпусами.',
      update(dt) {
        renderedPosition += (props.position - renderedPosition) * (props.reduced ? 1 : 1 - Math.exp(-dt * 11))
        if (Math.abs(props.position - renderedPosition) < .0001) renderedPosition = props.position
        const pose = sampleBlockoutCamera(props.reduced ? blockoutIndex(renderedPosition) : renderedPosition)
        eye.fromArray(pose.eye); aim.fromArray(pose.aim); camera.position.copy(eye); camera.lookAt(aim)
        entrance = props.reduced ? 1 : Math.min(1, entrance + dt * 1.35)
        factory.update(renderedPosition, entrance)
        emit('progress', renderedPosition)
        host.value.dataset.camera = JSON.stringify(pose.eye.map(v => +v.toFixed(3)))
        host.value.dataset.cameraPosition = renderedPosition.toFixed(4)
        return renderedPosition !== props.position || entrance < 1
      },
      onRendered() { if (firstFrame) { firstFrame = false; emit('ready') } },
    })
  } catch (error) { console.error('Factory blockout', error); emit('failed') }
})
watch(() => [props.position, props.active, props.reduced], () => viewport?.request())
onBeforeUnmount(() => viewport?.dispose())
</script>
<template><div ref="host" class="blockout-canvas" /></template>
<style scoped>
.blockout-canvas{position:absolute;inset:0}.blockout-canvas :deep(canvas){display:block;width:100%;height:100%;opacity:0;transition:opacity .35s}.blockout-canvas[data-rendered=true] :deep(canvas){opacity:1}
</style>
