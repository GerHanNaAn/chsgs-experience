import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { blockoutSections, blockoutIndex, boundPosition, scrollScreens } from '../data/blockout.js'

export function useBlockoutRoute() {
  const position = ref(0), reduced = ref(false)
  const index = computed(() => blockoutIndex(position.value))
  const section = computed(() => blockoutSections[index.value])
  let frame = 0, query
  function read() { frame = 0; position.value = boundPosition(window.scrollY / (window.innerHeight * scrollScreens)) }
  function request() { if (!frame) frame = requestAnimationFrame(read) }
  function preference() { reduced.value = query.matches }
  function goTo(value) {
    window.scrollTo({ top: boundPosition(value) * window.innerHeight * scrollScreens, behavior: reduced.value ? 'instant' : 'smooth' })
  }
  onMounted(() => {
    query = matchMedia('(prefers-reduced-motion: reduce)'); preference()
    query.addEventListener('change', preference)
    window.addEventListener('scroll', request, { passive: true })
    window.addEventListener('resize', request, { passive: true }); read()
  })
  onBeforeUnmount(() => {
    cancelAnimationFrame(frame); query?.removeEventListener('change', preference)
    window.removeEventListener('scroll', request); window.removeEventListener('resize', request)
  })
  return { position, index, section, reduced, goTo }
}
