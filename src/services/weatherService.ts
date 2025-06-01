
interface WeatherResponse {
  weather: Array<{
    main: string;
    description: string;
  }>;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  wind: {
    speed: number;
  };
  name: string;
}

export class WeatherService {
  private apiKey: string;
  private baseUrl = 'https://api.openweathermap.org/data/2.5';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    console.log('🌤️ WeatherService initialized with API key:', apiKey ? 'Key present' : 'No key');
  }

  async getCurrentWeather(lat: number, lon: number): Promise<WeatherResponse> {
    if (!this.apiKey) {
      throw new Error('Weather API key not configured');
    }

    const url = `${this.baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`;
    
    console.log('🌤️ Fetching weather from:', url.replace(this.apiKey, 'API_KEY_HIDDEN'));
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Weather API error:', errorText);
        throw new Error(`Weather API error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ Weather data received:', data.weather?.[0]?.main, data.main?.temp + '°C');
      return data;
    } catch (fetchError) {
      console.error('❌ Weather fetch error:', fetchError);
      throw new Error(`Weather network error: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
    }
  }

  mapWeatherCondition(weatherMain: string): 'clear' | 'cloudy' | 'light_rain' {
    const condition = weatherMain.toLowerCase();
    
    switch (condition) {
      case 'clear':
        return 'clear';
      case 'clouds':
      case 'mist':
      case 'fog':
        return 'cloudy';
      case 'rain':
      case 'drizzle':
      case 'snow':
      case 'thunderstorm':
        return 'light_rain';
      default:
        return 'clear';
    }
  }
}

export const getWeatherService = () => {
  // Using the existing API key for now - in production this should be moved to Supabase secrets
  const apiKey = '621ef155aee944e52067333d22d9968a';
  return new WeatherService(apiKey);
};
