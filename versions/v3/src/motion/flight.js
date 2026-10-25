import { stops,chapterIndex,ease } from '../data/route.js'
export const flightDuration=1650
export function flightView(flight) {
  const p=Math.max(0,Math.min(1,flight.progress)),blend=ease(p)
  return {position:flight.from+(flight.to-flight.from)*blend,index:p<.5?flight.fromIndex:flight.to,opacity:p<.5?flight.fromOpacity*(1-ease(p/.22)):ease((p-.76)/.24),fromIndex:flight.fromIndex,toIndex:flight.to,blend,moving:p>0&&p<1,progress:p}
}
export function flightPose(flight) {
  const {blend}=flightView(flight), target=stops[chapterIndex(flight.to)], mix=(a,b)=>a.map((v,i)=>v+(b[i]-v)*blend)
  const eye=mix(flight.fromPose.eye,target.eye),aim=mix(flight.fromPose.aim,target.aim),arc=Math.sin(Math.PI*blend)**2
  eye[1]+=arc*.5;eye[2]+=arc*5
  return {eye,aim,fov:36}
}
