import * as T from 'three'

export function buildWarehouse() {
  const root = new T.Group()
  function box(w, h, d, x, y, z, accent = false) {
    const geometry = new T.BoxGeometry(w, h, d)
    const material = new T.MeshBasicMaterial({ color: '#0c1725', transparent: true })
    const mesh = new T.Mesh(geometry, material); mesh.position.set(x, y, z); root.add(mesh)
    mesh.add(new T.LineSegments(new T.EdgesGeometry(geometry), new T.LineBasicMaterial({ color: accent ? '#ffea00' : '#6689aa', transparent: true, opacity: .6 })))
  }
  box(18, .1, 34, 0, -.05, -7)
  for (const x of [-8, 8]) for (const z of [-20, -12, -4, 4, 10]) {
    box(.13, 8, .13, x, 4, z); box(16, .10, .12, 0, 8, z)
  }
  for (const side of [-1, 1]) for (let z = -15; z <= 3; z += 6) {
    for (const x of [side * 4, side * 7]) box(.09, 4.5, .09, x, 2.25, z)
    for (const y of [.6, 2.1, 3.6]) box(3, .07, 4.5, side * 5.5, y, z + 1.5)
    for (let i = 0; i < 3; i++) box(.7, .7, .8, side * (4.5 + i * .8), 1, z + 1.5, i === 1)
  }
  const floor = new T.GridHelper(40, 40, 0x3e5871, 0x243b52); floor.position.set(0, .02, -5); root.add(floor)
  const baseOpacity = new Map()
  root.traverse(o => { if (o.material) { baseOpacity.set(o.material, o.material.opacity); o.material.transparent = true } })
  function fade(opacity) {
    root.visible = opacity > .001
    for (const [material, base] of baseOpacity) { material.opacity = base * opacity; material.depthWrite = opacity > .98 }
  }
  return { root, fade }
}
