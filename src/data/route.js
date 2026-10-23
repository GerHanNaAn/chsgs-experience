export const stops = { factory: 0, laser: 1.6, cnc: 2.9, press: 4.5, products: 6.4, stock: 11.3 }
export const galleryStart = 7.2
export const galleryStep = .65
export const galleryEnd = galleryStart + galleryStep * 4
export const galleryExit = 10.1
export const stockEntry = 10.7
export const storyEnd = 12.2
export const route = [
  { id: 'factory', from: 0, label: 'ЧелябинскСпецГражданСтрой', short: 'Карта завода', eyebrow: 'ЧСГС / ГРУППА КОМПАНИЙ ЛД' },
  { id: 'laser', from: 1.3, label: 'Лазерная резка', short: 'Лазерная резка', eyebrow: 'ПРОИЗВОДСТВО / ЛАЗЕР' },
  { id: 'cnc', from: 2.45, label: 'Пятиосевая обработка', short: 'Станок с ЧПУ', eyebrow: 'ПРОИЗВОДСТВО / ЧПУ' },
  { id: 'press', from: 4.15, label: 'Формовка заготовки', short: 'Формовочный пресс', eyebrow: 'ПРОИЗВОДСТВО / ПРЕСС' },
  { id: 'products', from: 6.15, label: 'Инженерия в деталях', short: 'Продукция', eyebrow: 'СКЛАД ГОТОВОЙ ПРОДУКЦИИ' },
  { id: 'stock', from: 10.95, label: 'Склад металла и логистика', short: 'Склад металла', eyebrow: 'СКЛАД МЕТАЛЛА / ДВИЖЕНИЕ МАТЕРИАЛА' },
].map((item, i) => ({ ...item, number: String(i + 1).padStart(2, '0'), position: stops[item.id] }))
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x))
export function smooth(a, b, x) { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t) }
export function routeIndex(position) { return Math.max(0, route.findLastIndex(item => position >= item.from)) }
export const storySteps = [0, .9, stops.laser, stops.cnc, 3.55, stops.press, 4.95, 5.35, 5.75, stops.products, galleryStart, galleryStart + galleryStep, galleryStart + galleryStep * 2, galleryStart + galleryStep * 3, galleryEnd, stops.stock, 11.8]
export function nextPosition(position) { return storySteps.find(step => step > position + .08) ?? storyEnd }
export const departments = [
  { id: 'production', label: 'Производство', position: stops.laser },
  { id: 'products', label: 'Продукция', position: stops.products },
  { id: 'stock', label: 'Склад металла', position: stops.stock },
]
export const stations = [
  { id: 'laser', label: 'Лазер', position: stops.laser },
  { id: 'cnc', label: 'Станок ЧПУ', position: stops.cnc },
  { id: 'press', label: 'Пресс', position: stops.press },
]
export function activeDepartment(position) { return position < 1.3 ? '' : position < 6.15 ? 'production' : position < 10.95 ? 'products' : 'stock' }
export function sceneWeights(position) {
  const returningFromProduction = smooth(5.8, 6.2, position) * (1 - smooth(6.45, 6.85, position))
  const returningFromProducts = smooth(galleryExit, 10.45, position) * (1 - smooth(stockEntry, 11.1, position))
  return {
    factory: 1 - smooth(1.1, 1.55, position) + returningFromProduction + returningFromProducts,
    laser: smooth(1.1, 1.55, position) * (1 - smooth(2.3, 2.7, position)),
    cnc: smooth(2.3, 2.7, position) * (1 - smooth(3.95, 4.35, position)),
    press: smooth(3.95, 4.35, position) * (1 - smooth(5.75, 6.2, position)),
    gallery: smooth(6.45, 6.85, position) * (1 - smooth(galleryExit, 10.45, position)),
    stock: smooth(stockEntry, 11.1, position),
  }
}
