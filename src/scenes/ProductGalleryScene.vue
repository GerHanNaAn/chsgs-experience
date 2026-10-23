<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import * as T from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { createViewport, disposeTree } from '../three/runtime/createViewport.js'
import { buildWarehouse } from '../three/warehouse/buildWarehouse.js'
import { buildProductGallery, productAngle } from '../three/warehouse/buildProductGallery.js'
import { products } from '../data/products.js'
import { galleryStart, galleryStep, smooth, clamp, stops, galleryExit } from '../data/route.js'

const props = defineProps({ active: Boolean, position: Number, reduced: Boolean, focusing: Boolean })
const emit = defineEmits(['open'])
const host = ref(null), ready = ref(false), failed = ref(false)
const productPosition = computed(() => clamp((props.position - galleryStart) / galleryStep, 0, products.length - 1))
const selected = computed(() => Math.round(productPosition.value)), current = computed(() => products[selected.value])
const exhibition = computed(() => props.position >= galleryStart-.15 && props.position < galleryExit)
let viewport, environment, gallery, angle = 0, focus = 0
const abort = new AbortController()
onMounted(() => {
  const scene = new T.Scene(), camera = new T.PerspectiveCamera(50, 1, .05, 150)
  scene.add(new T.HemisphereLight(0xe1efff, 0x15233b, 2))
  const key = new T.DirectionalLight(0xffffff, 4); key.position.set(2, 7, 4); scene.add(key)
  const rim = new T.DirectionalLight(0x8ebaff, 3); rim.position.set(-4, 3, -5); scene.add(rim)
  const warehouse = buildWarehouse(); scene.add(warehouse.root)
  const floor = new T.GridHelper(50, 50, 0x253c55, 0x132236); floor.position.y = -1; floor.material.transparent = true; floor.material.opacity = .32; scene.add(floor)
  try {
    viewport = createViewport(host.value, {
      scene, camera, active: () => props.active, label: 'Пространственная экспозиция продукции ЧСГС. Прокрутка поворачивает обзор по часовой стрелке.',
      resize(w, h) { camera.setViewOffset(w, h, 0, h * .075, w, h) },
      update(dt) {
        const target = productAngle(productPosition.value), rate = props.reduced ? 1 : 1 - Math.exp(-dt * 7)
        angle += (target - angle) * rate; focus += ((props.focusing ? 1 : 0) - focus) * rate
        const entering = smooth(stops.products+.05, galleryStart-.15, props.position), distance = 4 - focus * 3.3
        const eye = new T.Vector3(-Math.sin(angle) * distance, 1.75 - focus * .45, Math.cos(angle) * distance + (1 - entering) * 10)
        const aim = new T.Vector3(Math.sin(angle) * 6, 1.25 - focus * .4, -Math.cos(angle) * 6)
        camera.position.copy(eye); camera.lookAt(aim)
        warehouse.fade(1 - smooth(galleryStart-.35, galleryStart+.05, props.position))
        gallery?.highlight(selected.value, smooth(galleryStart-.4, galleryStart+.05, props.position))
        floor.material.opacity = .23 * smooth(galleryStart-.4, galleryStart+.05, props.position)
        return Math.abs(target - angle) > .0001 || Math.abs((props.focusing ? 1 : 0) - focus) > .0001
      },
    })
    const room = new RoomEnvironment(), pmrem = new T.PMREMGenerator(viewport.renderer)
    environment = pmrem.fromScene(room, .03); scene.environment = environment.texture; room.dispose(); pmrem.dispose()
    viewport.renderer.setRenderTarget(null)
    viewport.renderer.setClearColor(0x080d16, 0)
    viewport.renderer.clear()
    gallery = buildProductGallery(abort.signal, () => { ready.value = true; viewport.request() }); scene.add(gallery.root)
    gallery.ready.then(orphan => { if (orphan) disposeTree(orphan) }).catch(e => { if (e.name !== 'AbortError') { console.error(e); failed.value = true } })
  } catch (e) { failed.value = true; console.error(e) }
})
watch(() => [props.active, props.position, props.focusing, props.reduced], () => viewport?.request())
onBeforeUnmount(() => { abort.abort(); viewport?.dispose(); environment?.dispose() })
</script>

<template>
  <section class="gallery-scene scene-root" :data-product="current.id" :data-gallery-position="productPosition.toFixed(3)">
    <div ref="host" class="scene-canvas" />
    <Transition name="gallery-caption" mode="out-in"><div v-if="exhibition" :key="current.id" class="gallery-caption" :class="{ focusing }">
      <span class="eyebrow">{{ String(selected + 1).padStart(2, '0') }} / 05 — ПРОДУКЦИЯ ЧСГС</span>
      <h1>{{ current.label }}<span v-if="current.sub">{{ current.sub }}</span></h1>
      <p>{{ current.available ? 'DN400 · КШЦФР · ПП · PN25' : 'Модель появится в экспозиции позже' }}</p>
      <button v-if="current.available" class="action-button grid-button" :disabled="!ready" @click="emit('open')">{{ ready ? 'Подробнее о продукции' : 'Подготавливаем модель…' }} <span>↗</span></button>
      <span v-else class="gallery-placeholder">УСЛОВНЫЙ СИМВОЛ</span>
    </div></Transition>
    <span v-if="exhibition" class="gallery-direction">ПРОКРУТКА ВНИЗ <b>↻</b> ПОВОРОТ ПО ЧАСОВОЙ СТРЕЛКЕ</span>
    <p v-if="failed" class="scene-loading">Не удалось загрузить 3D. Виды продукции доступны ниже.</p>
  </section>
</template>

<style scoped>
.gallery-scene{z-index:4}.gallery-caption{position:absolute;left:64px;top:240px;width:390px;transition:opacity .35s,transform .35s}.gallery-caption.focusing{opacity:0;transform:translateY(40px)}.gallery-caption h1{font-size:48px;line-height:1.15;letter-spacing:-.05em;font-weight:400;margin:30px 0 25px}.gallery-caption h1 span{display:block;color:#9facbb}.gallery-caption p{font-size:11px;line-height:1.8;color:var(--muted);letter-spacing:.05em;margin:0 0 32px}.gallery-placeholder{font-size:8px;letter-spacing:.16em;color:#64778b;border-top:1px solid #52687e60;padding-top:18px;display:block;width:180px}.gallery-direction{position:absolute;right:64px;bottom:160px;display:flex;align-items:center;gap:18px;font-size:8px;letter-spacing:.12em;color:var(--muted)}.gallery-direction b{font-size:30px;color:var(--accent);font-weight:400}.gallery-caption-enter-active,.gallery-caption-leave-active{transition:opacity .25s,transform .3s}.gallery-caption-enter-from{opacity:0;transform:translateX(20px)}.gallery-caption-leave-to{opacity:0;transform:translateX(-20px)}
</style>
