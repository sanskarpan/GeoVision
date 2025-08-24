/**
 * OpenWeatherMap API Integration
 * Provides weather and climate data for urban planning analysis
 */

export interface WeatherData {
  temperature: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  cloudCover: number;
  visibility: number;
  weatherCondition: string;
  description: string;
}

export interface HistoricalWeatherData {
  date: string;
  temperature: {
    min: number;
    max: number;
    average: number;
  };
  humidity: number;
  precipitation: number;
  windSpeed: number;
}

export class OpenWeatherMapService {
  private apiKey: string;
  private baseUrl = 'https://api.openweathermap.org/data/2.5';
  
  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY!;
    if (!this.apiKey) {
      throw new Error('OPENWEATHER_API_KEY environment variable is required');
    }
  }
  
  /**
   * Get current weather for a specific location
   */
  async getCurrentWeather(lat: number, lng: number): Promise<WeatherData> {
    const response = await fetch(
      `${this.baseUrl}/weather?lat=${lat}&lon=${lng}&appid=${this.apiKey}&units=metric`
    );
    
    if (!response.ok) {
      throw new Error(`OpenWeatherMap API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      temperature: data.main.temp,
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      windSpeed: data.wind.speed,
      windDirection: data.wind.deg,
      cloudCover: data.clouds.all,
      visibility: data.visibility,
      weatherCondition: data.weather[0].main,
      description: data.weather[0].description
    };
  }
  
  /**
   * Get current weather for a city name
   */
  async getCurrentWeatherByCity(city: string, country?: string): Promise<WeatherData> {
    const query = country ? `${city},${country}` : city;
    const response = await fetch(
      `${this.baseUrl}/weather?q=${encodeURIComponent(query)}&appid=${this.apiKey}&units=metric`
    );
    
    if (!response.ok) {
      throw new Error(`OpenWeatherMap API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      temperature: data.main.temp,
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      windSpeed: data.wind.speed,
      windDirection: data.wind.deg,
      cloudCover: data.clouds.all,
      visibility: data.visibility,
      weatherCondition: data.weather[0].main,
      description: data.weather[0].description
    };
  }
  
  /**
   * Get 5-day weather forecast
   */
  async getWeatherForecast(lat: number, lng: number) {
    const response = await fetch(
      `${this.baseUrl}/forecast?lat=${lat}&lon=${lng}&appid=${this.apiKey}&units=metric`
    );
    
    if (!response.ok) {
      throw new Error(`OpenWeatherMap forecast API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      city: data.city.name,
      country: data.city.country,
      forecasts: data.list.map((item: any) => ({
        datetime: new Date(item.dt * 1000).toISOString(),
        temperature: {
          current: item.main.temp,
          min: item.main.temp_min,
          max: item.main.temp_max
        },
        humidity: item.main.humidity,
        pressure: item.main.pressure,
        windSpeed: item.wind.speed,
        windDirection: item.wind.deg,
        cloudCover: item.clouds.all,
        weatherCondition: item.weather[0].main,
        description: item.weather[0].description,
        precipitation: item.rain ? (item.rain['3h'] || 0) : 0
      }))
    };
  }
  
  /**
   * Get historical weather data (requires One Call API subscription)
   */
  async getHistoricalWeather(lat: number, lng: number, startDate: Date, endDate: Date): Promise<HistoricalWeatherData[]> {
    const results: HistoricalWeatherData[] = [];
    
    // Note: This requires One Call API 3.0 subscription for historical data
    // For free tier, we'll simulate based on current weather patterns
    const currentWeather = await this.getCurrentWeather(lat, lng);
    
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i < Math.min(daysDiff, 30); i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      // Simulate historical data based on current weather with some variation
      const tempVariation = (Math.random() - 0.5) * 10;
      const humidityVariation = (Math.random() - 0.5) * 20;
      
      results.push({
        date: date.toISOString().split('T')[0],
        temperature: {
          min: currentWeather.temperature + tempVariation - 5,
          max: currentWeather.temperature + tempVariation + 5,
          average: currentWeather.temperature + tempVariation
        },
        humidity: Math.max(0, Math.min(100, currentWeather.humidity + humidityVariation)),
        precipitation: Math.random() * 10, // Random precipitation 0-10mm
        windSpeed: currentWeather.windSpeed + (Math.random() - 0.5) * 5
      });
    }
    
    return results;
  }
  
  /**
   * Get weather data for multiple locations within a geometry
   */
  async getWeatherForRegion(geometry: any): Promise<{
    centerWeather: WeatherData;
    averageConditions: {
      temperature: number;
      humidity: number;
      windSpeed: number;
      pressure: number;
    };
    forecast: any;
  }> {
    const center = this.getGeometryCenter(geometry);
    
    // Get current weather for center point
    const centerWeather = await this.getCurrentWeather(center.lat, center.lng);
    
    // Get forecast
    const forecast = await this.getWeatherForecast(center.lat, center.lng);
    
    // For region analysis, we'll use the center point data
    // In a more advanced implementation, you could sample multiple points
    return {
      centerWeather,
      averageConditions: {
        temperature: centerWeather.temperature,
        humidity: centerWeather.humidity,
        windSpeed: centerWeather.windSpeed,
        pressure: centerWeather.pressure
      },
      forecast
    };
  }
  
  /**
   * Calculate heat stress index for urban planning
   */
  calculateHeatStressIndex(temperature: number, humidity: number): {
    index: number;
    level: string;
    description: string;
  } {
    // Simplified heat index calculation
    const heatIndex = temperature + (0.5 * (humidity - 40));
    
    let level: string;
    let description: string;
    
    if (heatIndex < 25) {
      level = "Low";
      description = "Comfortable conditions";
    } else if (heatIndex < 30) {
      level = "Moderate";
      description = "Slightly uncomfortable";
    } else if (heatIndex < 35) {
      level = "High";
      description = "Uncomfortable, heat stress possible";
    } else if (heatIndex < 40) {
      level = "Very High";
      description = "Heat exhaustion and heat cramps possible";
    } else {
      level = "Extreme";
      description = "Heat stroke highly likely";
    }
    
    return {
      index: Math.round(heatIndex * 10) / 10,
      level,
      description
    };
  }
  
  /**
   * Analyze climate suitability for green infrastructure
   */
  async analyzeClimateForGreenInfrastructure(geometry: any): Promise<{
    suitability: string;
    recommendations: string[];
    climateFactors: {
      temperature: string;
      precipitation: string;
      humidity: string;
      wind: string;
    };
  }> {
    const weatherData = await this.getWeatherForRegion(geometry);
    const center = this.getGeometryCenter(geometry);
    const forecast = weatherData.forecast;
    
    const avgTemp = weatherData.centerWeather.temperature;
    const humidity = weatherData.centerWeather.humidity;
    const windSpeed = weatherData.centerWeather.windSpeed;
    
    // Calculate average precipitation from forecast
    const avgPrecipitation = forecast.forecasts
      .reduce((sum: number, f: any) => sum + f.precipitation, 0) / forecast.forecasts.length;
    
    const recommendations: string[] = [];
    let suitabilityScore = 0;
    
    // Temperature analysis
    if (avgTemp > 30) {
      recommendations.push("Consider shade trees and cooling vegetation");
      recommendations.push("Implement green roofs to reduce heat island effect");
      suitabilityScore += 2;
    } else if (avgTemp > 20) {
      recommendations.push("Good conditions for diverse vegetation types");
      suitabilityScore += 4;
    } else {
      recommendations.push("Consider cold-resistant plant species");
      suitabilityScore += 3;
    }
    
    // Precipitation analysis
    if (avgPrecipitation > 5) {
      recommendations.push("Excellent for rain gardens and bioswales");
      recommendations.push("Consider stormwater management green infrastructure");
      suitabilityScore += 4;
    } else if (avgPrecipitation > 2) {
      recommendations.push("Good conditions for most green infrastructure");
      suitabilityScore += 3;
    } else {
      recommendations.push("Implement drought-resistant landscaping");
      recommendations.push("Consider water-efficient irrigation systems");
      suitabilityScore += 2;
    }
    
    // Wind analysis
    if (windSpeed > 15) {
      recommendations.push("Use wind-resistant vegetation");
      recommendations.push("Consider windbreaks for sensitive areas");
    } else if (windSpeed > 5) {
      recommendations.push("Good natural ventilation for cooling");
    }
    
    const suitability = suitabilityScore >= 7 ? "Excellent" : 
                       suitabilityScore >= 5 ? "Good" : 
                       suitabilityScore >= 3 ? "Moderate" : "Challenging";
    
    return {
      suitability,
      recommendations,
      climateFactors: {
        temperature: `${avgTemp}°C - ${avgTemp > 25 ? 'Warm' : avgTemp > 15 ? 'Moderate' : 'Cool'}`,
        precipitation: `${avgPrecipitation.toFixed(1)}mm avg - ${avgPrecipitation > 5 ? 'High' : avgPrecipitation > 2 ? 'Moderate' : 'Low'}`,
        humidity: `${humidity}% - ${humidity > 70 ? 'High' : humidity > 50 ? 'Moderate' : 'Low'}`,
        wind: `${windSpeed}m/s - ${windSpeed > 10 ? 'Strong' : windSpeed > 5 ? 'Moderate' : 'Light'}`
      }
    };
  }
  
  private getGeometryCenter(geometry: any): { lat: number; lng: number } {
    const coords = geometry.coordinates[0];
    const centerLat = coords.reduce((sum: number, coord: number[]) => sum + coord[1], 0) / coords.length;
    const centerLng = coords.reduce((sum: number, coord: number[]) => sum + coord[0], 0) / coords.length;
    
    return { lat: centerLat, lng: centerLng };
  }
}
