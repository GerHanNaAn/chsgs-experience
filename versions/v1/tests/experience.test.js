import { test } from 'node:test'
import assert from 'node:assert/strict'
import { sceneWeights, galleryStart, galleryStep, galleryExit, storyEnd, routeIndex, route, stops, activeDepartment, departments, stations, nextPosition } from '../src/data/route.js'
import { laserState } from '../src/three/laser/timeline.js'
import { pressState } from '../src/three/press/timeline.js'
import { stockState } from '../src/three/stock/timeline.js'
import { createSparks } from '../src/three/laser/createSparks.js'
import { disposeTree } from '../src/three/runtime/createViewport.js'
import { factoryZone } from '../src/three/factory/zones.js'
import { products } from '../src/data/products.js'

test('warehouse disappears before product exhibition; route can run backwards', () => {
  assert.equal(sceneWeights(0).factory, 1)
  assert.equal(sceneWeights(stops.stock).stock, 1)
  assert.equal(sceneWeights(stops.cnc).cnc, 1)
  assert.equal(sceneWeights(stops.press).press, 1)
  assert.equal(sceneWeights(galleryStart).factory, 0)
  assert.equal(sceneWeights(galleryStart).gallery, 1)
  assert.equal(sceneWeights(0).gallery, 0)
  for (let p = 0; p <= storyEnd; p += .03) {
    const weights = sceneWeights(p)
    assert.ok(Object.values(weights).some(weight => weight > .1), `Blank scene at ${p}`)
    assert.ok(Object.values(weights).every(weight => weight >= 0 && weight <= 1))
  }
})
test('all five products are reachable within the native scroll range', () => {
  assert.equal(products.length, 5)
  assert.equal(products.filter(p => p.available).length, 1)
  for (let i = 0; i < 5; i++) {
    const position = galleryStart + i * galleryStep
    assert.ok(position <= storyEnd)
    assert.equal(Math.round((position - galleryStart) / galleryStep), i)
    assert.equal(route[routeIndex(position)].id, 'products')
  }
})
test('the complete press stroke inserts before forming and opens after the sphere is formed', () => {
  assert.equal(pressState(stops.press).form, 0)
  assert.equal(pressState(stops.press + 1.25).form, 1)
  assert.equal(pressState(stops.press + 1.25).open, 1)
  for (let p = stops.press; p < stops.press + 1.5; p += .005) {
    const state = pressState(p)
    if (state.form > 0) assert.equal(state.insertion, 1)
    if (state.open > 0) assert.equal(state.form, 1)
    assert.ok(state.headY >= 3.4 - 1e-8)
    assert.equal(activeDepartment(p), 'production')
  }
})

test('department order and scroll continuation match production, products, metal stock', () => {
  assert.deepEqual(departments.map(d => d.id), ['production', 'products', 'stock'])
  assert.equal(activeDepartment(0), '')
  for (const station of stations) assert.equal(activeDepartment(station.position), 'production')
  assert.equal(activeDepartment(galleryStart), 'products')
  assert.equal(activeDepartment(stops.stock), 'stock')
  assert.equal(nextPosition(galleryStart + 4 * galleryStep), stops.stock)
  assert.ok(galleryExit < stops.stock)
  for (let p = 0; p < storyEnd - .1; p += .04) assert.ok(nextPosition(p) > p)
})
test('forklift cargo is not duplicated between truck, carriage and delivery', () => {
  for (let t = 0; t < 44; t += .02) {
    const state = stockState(t)
    assert.ok(!(state.carrying && state.delivered))
    if (state.phase > 10 && state.phase < 15) assert.ok(state.gate > .98)
  }
})
test('laser sparks are re-emitted throughout both cuts, with finite trail positions', () => {
  const sparks = createSparks()
  for (let t = 0; t < 20; t += .04) {
    const state = laserState(t)
    const count = sparks.update(t, state.x, state.z, state.cutting)
    assert.equal(count > 0, state.cutting)
    for (const object of sparks.root.children) assert.ok(object.geometry.attributes.position.array.every(Number.isFinite))
  }
  disposeTree(sparks.root)
})
test('whole warehouse shell and office share a zone; adjacent vehicles stay neutral', () => {
  for (const name of ['MainHangar_NEW_001','MainHangarRoof_NEW_002.001','MainOffice_NEW','MainOffice_Roof_NEW','Storage_NEW']) assert.equal(factoryZone(name, { x: 14 }), 'warehouse')
  assert.equal(factoryZone('Car_001', { x: 14 }), 'site')
  assert.equal(factoryZone('Fence', { x: 14 }), 'site')
  assert.equal(factoryZone('HangarRoof_001', { x: -10 }), 'production')
})
test('laser finishes outer and inner contours before releasing the ring', () => {
  for (let t = 0; t < 10; t += .02) {
    const state = laserState(t)
    if (state.release > 0) { assert.equal(state.outer, 1); assert.equal(state.inner, 1); assert.equal(state.cutting, false) }
  }
  assert.equal(laserState(0).release, 0)
  assert.equal(laserState(10).release, 0)
  assert.equal(laserState(2).cutting, true)
})
