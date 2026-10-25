import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { blockoutSections, blockoutIndex, boundPosition, scrollScreens } from '../data/blockout.js'

export function useBlockoutRoute() {
  const position = ref(0), reduced = ref(false)
  const index = computed(() => blockoutIndex(position.value))
  const section = computed(() => blockoutSections[index.value])
  let frame = 0, navigationFrame = 0, query
  function read() { frame = 0; position.value = boundPosition(window.scrollY / (window.innerHeight * scrollScreens)) }
  function request() { if (!frame) frame = requestAnimationFrame(read) }
  function preference() { reduced.value = query.matches; if (reduced.value) cancelNavigation() }
  function cancelNavigation() { cancelAnimationFrame(navigationFrame); navigationFrame = 0 }
  function interrupt(event) { if (event.type !== 'keydown' || ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) cancelNavigation() }
  function goTo(value) {
    cancelNavigation()
    const target = boundPosition(value) * window.innerHeight * scrollScreens, start = window.scrollY
    if (reduced.value) { window.scrollTo({ top: target, behavior: 'instant' }); return }
    const began = performance.now(), duration = Math.min(1800, 1000 + Math.abs(target - start) / window.innerHeight * 130)
    function travel(now) {
      const t = Math.min(1, (now - began) / duration), eased = t * t * t * (t * (t * 6 - 15) + 10)
      window.scrollTo({ top: start + (target - start) * eased, behavior: 'instant' })
      if (t < 1) navigationFrame = requestAnimationFrame(travel); else navigationFrame = 0
    }
    navigationFrame = requestAnimationFrame(travel)
  }
  onMounted(() => {
    query = matchMedia('(prefers-reduced-motion: reduce)'); preference()
    query.addEventListener('change', preference)
    window.addEventListener('scroll', request, { passive: true })
    window.addEventListener('resize', request, { passive: true }); read()
    for (const type of ['wheel', 'touchstart', 'pointerdown', 'keydown']) window.addEventListener(type, interrupt, { passive: true })
  })
  onBeforeUnmount(() => {
    cancelAnimationFrame(frame); cancelNavigation(); query?.removeEventListener('change', preference)
    window.removeEventListener('scroll', request); window.removeEventListener('resize', request)
    for (const type of ['wheel', 'touchstart', 'pointerdown', 'keydown']) window.removeEventListener(type, interrupt)
  })
  return { position, index, section, reduced, goTo }
}
