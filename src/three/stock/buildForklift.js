import * as T from 'three'
import { box, cylinder } from '../runtime/wirePrimitives.js'

export function buildForklift() {
  const root = new T.Group(), ink = { color: '#b3c5d4' }, wheels = []
  box(root, [1.7, .7, 2.5], [0, .85, .2], ink)
  box(root, [1.65, .9, .9], [0, 1.45, .85])
  for (const x of [-.75, .75]) for (const z of [-.65, 1]) {
    const wheel = cylinder(root, .47, .32, [x, .47, z], { axis: 'x', color: '#91a9bd' }); wheels.push(wheel)
  }
  for (const x of [-.65, .65]) for (const z of [-.65, .6]) box(root, [.07, 1.8, .07], [x, 2.1, z], ink)
  box(root, [1.55, .1, 1.65], [0, 3.04, 0], ink)
  box(root, [.65, .13, .65], [0, 1.45, .1]); box(root, [.65, .65, .15], [0, 1.8, .4])
  for (const x of [-.6, .6]) box(root, [.12, 3.5, .14], [x, 1.9, -1.25], { color: '#f0df54' })
  const forks = new T.Group(); root.add(forks)
  for (const x of [-.48, .48]) box(forks, [.17, .12, 1.7], [x, 0, -1.95], ink)
  box(forks, [1.4, .7, .08], [0, .3, -1.23], ink)
  return { root, forks, wheels }
}
