import * as T from 'three'
import { blockoutSections } from '../../data/blockout.js'

export function buildBlockout() {
  const root = new T.Group(), sites = []
  const cube = new T.BoxGeometry(1, 1, 1)
  const materials = {
    wall: new T.MeshStandardMaterial({ color: '#929b9e', roughness: .9 }),
    roof: new T.MeshStandardMaterial({ color: '#535e63', roughness: .95 }),
    dark: new T.MeshStandardMaterial({ color: '#303b41', roughness: .9 }),
    glass: new T.MeshStandardMaterial({ color: '#344a55', roughness: .55, metalness: .15 }),
    accent: new T.MeshStandardMaterial({ color: '#e9d55b', roughness: .8 }),
    concrete: new T.MeshStandardMaterial({ color: '#454d50', roughness: 1 }),
    road: new T.MeshStandardMaterial({ color: '#252f34', roughness: 1 }),
    paint: new T.MeshStandardMaterial({ color: '#89918c', roughness: 1 }),
  }
  function box(parent, dimensions, at, material = 'wall') {
    const mesh = new T.Mesh(cube, materials[material])
    mesh.scale.set(...dimensions); mesh.position.set(...at)
    mesh.castShadow = material !== 'paint'; mesh.receiveShadow = true; parent.add(mesh)
    return mesh
  }
  function hall(parent, x, z, width, height, depth) {
    box(parent, [width, height, depth], [x, height / 2, z])
    box(parent, [width + .5, .35, depth + .5], [x, height + .12, z], 'roof')
    box(parent, [width + .06, .7, depth + .06], [x, .35, z], 'dark')
  }
  function door(parent, x, z, width = 3.4, height = 3.4) { box(parent, [width, height, .12], [x, height / 2, z], 'dark') }
  function windows(parent, x, y, z, count) { for (let i = 0; i < count; i++) box(parent, [1.65, 1.15, .13], [x + i * 2.4, y, z], 'glass') }
  for (const section of blockoutSections) {
    const site = new T.Group(); site.name = section.id; site.position.x = section.x; site.scale.setScalar(.8); root.add(site); sites.push(site)
    box(site, [42, .24, 32], [0, -.18, -7], 'concrete')
    box(site, [46, .12, 11], [0, -.18, 17], 'road')
    box(site, [44, .22, .3], [0, -.04, 10.8], 'wall')
    box(site, [44, .22, .3], [0, -.04, 23], 'wall')
    if (section.kind === 'entrance') {
      hall(site, -4, -12, 23, 7, 10); windows(site, -13, 4.5, -6.93, 8)
      hall(site, -13, 1, 7, 3.7, 5); windows(site, -15, 2.2, 3.57, 2)
      box(site, [.75, 5.7, .75], [-8.5, 2.85, 3], 'dark')
      box(site, [.75, 5.7, .75], [5, 2.85, 3], 'dark')
      box(site, [14.3, 1.35, .9], [-1.75, 5.7, 3], 'accent')
      box(site, [7, .16, .2], [-1.6, 1.25, 2.9], 'wall')
      box(site, [.5, 1.7, .5], [-5.1, .85, 3], 'accent')
      for (let i = 0; i < 6; i++) box(site, [.65, .03, 3.4], [-4 + i * 1.35, .01, 8], 'paint')
    } else if (section.kind === 'hangar') {
      hall(site, -3, -8, 25, 9, 16); hall(site, 13, -10, 7, 5, 12)
      windows(site, -13, 6.4, .07, 9)
      for (const x of [-10, -3, 4]) door(site, x, .08, 4.4, 4.2)
      box(site, [1, 8.9, .2], [-15, 4.5, .15], 'accent')
      for (const x of [-10, -2, 6]) box(site, [3.5, .9, 5], [x, 9.7, -9], 'roof')
    } else if (section.kind === 'lab') {
      hall(site, -7, -10, 13, 10, 12); hall(site, 8, -12, 11, 7, 10)
      box(site, [4, 3, 5], [1, 4, -9], 'glass')
      for (const y of [3, 6.5]) windows(site, -12, y, -3.92, 5)
      windows(site, 4, 4.7, -6.92, 4)
      box(site, [2.7, 9.8, .2], [-1.9, 5, -3.8], 'accent'); door(site, -7, -3.9, 3, 2.5)
    } else if (section.kind === 'warehouse' || section.kind === 'logistics') {
      hall(site, -2, -10, 29, 7, 15)
      for (const x of [-13, -6, 1, 8]) {
        door(site, x, -2.4, 4.5, 4.5)
        box(site, [5.3, .5, 2.5], [x, .2, -1.2], 'roof')
        box(site, [.25, 1, .25], [x - 2.5, .5, .4], 'accent')
      }
      box(site, [29, .45, .18], [-2, 6.2, -2.35], 'accent')
      if (section.kind === 'logistics') {
        box(site, [5.5, 3.5, 3.5], [-10, 1.75, 5], 'roof'); box(site, [5.5, 3.5, 3.5], [-3.5, 1.75, 5], 'dark')
      }
    } else if (section.kind === 'service') {
      hall(site, -8, -9, 12, 6, 12); hall(site, 6, -11, 13, 8, 12)
      for (const x of [-11, -5]) door(site, x, -2.9, 4, 3.8)
      windows(site, 1, 5, -4.9, 5); box(site, [13, .6, .2], [6, 7, -4.8], 'accent')
    } else if (section.kind === 'film') {
      hall(site, -2, -11, 25, 9, 13)
      box(site, [15, 5.6, .18], [-2, 5, -4.4], 'dark'); box(site, [1.5, 5.6, .22], [-9.5, 5, -4.3], 'accent')
      hall(site, -15, -5, 5, 3.2, 6)
    } else {
      hall(site, -5, -10, 18, 9, 12); hall(site, 9, -9, 9, 5, 10)
      for (const y of [3.2, 6.7]) windows(site, -12, y, -3.9, 7)
      door(site, 9, -3.9, 3, 3); box(site, [1.4, 8.8, .2], [2.8, 4.5, -3.8], 'accent')
    }
    hall(site, -18, -37, 15, 6, 13); hall(site, 9, -40, 22, 8, 15)
  }
  const length = blockoutSections.at(-1).x + 120
  box(root, [length, .16, 11], [(length - 120) / 2, -.22, 17], 'road')
  for (let x = -40; x < length - 70; x += 8) box(root, [3, .025, .15], [x, -.12, 17], 'paint')
  // Original undulating ground; no downloaded terrain, model or wire grid.
  const groundGeometry = new T.PlaneGeometry(length + 180, 240, 100, 30)
  groundGeometry.rotateX(-Math.PI / 2)
  const points = groundGeometry.attributes.position
  for (let i = 0; i < points.count; i++) {
    const x = points.getX(i), z = points.getZ(i), edge = Math.max(0, Math.min(1, (Math.abs(z + 6) - 43) / 50))
    points.setY(i, -.38 + edge * (Math.sin(x * .035) * Math.cos(z * .06) * 1.6 - .9))
  }
  groundGeometry.computeVertexNormals()
  const ground = new T.Mesh(groundGeometry, new T.MeshStandardMaterial({ color: '#343e42', roughness: 1 }))
  ground.position.set((length - 120) / 2, 0, -7); ground.receiveShadow = true; root.add(ground)
  return { root, sites }
}
