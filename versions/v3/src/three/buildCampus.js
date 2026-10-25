import * as THREE from 'three'

const PALETTE = {
  frame: '#83949b',
  detail: '#566d78',
  accent: '#f4e600',
  back: '#3a4a56',
  face: '#0d1720',
  roof: '#13232d',
  ground: '#0a1018',
}

const clamp01 = value => Math.max(0, Math.min(1, Number(value) || 0))

/**
 * A deliberately schematic campus: broad architectural edges, shaded faces and
 * open foreground structures. There are no CAD models, triangle wireframes or
 * animated manufacturing props. Coordinates are metres in each stop's frame.
 */
export function buildCampus(stops) {
  const root = new THREE.Group()
  root.name = 'chsgs-v3-campus'
  const sites = []
  const bounds = []
  const allGeometries = new Set()
  const allMaterials = new Set()
  const inactiveAccent = new THREE.Color(PALETTE.frame)
  const activeAccent = new THREE.Color(PALETTE.accent)

  function geometry(positions) {
    const result = new THREE.BufferGeometry()
    result.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    result.computeBoundingSphere()
    allGeometries.add(result)
    return result
  }

  function lineMaterial(color, opacity) {
    const result = new THREE.LineBasicMaterial({
      color, transparent: true, opacity, depthWrite: false,
      toneMapped: false, fog: true,
    })
    allMaterials.add(result)
    return result
  }

  function faceMaterial(color, opacity) {
    const result = new THREE.MeshBasicMaterial({
      color, transparent: true, opacity, depthWrite: true,
      side: THREE.DoubleSide, toneMapped: false, fog: true,
      polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1,
    })
    allMaterials.add(result)
    return result
  }

  function siteBuilder(stop, order) {
    const group = new THREE.Group()
    group.name = `site-${stop.id || order}`
    group.position.fromArray(stop.site || [order * 75, 0, 0])
    group.rotation.y = Number(stop.yaw) || 0
    group.userData.stopIndex = stop.index ?? order
    root.add(group)

    const lines = { frame: [], detail: [], accent: [], back: [], ground: [] }
    const faces = { face: [], roof: [] }
    const solids = []

    function segment(a, b, layer = 'frame') {
      lines[layer].push(...a, ...b)
    }

    function path(points, layer = 'frame', close = false) {
      for (let i = 1; i < points.length; i++) segment(points[i - 1], points[i], layer)
      if (close) segment(points.at(-1), points[0], layer)
    }

    function quad(a, b, c, d, layer = 'face') {
      faces[layer].push(...a, ...b, ...c, ...a, ...c, ...d)
    }

    function rectangle(x, y, z, width, height, layer = 'detail') {
      const l = x - width / 2, r = x + width / 2
      path([[l, y, z], [r, y, z], [r, y + height, z], [l, y + height, z]], layer, true)
    }

    function floor(x, z, width, depth, y = 0, layer = 'ground') {
      const l = x - width / 2, r = x + width / 2
      const b = z - depth / 2, f = z + depth / 2
      path([[l, y, b], [r, y, b], [r, y, f], [l, y, f]], layer, true)
    }

    function volume(x, z, width, height, depth, options = {}) {
      const y = options.y || 0, layer = options.layer || 'frame'
      const l = x - width / 2, r = x + width / 2
      const b = z - depth / 2, f = z + depth / 2, top = y + height
      const bottom = [[l, y, b], [r, y, b], [r, y, f], [l, y, f]]
      const upper = bottom.map(([px, , pz]) => [px, top, pz])
      path(bottom, layer, true)
      path(upper, layer, true)
      for (let i = 0; i < 4; i++) segment(bottom[i], upper[i], layer)
      if (options.fill !== false) {
        quad(bottom[3], bottom[2], upper[2], upper[3])
        quad(bottom[0], bottom[3], upper[3], upper[0])
        quad(bottom[2], bottom[1], upper[1], upper[2])
        quad(bottom[1], bottom[0], upper[0], upper[1])
        quad(upper[0], upper[3], upper[2], upper[1], 'roof')
      }
      if (options.solid !== false) solids.push(new THREE.Box3(
        new THREE.Vector3(l, y, b), new THREE.Vector3(r, top, f),
      ))
      return { l, r, b, f, y, top }
    }

    function post(x, z, height, layer = 'frame', y = 0, width = .24) {
      return volume(x, z, width, height, width, { y, layer, solid: false })
    }

    function beam(a, b, height = .2, layer = 'frame') {
      // Beams are orthogonal architectural members; the line reads at distance,
      // while the quiet upper plane gives a small amount of dimensional weight.
      segment(a, b, layer)
      segment([a[0], a[1] + height, a[2]], [b[0], b[1] + height, b[2]], layer)
    }

    function canopy(x, z, width, depth, height, supports = true, layer = 'frame') {
      volume(x, z, width, .24, depth, { y: height, layer, solid: false })
      if (supports) {
        for (const px of [x - width / 2 + 1, x + width / 2 - 1]) {
          post(px, z + depth / 2 - .7, height, layer)
        }
      }
    }

    function ribbon(x, y, z, width, height = .34, layer = 'accent') {
      rectangle(x, y, z, width, height, layer)
      segment([x - width / 2, y + height / 2, z], [x + width / 2, y + height / 2, z], layer)
    }

    function glazing(x, y, z, width, height, columns = 3, rows = 1) {
      rectangle(x, y, z, width, height, 'detail')
      for (let i = 1; i < columns; i++) {
        const px = x - width / 2 + width * i / columns
        segment([px, y, z], [px, y + height, z], 'detail')
      }
      for (let i = 1; i < rows; i++) {
        const py = y + height * i / rows
        segment([x - width / 2, py, z], [x + width / 2, py, z], 'detail')
      }
    }

    function bay(x, z, width = 4.2, height = 4.8) {
      rectangle(x, .05, z, width, height, 'frame')
      rectangle(x, .18, z + .012, width - .28, height - .32, 'detail')
      segment([x - width / 2, height - .7, z], [x + width / 2, height - .7, z], 'detail')
      floor(x, z + 2.8, width + .5, 5.6, .018, 'ground')
    }

    function gable(x, z, width, wallHeight, depth, rise, layer = 'frame') {
      const l = x - width / 2, r = x + width / 2
      const b = z - depth / 2, f = z + depth / 2, peak = wallHeight + rise
      for (const pz of [b, f]) {
        path([[l, 0, pz], [l, wallHeight, pz], [x, peak, pz], [r, wallHeight, pz], [r, 0, pz]], layer)
        segment([l, wallHeight, pz], [r, wallHeight, pz], 'detail')
      }
      for (const [px, py] of [[l, 0], [r, 0], [l, wallHeight], [r, wallHeight], [x, peak]]) {
        segment([px, py, b], [px, py, f], layer)
      }
      quad([l, 0, f], [r, 0, f], [r, wallHeight, f], [l, wallHeight, f])
      quad([l, 0, b], [l, 0, f], [l, wallHeight, f], [l, wallHeight, b])
      quad([r, 0, f], [r, 0, b], [r, wallHeight, b], [r, wallHeight, f])
      quad([r, 0, b], [l, 0, b], [l, wallHeight, b], [r, wallHeight, b])
      faces.face.push(l, wallHeight, f, r, wallHeight, f, x, peak, f)
      faces.face.push(r, wallHeight, b, l, wallHeight, b, x, peak, b)
      quad([l, wallHeight, b], [l, wallHeight, f], [x, peak, f], [x, peak, b], 'roof')
      quad([x, peak, b], [x, peak, f], [r, wallHeight, f], [r, wallHeight, b], 'roof')
      // Two structural roof ribs, rather than a dense cage of facade cells.
      for (const pz of [z - depth / 6, z + depth / 6]) {
        path([[l, wallHeight, pz], [x, peak, pz], [r, wallHeight, pz]], 'detail')
      }
      solids.push(new THREE.Box3(new THREE.Vector3(l, 0, b), new THREE.Vector3(r, peak, f)))
      return { l, r, b, f, peak }
    }

    function bracket(x, y, z, width, height) {
      const l = x - width / 2, r = x + width / 2, size = Math.min(width, height) * .18
      for (const [px, sx] of [[l, 1], [r, -1]]) {
        for (const [py, sy] of [[y, 1], [y + height, -1]]) {
          path([[px + size * sx, py, z], [px, py, z], [px, py + size * sy, z]], 'accent')
        }
      }
    }

    function entrance() {
      const reception = volume(-12, -12, 17, 7.7, 10)
      glazing(-12, 3, reception.f + .025, 14, 3, 5)
      volume(-19, 3, 5.2, 3.7, 7)
      glazing(-19, 1.5, 6.52, 3.6, 1.25, 2)
      // The entrance is genuinely open: an overhead portal and a small booth.
      post(-10, 3, 7.2, 'frame', 0, .45)
      post(12, 3, 7.2, 'frame', 0, .45)
      canopy(1, 2.4, 23.4, 4.8, 7.2, false)
      ribbon(1, 7.25, 4.83, 22, .22)
      volume(-7.4, 5.2, .65, 1.35, .8, { solid: false })
      beam([-7.4, 1.3, 5.2], [4.5, 1.3, 5.2], .08, 'accent')
      for (const x of [-6.5, -3.5, -.5, 2.5, 5.5]) {
        segment([x, .03, 9], [x, .03, 12], 'detail')
      }
      // Foreground fence terminates at the gate, leaving its approach readable.
      for (const [a, b] of [[-27, -12], [15, 25]]) {
        beam([a, 1.8, 6], [b, 1.8, 6], .1, 'detail')
        beam([a, .45, 6], [b, .45, 6], .08, 'detail')
        for (let x = a; x <= b; x += 5) post(x, 6, 2, 'detail', 0, .12)
      }
    }

    function production() {
      const left = gable(-10, -7, 14, 7.8, 25, 3.6)
      const right = gable(7, -9.5, 14, 7.8, 25, 3.6)
      for (const [x, f] of [[-10, left.f], [7, right.f]]) {
        bay(x, f + .035, 6.2, 4.8)
        glazing(x, 6.15, f + .04, 11.3, 1.1, 4)
      }
      ribbon(-10, 7.88, left.f + .05, 13.9, .2)
      ribbon(7, 7.88, right.f + .05, 13.9, .2)
      // A high utility mast and an open pipe rack make the two halls distinct
      // from the low arrival portal without suggesting a detailed machine.
      volume(-22, -14, 1.2, 14.7, 1.2, { solid: false })
      for (const x of [-24, -18]) post(x, 7, 6.6, 'detail')
      beam([-24, 6.6, 7], [-18, 6.6, 7], .22, 'detail')
      segment([-24, 5.8, 7], [-18, 5.8, 7], 'detail')
      floor(-1, 8.5, 35, 7, .02, 'ground')
    }

    function quality() {
      const tower = volume(-11, -8, 11.5, 15.8, 12)
      const annex = volume(6.5, -9, 15, 6.2, 12)
      for (const y of [3, 7.4, 11.8]) {
        glazing(-11, y, tower.f + .025, 9.4, 2.8, 3)
      }
      for (const y of [6.6, 11]) {
        path([[tower.l - .2, y, tower.f + .12], [tower.r + .2, y, tower.f + .12], [tower.r + .2, y, tower.b]], 'frame')
      }
      glazing(6.5, 2.3, annex.f + .025, 12.4, 2.7, 4)
      canopy(5, 0, 9, 4, 3, false)
      rectangle(5, 0, 2.03, 2.3, 3, 'frame')
      // A suspended connector gives a clearly different composition and height.
      volume(-1.6, -7.5, 7.3, 2.3, 4, { y: 7.5 })
      ribbon(tower.r + .035, 1.4, tower.f + .04, .3, 12.9)
      bracket(-11, 11.6, tower.f + .07, 9.6, 3.2)
      floor(4.5, 5, 15, 9, .02)
    }

    function traceability() {
      const hall = volume(-5.5, -11, 28, 8.4, 14)
      for (const x of [-14.5, -6.5, 1.5]) bay(x, hall.f + .03, 5.2, 5)
      canopy(-5, .4, 33, 9.5, 6.25, false)
      for (const x of [-20, -8, 7, 10]) post(x, 4.1, 6.25, 'frame', 0, .19)
      ribbon(-5, 6.28, 5.18, 32.8, .22)
      // The freestanding rectangular inspection gate is an architectural cue,
      // not a fabricated animation of an actual factory control system.
      const gx = 9.5, gz = 8.3
      post(gx - 3, gz, 4.7, 'frame', 0, .28)
      post(gx + 3, gz, 4.7, 'frame', 0, .28)
      beam([gx - 3, 4.7, gz], [gx + 3, 4.7, gz], .2, 'frame')
      bracket(gx, .7, gz + .1, 5.7, 3.7)
      for (const x of [-16.5, -10.5]) {
        volume(x, .8, 3.9, 2.6, 3.2, { layer: 'detail', solid: false })
        segment([x, .1, 2.42], [x, 2.6, 2.42], 'detail')
      }
      floor(9.5, 6, 7.5, 12, .025)
      segment([5.7, .025, 12], [5.7, .025, -1], 'accent')
    }

    function service() {
      const hall = volume(-2.5, -8, 29, 7.8, 14)
      const tower = volume(-21, -10, 6, 11, 9)
      for (const x of [-12.5, -5.5, 1.5, 8.5]) bay(x, hall.f + .035, 5, 4.6)
      glazing(-2.5, 6.1, hall.f + .04, 25, .85, 8)
      canopy(-2.5, -.2, 30, 3.7, 5.2, false)
      ribbon(-2.5, 5.25, 1.68, 29.7, .24)
      glazing(-21, 7, tower.f + .035, 4.2, 2.6, 2)
      floor(-2.5, 5.2, 31, 8, .02)
      // Separate broad service lanes rather than a repetitive small floor grid.
      for (const x of [-16, -9, -2, 5, 12]) segment([x, .025, 1.7], [x, .025, 9], 'detail')
      post(-25, 9.5, 11.5, 'detail')
      beam([-25, 11.5, 9.5], [-20.5, 11.5, 9.5], .1, 'detail')
    }

    function film() {
      const left = volume(-20, -8, 7, 9.6, 22)
      volume(17, -14, 8, 7.2, 16)
      const screen = volume(-2, -15, 22, 10.3, .65, { y: 1.2 })
      rectangle(-2, 2.3, screen.f + .025, 19.7, 7.9, 'frame')
      bracket(-2, 2.3, screen.f + .055, 19.7, 7.9)
      // This dark architectural panel remains neutral; the actual video is
      // opened by the UI and is not imitated by a fake in-scene image.
      segment([-5, 6.25, screen.f + .045], [1, 6.25, screen.f + .045], 'detail')
      glazing(-20, 3, left.f + .035, 4.5, 4.8, 2, 2)
      for (const [w, d, z] of [[28, 13, -.5], [32, 17, -.5]]) floor(-1, z, w, d, .025, 'ground')
      for (const x of [-12, 10]) {
        volume(x, 3.8, 4.5, .5, 1.4, { layer: 'detail', solid: false })
      }
      canopy(-20, 5.2, 10, 4.5, 4.6, false, 'detail')
    }

    function global() {
      const terminal = volume(-4.5, -12, 33, 7.2, 14)
      canopy(-4.5, -3.8, 35, 4, 7.2, false)
      glazing(-4.5, 4.4, terminal.f + .025, 28.5, 1.6, 7)
      for (const x of [-15, -5, 5]) bay(x, terminal.f + .04, 5.5, 3.7)
      // A broad open gantry changes the horizon and frames the dispatch court.
      for (const x of [-22, 17]) {
        post(x, 6, 11.8, 'frame', 0, .42)
        post(x, 2, 11.8, 'detail', 0, .3)
        beam([x, 11.8, 2], [x, 11.8, 6], .28, 'frame')
      }
      beam([-22, 11.8, 6], [17, 11.8, 6], .45, 'frame')
      segment([-22, 11.6, 6.02], [17, 11.6, 6.02], 'accent')
      for (const [x, z] of [[-14, .4], [-5, .4], [4, -1.5]]) {
        volume(x, z, 7.2, 2.9, 3, { layer: 'detail', solid: false })
        for (const dx of [-2.4, 0, 2.4]) segment([x + dx, .15, z + 1.52], [x + dx, 2.75, z + 1.52], 'detail')
      }
      floor(-2.5, 8.5, 39, 6.5, .02)
      for (const x of [-17, -7, 3, 13]) segment([x, .025, 11.7], [x + 5, .025, 11.7], 'detail')
    }

    function clients() {
      const office = volume(-11, -7, 17, 13.2, 12)
      const wing = volume(6, -9.5, 14, 5.2, 11)
      glazing(-11, 1.6, office.f + .035, 14.3, 10, 5, 3)
      for (const y of [5, 8.6]) {
        path([[office.l, y, office.f + .05], [office.r, y, office.f + .05], [office.r, y, office.b]], 'frame')
      }
      glazing(6, 1.5, wing.f + .035, 11.4, 2.4, 4)
      canopy(1.3, 1.8, 10.5, 6, 4.2, false)
      post(-3.3, 4, 4.2, 'frame')
      post(5.7, 4, 4.2, 'frame')
      ribbon(-18.9, .6, office.f + .08, .27, 12)
      ribbon(1.3, 4.25, 4.84, 10.5, .19)
      floor(-1, 7.5, 17, 5, .02)
      for (const x of [-22, 13]) {
        post(x, 4.8, 8.3, 'detail', 0, .18)
        beam([x, 8.3, 4.8], [x + 3, 8.3, 4.8], .08, 'detail')
      }
    }

    // Station platforms are quiet orthogonal boundaries, not wire mesh terrain.
    floor(-1, -4, 53, 39, -.045)
    segment([-28, -.035, 13], [27, -.035, 13], 'ground')
    segment([-28, -.035, 20], [27, -.035, 20], 'ground')
    for (const x of [-23, -9, 5, 19]) segment([x, -.02, 16.5], [x + 5, -.02, 16.5], 'ground')

    const kind = String(stop.kind || '').toLowerCase()
    const constructors = {
      entrance, gate: entrance,
      production, hangar: production,
      quality, lab: quality,
      traceability, trace: traceability, warehouse: traceability,
      service,
      film, video: film, courtyard: film,
      global, logistics: global, dispatch: global,
      clients, office: clients, exit: clients,
    }
    ;(constructors[kind] || [entrance, production, quality, traceability, service, film, global, clients][order % 8])()

    // One distant volume and a broken utility line give atmosphere without
    // repeating a second detailed campus behind every focal building.
    volume(9, -37, 24, 5, 9, { layer: 'back', fill: false, solid: false })
    path([[-28, 5.3, -24], [-22, 4.9, -24], [-14, 4.8, -24], [-6, 5.3, -24]], 'back')
    segment([-28, 0, -24], [-28, 5.5, -24], 'back')
    segment([-6, 0, -24], [-6, 5.5, -24], 'back')

    const materials = {}
    for (const [layer, positions] of Object.entries(lines)) {
      if (!positions.length) continue
      const initial = layer === 'accent' ? .95 : layer === 'frame' ? .62 : layer === 'ground' ? .12 : .2
      const material = lineMaterial(PALETTE[layer] || PALETTE.detail, initial)
      const mesh = new THREE.LineSegments(geometry(positions), material)
      mesh.name = `${group.name}-${layer}`
      mesh.renderOrder = layer === 'accent' ? 4 : layer === 'ground' ? 1 : 3
      group.add(mesh)
      materials[layer] = material
    }
    for (const [layer, positions] of Object.entries(faces)) {
      if (!positions.length) continue
      const material = faceMaterial(PALETTE[layer], layer === 'roof' ? .58 : .72)
      const mesh = new THREE.Mesh(geometry(positions), material)
      mesh.name = `${group.name}-${layer}-planes`
      group.add(mesh)
      materials[layer] = material
    }
    group.updateMatrixWorld(true)
    for (const solid of solids) {
      const worldBox = solid.clone().applyMatrix4(group.matrixWorld)
      worldBox.userData = { stopId: stop.id, stopIndex: stop.index ?? order }
      bounds.push(worldBox)
    }
    sites.push({ group, materials, index: stop.index ?? order })
  }

  stops.forEach(siteBuilder)

  // Only a few large orthogonal ground intervals cross the whole set. Camera
  // perspective supplies depth without the dense triangular carpet of v2.
  const extent = new THREE.Box3()
  for (const stop of stops) extent.expandByPoint(new THREE.Vector3().fromArray(stop.site || [0, 0, 0]))
  if (extent.isEmpty()) extent.set(new THREE.Vector3(-40, 0, -40), new THREE.Vector3(40, 0, 40))
  extent.expandByVector(new THREE.Vector3(70, 0, 65))
  const groundLines = []
  for (let x = Math.ceil(extent.min.x / 28) * 28; x <= extent.max.x; x += 28) {
    groundLines.push(x, -.09, extent.min.z, x, -.09, extent.max.z)
  }
  for (let z = Math.ceil(extent.min.z / 28) * 28; z <= extent.max.z; z += 28) {
    groundLines.push(extent.min.x, -.09, z, extent.max.x, -.09, z)
  }
  const ground = new THREE.LineSegments(geometry(groundLines), lineMaterial('#405460', .085))
  ground.name = 'campus-large-ground-axes'
  ground.renderOrder = 1
  root.add(ground)

  function update(state = {}) {
    const from = state.fromIndex ?? 0, to = state.toIndex ?? from
    const blend = clamp01(state.blend)
    for (const site of sites) {
      const focus = from === to
        ? Number(site.index === to)
        : site.index === from ? 1 - blend : site.index === to ? blend : 0
      const { frame, detail, accent, back, ground: paving, face, roof } = site.materials
      if (frame) frame.opacity = .115 + .58 * focus
      if (detail) detail.opacity = .04 + .27 * focus
      if (back) back.opacity = .025 + .065 * focus
      if (paving) paving.opacity = .04 + .11 * focus
      if (accent) {
        accent.opacity = .025 + .94 * focus
        accent.color.copy(inactiveAccent).lerp(activeAccent, focus)
      }
      if (face) face.opacity = .66 + .1 * focus
      if (roof) roof.opacity = .44 + .12 * focus
    }
    root.userData.activeFrom = from
    root.userData.activeTo = to
    root.userData.transition = blend
    root.userData.moving = Boolean(state.moving)
  }

  function dispose() {
    for (const item of allGeometries) item.dispose()
    for (const item of allMaterials) item.dispose()
    root.clear()
    sites.length = 0
    bounds.length = 0
  }

  update()
  return { root, update, bounds, sites, dispose }
}
