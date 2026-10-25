import { test } from 'node:test'
import assert from 'node:assert/strict'
import * as T from 'three'
import { blockoutSections, blockoutEnd, sampleBlockoutCamera, stationPose, blockoutIndex, captionOpacity, overviewMetrics } from '../src/data/blockout.js'
import { buildBlockout } from '../src/three/blockout/buildBlockout.js'
import { disposeTree } from '../src/three/runtime/createViewport.js'

test('camera reaches every stop, clamps boundaries and holds still for reading', () => {
  for (const section of blockoutSections) {
    assert.deepEqual(sampleBlockoutCamera(section.index).eye, stationPose(section).eye)
    assert.deepEqual(sampleBlockoutCamera(section.index + .1).eye, stationPose(section).eye)
    assert.equal(blockoutIndex(section.index), section.index)
    assert.equal(captionOpacity(section.index), 1)
    if (section.index < blockoutEnd) assert.equal(captionOpacity(section.index + .5), 0)
  }
  assert.deepEqual(sampleBlockoutCamera(-20), sampleBlockoutCamera(0))
  assert.deepEqual(sampleBlockoutCamera(30), sampleBlockoutCamera(blockoutEnd))
  assert.equal(overviewMetrics.find(m => m.value === '700').prefix, 'Около')
})

test('horizontal flight is continuous, monotonic and reversible with no aerial jump', () => {
  const forward = [], step = .001
  let previous = sampleBlockoutCamera(0)
  for (let i = 0; i <= blockoutEnd / step; i++) {
    const p = i * step, pose = sampleBlockoutCamera(p)
    assert.ok([...pose.eye, ...pose.aim].every(Number.isFinite))
    assert.ok(pose.eye[0] >= previous.eye[0] - 1e-8)
    assert.ok(pose.eye[1] >= 6 - 1e-8 && pose.eye[1] < 12)
    assert.ok(pose.eye[2] > 30)
    assert.ok(Math.hypot(...pose.eye.map((v, j) => v - previous.eye[j])) < .4)
    assert.equal(pose.fov, 35)
    forward.push(pose); previous = pose
  }
  for (let i = forward.length - 1; i >= 0; i--) assert.deepEqual(sampleBlockoutCamera(i * step), forward[i])
})

test('the camera corridor does not intersect any blockout building or platform', () => {
  const factory = buildBlockout(); factory.root.updateMatrixWorld(true)
  const bounds = []
  factory.root.traverse(object => {
    if (object.isMesh && object.geometry.type === 'BoxGeometry') bounds.push(new T.Box3().setFromObject(object).expandByScalar(.5))
  })
  assert.equal(factory.sites.length, blockoutSections.length)
  for (let p = 0; p <= blockoutEnd; p += .01) {
    const eye = new T.Vector3(...sampleBlockoutCamera(p).eye)
    assert.ok(!bounds.some(box => box.containsPoint(eye)), `Collision at ${p}`)
  }
  disposeTree(factory.root)
})
