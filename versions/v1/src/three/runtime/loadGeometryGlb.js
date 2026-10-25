import * as T from 'three'

// Geometry-only reader: embedded factory photographs are not decoded or uploaded.
// Original node transforms, authored normals and triangle indices are retained.
export async function loadGeometryGlb(url, signal) {
  const response = await fetch(url, { signal })
  if (!response.ok) throw new Error(`Geometry: ${response.status}`)
  const buffer = await response.arrayBuffer(), view = new DataView(buffer)
  if (view.getUint32(0, true) !== 0x46546c67) throw new Error('Invalid GLB')
  const jsonLength = view.getUint32(12, true)
  const doc = JSON.parse(new TextDecoder().decode(new Uint8Array(buffer, 20, jsonLength)))
  const start = 28 + jsonLength
  const types = { 5126: Float32Array, 5125: Uint32Array, 5123: Uint16Array, 5121: Uint8Array }
  const counts = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 }
  function attribute(index) {
    const a = doc.accessors[index], v = doc.bufferViews[a.bufferView], Type = types[a.componentType]
    if (v.byteStride) throw new Error('Interleaved geometry is not supported by this asset reader')
    return new T.BufferAttribute(new Type(buffer, start + (v.byteOffset || 0) + (a.byteOffset || 0), a.count * counts[a.type]), counts[a.type])
  }
  const nodes = doc.nodes.map(node => {
    const group = new T.Group(); group.name = node.name || ''
    if (node.matrix) group.applyMatrix4(new T.Matrix4().fromArray(node.matrix))
    else { group.position.fromArray(node.translation || [0, 0, 0]); group.quaternion.fromArray(node.rotation || [0, 0, 0, 1]); group.scale.fromArray(node.scale || [1, 1, 1]) }
    if (node.mesh !== undefined) for (const p of doc.meshes[node.mesh].primitives) {
      const geometry = new T.BufferGeometry()
      geometry.setAttribute('position', attribute(p.attributes.POSITION))
      if (p.attributes.NORMAL !== undefined) geometry.setAttribute('normal', attribute(p.attributes.NORMAL))
      if (p.indices !== undefined) geometry.setIndex(attribute(p.indices))
      if (!geometry.attributes.normal) geometry.computeVertexNormals()
      const mesh = new T.Mesh(geometry); mesh.name = group.name; group.add(mesh)
    }
    return group
  })
  doc.nodes.forEach((node, i) => node.children?.forEach(child => nodes[i].add(nodes[child])))
  const root = new T.Group()
  for (const i of doc.scenes[doc.scene || 0].nodes) root.add(nodes[i])
  root.updateMatrixWorld(true)
  return root
}
