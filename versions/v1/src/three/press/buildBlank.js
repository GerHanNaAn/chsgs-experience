import * as T from 'three'

export function buildBlank() {
  const root = new T.Group(), segments = 40, rows = 24
  const geometry = new T.LatheGeometry(Array.from({ length: rows + 1 }, (_, j) => new T.Vector2(.6, j / rows * 2.4)), segments)
  root.add(new T.Mesh(geometry, new T.MeshBasicMaterial({ color: '#152b40', side: T.DoubleSide, polygonOffset: true, polygonOffsetFactor: 1 })))
  const gridArray = new Float32Array((7 * segments * 2 + 12 * rows * 2) * 3)
  const gridGeometry = new T.BufferGeometry().setAttribute('position', new T.BufferAttribute(gridArray, 3))
  root.add(new T.LineSegments(gridGeometry, new T.LineBasicMaterial({ color: '#c4d2db', transparent: true, opacity: .9 })))
  let previous = -1
  function update(amount) {
    if (Math.abs(previous - amount) < .0001) return
    previous = amount
    const point = (v, a) => { const radius = .6 * (1 - amount) + amount * Math.max(.38, Math.sqrt(Math.max(0, 1 - (v * 2 - 1) ** 2)) * 1.1); return [Math.sin(a) * radius, v * (2.4 - amount * .6), Math.cos(a) * radius] }
    const positions = geometry.attributes.position
    for (let i = 0; i <= segments; i++) for (let j = 0; j <= rows; j++) positions.setXYZ(i * (rows + 1) + j, ...point(j / rows, i / segments * Math.PI * 2))
    positions.needsUpdate = true; geometry.computeVertexNormals(); geometry.computeBoundingSphere()
    let offset = 0
    const add = p => { gridArray.set(p, offset); offset += 3 }
    for (let j = 0; j <= 6; j++) for (let i = 0; i < segments; i++) { add(point(j / 6, i / segments * Math.PI * 2)); add(point(j / 6, (i + 1) / segments * Math.PI * 2)) }
    for (let i = 0; i < 12; i++) for (let j = 0; j < rows; j++) { add(point(j / rows, i / 12 * Math.PI * 2)); add(point((j + 1) / rows, i / 12 * Math.PI * 2)) }
    gridGeometry.attributes.position.needsUpdate = true; gridGeometry.computeBoundingSphere()
  }
  update(0)
  return { root, update }
}
