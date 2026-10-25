// Headings follow the CHSGS source page; the first stop includes the scale block.
// Positions are compositional placeholders, not a surveyed factory plan.
export const sectionSpacing = 64
export const scrollScreens = 1.65
export const blockoutSections = [
  { id: 'entrance', title: 'ЧелябинскСпецГражданСтрой', short: 'Завод', place: 'Главный въезд', kind: 'entrance', yaw: .10, height: 6.8 },
  { id: 'technology', title: 'Технологический парк и глубина производства', short: 'Производство', place: 'Производственный корпус', kind: 'hangar', yaw: -.58, height: 6.2 },
  { id: 'quality', title: 'Модернизация продукции и 100% контроль качества', short: 'Качество', place: 'Инженерный корпус', kind: 'lab', yaw: .48, height: 10.5 },
  { id: 'traceability', title: 'Прослеживаемость и защита от фальсификата', short: 'Прослеживаемость', place: 'Участок отгрузки', kind: 'warehouse', yaw: .20, height: 8.4 },
  { id: 'service', title: 'Сервисная поддержка и гарантийные обязательства', short: 'Сервис', place: 'Сервисный корпус', kind: 'service', yaw: -.42, height: 6.5 },
  { id: 'film', title: 'Видео о заводе', short: 'Видео', place: 'Производственный двор', kind: 'film', yaw: .08, height: 6.0 },
  { id: 'global', title: 'Глобальное присутствие и достижения', short: 'География', place: 'Логистический корпус', kind: 'logistics', yaw: .45, height: 9.2 },
  { id: 'clients', title: 'Продукция завода используется крупными клиентами', short: 'Клиенты', place: 'Завершение маршрута', kind: 'office', yaw: -.28, height: 7.2 },
].map((section, index) => ({ ...section, index, x: index * sectionSpacing, number: String(index + 1).padStart(2, '0') }))

export const blockoutEnd = blockoutSections.length - 1
export const overviewMetrics = [
  { value: '25', prefix: 'Более', label: 'лет опыта' },
  { value: '2 млн', prefix: 'Более', label: 'изделий в год' },
  { value: '700', prefix: 'Около', label: 'единиц оборудования' },
  { value: '10', prefix: 'Более', label: 'патентов' },
  { value: '1 100', prefix: '', label: 'сотрудников' },
]

export const boundPosition = value => Math.max(0, Math.min(blockoutEnd, value))
const ease = t => t * t * t * (t * (t * 6 - 15) + 10)
export function blockoutIndex(position) { return Math.round(boundPosition(position)) }
export function stationPose(section) {
  const distance = 48, right = [Math.cos(section.yaw), 0, -Math.sin(section.yaw)]
  return {
    eye: [section.x + Math.sin(section.yaw) * distance, section.height, Math.cos(section.yaw) * distance - 8],
    aim: [section.x + right[0] * 9.5, 3.2, -8 + right[2] * 9.5],
  }
}

// Low horizontal dolly, eased departure and arrival, a small travelling arc.
// Deterministic sampling makes reverse scroll retrace exactly the same path.
export function sampleBlockoutCamera(position) {
  const p = boundPosition(position), index = Math.min(Math.floor(p), blockoutEnd - 1)
  const local = p - index
  const t = ease(Math.max(0, Math.min(1, (local - .12) / .76)))
  const a = stationPose(blockoutSections[index]), b = stationPose(blockoutSections[index + 1])
  const mix = (from, to) => from.map((v, i) => v + (to[i] - v) * t)
  const eye = mix(a.eye, b.eye), aim = mix(a.aim, b.aim)
  const arc = Math.sin(Math.PI * t) ** 2
  eye[1] += arc * .7; eye[2] += arc * 3
  return { eye, aim, fov: 35 }
}
export function captionOpacity(position) {
  const distance = Math.abs(boundPosition(position) - blockoutIndex(position))
  return 1 - ease(Math.max(0, Math.min(1, (distance - .15) / .25)))
}
