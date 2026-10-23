<script setup>
import { ref, computed, defineAsyncComponent, onBeforeUnmount } from 'vue'
import ExperienceHeader from './components/ExperienceHeader.vue'
import RouteMenu from './components/RouteMenu.vue'
import ScrollCue from './components/ScrollCue.vue'
import StoryCopy from './components/StoryCopy.vue'
import StockNarrative from './components/StockNarrative.vue'
import DepartmentNavigation from './components/DepartmentNavigation.vue'
import SectionNavigation from './components/SectionNavigation.vue'
import MosaicTransition from './components/MosaicTransition.vue'
import OpeningMosaic from './components/OpeningMosaic.vue'
import FactoryScene from './scenes/FactoryScene.vue'
import StockScene from './scenes/StockScene.vue'
import LaserScene from './scenes/LaserScene.vue'
import CncScene from './scenes/CncScene.vue'
import PressScene from './scenes/PressScene.vue'
import ProductGalleryScene from './scenes/ProductGalleryScene.vue'
import { useExperienceRoute } from './composables/useExperienceRoute.js'
import { sceneWeights, storyEnd, galleryStart, galleryExit, stops, nextPosition, activeDepartment } from './data/route.js'
const ValveExperience = defineAsyncComponent(() => import('./scenes/ValveExperience.vue'))
const { position, chapter, reduced, goTo } = useExperienceRoute()
const menu = ref(false), detail = ref(false), focusing = ref(false), transitionKey = ref(0)
const opening = ref(true), factoryReady = ref(false)
const weights = computed(() => sceneWeights(position.value))
const department = computed(() => activeDepartment(position.value))
const inGallery = computed(() => position.value >= galleryStart - .15 && position.value < galleryExit)
let timer
function transition(action) { transitionKey.value++; clearTimeout(timer); timer = setTimeout(action, reduced.value ? 0 : 210) }
function navigate(i) { transition(() => { menu.value = false; goTo(i) }) }
function selectLocation(id) { navigate(id === 'production' ? stops.laser : id === 'warehouse' ? stops.products : stops.stock) }
function openProduct() { focusing.value = true; clearTimeout(timer); timer = setTimeout(() => { detail.value = true }, reduced.value ? 0 : 650) }
function closeProduct() { transition(() => { detail.value = false; focusing.value = false }) }
function advance() { navigate(nextPosition(position.value)) }
onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <div class="scroll-track" :style="{ height: (storyEnd * 160 + 100) + 'vh' }" aria-hidden="true" />
  <main class="experience" :data-chapter="chapter.id" :data-position="position.toFixed(3)" :inert="detail || opening || undefined">
    <div class="technical-field" aria-hidden="true"><div class="field-cross cross-a" /><div class="field-cross cross-b" /></div>
    <div class="scene-layer" :style="{ opacity: weights.factory, visibility: weights.factory > 0 ? 'visible' : 'hidden' }"><FactoryScene :active="(weights.factory > 0 || opening) && !menu && !detail" :position="position" :reduced="reduced" @select="selectLocation" @ready="factoryReady = true" /></div>
    <div v-if="position > 10.4" class="scene-layer" :style="{ opacity: weights.stock, visibility: weights.stock > 0 ? 'visible' : 'hidden' }"><StockScene :active="weights.stock > 0 && !menu && !detail" :position="position" :reduced="reduced" /></div>
    <div v-if="position > .8 && position < 3.1" class="scene-layer" :style="{ opacity: weights.laser, visibility: weights.laser > 0 ? 'visible' : 'hidden' }"><LaserScene :active="weights.laser > 0 && !menu && !detail" :reduced="reduced" /></div>
    <div v-if="position > 2.1 && position < 4.8" class="scene-layer" :style="{ opacity: weights.cnc, visibility: weights.cnc > 0 ? 'visible' : 'hidden' }"><CncScene :active="weights.cnc > 0 && !menu && !detail" :position="position" :reduced="reduced" /></div>
    <div v-if="position > 3.7 && position < 6.7" class="scene-layer" :style="{ opacity: weights.press, visibility: weights.press > 0 ? 'visible' : 'hidden' }"><PressScene :active="weights.press > 0 && !menu && !detail" :position="position" :reduced="reduced" /></div>
    <div class="left-shade" />
    <div v-if="position > 5.9 && position < 10.8" class="scene-layer gallery-layer" :style="{ opacity: weights.gallery, visibility: weights.gallery > 0 ? 'visible' : 'hidden' }"><ProductGalleryScene :active="weights.gallery > 0 && !menu && !detail" :position="position" :reduced="reduced" :focusing="focusing" @open="openProduct" /></div>
    <StoryCopy :chapter="chapter" :position="position" @start="navigate(stops.laser)" />
    <StockNarrative v-if="chapter.id === 'stock'" :position="position" />
    <DepartmentNavigation v-if="department" :position="position" @navigate="navigate" />
    <ExperienceHeader :menu-open="menu" :show-navigation="!!department" @menu="transition(() => { menu = !menu })" @home="navigate(0)" />
    <footer class="experience-footer">
      <ScrollCue v-if="!inGallery && position < storyEnd - .2" @next="advance" />
      <span v-else-if="inGallery" class="footer-instruction">ПРОКРУТКА ПОВОРАЧИВАЕТ ОБЗОР ↻</span>
      <button v-else class="text-link" @click="navigate(0)">Вернуться к карте ↗</button>
      <SectionNavigation :position="position" :chapter="chapter.id" @navigate="navigate" />
      <span class="footer-place">ЧЕЛЯБИНСК, РОССИЯ <b>↗</b></span>
    </footer>
    <div class="overall-progress" :style="{ transform: `scaleX(${position / storyEnd})` }" />
    <Transition name="menu"><RouteMenu v-if="menu" :current="department" @close="transition(() => { menu = false })" @select="navigate" /></Transition>
  </main>
  <ValveExperience v-if="detail" @close="closeProduct" />
  <MosaicTransition :trigger="transitionKey" />
  <OpeningMosaic v-if="opening" :ready="factoryReady" :reduced="reduced" @complete="opening = false" />
</template>
