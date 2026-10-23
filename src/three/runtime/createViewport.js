import * as T from 'three'

export function disposeTree(root) {
  const geometries = new Set(), materials = new Set(), textures = new Set()
  root.traverse(o => { if (o.geometry) geometries.add(o.geometry); for (const m of (Array.isArray(o.material) ? o.material : [o.material])) if (m) { materials.add(m); Object.values(m).forEach(v => { if (v?.isTexture) textures.add(v) }) } })
  geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); textures.forEach(t => t.dispose())
}

export function createViewport(host, { scene, camera, update, active, resize, label }) {
  const renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5))
  renderer.setClearColor(0x080d16, 0)
  renderer.outputColorSpace = T.SRGBColorSpace
  renderer.toneMapping = T.ACESFilmicToneMapping
  renderer.domElement.setAttribute('aria-label', label); renderer.domElement.setAttribute('role', 'img')
  host.appendChild(renderer.domElement)
  let frame = 0, previous = 0, disposed = false, count = 0
  function request() { if (!frame && !disposed && active() && !document.hidden) frame = requestAnimationFrame(draw) }
  function draw(time) {
    frame = 0
    if (disposed || !active() || document.hidden) { previous = 0; return }
    const moving = update(Math.min(previous ? (time - previous) / 1000 : 1 / 60, .1), time / 1000)
    // Offscreen environment generation may leave a different clear state.
    // Expose a canvas only after its first complete scene frame.
    renderer.setClearColor(0x080d16, 0)
    previous = time; renderer.render(scene, camera); count++
    host.dataset.rendered = 'true'
    host.dataset.frames = String(count)
    if (moving) request(); else previous = 0
  }
  function onResize() {
    const { width, height } = host.getBoundingClientRect(); if (!width || !height) return
    renderer.setSize(width, height)
    if (camera.isPerspectiveCamera) camera.aspect = width / height
    resize?.(width, height); camera.updateProjectionMatrix(); request()
  }
  function onVisibility() { previous = 0; if (!document.hidden) request() }
  const observer = new ResizeObserver(onResize); observer.observe(host)
  document.addEventListener('visibilitychange', onVisibility); onResize()
  return {
    renderer, request,
    dispose() { disposed = true; cancelAnimationFrame(frame); observer.disconnect(); document.removeEventListener('visibilitychange', onVisibility); disposeTree(scene); renderer.dispose(); renderer.domElement.remove() },
  }
}
