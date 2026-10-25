import { blockoutSections, blockoutIndex, stationPose } from '../data/blockout.js'

const clamp = value => Math.max(0, Math.min(1, value))
export const easeFlight = value => { const t = clamp(value); return clamp(t * t * t * (t * (t * 6 - 15) + 10)) }
export const flightDuration = 1500

// Button navigation has one departure and one arrival, regardless of distance.
// Its caption is deliberately independent of the physical position along X.
export function navigationView(flight) {
  const progress = clamp(flight.progress), blend = easeFlight(progress)
  const departing = progress < .5
  return {
    blend,
    position: flight.from + (flight.to - flight.from) * blend,
    index: departing ? flight.fromIndex : blockoutIndex(flight.to),
    opacity: departing ? flight.fromOpacity * (1 - easeFlight(progress / .2)) : easeFlight((progress - .78) / .22),
  }
}

export function sampleDirectFlight(flight) {
  const { blend } = navigationView(flight), target = stationPose(blockoutSections[blockoutIndex(flight.to)])
  const mix = (a, b) => a.map((v, i) => v + (b[i] - v) * blend)
  const eye = mix(flight.fromPose.eye, target.eye), aim = mix(flight.fromPose.aim, target.aim)
  const arc = Math.sin(Math.PI * blend) ** 2
  eye[1] += arc * .7; eye[2] += arc * 3
  return { eye, aim, fov: 35 }
}
