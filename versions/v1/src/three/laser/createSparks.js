import * as T from 'three'

export function createSparks(count = 180) {
  const root = new T.Group(), positions = new Float32Array(count * 3), tails = new Float32Array(count * 6)
  const origins = new Float32Array(count * 3), ages = new Float32Array(count), brightness = new Float32Array(count)
  ages.fill(2)
  const geometry = new T.BufferGeometry().setAttribute('position', new T.BufferAttribute(positions, 3)).setAttribute('brightness', new T.BufferAttribute(brightness, 1))
  const particles = new T.Points(geometry, new T.ShaderMaterial({
    transparent: true, depthWrite: false, depthTest: false, blending: T.AdditiveBlending,
    vertexShader: 'attribute float brightness;varying float vLight;void main(){vLight=brightness;vec4 p=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*p;gl_PointSize=105./max(1.,-p.z);}',
    fragmentShader: 'varying float vLight;void main(){float d=length(gl_PointCoord-.5);float a=1.-smoothstep(.03,.5,d);if(a<.01)discard;vec3 color=mix(vec3(1.,.035,.008),vec3(1.,.7,.25),1.-smoothstep(0.,.15,d));gl_FragColor=vec4(color,a*vLight);}',
  }))
  const tailGeometry = new T.BufferGeometry().setAttribute('position', new T.BufferAttribute(tails, 3))
  const streaks = new T.LineSegments(tailGeometry, new T.LineBasicMaterial({ color: '#ff3823', transparent: true, opacity: .85, blending: T.AdditiveBlending, depthWrite: false, depthTest: false }))
  particles.frustumCulled = streaks.frustumCulled = false; particles.renderOrder = 30; streaks.renderOrder = 29
  root.add(particles, streaks)
  let wasEmitting = false
  function update(time, x, z, emitting) {
    root.visible = emitting
    if (!emitting) { wasEmitting = false; return 0 }
    for (let i = 0; i < count; i++) {
      const age = (time * 2.1 + i * .6180339) % 1
      if (!wasEmitting || age < ages[i]) origins.set([x, 1.3, z], i * 3)
      ages[i] = age
      const seed = (i * 17 % 31) / 31, angle = i * 2.39996
      const vx = -1.4 - seed * 2, vz = Math.sin(angle) * (1 + seed), vy = .8 + seed * .9
      const t = age * .65
      const px = origins[i*3] + vx*t, py = origins[i*3+1] + vy*t - 2*t*t, pz = origins[i*3+2] + vz*t
      positions.set([px, py, pz], i * 3); brightness[i] = 1 - age * .85
      tails.set([px,py,pz,px-vx*.035,py-(vy-4*t)*.035,pz-vz*.035], i * 6)
    }
    wasEmitting = true
    geometry.attributes.position.needsUpdate = geometry.attributes.brightness.needsUpdate = true
    tailGeometry.attributes.position.needsUpdate = true
    return count
  }
  return { root, update }
}
