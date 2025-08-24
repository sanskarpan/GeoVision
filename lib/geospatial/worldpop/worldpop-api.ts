// import { NextResponse } from "next/server";

// /**
//  * WorldPop API Integration for Population Data
//  * Provides access to high-resolution population data for urban analysis
//  */

// export interface WorldPopRequestParams {
//   country: string;
//   year: number;
//   geojson?: any;
//   format?: 'json' | 'csv' | 'geotiff';
//   resolution?: '100m' | '1km';
// }

// export interface WorldPopResponse {
//   success: boolean;
//   data?: {
//     population: number;
//     populationDensity: number;
//     area: number;
//     metadata: {
//       country: string;
//       year: number;
//       resolution: string;
//       source: string;
//       lastUpdated: string;
//     };
//     geospatial: {
//       bounds: {
//         north: number;
//         south: number;
//         east: number;
//         west: number;
//       };
//       centroid: {
//         lat: number;
//         lng: number;
//       };
//     };
//     timeSeries?: {
//       year: number;
//       population: number;
//       populationDensity: number;
//     }[];
//   };
//   error?: string;
// }

// export interface PopulationChangeAnalysis {
//   period1: {
//     year: number;
//     population: number;
//     populationDensity: number;
//   };
//   period2: {
//     year: number;
//     population: number;
//     populationDensity: number;
//   };
//   changes: {
//     absoluteChange: number;
//     percentageChange: number;
//     densityChange: number;
//     densityPercentageChange: number;
//     annualGrowthRate: number;
//   };
//   analysis: {
//     growthTrend: 'increasing' | 'decreasing' | 'stable';
//     urbanizationLevel: 'low' | 'medium' | 'high';
//     recommendations: string[];
//   };
// }

// /**
//  * WorldPop API base configuration
//  */
// const WORLDPOP_CONFIG = {
//   baseUrl: 'https://api.worldpop.org/v1',
//   endpoints: {
//     population: '/population',
//     populationDensity: '/population-density',
//     populationChange: '/population-change',
//     metadata: '/metadata',
//   },
//   defaultParams: {
//     format: 'json',
//     resolution: '100m',
//   },
// };

// /**
//  * Get population data for a specific country and year
//  */
// export async function getWorldPopPopulationData(
//   params: WorldPopRequestParams
// ): Promise<WorldPopResponse> {
//   try {
//     const { country, year, geojson, format = 'json', resolution = '100m' } = params;
    
//     // Validate parameters
//     if (!country || !year) {
//       return {
//         success: false,
//         error: 'Country and year are required parameters'
//       };
//     }

//     if (year < 2000 || year > 2023) {
//       return {
//         success: false,
//         error: 'Year must be between 2000 and 2023'
//       };
//     }

//     // Construct API URL
//     const url = new URL(`${WORLDPOP_CONFIG.baseUrl}${WORLDPOP_CONFIG.endpoints.population}`);
//     url.searchParams.append('country', country);
//     url.searchParams.append('year', year.toString());
//     url.searchParams.append('format', format);
//     url.searchParams.append('resolution', resolution);
    
//     if (geojson) {
//       url.searchParams.append('geojson', JSON.stringify(geojson));
//     }

//     console.log(`🌍 WorldPop API Request: ${url.toString()}`);

//     // Make API request
//     const response = await fetch(url.toString(), {
//       method: 'GET',
//       headers: {
//         'Accept': 'application/json',
//         'User-Agent': 'GeoVision-UrbanAnalysis/1.0',
//       },
//     });

//     if (!response.ok) {
//       throw new Error(`WorldPop API error: ${response.status} ${response.statusText}`);
//     }

//     const data = await response.json();
    
//     return {
//       success: true,
//       data: {
//         population: data.population || 0,
//         populationDensity: data.population_density || 0,
//         area: data.area || 0,
//         metadata: {
//           country: data.country || country,
//           year: data.year || year,
//           resolution: data.resolution || resolution,
//           source: 'WorldPop',
//           lastUpdated: data.last_updated || new Date().toISOString(),
//         },
//         geospatial: {
//           bounds: data.bounds || {},
//           centroid: data.centroid || {},
//         },
//         timeSeries: data.time_series || [],
//       }
//     };

