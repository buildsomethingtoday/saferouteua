
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
  }

  async getCurrentWeather(lat: number, lon: number): Promise<WeatherResponse> {
    const url = `${this.baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }
    
    return response.json();
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
  return new WeatherService('621ef155aee944e52067333d22d9968a');
};
