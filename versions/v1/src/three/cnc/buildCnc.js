import * as T from 'three'
import { box, cylinder, wireModel } from '../runtime/wirePrimitives.js'
import { cncState } from './timeline.js'

export function buildCnc() {
  const root = new T.Group(), shell = new T.Group(); root.add(shell)
  box(shell, [6.8, .6, 5.3], [0, .3, 0])
  box(shell, [6.8, .25, 5.3], [0, 5.9, 0])
  for (const x of [-3.3, 3.3]) box(shell, [.22, 5.5, 5.3], [x, 3, 0])
  box(shell, [6.5, 5.5, .18], [0, 3, -2.6])
  for (let x = -3; x <= 3; x += .28) box(shell, [.018, 5, .04], [x, 3, -2.47], { color: '#34516d' })
  box(shell, [1.1, 5.4, .2], [-2.75, 3, 2.6]); box(shell, [.5, 5.4, .2], [3.05, 3, 2.6])
  const door = new T.Group(); shell.add(door)
  for (const x of [-2.1, 2.1]) box(door, [.1, 4.9, .1], [x, 3.1, 2.7], { color: '#b0c8d8' })
  for (const y of [.65, 5.55]) box(door, [4.3, .1, .1], [0, y, 2.7], { color: '#b0c8d8' })
  box(door, [4.2, 4.8, .03], [0, 3.1, 2.68], { fill: null })
  box(door, [.1, 1, .12], [1.8, 2.6, 2.83], { color: '#f1e261' })
  box(root, [.15, 3.2, .15], [4, 1.6, 1.5])
  box(root, [1.5, 1.8, .25], [4, 4, 1.5]); box(root, [1.1, .7, .03], [4, 4.3, 1.66], { color: '#98b9d3' })
  for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) box(root, [.13, .08, .02], [3.6 + i * .25, 3.4 + j * .17, 1.66])
  // A/B tilt and C rotation are visible independently of the XYZ travel.
  box(root, [3.8, .8, 3.4], [0, 1, -.2])
  const tilt = new T.Group(); tilt.position.set(0, 1.6, 0); root.add(tilt)
  const table = new T.Group(); tilt.add(table)
  cylinder(table, 1.35, .3, [0, 0, 0], { color: '#b6c8d5' })
  const workpiece = wireModel(new T.BoxGeometry(1.35, .65, 1.35, 3, 1, 3), { color: '#e0e4b1' }); workpiece.position.y = .48; table.add(workpiece)
  const pocket = wireModel(new T.TorusGeometry(.4, .035, 6, 48), { color: '#ffe359' }); pocket.rotation.x = Math.PI / 2; pocket.position.y = .82; table.add(pocket)
  const carriage = new T.Group(); carriage.position.y = 4.7; root.add(carriage)
  box(carriage, [2, .4, 1], [0, .6, -.7])
  const head = new T.Group(); carriage.add(head)
  box(head, [1.2, 1.25, 1.05], [0, 0, 0], { color: '#a9becf' })
  cylinder(head, .4, .5, [0, -.8, 0], { color: '#c8d4dd' })
  const spindle = new T.Group(); spindle.position.y = -1.1; head.add(spindle)
  const tool = wireModel(new T.ConeGeometry(.085, 1.45, 8), { color: '#ffdf65', fill: '#8b916c' }); tool.rotation.z = Math.PI; tool.position.y = -.7; spindle.add(tool)
  const originalOpacities = new Map()
  shell.traverse(o => { if (o.material) originalOpacities.set(o.material, o.material.opacity) })
  function update(position, time, reduced) {
    const state = cncState(position, reduced ? 1.5 : time)
    door.position.x = -state.door * 4.2
    tilt.rotation.z = state.tableTilt; table.rotation.y = state.tableSpin
    carriage.position.x = state.headX; carriage.position.z = state.headZ
    carriage.position.y = 4.9 + Math.sin(time * 1.1) * .12
    head.rotation.z = state.headTilt; head.rotation.y = state.headTurn; spindle.rotation.y = state.toolRotation
    const fade = 1 - state.inside * .92
    for (const [material, opacity] of originalOpacities) { material.transparent = true; material.opacity = opacity * fade; material.depthWrite = state.inside < .05 }
    return state
  }
  return { root, update }
}
