import * as T from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { loadGeometryGlb } from '../runtime/loadGeometryGlb.js'
import { disposeTree } from '../runtime/createViewport.js'
import { surfaceMaterial } from './surfaceMaterial.js'
import { factoryZone } from './zones.js'
import { assetUrl } from '../runtime/assetUrl.js'

export async function buildFactory(signal) {
  const source = await loadGeometryGlb(assetUrl('models/factory.glb'), signal)
  const bounds = new T.Box3().setFromObject(source), center = bounds.getCenter(new T.Vector3())
  const scale = 64 / bounds.getSize(new T.Vector3()).x
  const transform = new T.Matrix4().makeScale(scale, scale, scale)
  transform.setPosition(-center.x * scale, -bounds.min.y * scale, -center.z * scale)
  const buckets = { site: [], warehouse: [], production: [], metal: [] }
  source.traverse(mesh => {
    if (!mesh.isMesh || /^Ground$/i.test(mesh.name)) return
    const raw = mesh.geometry.clone().applyMatrix4(mesh.matrixWorld)
    const midpoint = new T.Box3().setFromBufferAttribute(raw.attributes.position).getCenter(new T.Vector3())
    const zone = factoryZone(mesh.name, midpoint)
    raw.applyMatrix4(transform); raw.deleteAttribute('uv'); raw.deleteAttribute('color')
    buckets[zone].push(raw)
  })
  const root = new T.Group(), materials = {}, lines = {}
  for (const [zone, geometries] of Object.entries(buckets)) {
    if (!geometries.length) continue
    const geometry = mergeGeometries(geometries, false)
    geometries.forEach(g => g.dispose())
    const material = surfaceMaterial(); materials[zone] = material
    const surface = new T.Mesh(geometry, material); surface.userData.zone = zone; root.add(surface)
    const edge = new T.LineBasicMaterial({ color: '#a8bfd4', transparent: true, opacity: .4 })
    lines[zone] = edge
    root.add(new T.LineSegments(new T.EdgesGeometry(geometry, 28), edge))
  }
  disposeTree(source)
  const plane = new T.Mesh(new T.PlaneGeometry(70, 60), new T.MeshBasicMaterial({ color: 0x090f19 }))
  plane.rotation.x = -Math.PI / 2; plane.position.y = -.05; root.add(plane)
  const grid = new T.GridHelper(180, 90, 0x283a4c, 0x162536)
  grid.position.y = -.06; grid.material.transparent = true; grid.material.opacity = .38; root.add(grid)
  const locations = [
    { id: 'metal', label: 'Склад металла и труб', position: new T.Vector3(8, 3, 19).applyMatrix4(transform) },
    { id: 'production', label: 'Производство', position: new T.Vector3(-12, 3, -4).applyMatrix4(transform) },
    { id: 'warehouse', label: 'Склад продукции · офис', position: new T.Vector3(14, 4, -11).applyMatrix4(transform) },
  ]
  return { root, materials, lines, locations, pickables: root.children.filter(object => object.isMesh && object.userData.zone && object.userData.zone !== 'site') }
}
