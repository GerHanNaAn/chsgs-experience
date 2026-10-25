import { test } from 'node:test'
import assert from 'node:assert/strict'
import { damp, guideAxis, retargetGuides, advanceGuides } from '../src/motion/damped.js'

test('damped motion has the same timing at 30 and 144 frames per second', () => {
  function simulate(fps) {
    const state = { value: 0, velocity: 0 }
    for (let i = 0; i < fps / 2; i++) damp(state, 500, 1 / fps)
    return state
  }
  const slow = simulate(30), fast = simulate(144)
  assert.ok(Math.abs(slow.value - fast.value) < 1e-9)
  assert.ok(Math.abs(slow.velocity - fast.velocity) < 1e-9)
})

test('crossing a grid cell and interrupting a return keeps the same physical guides', () => {
  const homes = [27, 400, 773, 1146, 1519, 1892], axis = guideAxis(homes)
  retargetGuides(axis, homes, [1090, 1132])
  const pair = axis.pair
  for (let i = 0; i < 9; i++) advanceGuides(axis, 1 / 60)
  const rendered = axis.lines.map(({ value, velocity }) => [value, velocity])
  retargetGuides(axis, homes, [1150, 1192])
  assert.equal(axis.pair, pair, 'adjacent control across a cell must not switch line identities')
  assert.deepEqual(axis.lines.map(({ value, velocity }) => [value, velocity]), rendered, 'retarget must preserve position and velocity')
  retargetGuides(axis, homes, null)
  advanceGuides(axis, 1 / 60)
  retargetGuides(axis, homes, [1800, 1860])
  assert.equal(axis.pair, pair, 'a new target can interrupt the return without resetting')
  for (let i = 0; i < 180; i++) advanceGuides(axis, 1 / 60)
  assert.equal(axis.lines[pair].value, 1800)
  assert.equal(axis.lines[pair + 1].value, 1860)
  retargetGuides(axis, homes, null)
  for (let i = 0; i < 180; i++) advanceGuides(axis, 1 / 60)
  assert.equal(axis.pair, null)
  assert.deepEqual(axis.lines.map(line => line.value), homes)
  assert.equal(advanceGuides(axis, 1 / 60), false, 'settled animation stops requesting frames')
})

test('reduced motion reaches exact button bounds and returns without animated frames', () => {
  const homes = [27, 400, 773], axis = guideAxis(homes)
  retargetGuides(axis, homes, [450, 490])
  const pair = axis.pair
  assert.equal(advanceGuides(axis, 0, true), false)
  assert.equal(axis.lines[pair].value, 450)
  assert.equal(axis.lines[pair + 1].value, 490)
  retargetGuides(axis, homes, null)
  assert.equal(advanceGuides(axis, 0, true), false)
  assert.deepEqual(axis.lines.map(line => line.value), homes)
  assert.equal(axis.pair, null)
})
