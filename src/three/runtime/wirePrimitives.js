import * as T from 'three'

export function wireModel(geometry, { color = '#7598b5', fill = '#0c1826', grid = false } = {}) {
  const group = new T.Group()
  if (fill) group.add(new T.Mesh(geometry, new T.MeshBasicMaterial({ color: fill, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1, side: T.DoubleSide })))
  const lines = new T.LineSegments(grid ? new T.WireframeGeometry(geometry) : new T.EdgesGeometry(geometry, 25), new T.LineBasicMaterial({ color, transparent: true, opacity: .76 }))
  group.add(lines)
  if (!fill) geometry.dispose()
  return group
}
export function box(parent, size, position, options) {
  const object = wireModel(new T.BoxGeometry(...size), options)
  object.position.fromArray(position); parent.add(object); return object
}
export function cylinder(parent, radius, length, position, options = {}) {
  const object = wireModel(new T.CylinderGeometry(radius, radius, length, 24, 1, options.open ?? false), options)
  object.position.fromArray(position)
  if (options.axis === 'x') object.rotation.z = Math.PI / 2
  if (options.axis === 'z') object.rotation.x = Math.PI / 2
  parent.add(object); return object
}
export function pipe(parent, radius, length, position, color = '#7193ae') {
  const object = cylinder(parent, radius, length, position, { axis: 'x', open: true, color })
  const points = []
  for (const y of [-length / 2, 0, length / 2]) for (let i = 0; i < 32; i++) {
    const a = i * Math.PI / 16, b = (i + 1) * Math.PI / 16
    points.push(Math.cos(a) * radius, y, Math.sin(a) * radius, Math.cos(b) * radius, y, Math.sin(b) * radius)
  }
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; points.push(Math.cos(a) * radius, -length / 2, Math.sin(a) * radius, Math.cos(a) * radius, length / 2, Math.sin(a) * radius) }
  object.add(new T.LineSegments(new T.BufferGeometry().setAttribute('position', new T.Float32BufferAttribute(points, 3)), new T.LineBasicMaterial({ color, transparent: true, opacity: .55 })))
  return object
}
