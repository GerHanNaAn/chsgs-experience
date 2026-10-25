// Analytic critically damped motion keeps its velocity when a moving target
// changes. Unlike restarting an easing curve, rapid retargets remain continuous.
export function damp(state, target, dt, frequency = 11) {
  const offset = state.value - target
  const impulse = state.velocity + frequency * offset
  const decay = Math.exp(-frequency * Math.max(0, dt))
  state.value = target + (offset + impulse * dt) * decay
  state.velocity = (state.velocity - frequency * impulse * dt) * decay
  const moving = Math.abs(state.value - target) > .001 || Math.abs(state.velocity) > .001
  if (!moving) { state.value = target; state.velocity = 0 }
  return moving
}

export function guideAxis(homes) {
  return { pair: null, focused: false, lines: homes.map(home => ({ home, target: home, value: home, velocity: 0 })) }
}

export function retargetGuides(axis, homes, bounds) {
  axis.lines = homes.map((home, i) => Object.assign(axis.lines[i] || { value: home, velocity: 0 }, { home, target: home }))
  if (axis.pair !== null && axis.pair >= homes.length - 1) axis.pair = null
  axis.focused = !!bounds
  if (!bounds) return
  // Keep the same two physical lines until their return has finished. Crossing
  // a cell boundary or interrupting the return must not select different lines.
  if (axis.pair === null) {
    const center = (bounds[0] + bounds[1]) / 2
    axis.pair = Math.max(0, Math.min(homes.length - 2, homes.findLastIndex(home => home <= center)))
  }
  axis.lines[axis.pair].target = bounds[0]
  axis.lines[axis.pair + 1].target = bounds[1]
}

export function advanceGuides(axis, dt, reduced = false) {
  let moving = false
  for (const line of axis.lines) {
    if (reduced) { line.value = line.target; line.velocity = 0 }
    else if (damp(line, line.target, dt)) moving = true
  }
  if (!axis.focused && !moving) axis.pair = null
  return moving
}
