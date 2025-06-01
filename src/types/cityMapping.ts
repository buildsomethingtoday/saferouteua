
// Types for city-oblast mapping functionality
export interface CityOblastMap {
  [cityName: string]: {
    oblastUA: string;
    oblastEN: string;
    aliases: string[];
  };
}

export interface OblastInfo {
  oblastUA: string;
  oblastEN: string;
}
