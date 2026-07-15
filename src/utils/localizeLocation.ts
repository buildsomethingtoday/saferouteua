// alerts.in.ua returns location names in Ukrainian only (no language parameter
// exists in their API), so English mode localizes them client-side:
// oblasts via an exact map, everything else via the official Ukrainian
// romanization standard (KMU 55-2010).

const OBLAST_EN: { [key: string]: string } = {
  'Вінницька область': 'Vinnytsia Oblast',
  'Волинська область': 'Volyn Oblast',
  'Дніпропетровська область': 'Dnipropetrovsk Oblast',
  'Донецька область': 'Donetsk Oblast',
  'Житомирська область': 'Zhytomyr Oblast',
  'Закарпатська область': 'Zakarpattia Oblast',
  'Запорізька область': 'Zaporizhzhia Oblast',
  'Івано-Франківська область': 'Ivano-Frankivsk Oblast',
  'Київська область': 'Kyiv Oblast',
  'Кіровоградська область': 'Kirovohrad Oblast',
  'Луганська область': 'Luhansk Oblast',
  'Львівська область': 'Lviv Oblast',
  'Миколаївська область': 'Mykolaiv Oblast',
  'Одеська область': 'Odesa Oblast',
  'Полтавська область': 'Poltava Oblast',
  'Рівненська область': 'Rivne Oblast',
  'Сумська область': 'Sumy Oblast',
  'Тернопільська область': 'Ternopil Oblast',
  'Харківська область': 'Kharkiv Oblast',
  'Херсонська область': 'Kherson Oblast',
  'Хмельницька область': 'Khmelnytskyi Oblast',
  'Черкаська область': 'Cherkasy Oblast',
  'Чернівецька область': 'Chernivtsi Oblast',
  'Чернігівська область': 'Chernihiv Oblast',
  'м. Київ': 'Kyiv',
  'Автономна Республіка Крим': 'Autonomous Republic of Crimea'
};

// Word-initial forms differ from mid-word forms per the standard
const INITIAL: { [key: string]: string } = {
  'є': 'ye', 'ї': 'yi', 'й': 'y', 'ю': 'yu', 'я': 'ya'
};

const TABLE: { [key: string]: string } = {
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'h', 'ґ': 'g', 'д': 'd', 'е': 'e',
  'є': 'ie', 'ж': 'zh', 'з': 'z', 'и': 'y', 'і': 'i', 'ї': 'i', 'й': 'i',
  'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r',
  'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch',
  'ш': 'sh', 'щ': 'shch', 'ь': '', 'ю': 'iu', 'я': 'ia', "'": '', 'ʼ': '', '’': ''
};

export const transliterateUkrainian = (text: string): string => {
  let out = '';
  let wordStart = true;
  for (const char of text) {
    const lower = char.toLowerCase();
    const isUpper = char !== lower;
    let mapped = TABLE[lower];

    if (mapped === undefined) {
      out += char;
      wordStart = !/[a-zа-яіїєґ0-9]/i.test(char);
      continue;
    }

    if (wordStart && INITIAL[lower] !== undefined) {
      mapped = INITIAL[lower];
    }
    // "зг" → "zgh" per the standard, to distinguish from "ж"
    if (lower === 'г' && out.toLowerCase().endsWith('z')) {
      mapped = 'gh';
    }

    out += isUpper && mapped ? mapped[0].toUpperCase() + mapped.slice(1) : mapped;
    wordStart = false;
  }
  return out;
};

/** Localize an oblast name ("Харківська область" → "Kharkiv Oblast"). */
export const localizeOblast = (oblast: string, language: 'en' | 'ua'): string => {
  if (language === 'ua' || !oblast) return oblast;
  return OBLAST_EN[oblast] || transliterateUkrainian(oblast);
};

/** Localize a location title ("Чугуївський район" → "Chuhuivskyi district"). */
export const localizeLocation = (title: string, language: 'en' | 'ua'): string => {
  if (language === 'ua' || !title) return title;
  if (OBLAST_EN[title]) return OBLAST_EN[title];

  const anglicized = title
    .replace(/^м\.\s*/, '')
    .replace(/\sрайон$/, ' district')
    .replace(/\sтериторіальна громада$/, ' community')
    .replace(/\sобласть$/, ' oblast');

  return transliterateUkrainian(anglicized);
};
