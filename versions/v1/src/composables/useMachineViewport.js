import { onMounted, onBeforeUnmount, watch, ref } from 'vue'
import * as T from 'three'
import { createViewport } from '../three/runtime/createViewport.js'

export function useMachineViewport(host, props, { build, cameraPose, label, animate, diagnostics }) {
  const failed = ref(false), status = ref('')
  let viewport, elapsed = 0
  onMounted(() => {
    const scene = new T.Scene(), camera = new T.PerspectiveCamera(38, 1, .05, 180)
    scene.add(new T.HemisphereLight(0xeaf3ff, 0x1a2940, 2))
    const key = new T.DirectionalLight(0xffffff, 3); key.position.set(4, 8, 6); scene.add(key)
    const floor = new T.GridHelper(70, 70, 0x263e57, 0x132337); floor.position.y = -.13
    floor.material.transparent = true; floor.material.opacity = .5; scene.add(floor)
    try {
      const model = build(); scene.add(model.root)
      const eye = new T.Vector3(), aim = new T.Vector3()
      const first = cameraPose(props.position); eye.fromArray(first.eye); aim.fromArray(first.aim)
      viewport = createViewport(host.value, {
        scene, camera, active: () => props.active, label,
        resize(w, h) { camera.setViewOffset(w, h, -w * .16, 0, w, h) },
        update(dt) {
          if (!props.reduced) elapsed += dt
          const state = model.update(props.position, props.reduced ? 0 : elapsed, props.reduced)
          status.value = state.label
          diagnostics?.(host.value, state)
          const pose = cameraPose(props.position), rate = props.reduced ? 1 : 1 - Math.exp(-dt * 6)
          const targetEye = new T.Vector3(...pose.eye), targetAim = new T.Vector3(...pose.aim)
          eye.lerp(targetEye, rate); aim.lerp(targetAim, rate)
          camera.position.copy(eye); camera.lookAt(aim)
          return animate && !props.reduced || eye.distanceTo(targetEye) > .002 || aim.distanceTo(targetAim) > .002
        },
      })
    } catch (error) { failed.value = true; console.error(label, error) }
  })
  watch(() => [props.active, props.position, props.reduced], () => viewport?.request())
  onBeforeUnmount(() => viewport?.dispose())
  return { failed, status }
}
