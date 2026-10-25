<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { guideAxis,retargetGuides,advanceGuides } from '../motion/damped.js'
const props=defineProps({bounds:Object,reduced:Boolean})
const svg=ref(null),size=ref({width:1920,height:1080}),lines=ref({x:[],y:[]})
const xs=computed(()=>Array.from({length:7},(_,i)=>240+(i-1)*360))
const ys=computed(()=>Array.from({length:5},(_,i)=>112+(i-1)*360))
const x=guideAxis(xs.value),y=guideAxis(ys.value)
let frame=0,previous=0,observer,disposed=false
const local=computed(()=>{
  void size.value
  const matrix=svg.value?.getScreenCTM()?.inverse()
  if(!matrix||!props.bounds)return null
  const a=new DOMPoint(props.bounds.left,props.bounds.top).matrixTransform(matrix),b=new DOMPoint(props.bounds.right,props.bounds.bottom).matrixTransform(matrix)
  return {left:a.x,right:b.x,top:a.y,bottom:b.y}
})
function publish(){const values=axis=>axis.lines.map((l,i)=>({value:l.value,active:axis.focused&&(i===axis.pair||i===axis.pair+1)}));lines.value={x:values(x),y:values(y)}}
function draw(time){frame=0;const dt=Math.min(previous?(time-previous)/1000:1/60,.05);previous=time;const a=advanceGuides(x,dt,props.reduced),b=advanceGuides(y,dt,props.reduced);publish();if(a||b)frame=requestAnimationFrame(draw);else previous=0}
watch([local,()=>props.reduced],()=>{
  const b=local.value;retargetGuides(x,xs.value,b?[b.left,b.right]:null);retargetGuides(y,ys.value,b?[b.top,b.bottom]:null)
  if(props.reduced){cancelAnimationFrame(frame);frame=0;previous=0;advanceGuides(x,0,true);advanceGuides(y,0,true);publish()}
  else if(!frame&&!disposed)frame=requestAnimationFrame(draw)
},{immediate:true});publish()
onMounted(()=>{observer=new ResizeObserver(()=>{size.value={width:svg.value.clientWidth,height:svg.value.clientHeight}});observer.observe(svg.value)})
onBeforeUnmount(()=>{disposed=true;observer?.disconnect();cancelAnimationFrame(frame)})
</script>
<template><svg ref="svg" class="engineering-guides" aria-hidden="true"><line v-for="(line,i) in lines.x" :key="'x'+i" class="guide vertical" :class="{selected:line.active}" :x1="line.value" :x2="line.value" y1="0" :y2="size.height"/><line v-for="(line,i) in lines.y" :key="'y'+i" class="guide horizontal" :class="{selected:line.active}" x1="0" :x2="size.width" :y1="line.value" :y2="line.value"/></svg></template>
<style scoped>
.engineering-guides{position:absolute;inset:0;width:100%;height:100%;z-index:55;pointer-events:none}.guide{stroke:#7a8a92;stroke-width:1;stroke-opacity:.065;vector-effect:non-scaling-stroke;transition:stroke-opacity .35s}.guide.horizontal{stroke-opacity:.05}.guide.selected{stroke-opacity:.27}@media(prefers-reduced-motion:reduce){.guide{transition:none}}
</style>
