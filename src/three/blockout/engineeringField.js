import * as T from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { blockoutEnd, captionOpacity } from '../../data/blockout.js'

function lineMaterial(color, opacity) {
  return new T.ShaderMaterial({
    transparent: true, depthWrite: false, toneMapped: false,
    uniforms: {
      uColor: { value: new T.Color(color) }, uOpacity: { value: opacity },
      uFocus: { value: 0 }, uEntrance: { value: 0 }, uTravel: { value: 0 }, uScan: { value: 0 },
    },
    vertexShader: `varying vec3 vWorld;
      void main(){vec4 p=modelMatrix*vec4(position,1.);vWorld=p.xyz;gl_Position=projectionMatrix*viewMatrix*p;}`,
    fragmentShader: `varying vec3 vWorld;uniform vec3 uColor;uniform float uOpacity,uFocus,uEntrance,uTravel,uScan;
      void main(){
        float fog=1.-smoothstep(65.,170.,distance(cameraPosition,vWorld));
        float scan=exp(-abs(vWorld.y-uScan)*3.)*uTravel;
        float alpha=uOpacity*(.28+.72*uFocus)*fog*uEntrance;
        gl_FragColor=vec4(mix(uColor,vec3(1.),scan*.7),alpha+scan*.12*fog*uEntrance);
        #include <colorspace_fragment>
      }`,
  })
}

// Structural edges and spaced facade/roof divisions, without triangle diagonals.
// Coordinates remain local until the original primitive's complete transform is applied.
function panelLines(mesh) {
  const coordinates = []
  const edge = new T.EdgesGeometry(mesh.geometry)
  coordinates.push(...edge.attributes.position.array); edge.dispose()
  const [w, h, d] = mesh.scale.toArray()
  const segment = (...values) => coordinates.push(...values)
  if (w > 7 && h > 3 && d > 5) {
    for (const z of [-.5, .5]) {
      for (let x = 3.6; x < w - .1; x += 3.6) segment(x / w - .5, -.5, z, x / w - .5, .5, z)
      for (let y = 2.5; y < h - .1; y += 2.5) segment(-.5, y / h - .5, z, .5, y / h - .5, z)
    }
    for (let x = 4.5; x < w - .1; x += 4.5) segment(x / w - .5, .5, -.5, x / w - .5, .5, .5)
    for (let z = 4.5; z < d - .1; z += 4.5) segment(-.5, .5, z / d - .5, .5, .5, z / d - .5)
  }
  return new T.BufferGeometry().setAttribute('position', new T.Float32BufferAttribute(coordinates, 3)).applyMatrix4(mesh.matrixWorld)
}

export function createEngineeringField(root) {
  root.updateMatrixWorld(true)
  const buckets = new Map(), originals = []
  root.traverse(mesh => { if (mesh.isMesh) originals.push(mesh) })
  for (const mesh of originals) {
    mesh.visible = false // Retain the source volumes for collision and framing checks.
    if (mesh.geometry.type !== 'BoxGeometry') continue
    const index = Number.isInteger(mesh.parent.userData.section) ? mesh.parent.userData.section : -1
    const role = mesh.userData.role || 'wall', backdrop = mesh.parent !== root && mesh.position.z < -25
    const key = `${index}:${role}:${backdrop}`
    if (!buckets.has(key)) buckets.set(key, { index, role, backdrop, geometries: [] })
    buckets.get(key).geometries.push(panelLines(mesh))
  }
  const field = new T.Group(); field.name = 'engineering-field'
  const layers = []
  for (const { index, role, backdrop, geometries } of buckets.values()) {
    const geometry = mergeGeometries(geometries, false); geometries.forEach(g => g.dispose())
    const accent = role === 'accent', quiet = ['road', 'paint', 'concrete'].includes(role)
    const material = lineMaterial(accent ? '#fff000' : '#b3b6c9', (accent ? .98 : quiet ? .22 : .56) * (backdrop ? .28 : 1))
    field.add(new T.LineSegments(geometry, material)); layers.push({ material, index, accent })
  }
  const ground = originals.find(mesh => mesh.geometry.type === 'PlaneGeometry')
  const terrainGeometry = new T.WireframeGeometry(ground.geometry).applyMatrix4(ground.matrixWorld)
  const terrainMaterial = lineMaterial('#858aab', .27)
  const terrain = new T.LineSegments(terrainGeometry, terrainMaterial); field.add(terrain)
  root.add(field)
  function update(position, entrance = 1) {
    const travel = 1 - captionOpacity(position)
    for (const { material, index, accent } of layers) {
      const focus = index < 0 ? .55 : Math.max(0, 1 - Math.abs(index - position) * 1.5)
      material.uniforms.uFocus.value = focus
      material.uniforms.uEntrance.value = entrance
      material.uniforms.uTravel.value = travel * focus
      material.uniforms.uScan.value = (position % 1) * 11
      if (accent) material.uniforms.uColor.value.set(focus > .1 ? '#fff000' : '#9b9cb0')
    }
    terrainMaterial.uniforms.uFocus.value = .75
    terrainMaterial.uniforms.uEntrance.value = entrance
    terrainMaterial.uniforms.uTravel.value = travel * .2
    terrainMaterial.uniforms.uScan.value = -1
    field.userData.activeSection = Math.max(0, Math.min(blockoutEnd, Math.round(position)))
  }
  update(0, 0)
  return { update, field, layers, terrain }
}
