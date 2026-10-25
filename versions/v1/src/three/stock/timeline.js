import { smooth, clamp } from '../../data/route.js'
export function stockState(time) {
  const phase = ((time % 22) + 22) % 22
  const carrying = phase >= 3 && phase < 13
  const driving = clamp((phase - 5) / 7)
  const returning = clamp((phase - 15) / 7)
  const lift = smooth(2, 4, phase) * (1 - smooth(11.5, 13.5, phase))
  return {
    phase, carrying, driving, returning, lift,
    gate: smooth(7.5, 9, phase) * (1 - smooth(17, 18.5, phase)),
    delivered: phase >= 13,
    label: phase < 3 ? 'ПРИЁМКА И ПОГРУЗКА' : phase < 5 ? 'ПОДЪЁМ ТРУБ' : phase < 12 ? 'ПОДАЧА В ПРОИЗВОДСТВО' : phase < 15 ? 'РАЗГРУЗКА В ЦЕХЕ' : 'ВОЗВРАТ К СКЛАДУ',
  }
}