//   } catch (error) {
//     console.error('WorldPop API Error:', error);
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : 'Unknown error occurred'
//     };
//   }
// }

// /**
//  * Get population change analysis between two time periods
//  */
// export async function getWorldPopPopulationChange(
//   params: {
//     country: string;
//     year1: number;
//     year2: number;
//     geojson?: any;
//   }
// ): Promise<PopulationChangeAnalysis | { success: false; error: string }> {
//   try {
//     const { country, year1, year2, geojson } = params;
    
//     // Validate parameters
//     if (year1 >= year2) {
//       return {
//         success: false,
//         error: 'Year1 must be less than Year2'
//       };
//     }

//     // Get population data for both periods
//     const [period1Data, period2Data] = await Promise.all([
//       getWorldPopPopulationData({ country, year: year1, geojson }),
//       getWorldPopPopulationData({ country, year: year2, geojson })
//     ]);

//     if (!period1Data.success || !period2Data.success) {
//       return {
//         success: false,
//         error: `Failed to get population data: ${period1Data.error || period2Data.error}`
//       };
//     }

//     const p1 = period1Data.data!;
//     const p2 = period2Data.data!;

//     // Calculate changes
//     const absoluteChange = p2.population - p1.population;
//     const percentageChange = ((absoluteChange / p1.population) * 100);
//     const densityChange = p2.populationDensity - p1.populationDensity;
//     const densityPercentageChange = ((densityChange / p1.populationDensity) * 100);
//     const yearsDiff = year2 - year1;
//     const annualGrowthRate = (Math.pow(p2.population / p1.population, 1 / yearsDiff) - 1) * 100;

//     // Analyze trends
//     const growthTrend = absoluteChange > 0 ? 'increasing' : absoluteChange < 0 ? 'decreasing' : 'stable';
    
//     let urbanizationLevel: 'low' | 'medium' | 'high';
//     if (p2.populationDensity < 100) urbanizationLevel = 'low';
//     else if (p2.populationDensity < 1000) urbanizationLevel = 'medium';
//     else urbanizationLevel = 'high';

//     // Generate recommendations
//     const recommendations: string[] = [];
//     if (growthTrend === 'increasing' && urbanizationLevel === 'high') {
//       recommendations.push('Consider urban planning strategies to manage population density');
//       recommendations.push('Monitor infrastructure capacity and service delivery');
//     } else if (growthTrend === 'decreasing') {
//       recommendations.push('Investigate factors contributing to population decline');
//       recommendations.push('Consider economic development strategies');
//     }

//     return {
//       period1: {
//         year: year1,
//         population: p1.population,
//         populationDensity: p1.populationDensity,
//       },
//       period2: {
//         year: year2,
//         population: p2.population,
//         populationDensity: p2.populationDensity,
//       },
//       changes: {
//         absoluteChange,
//         percentageChange,
//         densityChange,
//         densityPercentageChange,
//         annualGrowthRate,
//       },
//       analysis: {
//         growthTrend,
//         urbanizationLevel,
//         recommendations,
//       },
//     };

//   } catch (error) {
//     console.error('Population Change Analysis Error:', error);
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : 'Unknown error occurred'
//     };
//   }
// }

// /**
//  * Get population density data for urban analysis
//  */
// export async function getWorldPopPopulationDensity(
//   params: WorldPopRequestParams
// ): Promise<WorldPopResponse> {
//   try {
//     const { country, year, geojson, format = 'json', resolution = '100m' } = params;
    
//     // Validate parameters
//     if (!country || !year) {
//       return {
//         success: false,
//         error: 'Country and year are required parameters'
//       };
//     }

//     // Construct API URL for population density
//     const url = new URL(`${WORLDPOP_CONFIG.baseUrl}${WORLDPOP_CONFIG.endpoints.populationDensity}`);
//     url.searchParams.append('country', country);
//     url.searchParams.append('year', year.toString());
//     url.searchParams.append('format', format);
//     url.searchParams.append('resolution', resolution);
    
