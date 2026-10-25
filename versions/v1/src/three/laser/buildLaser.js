import * as T from 'three'
import { laserState } from './timeline.js'
import { createSparks } from './createSparks.js'

export function buildLaser() {
  const root = new T.Group(), lines = new T.LineBasicMaterial({ color: '#7297b7', transparent: true, opacity: .52 })
  const solid = new T.MeshBasicMaterial({ color: '#0d1a29', polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 })
  function box(w, h, d, x, y, z, parent = root, accent = false) {
    const g = new T.BoxGeometry(w, h, d), mesh = new T.Mesh(g, solid)
    mesh.position.set(x, y, z); parent.add(mesh)
    mesh.add(new T.LineSegments(new T.EdgesGeometry(g), accent ? new T.LineBasicMaterial({ color: '#e7dd46' }) : lines))
    return mesh
  }
  box(9.5, .35, 6, 0, .8, 0)
  for (const x of [-4, 4]) for (const z of [-2.4, 2.4]) box(.18, 1.8, .18, x, -.1, z)
  for (let x = -4.4; x <= 4.4; x += .42) box(.035, .25, 5.6, x, 1.06, 0)
  for (const x of [-4.8, 4.8]) box(.16, .16, 6.5, x, 2.4, 0)
  const gantry = new T.Group(); root.add(gantry)
  box(10.1, .45, .42, 0, 2.7, 0, gantry)
  const head = new T.Group(); gantry.add(head)
  box(.75, 1.05, .65, 0, 2.1, 0, head, true)
  const nozzle = new T.Mesh(new T.CylinderGeometry(.12, .04, .35, 12), new T.MeshBasicMaterial({ color: '#b7c4ce' }))
  nozzle.position.y = 1.42; head.add(nozzle)
  const shape = new T.Shape(); shape.moveTo(-4.3, -2.6); shape.lineTo(4.3, -2.6); shape.lineTo(4.3, 2.6); shape.lineTo(-4.3, 2.6); shape.closePath()
  const hole = new T.Path(); hole.absarc(0, 0, 1.4, 0, Math.PI * 2, true); shape.holes.push(hole)
  const sheet = new T.Mesh(new T.ShapeGeometry(shape, 80), solid); sheet.rotation.x = -Math.PI / 2; sheet.position.y = 1.24; root.add(sheet)
  const ring = new T.Mesh(new T.RingGeometry(.78, 1.4, 96), new T.MeshBasicMaterial({ color: '#203448', side: T.DoubleSide }))
  ring.rotation.x = -Math.PI / 2; ring.position.y = 1.245; root.add(ring)
  const plug = new T.Mesh(new T.CircleGeometry(.78, 64), solid); plug.rotation.x = -Math.PI / 2; plug.position.y = 1.247; root.add(plug)
  const gridPoints = []
  for (let x = -4.2; x <= 4.3; x += .45) gridPoints.push(x, 1.25, -2.6, x, 1.25, 2.6)
  for (let z = -2.6; z <= 2.6; z += .45) gridPoints.push(-4.3, 1.25, z, 4.3, 1.25, z)
  const grid = new T.LineSegments(new T.BufferGeometry().setAttribute('position', new T.Float32BufferAttribute(gridPoints, 3)), new T.LineBasicMaterial({ color: '#476b87', transparent: true, opacity: .45 })); root.add(grid)
  function cutCircle(radius) {
    const points = Array.from({ length: 129 }, (_, i) => new T.Vector3(Math.cos(i / 128 * Math.PI * 2) * radius, 1.265, Math.sin(i / 128 * Math.PI * 2) * radius))
    const circle = new T.Line(new T.BufferGeometry().setFromPoints(points), new T.LineBasicMaterial({ color: '#ffdc5b' })); root.add(circle); return circle
  }
  const outer = cutCircle(1.4), inner = cutCircle(.78)
  const glow = new T.Mesh(new T.SphereGeometry(.09, 12, 8), new T.MeshBasicMaterial({ color: '#ffe8b0', transparent: true, blending: T.AdditiveBlending, depthWrite: false }))
  root.add(glow)
  const sparks = createSparks(); root.add(sparks.root)
  function update(time, reduced) {
    const state = laserState(reduced ? 7 : time)
    gantry.position.z = state.z; head.position.x = state.x
    glow.position.set(state.x, 1.27, state.z); glow.visible = state.cutting && !reduced
    outer.geometry.setDrawRange(0, Math.max(0, Math.floor(state.outer * 129))); inner.geometry.setDrawRange(0, Math.max(0, Math.floor(state.inner * 129)))
    ring.position.y = 1.245 + state.release * .85; ring.rotation.z = state.release * .18
    plug.position.y = 1.247 - state.release * .6; grid.visible = state.release < .1
    state.sparks = sparks.update(time, state.x, state.z, state.cutting && !reduced)
    return state
  }
  return { root, update }
}
