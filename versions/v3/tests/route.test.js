import {test} from 'node:test'
import assert from 'node:assert/strict'
import * as T from 'three'
import {stops,end,sampleCamera,scrollView} from '../src/data/route.js'
import {flightView,flightPose} from '../src/motion/flight.js'
import {buildCampus} from '../src/three/buildCampus.js'
import {guideAxis,retargetGuides,advanceGuides} from '../src/motion/damped.js'

const flight=(from,to)=>({from,to,fromIndex:from,fromOpacity:1,fromPose:sampleCamera(from),progress:0})
test('each chapter has an exact reading pose; reverse scroll retraces the same low corridor',()=>{
  for(const stop of stops){assert.deepEqual(sampleCamera(stop.index),{eye:stop.eye,aim:stop.aim,fov:36});assert.deepEqual(sampleCamera(stop.index+.1),sampleCamera(stop.index))}
  const forward=[];let last=sampleCamera(0)
  for(let p=0;p<=end;p+=.005){const pose=sampleCamera(p);assert.ok(pose.eye.every(Number.isFinite));assert.ok(pose.eye[0]>=last.eye[0]);assert.ok(pose.eye[1]>=6&&pose.eye[1]<=11);assert.ok(Math.hypot(...pose.eye.map((v,i)=>v-last.eye[i]))<2);forward.push({p,pose});last=pose}
  for(const state of forward.reverse())assert.deepEqual(sampleCamera(state.p),state.pose)
  assert.deepEqual(sampleCamera(-1),sampleCamera(0));assert.deepEqual(sampleCamera(100),sampleCamera(end))
})
test('native and direct flights stay outside all solid blockout buildings',()=>{
  const campus=buildCampus(stops),eye=new T.Vector3()
  const check=pose=>assert.ok(!campus.bounds.some(b=>b.containsPoint(eye.fromArray(pose.eye))),`Camera collision at ${pose.eye}`)
  for(let p=0;p<=end;p+=.01)check(sampleCamera(p))
  for(let from=0;from<=end;from++)for(let to=0;to<=end;to++)for(let i=0;i<=100;i++)check(flightPose({...flight(from,to),progress:i/100}))
  campus.dispose()
})
test('distant selections have one transition with only source and target captions',()=>{
  for(const [from,to] of [[1,6],[6,1],[5,6]]){
    const f=flight(from,to),seen=new Set()
    for(let i=0;i<=1000;i++){const view=flightView({...f,progress:i/1000});seen.add(view.index);if(i>=220&&i<=760)assert.equal(view.opacity,0)}
    assert.deepEqual([...seen],[from,to]);assert.deepEqual(flightPose(f),sampleCamera(from));assert.deepEqual(flightPose({...f,progress:1}),sampleCamera(to))
  }
})
test('a replacement flight starts at the shown pose without revealing an intermediate chapter',()=>{
  const previous={...flight(1,6),progress:.4},view=flightView(previous),pose=flightPose(previous)
  const replacement={from:view.position,fromIndex:view.index,fromOpacity:view.opacity,fromPose:pose,to:7,progress:0}
  assert.notEqual(Math.round(view.position),view.index);assert.deepEqual(flightPose(replacement),pose);assert.equal(flightView(replacement).index,view.index);assert.equal(flightView(replacement).opacity,view.opacity)
})
test('campus uses distinct primitive silhouettes, bounded geometry and endpoint accents',()=>{
  const campus=buildCampus(stops);let calls=0,vertices=0
  campus.root.traverse(o=>{if(o.geometry){calls++;vertices+=o.geometry.attributes.position.count}})
  assert.ok(calls<80&&vertices<15000);assert.equal(campus.sites.length,stops.length);assert.ok(campus.bounds.length>=8)
  campus.update({fromIndex:1,toIndex:6,blend:.4,moving:true})
  for(const site of campus.sites){if(![1,6].includes(site.index))assert.ok(site.materials.accent.opacity<.1)}
  assert.ok(campus.sites[1].materials.accent.opacity>.3);assert.ok(campus.sites[6].materials.accent.opacity>.3)
  campus.dispose();assert.equal(campus.root.children.length,0)
})
test('guides retain their physical lines and velocity across a cell boundary and interrupted return',()=>{
  const homes=[-120,240,600,960,1320,1680,2040],axis=guideAxis(homes)
  retargetGuides(axis,homes,[890,930]);for(let i=0;i<15;i++)advanceGuides(axis,1/60)
  const pair=axis.pair,positions=axis.lines.map(l=>[l.value,l.velocity]);retargetGuides(axis,homes,[980,1020]);assert.equal(axis.pair,pair);assert.deepEqual(axis.lines.map(l=>[l.value,l.velocity]),positions)
  retargetGuides(axis,homes,null);advanceGuides(axis,1/60);retargetGuides(axis,homes,[1500,1600]);assert.equal(axis.pair,pair)
  for(let i=0;i<200;i++)advanceGuides(axis,1/60);assert.equal(axis.lines[pair].value,1500);assert.equal(axis.lines[pair+1].value,1600)
  retargetGuides(axis,homes,null);assert.equal(advanceGuides(axis,0,true),false);assert.deepEqual(axis.lines.map(l=>l.value),homes)
})