//     if (geojson) {
//       url.searchParams.append('geojson', JSON.stringify(geojson));
//     }

//     console.log(`🌍 WorldPop Population Density API Request: ${url.toString()}`);

//     // Make API request
//     const response = await fetch(url.toString(), {
//       method: 'GET',
//       headers: {
//         'Accept': 'application/json',
//         'User-Agent': 'GeoVision-UrbanAnalysis/1.0',
//       },
//     });

//     if (!response.ok) {
//       throw new Error(`WorldPop API error: ${response.status} ${response.statusText}`);
//     }

//     const data = await response.json();
    
//     return {
//       success: true,
//       data: {
//         population: data.population || 0,
//         populationDensity: data.population_density || 0,
//         area: data.area || 0,
//         metadata: {
//           country: data.country || country,
//           year: data.year || year,
//           resolution: data.resolution || resolution,
//           source: 'WorldPop',
//           lastUpdated: data.last_updated || new Date().toISOString(),
//         },
//         geospatial: {
//           bounds: data.bounds || {},
//           centroid: data.centroid || {},
//         },
//         timeSeries: data.time_series || [],
//       }
//     };

//   } catch (error) {
//     console.error('WorldPop Population Density API Error:', error);
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : 'Unknown error occurred'
//     };
//   }
// }

// /**
//  * Get metadata about available WorldPop datasets
//  */
// export async function getWorldPopMetadata(country?: string): Promise<any> {
//   try {
//     const url = new URL(`${WORLDPOP_CONFIG.baseUrl}${WORLDPOP_CONFIG.endpoints.metadata}`);
    
//     if (country) {
//       url.searchParams.append('country', country);
//     }

//     const response = await fetch(url.toString(), {
//       method: 'GET',
//       headers: {
//         'Accept': 'application/json',
//         'User-Agent': 'GeoVision-UrbanAnalysis/1.0',
//       },
//     });

//     if (!response.ok) {
//       throw new Error(`WorldPop API error: ${response.status} ${response.statusText}`);
//     }

//     return await response.json();

//   } catch (error) {
//     console.error('WorldPop Metadata API Error:', error);
//     throw error;
//   }
// }


/**
 * WorldPop API Integration for Population Data - Fixed Version
 * Provides access to high-resolution population data for urban analysis
 * Based on the actual WorldPop API structure (v1/services)
 */

