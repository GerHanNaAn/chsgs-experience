// Selected facts paraphrased from the official CHSGS page, checked 2026-10-25.
// The page's client widget did not return its list; do not invent company names.
const sourceUrl = 'https://xn--d1an.xn--p1ai/info_ld_plants/chsgs/'
const factoryFilmUrl = 'https://rutube.ru/play/embed/4307072ce86bf1bbfcd0e9fe51c7a6cc/?skinColor=FDD835'

export const blockoutCopy = {
  entrance: {
    body: 'Крупнейшая производственная площадка Группы компаний «ЛД». Полный цикл — от разработки и комплектующих до испытаний готовой арматуры.',
    highlights: [],
    sourceUrl,
  },
  technology: {
    body: 'Обработка стали, роботизированная сварка и автоматическая сборка объединены на одной площадке. Сборочные линии разработаны собственными инженерами.',
    highlights: [{ value: '>120', label: 'станков с ЧПУ' }],
    sourceUrl,
  },
  quality: {
    body: 'Каждое изделие проходит гидравлические и пневматические испытания. Собственные лаборатории проверяют металл и сварные соединения.',
    highlights: [
      { value: '100%', label: 'продукции проходит испытания' },
      { value: 'Класс А', label: 'герметичность по ГОСТ 9544' },
    ],
    sourceUrl,
  },
  traceability: {
    body: 'Индивидуальный QR-код открывает электронный паспорт изделия. Для соответствующей номенклатуры номер дополнительно наносится механической накаткой на корпус.',
    highlights: [{ value: 'QR', label: 'проверка подлинности' }],
    sourceUrl,
  },
  service: {
    body: 'Выездные инженеры помогают с монтажом, запуском и обслуживанием арматуры в России и за рубежом.',
    highlights: [
      { value: '10 лет', label: 'заводская гарантия' },
      { value: '24/7', label: 'выездная сервисная служба' },
    ],
    sourceUrl,
  },
  film: {
    body: 'Фильм о заводе «ЧелябинскСпецГражданСтрой» — производственной площадке Группы компаний «ЛД».',
    highlights: [],
    // This is the exact iframe URL published by LD, not a guessed video ID.
    // Rutube can fail independently; keep the source page available as a fallback.
    videoUrl: factoryFilmUrl,
    videoEmbedUrl: factoryFilmUrl,
    sourceUrl,
  },
  global: {
    body: 'Завод вместе с LD Pride отмечен федеральной премией в области экспорта в 2023 и 2025 годах.',
    highlights: [
      { value: '>200', label: 'дилеров' },
      { value: '12', label: 'филиалов со складами' },
      { value: '>30', label: 'стран' },
    ],
    sourceUrl,
  },
  clients: {
    body: 'Арматура ЧСГС работает на объектах теплоэнергетики, газоснабжения и добывающей промышленности. Завод выпускает общепромышленные и специализированные решения.',
    highlights: [],
    sourceUrl,
  },
}
