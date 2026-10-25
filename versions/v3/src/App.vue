<script setup>
import {ref,computed,watch,onMounted,onBeforeUnmount,nextTick} from 'vue'
import CampusScene from './components/CampusScene.vue'
import ChapterCopy from './components/ChapterCopy.vue'
import ExperienceMenu from './components/ExperienceMenu.vue'
import EngineeringGuides from './components/EngineeringGuides.vue'
import {useJourney} from './composables/useJourney.js'
import {useGuides} from './composables/useGuides.js'
import {stops,end,metrics,screensPerChapter,scrollView} from './data/route.js'
import {flightView} from './motion/flight.js'
import {assetUrl} from './runtime/assetUrl.js'
const {position,reduced,navigation,goTo,cancelNavigation}=useJourney()
const guides=useGuides(),scene=ref(null),root=ref(null),ready=ref(false),failed=ref(false),rendered=ref(0),overlay=ref(null),menuButton=ref(null)
const visualPosition=computed(()=>ready.value&&!failed.value?rendered.value:position.value)
const view=computed(()=>navigation.value?flightView(navigation.value):scrollView(visualPosition.value))
const stop=computed(()=>stops[view.value.index]),opacity=computed(()=>reduced.value?1:view.value.opacity)
const busy=computed(()=>!!overlay.value)
let overlayOrigin=null,restoreFocus=null,previousOverflow=''
function capture(){return {position:visualPosition.value,index:view.value.index,opacity:opacity.value,pose:scene.value?.capturePose()}}
function navigate(i){const origin=busy.value&&overlayOrigin?overlayOrigin:capture();overlay.value=null;guides.clear();goTo(i,origin)}
function close(){overlay.value=null}
watch(()=>opacity.value<.25,moving=>{if(moving)guides.clear()})
watch(overlay,async(value,old)=>{
  guides.clear()
  if(value&&!old){overlayOrigin=capture();cancelNavigation();restoreFocus=document.activeElement;previousOverflow=document.documentElement.style.overflow;document.documentElement.style.overflow='hidden'}
  await nextTick()
  if(value)root.value?.querySelector('[role="dialog"] button')?.focus({preventScroll:true})
  else if(old){document.documentElement.style.overflow=previousOverflow;restoreFocus?.isConnected?restoreFocus.focus({preventScroll:true}):menuButton.value?.focus({preventScroll:true})}
})
function key(e){
  if(e.key==='Escape'&&busy.value){e.preventDefault();close()}
  if(e.key==='Tab'&&busy.value){const modal=root.value?.querySelector('[role="dialog"]');const items=[...modal.querySelectorAll('button,a,iframe')].filter(e=>!e.disabled);const first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}
}
onMounted(()=>window.addEventListener('keydown',key))
onBeforeUnmount(()=>{window.removeEventListener('keydown',key);if(busy.value)document.documentElement.style.overflow=previousOverflow})
</script>
<template>
  <div class="journey-scroll" :style="{height:`${(end*screensPerChapter+1)*100}vh`}" aria-hidden="true"/>
  <main ref="root" class="experience" :class="{'is-ready':ready||failed,'is-overlay':busy,'is-reduced':reduced}" :data-section="stop.id" :data-position="visualPosition.toFixed(4)" :data-flight="navigation?`${navigation.fromIndex+1}-${navigation.to+1}`:undefined" :data-flight-progress="navigation?.progress.toFixed(4)" :data-caption-opacity="opacity.toFixed(4)" @pointerover="guides.enter" @pointerout="guides.leave" @pointerleave="guides.exit" @focusin="guides.enter" @focusout="guides.leave">
    <CampusScene ref="scene" :position="position" :navigation="navigation" :reduced="reduced" :active="!busy" @progress="rendered=$event" @ready="ready=true" @failed="failed=true"/>
    <div class="scene-vignette" aria-hidden="true"/>
    <EngineeringGuides :bounds="guides.bounds.value" :reduced="reduced"/>
    <header class="experience-header shell">
      <button class="brand" data-guide aria-label="ЧСГС — к началу экскурсии" :inert="busy||undefined" @click="navigate(0)"><img :src="assetUrl('brand/ld-logo.svg')" alt="ЛД"><span>ЧСГС<small>ЧЕЛЯБИНСКСПЕЦГРАЖДАНСТРОЙ</small></span></button>
      <span class="header-caption">Завод полного цикла</span>
      <button v-show="!busy" ref="menuButton" class="menu-toggle" data-guide :aria-expanded="overlay==='menu'" aria-controls="experience-menu-title" @click="overlay='menu'"><span>Разделы</span><i aria-hidden="true"><b/><b/></i></button>
    </header>
    <div class="experience-content shell" :inert="busy||undefined">
      <div class="chapter-counter" :style="{opacity}" aria-hidden="true"><span>{{stop.number}}</span><i/>{{String(stops.length).padStart(2,'0')}}</div>
      <div class="copy-position"><ChapterCopy :key="stop.id" :stop="stop" :opacity="opacity" :reduced="reduced" @start="navigate(1)" @watch="overlay='film'"/></div>
      <div class="site-label" :style="{opacity}" aria-hidden="true"><span>{{stop.number}}</span><i/>{{stop.place}}</div>
      <section v-if="stop.index===0" class="scale" :style="{opacity}" aria-labelledby="scale-title"><h2 id="scale-title">Масштаб завода</h2><dl><div v-for="metric in metrics" :key="metric.label"><dt>{{metric.label}}</dt><dd><small>{{metric.prefix||'\u00a0'}}</small>{{metric.value}}</dd></div></dl></section>
      <footer class="experience-footer">
        <button class="scroll-cue" data-guide @click="navigate(stop.index<end?stop.index+1:0)"><span aria-hidden="true">{{stop.index<end?'↓':'↑'}}</span>{{stop.index<end?'Прокрутите, чтобы продолжить':'Вернуться к началу'}}</button>
        <nav class="chapter-nav" aria-label="Маршрут по заводу"><button v-for="s in stops" :key="s.id" data-guide :aria-label="`${s.number}. ${s.short}`" :title="s.title" :aria-current="stop.index===s.index?'step':undefined" @click="navigate(s.index)"><span>{{s.number}}</span><i/></button></nav>
        <a class="ld-link" data-guide href="https://xn--d1an.xn--p1ai/" target="_blank" rel="noopener noreferrer">Группа компаний ЛД <span>↗</span></a>
      </footer>
    </div>
    <div class="chapter-arrows" :inert="busy||undefined"><button data-guide aria-label="Предыдущий раздел" :disabled="stop.index===0" @click="navigate(stop.index-1)"><span>←</span></button><button data-guide aria-label="Следующий раздел" :disabled="stop.index===end" @click="navigate(stop.index+1)"><span>→</span></button></div>
    <p v-if="!ready&&!failed" class="scene-status" role="status">Загружаем территорию…</p>
    <p v-if="failed" class="scene-status fallback" role="status">3D недоступно.<br>Разделы, тексты и навигация доступны.</p>
    <ExperienceMenu :open="overlay==='menu'" :stops="stops" :active-index="stop.index" :reduced="reduced" @close="close" @select="navigate"/>
    <Transition name="film"><section v-if="overlay==='film'" class="film-dialog" role="dialog" aria-modal="true" aria-labelledby="film-title"><div class="film-shell"><header><h2 id="film-title">ЧСГС / Фильм о заводе</h2><button data-guide @click="close">Закрыть <span>×</span></button></header><iframe :src="stops[5].videoEmbedUrl" title="Фильм о заводе ЧСГС" allow="fullscreen; picture-in-picture" allowfullscreen/><a data-guide :href="stops[5].sourceUrl" target="_blank" rel="noopener noreferrer">Открыть страницу завода на сайте ЛД ↗</a></div></section></Transition>
    <div class="journey-progress" :style="{transform:`scaleX(${visualPosition/end})`}" aria-hidden="true"/>
  </main>
</template>
