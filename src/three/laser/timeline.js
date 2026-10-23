import { clamp } from '../../data/route.js'
export function laserState(time) {
  const phase = ((time % 10) + 10) % 10
  const outer = clamp((phase - 1) / 3.2), inner = clamp((phase - 4.4) / 2.2)
  const cutting = phase >= 1 && phase < 4.2 || phase >= 4.4 && phase < 6.6
  const radius = phase < 4.3 ? 1.4 : .78, progress = phase < 4.3 ? outer : inner
  return { outer, inner, cutting, x: Math.cos(progress * Math.PI * 2) * radius, z: Math.sin(progress * Math.PI * 2) * radius, release: clamp((phase - 6.8) / 1.1), phase }
}