export interface WorldPopRequestParams {
    dataset: 'wpgppop' | 'wpgpas';
    year: number;
    geojson: any;
    key?: string;
    runasync?: boolean;
  }
  
  export interface WorldPopTaskResponse {
    status: string;
    status_code: number;
    error: boolean;
    error_message: string | null;
    taskid?: string;
    data?: {
      total_population?: number;
      agesexpyramid?: Array<{
        class: string;
        age: string;
        male: number;
        female: number;
      }>;
    };
    startTime?: string;
    endTime?: string;
    executionTime?: number;
  }
  
  export interface WorldPopResponse {
    success: boolean;
    data?: {
      population: number;
      populationDensity?: number;
      area?: number;
      ageGenderData?: Array<{
        class: string;
        age: string;
        male: number;
        female: number;
      }>;
      metadata: {
        country: string;
        year: number;
        resolution: string;
        source: string;
        lastUpdated: string;
        dataset: string;
      };
      geospatial: {
        bounds: {
          north: number;
          south: number;
          east: number;
          west: number;
        };
        centroid: {
          lat: number;
          lng: number;
        };
      };
      timeSeries?: {
        year: number;
        population: number;
        populationDensity: number;
      }[];
    };
    taskid?: string;
    error?: string;
  }
  
  export interface PopulationChangeAnalysis {
    country: string;
    year1: number;
    year2: number;
    period1Population: number;
    period2Population: number;
    absoluteChange: number;
    percentageChange: number;
    annualGrowthRate: number;
    urbanizationLevel: number;
    populationDensity: number;
    area: number;
    metadata: {
      source: string;
      resolution: string;
      format: string;
      lastUpdated: string;
      analysisType: string;
      geojsonProvided: boolean;
      dataset: string;
    };
    geospatial: {
      bounds: {
        north: number;
        south: number;
        east: number;
        west: number;
      };
      centroid: {
        lat: number;
        lng: number;
      };
    };
  }
  
  /**
   * WorldPop API base configuration - Updated to match actual API
   */
  const WORLDPOP_CONFIG = {
    baseUrl: 'https://api.worldpop.org/v1',
    endpoints: {
      services: '/services',
      tasks: '/tasks',
    },
    services: {
      stats: 'stats',
      sample: 'sample',
    },
    datasets: {
      population: 'wpgppop', // Global per country 2000-2020
      ageGender: 'wpgpas',   // Age and sex structures
    },
    defaultParams: {
      runasync: false, // Set to false for synchronous requests when possible
    },
  };
  
  /**
   * Utility function to calculate bounding box from GeoJSON
   */
  function calculateBounds(geojson: any): { north: number; south: number; east: number; west: number } {
    if (!geojson || !geojson.features || geojson.features.length === 0) {
      return { north: 0, south: 0, east: 0, west: 0 };
    }
  
    let minLng = Infinity, maxLng = -Infinity;
    let minLat = Infinity, maxLat = -Infinity;
  
    geojson.features.forEach((feature: any) => {
      if (feature.geometry && feature.geometry.coordinates) {
        const coords = feature.geometry.coordinates[0]; // Assuming polygon
        coords.forEach((coord: [number, number]) => {
          const [lng, lat] = coord;
          minLng = Math.min(minLng, lng);
          maxLng = Math.max(maxLng, lng);
          minLat = Math.min(minLat, lat);
          maxLat = Math.max(maxLat, lat);
        });
      }
    });
  
    return {
      north: maxLat,
      south: minLat,
      east: maxLng,
      west: minLng,
    };
  }
  
  /**
   * Utility function to calculate centroid from GeoJSON
   */
  function calculateCentroid(geojson: any): { lat: number; lng: number } {
    const bounds = calculateBounds(geojson);
    return {
      lat: (bounds.north + bounds.south) / 2,
      lng: (bounds.east + bounds.west) / 2,
    };
  }
  
  /**
   * Wait for task completion and get results
   */
  async function waitForTaskCompletion(taskid: string, maxAttempts: number = 10): Promise<WorldPopTaskResponse> {
    const taskUrl = `${WORLDPOP_CONFIG.baseUrl}${WORLDPOP_CONFIG.endpoints.tasks}/${taskid}`;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await fetch(taskUrl);
        
        if (!response.ok) {
          throw new Error(`Task status check failed: ${response.status} ${response.statusText}`);
        }
  
        const taskData: WorldPopTaskResponse = await response.json();
        
        if (taskData.status === 'finished') {
          return taskData;
        } else if (taskData.status === 'error' || taskData.error) {
          throw new Error(`Task failed: ${taskData.error_message || 'Unknown error'}`);
        }
        
        // Wait before next attempt (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      } catch (error) {
        console.error(`Task check attempt ${attempt + 1} failed:`, error);
        if (attempt === maxAttempts - 1) throw error;
      }
    }
    
    throw new Error(`Task ${taskid} did not complete within expected time`);
  }
  
  /**
   * Get population data for a specific area using GeoJSON
   */
  export async function getWorldPopPopulationData(
    country: string,
    year: string,
    resolution: string = "100m",
    format: string = "json",
    geojson?: any
  ): Promise<WorldPopResponse> {
    try {
      if (!geojson) {
        throw new Error("GeoJSON is required for WorldPop API requests");
      }
  
      const requestUrl = `${WORLDPOP_CONFIG.baseUrl}${WORLDPOP_CONFIG.endpoints.services}/${WORLDPOP_CONFIG.services.stats}`;
      
      // Construct query parameters
      const params = new URLSearchParams({
        dataset: WORLDPOP_CONFIG.datasets.population,
        year: year,
        geojson: JSON.stringify(geojson),
        runasync: 'false' // Try synchronous first
      });
  
      console.log(`🌍 WorldPop API Request URL: ${requestUrl}`);
      
      const response = await fetch(`${requestUrl}?${params}`);
  
      if (!response.ok) {
        throw new Error(`WorldPop API error: ${response.status} ${response.statusText}`);
      }
  
      const data: WorldPopTaskResponse = await response.json();
      
      let finalData = data;
      
      // Handle asynchronous response
      if (data.status === 'created' && data.taskid) {
        console.log(`Task created with ID: ${data.taskid}. Waiting for completion...`);
        finalData = await waitForTaskCompletion(data.taskid);
      }
  
      if (!finalData.data?.total_population) {
        throw new Error("No population data returned from API");
      }
  
      // Calculate geospatial properties
      const bounds = calculateBounds(geojson);
      const centroid = calculateCentroid(geojson);
  
      // Calculate area (rough approximation in km²)
      const area = Math.abs((bounds.east - bounds.west) * (bounds.north - bounds.south)) * 111.32 * 111.32;
      const populationDensity = finalData.data.total_population / area;
  
      return {
        success: true,
        data: {
          population: finalData.data.total_population,
          populationDensity,
          area,
          metadata: {
            country,
            year: parseInt(year),
            resolution,
            source: 'WorldPop Global Project',
            lastUpdated: new Date().toISOString(),
            dataset: WORLDPOP_CONFIG.datasets.population
          },
          geospatial: {
            bounds,
            centroid,
          }
        },
        taskid: finalData.taskid
      };
  
    } catch (error) {
      console.error("Error fetching WorldPop population data:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
  
  /**
   * Get population data with age and gender breakdown
   */
  export async function getWorldPopAgeGenderData(
    country: string,
    year: string,
    resolution: string = "100m",
    format: string = "json",
    geojson?: any
  ): Promise<WorldPopResponse> {
    try {
      if (!geojson) {
        throw new Error("GeoJSON is required for WorldPop API requests");
      }
  
      const requestUrl = `${WORLDPOP_CONFIG.baseUrl}${WORLDPOP_CONFIG.endpoints.services}/${WORLDPOP_CONFIG.services.stats}`;
      
      const params = new URLSearchParams({
        dataset: WORLDPOP_CONFIG.datasets.ageGender,
        year: year,
        geojson: JSON.stringify(geojson),
        runasync: 'false'
      });
  
      const response = await fetch(`${requestUrl}?${params}`);
  
      if (!response.ok) {
        throw new Error(`WorldPop API error: ${response.status} ${response.statusText}`);
      }
  
      const data: WorldPopTaskResponse = await response.json();
      
      let finalData = data;
      
      if (data.status === 'created' && data.taskid) {
        finalData = await waitForTaskCompletion(data.taskid);
      }
  
      if (!finalData.data?.agesexpyramid) {
        throw new Error("No age/gender data returned from API");
      }
  
      // Calculate total population from age pyramid
      const totalPopulation = finalData.data.agesexpyramid.reduce(
        (sum, group) => sum + group.male + group.female, 0
      );
  
      const bounds = calculateBounds(geojson);
      const centroid = calculateCentroid(geojson);
      const area = Math.abs((bounds.east - bounds.west) * (bounds.north - bounds.south)) * 111.32 * 111.32;
  
      return {
        success: true,
        data: {
          population: totalPopulation,
          populationDensity: totalPopulation / area,
          area,
          ageGenderData: finalData.data.agesexpyramid,
          metadata: {
            country,
            year: parseInt(year),
            resolution,
            source: 'WorldPop Global Project',
            lastUpdated: new Date().toISOString(),
            dataset: WORLDPOP_CONFIG.datasets.ageGender
          },
          geospatial: {
            bounds,
            centroid,
          }
        },
        taskid: finalData.taskid
      };
  
    } catch (error) {
      console.error("Error fetching WorldPop age/gender data:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
  
  /**
   * Get population change analysis between two time periods
   */
  export async function getWorldPopPopulationChange(
    country: string,
    year1: string,
    year2: string,
    resolution: string = "100m",
    format: string = "json",
    geojson?: any
  ): Promise<PopulationChangeAnalysis> {
    try {
      // Validate parameters
      if (parseInt(year1) >= parseInt(year2)) {
        throw new Error("Year1 must be less than Year2 for change analysis");
      }
  
      if (parseInt(year1) < 2000 || parseInt(year2) > 2020) {
        throw new Error("WorldPop Global Project data is only available for years 2000-2020");
      }
  
      // Get population data for both periods
      const [period1Response, period2Response] = await Promise.all([
        getWorldPopPopulationData(country, year1, resolution, format, geojson),
        getWorldPopPopulationData(country, year2, resolution, format, geojson)
      ]);
  
      if (!period1Response.success || !period2Response.success) {
        throw new Error(`Failed to fetch data: ${period1Response.error || period2Response.error}`);
      }
  
      const population1 = period1Response.data?.population || 0;
      const population2 = period2Response.data?.population || 0;
  
      // Calculate changes
      const absoluteChange = population2 - population1;
      const percentageChange = population1 > 0 ? ((absoluteChange / population1) * 100) : 0;
      const annualGrowthRate = population1 > 0 ? 
        (Math.pow(population2 / population1, 1 / (parseInt(year2) - parseInt(year1))) - 1) * 100 : 0;
  
      const populationDensity = period2Response.data?.populationDensity || 0;
      const area = period2Response.data?.area || 0;
  
      // Simple urbanization level calculation based on population density
      const urbanizationLevel = populationDensity > 1000 ? 3 : populationDensity > 500 ? 2 : 1;
  
      return {
        country,
        year1: parseInt(year1),
        year2: parseInt(year2),
        period1Population: population1,
        period2Population: population2,
        absoluteChange,
        percentageChange,
        annualGrowthRate,
        urbanizationLevel,
        populationDensity,
        area,
        metadata: {
          source: 'WorldPop Global Project',
          resolution,
          format,
          lastUpdated: new Date().toISOString(),
          analysisType: 'Population Change',
          geojsonProvided: !!geojson,
          dataset: WORLDPOP_CONFIG.datasets.population
        },
        geospatial: period2Response.data?.geospatial || {
          bounds: { north: 0, south: 0, east: 0, west: 0 },
          centroid: { lat: 0, lng: 0 }
        }
      };
    } catch (error) {
      console.error("Error calculating population change:", error);
      throw error;
    }
  }
  
  /**
   * Get available datasets and metadata
   */
  export async function getWorldPopMetadata(): Promise<any> {
    try {
      const url = `${WORLDPOP_CONFIG.baseUrl}${WORLDPOP_CONFIG.endpoints.services}`;
  
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'GeoVision-UrbanAnalysis/1.0',
        },
      });
  
      if (!response.ok) {
        throw new Error(`WorldPop API error: ${response.status} ${response.statusText}`);
      }
  
      return await response.json();
  
    } catch (error) {
      console.error('WorldPop Metadata API Error:', error);
      throw error;
    }
  }
  
  /**
   * Create sample GeoJSON for testing (small area around London)
   */
  export function createSampleGeoJSON(): any {
    return {
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "properties": {},
          "geometry": {
            "type": "Polygon",
            "coordinates": [
              [
                [-0.1,51.5],
                [-0.05,51.5],
                [-0.05,51.55],
                [-0.1,51.55],
                [-0.1,51.5]
              ]
            ]
          }
        }
      ]
    };
  }
  
  /**
   * Example usage function
   */
  export async function exampleUsage() {
    try {
      const sampleGeoJSON = createSampleGeoJSON();
      
      // Get population data
      const populationData = await getWorldPopPopulationData(
        "GBR",
        "2020",
        "100m",
        "json",
        sampleGeoJSON
      );
      
      console.log("Population Data:", populationData);
      
      // Get age/gender data
      const ageGenderData = await getWorldPopAgeGenderData(
        "GBR",
        "2020",
        "100m",
        "json",
        sampleGeoJSON
      );
      
      console.log("Age/Gender Data:", ageGenderData);
      
      // Get population change
      const changeAnalysis = await getWorldPopPopulationChange(
        "GBR",
        "2010",
        "2020",
        "100m",
        "json",
        sampleGeoJSON
      );
      
      console.log("Population Change:", changeAnalysis);
      
    } catch (error) {
      console.error("Example usage failed:", error);
    }
  }