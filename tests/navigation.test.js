import { test } from 'node:test'
import assert from 'node:assert/strict'
import { blockoutSections, stationPose } from '../src/data/blockout.js'
import { navigationView, sampleDirectFlight } from '../src/motion/blockoutNavigation.js'

const flight = (from, to) => ({ from, to, fromIndex: from, fromOpacity: 1, fromPose: stationPose(blockoutSections[from]), progress: 0 })

test('2 to 7 and 7 to 2 expose only the source and destination captions', () => {
  for (const [from, to] of [[1, 6], [6, 1], [5, 6]]) {
    const route = flight(from, to), seen = new Set()
    for (let i = 0; i <= 1000; i++) {
      const view = navigationView({ ...route, progress: i / 1000 })
      seen.add(view.index)
      if (i >= 200 && i <= 780) assert.equal(view.opacity, 0, 'intermediate landscape must not flash a caption')
    }
    assert.deepEqual([...seen], [from, to])
    assert.equal(navigationView(route).opacity, 1)
    assert.equal(navigationView({ ...route, progress: 1 }).opacity, 1)
  }
})

test('a distant flight has exact endpoints and no repeated stops in the middle', () => {
  const route = flight(1, 6)
  assert.deepEqual(sampleDirectFlight(route), { ...route.fromPose, fov: 35 })
  assert.deepEqual(sampleDirectFlight({ ...route, progress: 1 }), { ...stationPose(blockoutSections[6]), fov: 35 })
  let previous = sampleDirectFlight({ ...route, progress: .1 })
  for (let i = 101; i <= 900; i++) {
    const pose = sampleDirectFlight({ ...route, progress: i / 1000 })
    assert.ok(pose.eye[0] > previous.eye[0], 'one uninterrupted dolly instead of a hold at every intermediate stop')
    assert.ok(pose.eye[2] > 30 && pose.eye[1] < 12)
    previous = pose
  }
})

test('retarget starts at the displayed pose and preserves the current caption opacity', () => {
  const original = { ...flight(1, 6), progress: .41 }
  const shown = navigationView(original), shownPose = sampleDirectFlight(original)
  const replacement = {
    from: shown.position, fromIndex: shown.index, fromOpacity: shown.opacity,
    fromPose: shownPose, to: 7, progress: 0,
  }
  assert.notEqual(Math.round(shown.position), shown.index, 'fixture must cross an unrelated physical section')
  assert.deepEqual(sampleDirectFlight(replacement), shownPose)
  assert.equal(navigationView(replacement).index, shown.index)
  assert.equal(navigationView(replacement).opacity, shown.opacity)
})
