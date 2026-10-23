import * as T from 'three'
import { products } from '../../data/products.js'
import { buildHeroValve } from '../valve/buildHeroValve.js'

export const orbitRadius = 6
export const productAngle = index => index * Math.PI * 2 / products.length

function token(symbol) {
  const geometry = symbol === 'circle' ? new T.TorusGeometry(1.35, .055, 10, 80) : new T.BoxGeometry(2.1, 2.1, .4, 4, 4, 1)
  const group = new T.Group()
  group.add(new T.Mesh(geometry, new T.MeshStandardMaterial({ color: '#152c43', metalness: .65, roughness: .4 })))
  group.add(new T.LineSegments(symbol === 'circle' ? new T.WireframeGeometry(geometry) : new T.EdgesGeometry(geometry), new T.LineBasicMaterial({ color: '#8fa9bf', transparent: true, opacity: .6 })))
  if (symbol === 'diamond') group.rotation.z = Math.PI / 4
  return group
}

export function buildProductGallery(signal, onReady) {
  const root = new T.Group(), slots = []
  products.forEach((product, i) => {
    const angle = productAngle(i), slot = new T.Group()
    slot.position.set(Math.sin(angle) * orbitRadius, 1.5, -Math.cos(angle) * orbitRadius)
    slot.rotation.y = -angle
    const symbol = token(product.available ? 'circle' : product.symbol); slot.add(symbol)
    const platform = new T.Line(new T.BufferGeometry().setFromPoints(Array.from({ length: 97 }, (_, j) => new T.Vector3(Math.cos(j / 96 * Math.PI * 2) * 2.1, -2.4, Math.sin(j / 96 * Math.PI * 2) * 2.1))), new T.LineBasicMaterial({ color: '#536c85', transparent: true, opacity: .5 }))
    slot.add(platform); slots.push({ root: slot, symbol, product }); root.add(slot)
  })
  const actual = slots.find(s => s.product.available)
  const ready = buildHeroValve(signal).then(valve => {
    if (signal.aborted) return valve.root
    actual.root.remove(actual.symbol)
    actual.symbol.traverse(o => { o.geometry?.dispose(); o.material?.dispose() })
    valve.root.rotation.y = .28; valve.root.scale.setScalar(1.7); actual.root.add(valve.root)
    actual.model = valve.root; onReady(); return null
  })
  function highlight(index, opacity) {
    root.visible = opacity > .001
    slots.forEach((slot, i) => slot.root.traverse(o => {
      if (!o.material) return
      const materials = Array.isArray(o.material) ? o.material : [o.material]
      for (const material of materials) {
        if (material.userData.baseOpacity === undefined) material.userData.baseOpacity = material.opacity
        const amount = material.userData.baseOpacity * opacity * (i === index ? 1 : .35)
        material.transparent = amount < .99
        material.opacity = amount
        material.depthWrite = amount > .98
      }
    }))
  }
  return { root, slots, ready, highlight }
}
