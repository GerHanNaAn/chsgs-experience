import { smooth } from '../../data/route.js'
export function cncState(position, time) {
  const inside = smooth(3.05, 3.55, position)
  const a = time * .8
  return {
    inside, door: smooth(2.95, 3.35, position),
    tableTilt: -.2 + Math.sin(a * .65) * .32,
    tableSpin: a * .55,
    headTilt: .15 + Math.sin(a * .8) * .24,
    headTurn: Math.sin(a * .6) * .4,
    headX: Math.sin(a) * .48,
    headZ: Math.cos(a * .7) * .3,
    toolRotation: time * 18,
    label: inside < .5 ? 'КОРПУС ПЯТИОСЕВОГО СТАНКА' : 'ОБРАБОТКА · ПЯТЬ ОСЕЙ',
  }
}
