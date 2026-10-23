import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { route, routeIndex, clamp, storyEnd } from '../data/route.js'

export function useExperienceRoute() {
  const position = ref(0), reduced = ref(false)
  const index = computed(() => routeIndex(position.value))
  const chapter = computed(() => route[index.value])
  let frame, query
  function read() { frame = 0; position.value = clamp(window.scrollY / (window.innerHeight * 1.6), 0, storyEnd) }
  function request() { if (!frame) frame = requestAnimationFrame(read) }
  function change() { reduced.value = query.matches }
  function goTo(i) { window.scrollTo({ top: i * innerHeight * 1.6, behavior: reduced.value ? 'instant' : 'smooth' }) }
  onMounted(() => {
    query = matchMedia('(prefers-reduced-motion: reduce)'); change()
    query.addEventListener('change', change)
    window.addEventListener('scroll', request, { passive: true })
    window.addEventListener('resize', request, { passive: true }); read()
  })
  onBeforeUnmount(() => { cancelAnimationFrame(frame); query?.removeEventListener('change', change); window.removeEventListener('scroll', request); window.removeEventListener('resize', request) })
  return { position, index, chapter, reduced, goTo }
}
