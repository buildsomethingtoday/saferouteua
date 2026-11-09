import { RouteInputTranslations } from '@/types/route';

export type Language = 'en' | 'ua';

// Single source of truth for the route panel translations.
// Used by Index and SafetyPanel so the two never drift apart.
export const getRouteInputTranslations = (language: Language): RouteInputTranslations => ({
  from: language === 'en' ? 'From' : 'Звідки',
  to: language === 'en' ? 'To' : 'Куди',
  route: language === 'en' ? 'Route' : 'Маршрут',
  routeError: language === 'en' ? 'Route Error' : 'Помилка маршруту',
  errorTips: language === 'en'
    ? [
        'Check your internet connection',
        'Try more specific city names (e.g., "Kyiv, Ukraine")',
        'Ensure city names are spelled correctly',
        "Try different nearby cities if the exact location isn't found"
      ]
    : [
        "Перевірте інтернет-з'єднання",
        'Спробуйте точнішу назву міста (напр., «Київ, Україна»)',
        'Переконайтеся, що назви міст написані правильно',
        'Спробуйте сусідні міста, якщо точне місце не знайдено'
      ],
  errorMapboxInit: language === 'en'
    ? 'Map service is unavailable right now. Please try again later.'
    : 'Картографічний сервіс наразі недоступний. Спробуйте пізніше.',
  errorCityNotFound: language === 'en'
    ? 'Could not find city "{city}"'
    : 'Не вдалося знайти місто «{city}»',
  errorNoCityResults: language === 'en'
    ? 'No results found for: {city}. Please try a more specific location.'
    : 'Нічого не знайдено для: {city}. Спробуйте вказати точніше місце.',
  errorDirections: language === 'en'
    ? 'Could not get route directions. Please try again.'
    : 'Не вдалося отримати маршрут. Спробуйте ще раз.',
  errorNoRoutes: language === 'en'
    ? 'No routes found between the selected cities. Please try different locations.'
    : 'Маршрутів між обраними містами не знайдено. Спробуйте інші міста.',
  errorSearchFailed: language === 'en' ? 'Route search failed' : 'Не вдалося знайти маршрут',
  unexpectedError: language === 'en' ? 'An unexpected error occurred' : 'Сталася неочікувана помилка',
  loading: language === 'en' ? 'Loading...' : 'Завантаження...',
  dataSources: language === 'en' ? 'Data: alerts.in.ua · Mapbox © OSM' : 'Дані: alerts.in.ua · Mapbox © OSM',
  severity: {
    low: language === 'en' ? 'Low' : 'Низька',
    moderate: language === 'en' ? 'Moderate' : 'Помірна',
    high: language === 'en' ? 'High' : 'Висока',
    critical: language === 'en' ? 'Critical' : 'Критична'
  },
  startCity: language === 'en' ? 'From' : 'Звідки',
  endCity: language === 'en' ? 'To' : 'Куди',
  startPlaceholder: language === 'en' ? 'Enter starting city...' : 'Введіть місто відправлення...',
  endPlaceholder: language === 'en' ? 'Enter destination city...' : 'Введіть місто призначення...',
  planRoute: language === 'en' ? 'Plan Route' : 'Планувати маршрут',
  alerts: language === 'en' ? 'Alerts' : 'Сповіщення',
  statistics: language === 'en' ? 'Statistics' : 'Статистика',
  searchPlaceholder: language === 'en' ? 'Search cities...' : 'Пошук міст...',
  searching: language === 'en' ? 'Searching route...' : 'Пошук маршруту...',
  distance: language === 'en' ? 'Distance' : 'Відстань',
  duration: language === 'en' ? 'Duration' : 'Тривалість',
  routeInformation: language === 'en' ? 'Route Information' : 'Інформація про маршрут',
  safetyAlerts: language === 'en' ? 'Safety Alerts' : 'Сповіщення безпеки',
  alertsCount: language === 'en' ? 'alerts' : 'сповіщень',
  live: language === 'en' ? 'Live' : 'Прямий ефір',
  estimated: language === 'en' ? 'Estimated' : 'Приблизно',
  weather: language === 'en' ? 'Weather' : 'Погода',
  weatherConditions: {
    clear: language === 'en' ? 'Clear' : 'Ясно',
    cloudy: language === 'en' ? 'Cloudy' : 'Хмарно',
    light_rain: language === 'en' ? 'Light Rain' : 'Невеликий дощ',
    rainy: language === 'en' ? 'Rainy' : 'Дощ',
    snowy: language === 'en' ? 'Snowy' : 'Сніг'
  },
  alertsByType: language === 'en' ? 'Alerts by Type' : 'Сповіщення за типом',
  alertsByRegion: language === 'en' ? 'Alerts by Region' : 'Сповіщення за регіоном',
  timeFilter: language === 'en' ? 'Time Period' : 'Період часу',
  last7Days: language === 'en' ? 'Last 7 Days' : 'Останні 7 днів',
  last30Days: language === 'en' ? 'Last 30 Days' : 'Останні 30 днів',
  last90Days: language === 'en' ? 'Last 90 Days' : 'Останні 90 днів',
  allTime: language === 'en' ? 'All Time' : 'Весь час',
  noData: language === 'en' ? 'No data available' : 'Дані відсутні',
  loadingStats: language === 'en' ? 'Loading statistics...' : 'Завантаження статистики...',
  statisticsTitle: language === 'en' ? 'Statistics' : 'Статистика',
  syncData: language === 'en' ? 'Sync Data' : 'Синхронізувати дані',
  syncing: language === 'en' ? 'Syncing...' : 'Синхронізація...',
  syncCompleted: language === 'en' ? 'Sync Completed' : 'Синхронізація завершена',
  syncFailed: language === 'en' ? 'Sync Failed' : 'Помилка синхронізації',
  syncError: language === 'en' ? 'Sync Error' : 'Помилка синхронізації',
  totalAlerts: language === 'en' ? 'Total Alerts' : 'Всього сповіщень',
  activeAlerts: language === 'en' ? 'Active Alerts' : 'Активні сповіщення',
  averageDaily: language === 'en' ? 'Daily Average' : 'Щоденне середнє',
  alertsOverTime: language === 'en' ? 'Alerts Over Time' : 'Сповіщення за часом',
  attackTiming: language === 'en' ? 'Attack Timing' : 'Час атак',
  morning: language === 'en' ? 'Morning (6-12)' : 'Ранок (6-12)',
  afternoon: language === 'en' ? 'Afternoon (12-18)' : 'День (12-18)',
  evening: language === 'en' ? 'Evening (18-24)' : 'Вечір (18-24)',
  night: language === 'en' ? 'Night (0-6)' : 'Ніч (0-6)',
  noStatisticsData: language === 'en' ? 'No statistics data available' : 'Статистичні дані відсутні'
});
