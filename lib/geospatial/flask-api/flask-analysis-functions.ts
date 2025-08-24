"use server";

interface FlaskAPIResponse {
  status: string;
  [key: string]: any;
}

interface FlaskAnalysisResult {
  urlFormat?: string;
  geojson?: any;
  legendConfig?: any;
  mapStats: Record<string, any>;
  extraDescription?: string;
  uhiMetrics?: any;
  insights?: any[];
  summary?: any;
  urban_metrics?: any;
  recommendations?: any;
}

const FLASK_API_BASE_URL = "http://localhost:5000";

/**
 * Helper function to make Flask API requests
 */
async function makeFlaskAPIRequest(
  endpoint: string,
  data: Record<string, any>
): Promise<FlaskAPIResponse> {
  const url = `${FLASK_API_BASE_URL}${endpoint}`;
  
  console.log(`🌐 [Flask API] Making request to: ${url}`);
  console.log(`📤 [Flask API] Request data:`, data);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Flask API request failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log(`📥 [Flask API] Response:`, result);
    
    return result;
  } catch (error) {
    console.error(`❌ [Flask API] Error making request to ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Geocode a city name to coordinates
 */
export async function geocodeCity(cityName: string): Promise<any> {
  return await makeFlaskAPIRequest('/api/geocode', { city: cityName });
}

/**
 * Get OpenStreetMap infrastructure data
 */
export async function getOSMData(lat: number, lon: number, bbox_size: number = 0.05): Promise<any> {
  return await makeFlaskAPIRequest('/api/osm-data', { lat, lon, bbox_size });
}

/**
 * Get satellite data information
 */
export async function getSatelliteData(
  lat: number, 
  lon: number, 
  time_range: string = '2years', 
  cloud_cover: number = 30
): Promise<any> {
  return await makeFlaskAPIRequest('/api/satellite-data', { 
    lat, 
    lon, 
    time_range, 
    cloud_cover 
  });
}

/**
 * Get demographic data for a country
 */
export async function getDemographicData(country_code: string): Promise<any> {
  return await makeFlaskAPIRequest('/api/demographic-data', { country_code });
}

/**
 * Perform comprehensive urban planning analysis
 */
export async function comprehensiveUrbanAnalysis(
  city: string,
  time_range: string = '2years',
  cloud_cover: number = 25,
  bbox_size: number = 0.05
): Promise<FlaskAnalysisResult> {
  try {
    const response = await makeFlaskAPIRequest('/api/analyze', {
      city,
      time_range,
      cloud_cover,
      bbox_size
    });

    if (response.status !== 'success') {
      throw new Error(`Analysis failed: ${response.error || 'Unknown error'}`);
    }

    // Transform Flask API response to match expected format
    const transformedResult: FlaskAnalysisResult = {
      mapStats: {
        // Urban metrics from Flask API
        infrastructure_score: response.urban_metrics?.quality_scores?.infrastructure_score || 0,
        satellite_quality_score: response.urban_metrics?.quality_scores?.satellite_quality_score || 0,
        environmental_score: response.urban_metrics?.quality_scores?.environmental_score || 0,
        overall_score: response.urban_metrics?.quality_scores?.overall_score || 0,
        
        // Infrastructure metrics
        building_density: response.urban_metrics?.infrastructure?.building_density || 0,
        road_network_density: response.urban_metrics?.infrastructure?.road_network_density || 0,
        amenity_accessibility: response.urban_metrics?.infrastructure?.amenity_accessibility || 0,
        
        // Development metrics
        population_density: response.urban_metrics?.development?.population_density || 0,
        urbanization_rate: response.urban_metrics?.development?.urbanization_rate || 0,
        satellite_coverage: response.urban_metrics?.development?.satellite_coverage || 0,
        
        // Environmental metrics
        green_space_ratio: response.urban_metrics?.environment?.green_space_ratio || 0,
        natural_features_count: response.urban_metrics?.environment?.natural_features_count || 0,
        
        // Data source quality indicators
        osm_data_available: response.urban_metrics?.data_availability?.osm_data || false,
        satellite_data_available: response.urban_metrics?.data_availability?.satellite_data || false,
        demographic_data_available: response.urban_metrics?.data_availability?.demographic_data || false,
      },
      
      // Store insights and recommendations for charts
      insights: response.insights || [],
      summary: response.summary || {},
      urban_metrics: response.urban_metrics || {},
      recommendations: response.recommendations || {},
      
      extraDescription: `Comprehensive urban planning analysis for ${city} using multiple data sources including OpenStreetMap, Copernicus Sentinel-2, and World Bank demographic data.`,
      
      // Note: Flask API doesn't provide map visualization URLs like GEE
      // These would need to be generated separately or the Flask API would need to be extended
      urlFormat: undefined,
      geojson: {
        type: "Point",
        coordinates: [response.location?.lon || 0, response.location?.lat || 0]
      },
      legendConfig: {
        labelNames: ["Infrastructure", "Environment", "Development", "Data Quality"],
        palette: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"]
      }
    };

    return transformedResult;
  } catch (error) {
    console.error("❌ [Flask API] Comprehensive analysis failed:", error);
    throw error;
  }
}

/**
 * Enhanced UHI Analysis using Flask API data to complement GEE analysis
 */
export async function enhancedUHIAnalysis(
  city: string,
  geometry: any,
  time_range: string = '2years'
): Promise<FlaskAnalysisResult> {
  try {
    // Get comprehensive data from Flask API
    const flaskData = await comprehensiveUrbanAnalysis(city, time_range);
    
    // Extract center coordinates from geometry for Flask API calls
    const coords = extractCenterCoordinates(geometry);
    
    // Get additional infrastructure and demographic context
    const [osmData, demographicData] = await Promise.all([
      getOSMData(coords.lat, coords.lon),
      getDemographicData(flaskData.urban_metrics?.location?.country_code || 'GB')
    ]);

    // Enhance mapStats with Flask API data
    const enhancedMapStats = {
      ...flaskData.mapStats,
      
      // UHI-specific enhancements from infrastructure data
      built_area_density: osmData.feature_counts?.buildings || 0,
      road_density: osmData.feature_counts?.highways || 0,
      green_infrastructure: osmData.feature_counts?.natural_features || 0,
      
      // Population context for heat vulnerability
      population_density: demographicData.indicators?.population_density?.value || 0,
      urban_population_percent: demographicData.indicators?.urban_population_percent?.value || 0,
      
      // Heat island risk factors
      impervious_surface_ratio: calculateImperviousSurfaceRatio(osmData),
      heat_vulnerability_score: calculateHeatVulnerabilityScore(osmData, demographicData),
    };

    return {
      ...flaskData,
      mapStats: enhancedMapStats,
      extraDescription: `Enhanced Urban Heat Island analysis for ${city} combining satellite thermal data with real-time infrastructure and demographic indicators.`
    };
  } catch (error) {
    console.error("❌ [Flask API] Enhanced UHI analysis failed:", error);
    throw error;
  }
}

/**
 * Enhanced Land Cover Analysis using Flask API data
 */
export async function enhancedLandCoverAnalysis(
  city: string,
  geometry: any,
  time_range: string = '2years'
): Promise<FlaskAnalysisResult> {
  try {
    const flaskData = await comprehensiveUrbanAnalysis(city, time_range);
    const coords = extractCenterCoordinates(geometry);
    
    const osmData = await getOSMData(coords.lat, coords.lon);
    
    // Create land cover categories from OSM data
    const landCoverStats = {
      ...flaskData.mapStats,
      
      // Land use categories from OSM
      residential_area: osmData.landuse_breakdown?.residential || 0,
      commercial_area: osmData.landuse_breakdown?.commercial || 0,
      industrial_area: osmData.landuse_breakdown?.industrial || 0,
      green_space: osmData.landuse_breakdown?.grass || 0,
      retail_area: osmData.landuse_breakdown?.retail || 0,
      
      // Infrastructure density
      total_buildings: osmData.feature_counts?.buildings || 0,
      total_amenities: osmData.feature_counts?.amenities || 0,
      total_shops: osmData.feature_counts?.shops || 0,
      
      // Data quality indicators
      data_completeness: osmData.data_quality?.completeness || 'unknown',
      last_updated: osmData.data_quality?.last_updated || 'unknown',
    };

    return {
      ...flaskData,
      mapStats: landCoverStats,
      legendConfig: {
        labelNames: ["Residential", "Commercial", "Industrial", "Green Space", "Retail", "Other"],
        palette: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD"]
      },
      extraDescription: `Enhanced Land Cover analysis for ${city} using real-time OpenStreetMap data for detailed urban land use classification.`
    };
  } catch (error) {
    console.error("❌ [Flask API] Enhanced Land Cover analysis failed:", error);
    throw error;
  }
}

/**
 * Enhanced Land Change Analysis using Flask API temporal data
 */
export async function enhancedLandChangeAnalysis(
  city: string,
  geometry: any,
  startDate1: string,
  endDate1: string,
  startDate2: string,
  endDate2: string
): Promise<FlaskAnalysisResult> {
  try {
    // For land change analysis, we'll use satellite data availability info
    const coords = extractCenterCoordinates(geometry);
    const [satData1, satData2, osmData, demographicData] = await Promise.all([
      getSatelliteData(coords.lat, coords.lon, '2years'),
      getSatelliteData(coords.lat, coords.lon, '5years'), // Different time range for comparison
      getOSMData(coords.lat, coords.lon),
      getDemographicData('GB') // Default to GB, should be dynamic based on location
    ]);

    const changeAnalysisStats = {
      // Satellite data availability comparison
      period1_images: satData1.total_images || 0,
      period2_images: satData2.total_images || 0,
      
      // Cloud coverage trends
      period1_cloud_cover: satData1.cloud_coverage?.average || 0,
      period2_cloud_cover: satData2.cloud_coverage?.average || 0,
      
      // Development pressure indicators
      population_growth_rate: demographicData.indicators?.population_growth_rate?.value || 0,
      urban_expansion_pressure: calculateUrbanExpansionPressure(demographicData, osmData),
      
      // Infrastructure change indicators
      current_building_density: osmData.feature_counts?.buildings || 0,
      current_road_density: osmData.feature_counts?.highways || 0,
      development_intensity: calculateDevelopmentIntensity(osmData),
      
      // Data quality metrics
      data_temporal_coverage: calculateTemporalCoverage(satData1, satData2),
      analysis_confidence: calculateAnalysisConfidence(satData1, satData2, osmData),
    };

    return {
      mapStats: changeAnalysisStats,
      legendConfig: {
        labelNames: ["No Change", "Urban Expansion", "Infrastructure Growth", "Green Space Loss"],
        palette: ["#90EE90", "#FFD700", "#FF6347", "#8B0000"]
      },
      extraDescription: `Enhanced Land Change analysis for ${city} integrating satellite monitoring capabilities with real-time infrastructure development indicators.`,
      insights: [
        {
          title: "Satellite Monitoring Capability",
          content: `Analysis shows ${satData1.total_images || 0} available images for recent period with ${satData1.cloud_coverage?.average || 0}% average cloud cover.`,
          category: "monitoring",
          priority: "medium"
        },
        {
          title: "Development Pressure Assessment",
          content: `Population growth rate of ${demographicData.indicators?.population_growth_rate?.value || 0}% indicates ${getGrowthPressureLevel(demographicData.indicators?.population_growth_rate?.value || 0)} development pressure.`,
          category: "development",
          priority: "high"
        }
      ]
    };
  } catch (error) {
    console.error("❌ [Flask API] Enhanced Land Change analysis failed:", error);
    throw error;
  }
}

// Helper functions
function extractCenterCoordinates(geometry: any): { lat: number; lon: number } {
  if (!geometry || !geometry.coordinates) {
    throw new Error("Invalid geometry provided");
  }
  
  // Handle different geometry types
  if (geometry.type === "Polygon") {
    const coords = geometry.coordinates[0];
    const centerLat = coords.reduce((sum: number, coord: number[]) => sum + coord[1], 0) / coords.length;
    const centerLon = coords.reduce((sum: number, coord: number[]) => sum + coord[0], 0) / coords.length;
    return { lat: centerLat, lon: centerLon };
  } else if (geometry.type === "Point") {
    return { lat: geometry.coordinates[1], lon: geometry.coordinates[0] };
  }
  
  throw new Error("Unsupported geometry type");
}

function calculateImperviousSurfaceRatio(osmData: any): number {
  const buildings = osmData.feature_counts?.buildings || 0;
  const roads = osmData.feature_counts?.highways || 0;
  const total = osmData.total_features || 1;
  return ((buildings + roads) / total * 100);
}

function calculateHeatVulnerabilityScore(osmData: any, demographicData: any): number {
  const buildingDensity = osmData.feature_counts?.buildings || 0;
  const greenSpace = osmData.feature_counts?.natural_features || 0;
  const populationDensity = demographicData.indicators?.population_density?.value || 0;
  
  // Simple scoring algorithm (can be made more sophisticated)
  const buildingFactor = Math.min(buildingDensity / 100, 1) * 40;
  const greenFactor = Math.max(0, 30 - (greenSpace * 2));
  const populationFactor = Math.min(populationDensity / 500, 1) * 30;
  
  return buildingFactor + greenFactor + populationFactor;
}

function calculateUrbanExpansionPressure(demographicData: any, osmData: any): number {
  const growthRate = demographicData.indicators?.population_growth_rate?.value || 0;
  const urbanPercent = demographicData.indicators?.urban_population_percent?.value || 0;
  const currentDensity = osmData.feature_counts?.buildings || 0;
  
  return (growthRate * 10) + (urbanPercent / 10) + (currentDensity / 50);
}

function calculateDevelopmentIntensity(osmData: any): number {
  const buildings = osmData.feature_counts?.buildings || 0;
  const amenities = osmData.feature_counts?.amenities || 0;
  const shops = osmData.feature_counts?.shops || 0;
  
  return buildings + (amenities * 2) + (shops * 1.5);
}

function calculateTemporalCoverage(satData1: any, satData2: any): string {
  const images1 = satData1.total_images || 0;
  const images2 = satData2.total_images || 0;
  const total = images1 + images2;
  
  if (total > 100) return "excellent";
  if (total > 50) return "good";
  if (total > 20) return "moderate";
  return "limited";
}

function calculateAnalysisConfidence(satData1: any, satData2: any, osmData: any): number {
  const satQuality = ((satData1.total_images || 0) + (satData2.total_images || 0)) / 100;
  const osmQuality = osmData.data_quality?.completeness === "high" ? 1 : 0.5;
  const cloudQuality = 1 - ((satData1.cloud_coverage?.average || 50) / 100);
  
  return Math.min((satQuality + osmQuality + cloudQuality) / 3 * 100, 100);
}

function getGrowthPressureLevel(growthRate: number): string {
  if (growthRate > 2) return "high";
  if (growthRate > 1) return "moderate";
  if (growthRate > 0) return "low";
  return "declining";
}
