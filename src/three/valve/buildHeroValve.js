import * as T from 'three'
import { loadGeometryGlb } from '../runtime/loadGeometryGlb.js'
import { assetUrl } from '../runtime/assetUrl.js'

export async function buildHeroValve(signal) {
  const source = await loadGeometryGlb(assetUrl('valve/products/dn400-pp/valve.glb'), signal)
  const blue = new T.MeshStandardMaterial({ color: '#16345f', metalness: .38, roughness: .3 })
  const gear = new T.MeshStandardMaterial({ color: '#1c222a', metalness: .75, roughness: .28 })
  const steel = new T.MeshStandardMaterial({ color: '#e2e4e7', metalness: 1, roughness: .17 })
  const wires = []
  source.traverse(mesh => {
    if (!mesh.isMesh) return
    mesh.material.dispose()
    mesh.material = /gearbox|handwheel/.test(mesh.name) ? gear : /ball|stem/.test(mesh.name) ? steel : blue
    const edges = new T.LineSegments(new T.EdgesGeometry(mesh.geometry, 35), new T.LineBasicMaterial({ color: '#8aa6bd', transparent: true, opacity: .10 }))
    mesh.add(edges); wires.push(edges)
  })
  const bounds = new T.Box3().setFromObject(source), center = bounds.getCenter(new T.Vector3())
  source.position.sub(center)
  const root = new T.Group(); root.add(source)
  return { root, wires }
}
