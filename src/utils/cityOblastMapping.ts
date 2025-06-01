
// Comprehensive mapping of cities to their oblasts in both English and Ukrainian
export interface CityOblastMap {
  [cityName: string]: {
    oblastUA: string;
    oblastEN: string;
    aliases: string[];
  };
}

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

// Function to find oblast for a given city name
export function findOblastForCity(cityName: string): { oblastUA: string; oblastEN: string } | null {
  const normalizedCity = cityName.toLowerCase().trim();
  
  // Direct lookup
  if (cityToOblastMapping[normalizedCity]) {
    return {
      oblastUA: cityToOblastMapping[normalizedCity].oblastUA,
      oblastEN: cityToOblastMapping[normalizedCity].oblastEN
    };
  }
  
  // Search in aliases
  for (const [cityKey, cityData] of Object.entries(cityToOblastMapping)) {
    if (cityData.aliases.some(alias => 
      alias.toLowerCase() === normalizedCity || 
      normalizedCity.includes(alias.toLowerCase()) ||
      alias.toLowerCase().includes(normalizedCity)
    )) {
      return {
        oblastUA: cityData.oblastUA,
        oblastEN: cityData.oblastEN
      };
    }
  }
  
  return null;
}

// Enhanced function to check if an alert location matches a city
export function doesAlertMatchCity(alertLocation: string, alertOblast: string, cityName: string): boolean {
  console.log('🔍 Checking alert match:', { alertLocation, alertOblast, cityName });
  
  const normalizedAlertLocation = alertLocation.toLowerCase().trim();
  const normalizedAlertOblast = alertOblast.toLowerCase().trim();
  const normalizedCity = cityName.toLowerCase().trim();
  
  // Special handling for "м. Київ м. Київ" format
  if (normalizedAlertLocation.includes('м. київ') && normalizedCity === 'kyiv') {
    console.log('✅ Special Kyiv match found');
    return true;
  }
  
  // Check if alert location directly mentions the city
  if (normalizedAlertLocation.includes(normalizedCity)) {
    console.log('✅ Direct city name match');
    return true;
  }
  
  // Check city aliases
  const cityData = Object.entries(cityToOblastMapping).find(([key, data]) => 
    key === normalizedCity || data.aliases.some(alias => alias.toLowerCase() === normalizedCity)
  );
  
  if (cityData) {
    const [cityKey, data] = cityData;
    
    // Check if alert location mentions any alias of the city
    if (data.aliases.some(alias => normalizedAlertLocation.includes(alias.toLowerCase()))) {
      console.log('✅ City alias match found');
      return true;
    }
    
    // Check if alert is in the same oblast as the city
    if (normalizedAlertOblast.includes(data.oblastUA.toLowerCase()) || 
        normalizedAlertOblast.includes(data.oblastEN.toLowerCase())) {
      console.log('✅ Oblast match found');
      return true;
    }
  }
  
  // Special case for major cities by oblast matching
  if (normalizedCity === 'kyiv' && normalizedAlertOblast.includes('київ')) {
    console.log('✅ Kyiv oblast match');
    return true;
  }
  
  if (normalizedCity === 'dnipro' && normalizedAlertOblast.includes('дніпропетровськ')) {
    console.log('✅ Dnipro oblast match');
    return true;
  }
  
  console.log('❌ No match found');
  return false;
}
