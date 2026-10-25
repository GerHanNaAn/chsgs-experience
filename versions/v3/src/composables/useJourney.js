import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { stops as blockoutSections, chapterIndex as blockoutIndex, clampPosition as boundPosition, screensPerChapter as scrollScreens, sampleCamera as sampleBlockoutCamera, captionOpacity } from '../data/route.js'
import { flightView as navigationView, flightDuration } from '../motion/flight.js'

export function useJourney() {
  const position = ref(0), reduced = ref(false), navigation = ref(null)
  const index = computed(() => blockoutIndex(position.value))
  const section = computed(() => blockoutSections[index.value])
  let frame = 0, navigationFrame = 0, query, runner = null, serial = 0
  function read() {
    frame = 0
    position.value = boundPosition(window.scrollY / (window.innerHeight * scrollScreens))
    // Hold the exact arrival until native scrolling actually moves away.
    if (!runner && navigation.value && Math.abs(position.value - navigation.value.to) > .002) navigation.value = null
  }
  function request() { if (!frame) frame = requestAnimationFrame(read) }
  function preference() { reduced.value = query.matches; if (reduced.value) cancelNavigation() }
  function cancelNavigation() {
    cancelAnimationFrame(navigationFrame); navigationFrame = 0; runner = null; navigation.value = null
  }
  function interrupt(event) {
    // A button replaces the flight atomically on click. Cancelling on mousedown
    // would expose an unrelated intermediate caption before the new click.
    if (event.type === 'pointerdown' && event.target.closest?.('button,a')) return
    if (event.type === 'keydown' && event.key === ' ' && event.target.closest?.('button')) return
    if (event.type !== 'keydown' || ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) cancelNavigation()
  }
  function travel(now) {
    navigationFrame = 0
    if (!runner || document.hidden) return
    const progress = Math.min(1, (now - runner.began) / flightDuration)
    navigation.value = { ...navigation.value, progress }
    const { blend } = navigationView(navigation.value)
    window.scrollTo({ top: runner.startScroll + (runner.targetScroll - runner.startScroll) * blend, behavior: 'instant' })
    if (progress < 1) navigationFrame = requestAnimationFrame(travel)
    else runner = null
  }
  function goTo(value, origin = {}) {
    const from = boundPosition(origin.position ?? position.value)
    const fromIndex = origin.index ?? navigation.value?.fromIndex ?? blockoutIndex(from)
    const fromOpacity = origin.opacity ?? captionOpacity(from)
    const fromPose = origin.pose ?? sampleBlockoutCamera(from), to = blockoutIndex(value)
    if (runner && navigation.value.to === to) return
    if (!runner && Math.abs(from - to) < .001 && fromIndex === to && fromOpacity > .999) return
    cancelNavigation()
    const targetScroll = to * window.innerHeight * scrollScreens
    if (reduced.value) { window.scrollTo({ top: targetScroll, behavior: 'instant' }); read(); return }
    navigation.value = { id: ++serial, from, to, fromIndex, fromOpacity, fromPose, progress: 0 }
    runner = { began: performance.now(), startScroll: window.scrollY, targetScroll }
    navigationFrame = requestAnimationFrame(travel)
  }
  function visibility() {
    if (!runner) return
    cancelAnimationFrame(navigationFrame); navigationFrame = 0
    if (!document.hidden) {
      runner.began = performance.now() - navigation.value.progress * flightDuration
      navigationFrame = requestAnimationFrame(travel)
    }
  }
  onMounted(() => {
    query = matchMedia('(prefers-reduced-motion: reduce)'); preference()
    query.addEventListener('change', preference)
    document.addEventListener('visibilitychange', visibility)
    window.addEventListener('scroll', request, { passive: true })
    window.addEventListener('resize', request, { passive: true }); read()
    for (const type of ['wheel', 'touchstart', 'pointerdown', 'keydown']) window.addEventListener(type, interrupt, { passive: true })
  })
  onBeforeUnmount(() => {
    cancelAnimationFrame(frame); cancelNavigation(); query?.removeEventListener('change', preference)
    document.removeEventListener('visibilitychange', visibility)
    window.removeEventListener('scroll', request); window.removeEventListener('resize', request)
    for (const type of ['wheel', 'touchstart', 'pointerdown', 'keydown']) window.removeEventListener(type, interrupt)
  })
  return { position, index, section, reduced, navigation, goTo, cancelNavigation }
}
