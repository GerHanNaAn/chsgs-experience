import * as T from 'three'
import { box, pipe, cylinder } from '../runtime/wirePrimitives.js'
import { buildForklift } from './buildForklift.js'
import { stockState } from './timeline.js'
import { smooth } from '../../data/route.js'

export function buildStockyard() {
  const root = new T.Group(), vehicle = buildForklift(); root.add(vehicle.root)
  // Open front portal and wire roof preserve a view of unloading inside.
  box(root, [4, 5.7, .25], [-.2, 2.85, -7]); box(root, [4, 5.7, .25], [10.2, 2.85, -7])
  box(root, [14.4, 1.4, .25], [5, 5.7, -7])
  for (const x of [-2, 12]) for (const z of [-7, -17]) box(root, [.16, 6, .16], [x, 3, z])
  box(root, [14, .1, 10], [5, 6.2, -12], { fill: null })
  const gate = box(root, [4.2, 4.3, .14], [5, 2.15, -7], { color: '#d4d56b' })
  for (let y = .3; y < 4.2; y += .4) box(gate, [4.1, .035, .035], [0, y - 2.15, .08])
  // Flatbed truck and tubes, based on the supplied loading reference.
  const truck = new T.Group(); truck.position.set(-7, 0, 3.8); root.add(truck)
  box(truck, [2.8, .35, 8.5], [0, 1.15, 0]); box(truck, [2.8, 2.1, 2.4], [0, 2, -5.1])
  box(truck, [2.5, .8, .02], [0, 2.5, -6.33], { color: '#a7c1d4' })
  for (const x of [-1.4, 1.4]) for (const z of [-4.5, 2.2, 3.4]) cylinder(truck, .6, .35, [x, .6, z], { axis: 'x' })
  for (let row = 0; row < 2; row++) for (let i = 0; i < 4 - row; i++) pipe(root, .38, 5.8, [-12, .42 + row * .7, -1 + i * .82])
  function bundle(parent, position) { const g = new T.Group(); g.position.fromArray(position); for (let i = 0; i < 3; i++) pipe(g, .28, 4.5, [0, i === 2 ? .53 : .28, i === 0 ? -.32 : i === 1 ? .32 : 0], '#9cb7ce'); parent.add(g); return g }
  const onTruck = bundle(root, [-5, 1.4, 5.4]), load = bundle(vehicle.forks, [0, .14, -2]), delivered = bundle(root, [5, .2, -13])
  const path = new T.CatmullRomCurve3([new T.Vector3(-5, 0, 7.5), new T.Vector3(-2, 0, 3), new T.Vector3(5, 0, .5), new T.Vector3(5, 0, -11)])
  const initial = new T.Vector3(-5, 0, 10)
  function update(position, time, reduced) {
    const state = stockState(reduced ? 12 : time)
    if (state.phase < 5) { vehicle.root.position.copy(initial).lerp(path.getPoint(0), smooth(0, 2, state.phase)); vehicle.root.rotation.y = 0 }
    else {
      const p = state.phase < 15 ? state.driving : 1 - state.returning
      vehicle.root.position.copy(path.getPoint(p))
      const tangent = path.getTangent(p)
      vehicle.root.rotation.y = Math.atan2(-tangent.x, -tangent.z) + (state.phase >= 15 ? Math.PI : 0)
    }
    vehicle.forks.position.y = .5 + state.lift * .8
    onTruck.visible = state.phase < 3; load.visible = state.carrying; delivered.visible = state.delivered
    gate.position.y = 2.15 + state.gate * 4.5
    vehicle.wheels.forEach(wheel => { wheel.children.forEach(child => { child.rotation.y = time * 2 }) })
    return state
  }
  return { root, update }
}
