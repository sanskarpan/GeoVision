/**
 * Utility functions for Flask API integration
 * These are synchronous helper functions that don't require server actions
 */

/**
 * Determine if Flask API should be used based on analysis type and user intent
 */
export function shouldUseFlaskAPI(functionType: string, userQuery?: string): boolean {
  const flaskAnalysisTypes = [
    "Comprehensive Urban Analysis",
    "Infrastructure Analysis", 
    "Demographic Analysis",
    "Real-time Urban Data",
    "Urban Planning Intelligence"
  ];
  
  // Check if it's explicitly a Flask API analysis type
  if (flaskAnalysisTypes.includes(functionType)) {
    return true;
  }
  
  // Check user intent keywords that suggest Flask API usage
  const flaskKeywords = [
    "infrastructure", "demographics", "real-time", "current", "recent",
    "osm", "openstreetmap", "population", "comprehensive", "urban planning",
    "satellite availability", "data sources", "amenities", "buildings",
    "roads", "land use classification"
  ];
  
  if (userQuery) {
    const queryLower = userQuery.toLowerCase();
    return flaskKeywords.some(keyword => queryLower.includes(keyword));
  }
  
  return false;
}

/**
 * Intent recognition for determining analysis type from user query
 */
export function recognizeFlaskAPIIntent(userQuery: string): string | null {
  const query = userQuery.toLowerCase();
  
  // Define intent patterns
  const intentPatterns = {
    "Comprehensive Urban Analysis": [
      "comprehensive analysis", "complete analysis", "full analysis", 
      "urban intelligence", "planning analysis", "analyze everything"
    ],
    "Infrastructure Analysis": [
      "infrastructure", "buildings", "roads", "amenities", "facilities",
      "osm data", "openstreetmap", "built environment"
    ],
    "Demographic Analysis": [
      "demographics", "population", "people", "residents", "inhabitants",
      "population density", "urban population", "growth rate"
    ],
    "Real-time Urban Data": [
      "real-time", "current", "recent", "latest", "up-to-date",
      "live data", "current status"
    ],
    "Urban Heat Island (UHI) Analysis": [
      "heat island", "uhi", "temperature", "thermal", "heat",
      "urban heat", "surface temperature"
    ],
    "Land Use/Land Cover Maps": [
      "land cover", "land use", "landcover", "landuse", "classification",
      "mapping", "cover types"
    ],
    "Land Use/Land Cover Change Maps": [
      "land change", "change detection", "temporal analysis", "before after",
      "land cover change", "land use change", "urban growth"
    ]
  };
  
  // Find matching intent
  for (const [intent, patterns] of Object.entries(intentPatterns)) {
    if (patterns.some(pattern => query.includes(pattern))) {
      return intent;
    }
  }
  
  return null;
}

/**
 * Extract city name from user query or geometry
 */
export function extractCityFromQuery(userQuery: string): string | null {
  // Simple city name extraction - can be enhanced with NLP
  const cityPatterns = [
    /(?:in|for|of|at)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g,
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:city|area|region)/gi
  ];
  
  for (const pattern of cityPatterns) {
    const matches = userQuery.match(pattern);
    if (matches && matches[0]) {
      // Extract city name and clean it
      return matches[0].replace(/^(?:in|for|of|at)\s+/i, '')
                       .replace(/\s+(?:city|area|region)$/gi, '')
                       .trim();
    }
  }
  
  return null;
}

/**
 * Create UHI metrics compatible with existing system
 */
export function createUHIMetricsFromFlaskData(flaskData: any): any[] {
  if (!flaskData.urban_metrics) return [];
  
  return [
    {
      Metric: "Infrastructure Score",
      Value: flaskData.urban_metrics.quality_scores?.infrastructure_score?.toFixed(1) || "N/A",
      Unit: "score",
      Description: "Overall infrastructure density and accessibility score based on real-time OSM data."
    },
    {
      Metric: "Environmental Score", 
      Value: flaskData.urban_metrics.quality_scores?.environmental_score?.toFixed(1) || "N/A",
      Unit: "score",
      Description: "Environmental quality score including green space ratio and natural features."
    },
    {
      Metric: "Development Pressure",
      Value: (flaskData.urban_metrics.development?.population_growth || 0).toFixed(2),
      Unit: "%/year",
      Description: "Annual population growth rate indicating urban development pressure."
    },
    {
      Metric: "Data Quality Score",
      Value: flaskData.summary?.overall_score?.toFixed(1) || "N/A",
      Unit: "score",
      Description: "Overall data availability and quality assessment for analysis confidence."
    }
  ];
}

// Helper functions for calculations
export function extractCenterCoordinates(geometry: any): { lat: number; lon: number } {
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

export function calculateImperviousSurfaceRatio(osmData: any): number {
  const buildings = osmData.feature_counts?.buildings || 0;
  const roads = osmData.feature_counts?.highways || 0;
  const total = osmData.total_features || 1;
  return ((buildings + roads) / total * 100);
}

export function calculateHeatVulnerabilityScore(osmData: any, demographicData: any): number {
  const buildingDensity = osmData.feature_counts?.buildings || 0;
  const greenSpace = osmData.feature_counts?.natural_features || 0;
  const populationDensity = demographicData.indicators?.population_density?.value || 0;
  
  // Simple scoring algorithm (can be made more sophisticated)
  const buildingFactor = Math.min(buildingDensity / 100, 1) * 40;
  const greenFactor = Math.max(0, 30 - (greenSpace * 2));
  const populationFactor = Math.min(populationDensity / 500, 1) * 30;
  
  return buildingFactor + greenFactor + populationFactor;
}

export function calculateUrbanExpansionPressure(demographicData: any, osmData: any): number {
  const growthRate = demographicData.indicators?.population_growth_rate?.value || 0;
  const urbanPercent = demographicData.indicators?.urban_population_percent?.value || 0;
  const currentDensity = osmData.feature_counts?.buildings || 0;
  
  return (growthRate * 10) + (urbanPercent / 10) + (currentDensity / 50);
}

export function calculateDevelopmentIntensity(osmData: any): number {
  const buildings = osmData.feature_counts?.buildings || 0;
  const amenities = osmData.feature_counts?.amenities || 0;
  const shops = osmData.feature_counts?.shops || 0;
  
  return buildings + (amenities * 2) + (shops * 1.5);
}

export function calculateTemporalCoverage(satData1: any, satData2: any): string {
  const images1 = satData1.total_images || 0;
  const images2 = satData2.total_images || 0;
  const total = images1 + images2;
  
  if (total > 100) return "excellent";
  if (total > 50) return "good";
  if (total > 20) return "moderate";
  return "limited";
}

export function calculateAnalysisConfidence(satData1: any, satData2: any, osmData: any): number {
  const satQuality = ((satData1.total_images || 0) + (satData2.total_images || 0)) / 100;
  const osmQuality = osmData.data_quality?.completeness === "high" ? 1 : 0.5;
  const cloudQuality = 1 - ((satData1.cloud_coverage?.average || 50) / 100);
  
  return Math.min((satQuality + osmQuality + cloudQuality) / 3 * 100, 100);
}

export function getGrowthPressureLevel(growthRate: number): string {
  if (growthRate > 2) return "high";
  if (growthRate > 1) return "moderate";
  if (growthRate > 0) return "low";
  return "declining";
}
