"use server";

import { 
  comprehensiveUrbanAnalysis,
  enhancedUHIAnalysis,
  enhancedLandCoverAnalysis,
  enhancedLandChangeAnalysis,
  geocodeCity 
} from "./flask-analysis-functions";
import {
  shouldUseFlaskAPI,
  recognizeFlaskAPIIntent,
  extractCityFromQuery,
  createUHIMetricsFromFlaskData,
  extractCenterCoordinates,
  calculateImperviousSurfaceRatio,
  calculateHeatVulnerabilityScore,
  calculateUrbanExpansionPressure,
  calculateDevelopmentIntensity,
  calculateTemporalCoverage,
  calculateAnalysisConfidence,
  getGrowthPressureLevel
} from "./flask-utils";

interface FlaskIntegrationResult {
  urlFormat?: string;
  geojson?: any;
  legendConfig?: any;
  mapStats: Record<string, any>;
  extraDescription?: string;
  uhiMetrics?: any;
  insights?: any[];
  summary?: any;
  functionType: string;
  dataSource: "flask-api" | "gee" | "hybrid";
}



/**
 * Enhanced analysis that combines Flask API with existing GEE capabilities
 */
export async function integratedAnalysis(
  functionType: string,
  geometry: any,
  startDate1: string,
  endDate1: string,
  startDate2?: string,
  endDate2?: string,
  cityName?: string,
  aggregationMethod?: string
): Promise<FlaskIntegrationResult> {
  
  console.log(`🔄 [Flask Integration] Starting integrated analysis:`, {
    functionType,
    hasGeometry: !!geometry,
    cityName,
    dateRange: `${startDate1} to ${endDate1}`
  });

  try {
    let result: FlaskIntegrationResult;
    
    // If no city name provided, try to reverse geocode or use a default
    if (!cityName) {
      cityName = "London"; // Default for testing, should be improved with reverse geocoding
    }

    let baseResult;
    
    switch (functionType) {
      case "Urban Heat Island (UHI) Analysis":
        baseResult = await enhancedUHIAnalysis(cityName, geometry);
        result = {
          ...baseResult,
          functionType,
          dataSource: "hybrid" as const
        };
        break;
        
      case "Land Use/Land Cover Maps":
        baseResult = await enhancedLandCoverAnalysis(cityName, geometry);
        result = {
          ...baseResult,
          functionType,
          dataSource: "hybrid" as const
        };
        break;
        
      case "Land Use/Land Cover Change Maps":
        baseResult = await enhancedLandChangeAnalysis(
          cityName, 
          geometry, 
          startDate1, 
          endDate1, 
          startDate2 || startDate1, 
          endDate2 || endDate1
        );
        result = {
          ...baseResult,
          functionType,
          dataSource: "hybrid" as const
        };
        break;
        
      case "Comprehensive Urban Analysis":
      case "Infrastructure Analysis":
      case "Demographic Analysis":
      case "Real-time Urban Data":
      case "Urban Planning Intelligence":
        baseResult = await comprehensiveUrbanAnalysis(cityName);
        result = {
          ...baseResult,
          functionType,
          dataSource: "flask-api" as const
        };
        break;
        
      default:
        throw new Error(`Unsupported Flask API analysis type: ${functionType}`);
    }

    // Add integration metadata
    result.extraDescription = `${result.extraDescription || ''}\n\nData Integration: This analysis combines multiple data sources including ${result.dataSource === 'flask-api' ? 'Flask API services' : 'Google Earth Engine and Flask API services'} for comprehensive urban intelligence.`;

    console.log(`✅ [Flask Integration] Analysis completed successfully:`, {
      functionType: result.functionType,
      dataSource: result.dataSource,
      hasMapStats: !!result.mapStats,
      statsCount: Object.keys(result.mapStats || {}).length
    });

    return result;
    
  } catch (error) {
    console.error(`❌ [Flask Integration] Analysis failed:`, error);
    throw new Error(`Flask API integration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validate Flask API availability
 */
export async function validateFlaskAPIAvailability(): Promise<boolean> {
  try {
    const response = await fetch("http://localhost:5000/", {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.status === "healthy";
    }
    
    return false;
  } catch (error) {
    console.warn("⚠️ [Flask Integration] Flask API not available:", error);
    return false;
  }
}
