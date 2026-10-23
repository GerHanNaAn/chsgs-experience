import { clamp, smooth } from '../../data/route.js'
export function pressState(position) {
  const phase = clamp((position - 4.6) / 1.15)
  const insertion = smooth(0, .22, phase), close = smooth(.25, .5, phase), form = smooth(.4, .65, phase), open = smooth(.72, .98, phase)
  return {
    phase, insertion, form, open, headY: 5.8 - 2.4 * close * (1 - open), blankX: -4.7 * (1 - insertion),
    label: phase < .22 ? 'ПОДАЧА ТРУБНОЙ ЗАГОТОВКИ' : phase < .4 ? 'ЗАКРЫТИЕ ПРЕССА' : phase < .72 ? 'ФОРМОВКА ШАРА' : phase < .98 ? 'РАСКРЫТИЕ ПРЕССА' : 'ШАРОВАЯ ЗАГОТОВКА',
  }
}
