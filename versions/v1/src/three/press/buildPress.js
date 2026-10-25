import * as T from 'three'
import { box, cylinder } from '../runtime/wirePrimitives.js'
import { buildBlank } from './buildBlank.js'
import { pressState } from './timeline.js'

export function buildPress() {
  const root = new T.Group()
  box(root, [7, .7, 4.4], [0, .35, 0])
  for (const x of [-2.7, 2.7]) { box(root, [.8, 6.5, 2.4], [x, 3.8, -.5]); cylinder(root, .12, 5, [x + (x < 0 ? .55 : -.55), 3.9, .8], { color: '#b9cbd7' }) }
  box(root, [6.2, 1.2, 3], [0, 7.2, -.3])
  box(root, [4, .5, 3.3], [0, 1.35, 0], { color: '#aabed1' })
  cylinder(root, 1.3, .25, [0, 1.55, 0])
  const ram = new T.Group(); root.add(ram)
  box(ram, [4.3, .5, 3.1], [0, 0, 0], { color: '#f5e168' })
  cylinder(ram, .4, 2.3, [0, 1.4, -.3], { color: '#bfcbd3' })
  for (let i = -3; i <= 3; i++) { const stripe = box(ram, [.13, .35, .02], [i * .5, 0, 1.565], { color: '#d1c971' }); stripe.rotation.z = -.5 }
  box(root, [1.4, 2.5, 1.6], [-4, 1.25, -.4]); cylinder(root, .45, 1.1, [-4, 3, -.4])
  box(root, [1, 2, .2], [3.5, 3, .8]); for (let y = 2.5; y < 3.6; y += .3) cylinder(root, .07, .04, [3.5, y, .94], { axis: 'z', color: '#b4c4d4' })
  const blank = buildBlank(); root.add(blank.root)
  function update(position) {
    const state = pressState(position)
    ram.position.y = state.headY
    blank.root.position.set(state.blankX, 1.6, 0); blank.update(state.form)
    return state
  }
  return { root, update }
}
