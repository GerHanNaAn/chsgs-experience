import { blockoutCopy } from './content.js'

// Eight editorial chapters; the arrangement is compositional, not a survey.
const chapters = [
  { id:'entrance', short:'Завод', title:'ЧелябинскСпецГражданСтрой', chapter:'Территория полного цикла', place:'Главная проходная', kind:'entrance', site:[0,0,0], yaw:0, eye:[14,7.6,59], aim:[13.5,4.7,-3] },
  { id:'technology', short:'Производство', title:'Технологический парк и глубина производства', chapter:'От металла до готового изделия', place:'Производственные корпуса', kind:'production', site:[92,0,-8], yaw:-.08, eye:[-23,7.4,61], aim:[14,4.8,-3] },
  { id:'quality', short:'Качество', title:'Модернизация продукции и 100% контроль качества', chapter:'Инженерия и испытания', place:'Лабораторный корпус', kind:'quality', site:[176,0,3], yaw:.18, eye:[24,9.4,54], aim:[13,5.8,-4] },
  { id:'traceability', short:'Прослеживаемость', title:'Прослеживаемость и защита от фальсификата', chapter:'У каждого изделия — своя история', place:'Участок идентификации и отгрузки', kind:'traceability', site:[264,0,-6], yaw:-.1, eye:[-16,6.8,57], aim:[14,3.8,-1] },
  { id:'service', short:'Сервис', title:'Сервисная поддержка и гарантийные обязательства', chapter:'Ответственность после поставки', place:'Сервисный корпус', kind:'service', site:[348,0,6], yaw:0, eye:[22,7.2,54], aim:[13,4.4,-4] },
  { id:'film', short:'Фильм о заводе', title:'Видео о заводе', chapter:'Знакомство с ЧСГС', place:'Производственный двор', kind:'film', site:[436,0,-16], yaw:.1, eye:[-16,7.8,65], aim:[14,4.8,-3] },
  { id:'global', short:'География', title:'Глобальное присутствие и достижения', chapter:'За пределами территории завода', place:'Терминал отгрузки', kind:'global', site:[536,0,-4], yaw:-.14, eye:[26,8.4,59], aim:[14,4.2,-4] },
  { id:'clients', short:'Применение', title:'Продукция завода используется крупными клиентами', chapter:'Арматура в работе', place:'Завершение маршрута', kind:'clients', site:[622,0,10], yaw:.04, eye:[-16,7.4,59], aim:[14,4.5,-3] },
]
export const stops = chapters.map((s,index)=>({ ...s,...blockoutCopy[s.id],index,number:String(index+1).padStart(2,'0'),eye:s.eye.map((v,i)=>v+s.site[i]),aim:s.aim.map((v,i)=>v+s.site[i]),catalogUrl:'https://xn--d1an.xn--p1ai/catalog/' }))
export const end = stops.length-1
export const screensPerChapter = 1.65
export const clampPosition = value=>Math.max(0,Math.min(end,value))
export const chapterIndex = value=>Math.round(clampPosition(value))
export const ease = value=>{const t=Math.max(0,Math.min(1,value));return Math.max(0,Math.min(1,t*t*t*(t*(t*6-15)+10)))}
export const metrics = [{value:'25',prefix:'Более',label:'лет опыта'},{value:'2 млн',prefix:'Более',label:'изделий в год'},{value:'700',prefix:'Около',label:'единиц оборудования'},{value:'10',prefix:'Более',label:'патентов'},{value:'1 100',prefix:'',label:'сотрудников'}]
export function captionOpacity(position) {
  const distance=Math.abs(clampPosition(position)-chapterIndex(position))
  return 1-ease((distance-.12)/.22)
}
export function sampleCamera(position) {
  const p=clampPosition(position), i=Math.min(Math.floor(p),end-1), t=ease((p-i-.14)/.72)
  const mix=(a,b)=>a.map((v,j)=>v+(b[j]-v)*t)
  const eye=mix(stops[i].eye,stops[i+1].eye),aim=mix(stops[i].aim,stops[i+1].aim), arc=Math.sin(Math.PI*t)**2
  eye[1]+=arc*.5;eye[2]+=arc*5
  return {eye,aim,fov:36}
}
export function scrollView(position) {
  const p=clampPosition(position), fromIndex=Math.min(Math.floor(p),end-1), blend=ease((p-fromIndex-.14)/.72)
  return {position:p,index:chapterIndex(p),opacity:captionOpacity(p),fromIndex,toIndex:fromIndex+1,blend,moving:captionOpacity(p)<.999,progress:p-fromIndex}
}
