
import { CityOblastMap } from '@/types/cityMapping';

// Comprehensive mapping of cities to their oblasts in both English and Ukrainian
export const cityToOblastMapping: CityOblastMap = {
  // Kyiv Oblast
  'kyiv': {
    oblastUA: 'Київська область',
    oblastEN: 'Kyiv Oblast',
    aliases: ['kiev', 'київ', 'киев', 'kyiv city', 'kiev city']
  },
  'bila tserkva': {
    oblastUA: 'Київська область',
    oblastEN: 'Kyiv Oblast',
    aliases: ['bila cerkva', 'белая церковь', 'біла церква']
  },
  'boryspil': {
    oblastUA: 'Київська область',
    oblastEN: 'Kyiv Oblast',
    aliases: ['borispol', 'борисполь', 'бориспіль']
  },
  
  // Dnipropetrovsk Oblast
  'dnipro': {
    oblastUA: 'Дніпропетровська область',
    oblastEN: 'Dnipropetrovsk Oblast',
    aliases: ['dnepropetrovsk', 'dnipropetrovsk', 'дніпро', 'днепропетровск', 'дніпропетровськ']
  },
  'kamenske': {
    oblastUA: 'Дніпропетровська область',
    oblastEN: 'Dnipropetrovsk Oblast',
    aliases: ['kamenskoye', 'каменское', 'кам\'янське']
  },
  'kryvyi rih': {
    oblastUA: 'Дніпропетровська область',
    oblastEN: 'Dnipropetrovsk Oblast',
    aliases: ['krivoy rog', 'кривой рог', 'кривий ріг']
  },
  'nikopol': {
    oblastUA: 'Дніпропетровська область',
    oblastEN: 'Dnipropetrovsk Oblast',
    aliases: ['никополь', 'нікополь']
  },
  
  // Kharkiv Oblast
  'kharkiv': {
    oblastUA: 'Харківська область',
    oblastEN: 'Kharkiv Oblast',
    aliases: ['kharkov', 'харків', 'харьков']
  },
  
  // Odesa Oblast
  'odesa': {
    oblastUA: 'Одеська область',
    oblastEN: 'Odesa Oblast',
    aliases: ['odessa', 'одеса', 'одесса']
  },
  
  // Lviv Oblast
  'lviv': {
    oblastUA: 'Львівська область',
    oblastEN: 'Lviv Oblast',
    aliases: ['lvov', 'львів', 'львов']
  },
  
  // Zaporizhzhia Oblast
  'zaporizhzhia': {
    oblastUA: 'Запорізька область',
    oblastEN: 'Zaporizhzhia Oblast',
    aliases: ['zaporozhye', 'запоріжжя', 'запорожье']
  },
  
  // Poltava Oblast
  'poltava': {
    oblastUA: 'Полтавська область',
    oblastEN: 'Poltava Oblast',
    aliases: ['полтава']
  },
  
  // Sumy Oblast
  'sumy': {
    oblastUA: 'Сумська область',
    oblastEN: 'Sumy Oblast',
    aliases: ['суми']
  },
  
  // Chernihiv Oblast
  'chernihiv': {
    oblastUA: 'Чернігівська область',
    oblastEN: 'Chernihiv Oblast',
    aliases: ['chernigov', 'чернігів', 'чернигов']
  },
  
  // Donetsk Oblast
  'donetsk': {
    oblastUA: 'Донецька область',
    oblastEN: 'Donetsk Oblast',
    aliases: ['донецьк', 'донецк']
  },
  'mariupol': {
    oblastUA: 'Донецька область',
    oblastEN: 'Donetsk Oblast',
    aliases: ['маріуполь', 'мариуполь']
  },
  
  // Luhansk Oblast
  'luhansk': {
    oblastUA: 'Луганська область',
    oblastEN: 'Luhansk Oblast',
    aliases: ['lugansk', 'луганськ', 'луганск']
  },
  
  // Kherson Oblast
  'kherson': {
    oblastUA: 'Херсонська область',
    oblastEN: 'Kherson Oblast',
    aliases: ['херсон']
  },
  
  // Mykolaiv Oblast
  'mykolaiv': {
    oblastUA: 'Миколаївська область',
    oblastEN: 'Mykolaiv Oblast',
    aliases: ['nikolaev', 'миколаїв', 'николаев']
  },
  
  // Kirovohrad Oblast
  'kropyvnytskyi': {
    oblastUA: 'Кіровоградська область',
    oblastEN: 'Kirovohrad Oblast',
    aliases: ['kirovograd', 'кропивницький', 'кировоград']
  },
  
  // Vinnytsia Oblast
  'vinnytsia': {
    oblastUA: 'Вінницька область',
    oblastEN: 'Vinnytsia Oblast',
    aliases: ['vinnitsa', 'вінниця', 'винница']
  },
  
  // Zhytomyr Oblast
  'zhytomyr': {
    oblastUA: 'Житомирська область',
    oblastEN: 'Zhytomyr Oblast',
    aliases: ['zhitomir', 'житомир']
  },
  
  // Rivne Oblast
  'rivne': {
    oblastUA: 'Рівненська область',
    oblastEN: 'Rivne Oblast',
    aliases: ['rovno', 'рівне', 'ровно']
  },
  
  // Volyn Oblast
  'lutsk': {
    oblastUA: 'Волинська область',
    oblastEN: 'Volyn Oblast',
    aliases: ['luck', 'луцьк', 'луцк']
  },
  
  // Ternopil Oblast
  'ternopil': {
    oblastUA: 'Тернопільська область',
    oblastEN: 'Ternopil Oblast',
    aliases: ['tarnopol', 'тернопіль', 'тернополь']
  },
  
  // Khmelnytskyi Oblast
  'khmelnytskyi': {
    oblastUA: 'Хмельницька область',
    oblastEN: 'Khmelnytskyi Oblast',
    aliases: ['khmelnitsky', 'хмельницький', 'хмельницкий']
  },
  
  // Cherkasy Oblast
  'cherkasy': {
    oblastUA: 'Черкаська область',
    oblastEN: 'Cherkasy Oblast',
    aliases: ['cherkassy', 'черкаси', 'черкассы']
  },
  
  // Ivano-Frankivsk Oblast
  'ivano-frankivsk': {
    oblastUA: 'Івано-Франківська область',
    oblastEN: 'Ivano-Frankivsk Oblast',
    aliases: ['ivano frankivsk', 'івано-франківськ', 'ивано-франковск']
  },
  
  // Chernivtsi Oblast
  'chernivtsi': {
    oblastUA: 'Чернівецька область',
    oblastEN: 'Chernivtsi Oblast',
    aliases: ['chernovtsy', 'чернівці', 'черновцы']
  },
  
  // Transcarpathia Oblast
  'uzhhorod': {
    oblastUA: 'Закарпатська область',
    oblastEN: 'Transcarpathia Oblast',
    aliases: ['uzhgorod', 'ужгород']
  }
};
