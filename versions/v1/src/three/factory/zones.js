// Building identity is stable across geometry merges; cars and fences stay neutral.
export function factoryZone(name, center) {
  if (/^(MainHangar|MainOffice|MainEntrance|Storage|Logo_)/.test(name)) return 'warehouse'
  if (/^HangarGate/.test(name)) return center.x > 2 ? 'warehouse' : 'production'
  if (/^(Hangar(?:Roof)?_00[1-4](?:\.|$)|Building(?:Roof)?_)/.test(name)) return 'production'
  if (/^(Hangar(?:Roof)?_00[5-7]|Crane|Pipes|Pallete|Estakada|Naves|Fura)/.test(name)) return 'metal'
  return 'site'
}
