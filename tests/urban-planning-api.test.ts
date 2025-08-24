/**
 * Comprehensive test suite for Urban Planning API endpoints
 * 
 * This test suite covers all 5 urban planning analysis APIs:
 * 1. Infrastructure Analysis
 * 2. Investment Analysis
 * 3. Flood Risk Analysis
 * 4. Green Space Analysis
 * 5. Transport Optimization Analysis
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/test';

// Test configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const TEST_TIMEOUT = 30000; // 30 seconds for API calls

// Sample ROI geometry for testing (Manhattan area)
const SAMPLE_ROI_GEOMETRY = {
  type: "Polygon",
  coordinates: [[
    [-74.0059, 40.7128],  // New York City area
    [-74.0059, 40.7589],
    [-73.9441, 40.7589],
    [-73.9441, 40.7128],
    [-74.0059, 40.7128]
  ]]
};

// Helper function to make API requests
async function makeAPIRequest(endpoint: string, payload: any) {
  const response = await fetch(`${API_BASE_URL}/api/urban-planning/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  return { response, data };
}

describe('Urban Planning API Test Suite', () => {
  
  describe('🏗️ Infrastructure Analysis API', () => {
    const endpoint = 'request-infrastructure-analysis';

    it('should analyze flyover and bridge requirements', async () => {
      const payload = {
        analysisType: "Flyover and Bridge Requirements",
        infrastructureType: "Roads and Highways",
        trafficDataYear: "2023",
        populationDataYear: "2023",
        selectedRoiGeometry: SAMPLE_ROI_GEOMETRY,
        thresholds: {
          congestionLevel: 8,
          populationDensity: 5000,
          accessibilityRadius: 2
        }
      };

      const { response, data } = await makeAPIRequest(endpoint, payload);

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.analysisType).toBe("Flyover and Bridge Requirements");
      expect(data).toHaveProperty('recommendations');
      expect(data).toHaveProperty('congestionAnalysis');
      expect(data).toHaveProperty('costBenefitAnalysis');
      
      // Check recommendations structure
      expect(Array.isArray(data.recommendations)).toBe(true);
      if (data.recommendations.length > 0) {
        const recommendation = data.recommendations[0];
        expect(recommendation).toHaveProperty('type');
        expect(recommendation).toHaveProperty('location');
        expect(recommendation).toHaveProperty('priority');
        expect(recommendation).toHaveProperty('estimatedCost');
      }
    }, TEST_TIMEOUT);

    it('should analyze traffic congestion hotspots', async () => {
      const payload = {
        analysisType: "Traffic Congestion Hotspots",
        infrastructureType: "Traffic Management Systems",
        selectedRoiGeometry: SAMPLE_ROI_GEOMETRY
      };

      const { response, data } = await makeAPIRequest(endpoint, payload);

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data).toHaveProperty('congestionHotspots');
      expect(data).toHaveProperty('overallCongestionScore');
      expect(Array.isArray(data.congestionHotspots)).toBe(true);
    }, TEST_TIMEOUT);

    it('should handle invalid analysis type', async () => {
      const payload = {
        analysisType: "Invalid Analysis Type",
        infrastructureType: "Roads and Highways",
        selectedRoiGeometry: SAMPLE_ROI_GEOMETRY
      };

      const { response, data } = await makeAPIRequest(endpoint, payload);

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Invalid input parameters");
    }, TEST_TIMEOUT);
  });

  describe('💰 Investment Analysis API', () => {
    const endpoint = 'request-investment-analysis';

    it('should analyze property value trends', async () => {
      const payload = {
        analysisType: "Property Value Trends",
        investmentCategory: "Residential",
        timeframe: "Medium-term",
        budgetRange: "Medium",
        selectedRoiGeometry: SAMPLE_ROI_GEOMETRY,
        developmentFactors: ["Transport Connectivity", "Population Growth"]
      };

      const { response, data } = await makeAPIRequest(endpoint, payload);

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.analysisType).toBe("Property Value Trends");
      expect(data).toHaveProperty('historicalTrends');
      expect(data).toHaveProperty('projections');
      expect(data).toHaveProperty('marketIndicators');
      
      // Validate historical trends structure
      expect(Array.isArray(data.historicalTrends)).toBe(true);
      if (data.historicalTrends.length > 0) {
        const trend = data.historicalTrends[0];
        expect(trend).toHaveProperty('year');
        expect(trend).toHaveProperty('averageValue');
        expect(trend).toHaveProperty('pricePerSqFt');
      }
    }, TEST_TIMEOUT);

    it('should identify investment opportunities', async () => {
      const payload = {
        analysisType: "Investment Potential Mapping",
        investmentCategory: "Commercial",
        budgetRange: "High",
        selectedRoiGeometry: SAMPLE_ROI_GEOMETRY
      };

      const { response, data } = await makeAPIRequest(endpoint, payload);

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data).toHaveProperty('opportunities');
      expect(data).toHaveProperty('marketOverview');
      expect(Array.isArray(data.opportunities)).toBe(true);
      
      if (data.opportunities.length > 0) {
        const opportunity = data.opportunities[0];
        expect(opportunity).toHaveProperty('investmentScore');
        expect(opportunity).toHaveProperty('financials');
        expect(opportunity).toHaveProperty('location');
      }
    }, TEST_TIMEOUT);

    it('should assess gentrification risk', async () => {
      const payload = {
        analysisType: "Gentrification Risk Assessment",
        selectedRoiGeometry: SAMPLE_ROI_GEOMETRY
      };

      const { response, data } = await makeAPIRequest(endpoint, payload);

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data).toHaveProperty('riskLevel');
      expect(data).toHaveProperty('riskScore');
      expect(data).toHaveProperty('vulnerablePopulations');
      expect(data).toHaveProperty('mitigationStrategies');
    }, TEST_TIMEOUT);
  });

  describe('🌊 Flood Risk Analysis API', () => {
    const endpoint = 'request-flood-risk-analysis';

    it('should map flood risk areas', async () => {
      const payload = {
        analysisType: "Flood Risk Mapping",
        floodType: "Urban Flooding",
        returnPeriod: "100-year",
        selectedRoiGeometry: SAMPLE_ROI_GEOMETRY,
        vulnerabilityFactors: ["Population Density", "Critical Infrastructure"]
      };

      const { response, data } = await makeAPIRequest(endpoint, payload);

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.analysisType).toBe("Flood Risk Mapping");
      expect(data).toHaveProperty('floodZones');
      expect(data).toHaveProperty('overallRisk');
      expect(data).toHaveProperty('elevationProfile');
      
      // Validate flood zones structure
      expect(Array.isArray(data.floodZones)).toBe(true);
      if (data.floodZones.length > 0) {
        const zone = data.floodZones[0];
        expect(zone).toHaveProperty('riskLevel');
        expect(zone).toHaveProperty('floodDepth');
        expect(zone).toHaveProperty('affectedArea');
        expect(zone).toHaveProperty('population');
      }
    }, TEST_TIMEOUT);

    it('should assess drainage system', async () => {
      const payload = {
        analysisType: "Drainage System Assessment",
        selectedRoiGeometry: SAMPLE_ROI_GEOMETRY
      };

      const { response, data } = await makeAPIRequest(endpoint, payload);

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data).toHaveProperty('systemOverview');
      expect(data).toHaveProperty('capacityAnalysis');
      expect(data).toHaveProperty('improvementRecommendations');
      
      // Check capacity analysis
      expect(data.capacityAnalysis).toHaveProperty('adequateCapacity');
      expect(data.capacityAnalysis).toHaveProperty('bottleneckLocations');
      expect(Array.isArray(data.capacityAnalysis.bottleneckLocations)).toBe(true);
    }, TEST_TIMEOUT);

    it('should plan emergency response', async () => {
      const payload = {
        analysisType: "Emergency Response Planning",
        floodType: "Flash Flooding",
        selectedRoiGeometry: SAMPLE_ROI_GEOMETRY
      };

      const { response, data } = await makeAPIRequest(endpoint, payload);

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data).toHaveProperty('evacuationPlan');
      expect(data).toHaveProperty('earlyWarning');
      expect(data).toHaveProperty('responseResources');
      
      // Check evacuation plan structure
      expect(data.evacuationPlan).toHaveProperty('evacuationZones');
      expect(data.evacuationPlan).toHaveProperty('shelterLocations');
      expect(Array.isArray(data.evacuationPlan.evacuationZones)).toBe(true);
    }, TEST_TIMEOUT);
  });

  describe('🌳 Green Space Analysis API', () => {
    const endpoint = 'request-green-space-analysis';

    it('should assess green space coverage', async () => {
      const payload = {
        analysisType: "Green Space Coverage Assessment",
        vegetationIndex: "NDVI",
        selectedRoiGeometry: SAMPLE_ROI_GEOMETRY
      };

      const { response, data } = await makeAPIRequest(endpoint, payload);

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.analysisType).toBe("Green Space Coverage Assessment");
      expect(data).toHaveProperty('overallMetrics');
      expect(data).toHaveProperty('greenSpaceDistribution');
      expect(data).toHaveProperty('gapsAndOpportunities');
      
      // Validate overall metrics
      expect(data.overallMetrics).toHaveProperty('totalGreenSpace');
      expect(data.overallMetrics).toHaveProperty('treeCanopyCover');
      expect(data.overallMetrics).toHaveProperty('vegetationHealth');
    }, TEST_TIMEOUT);

    it('should map urban heat islands', async () => {
      const payload = {
        analysisType: "Urban Heat Island Mapping",
        vegetationIndex: "NDVI",
        seasonalComparison: "Summer vs Winter",
        selectedRoiGeometry: SAMPLE_ROI_GEOMETRY
      };

      const { response, data } = await makeAPIRequest(endpoint, payload);

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data).toHaveProperty('temperatureProfile');
      expect(data).toHaveProperty('heatZones');
      expect(data).toHaveProperty('healthImpacts');
      
      // Check heat zones structure
      expect(Array.isArray(data.heatZones)).toBe(true);
      if (data.heatZones.length > 0) {
        const zone = data.heatZones[0];
        expect(zone).toHaveProperty('severity');
        expect(zone).toHaveProperty('temperature');
        expect(zone).toHaveProperty('affectedPopulation');
      }
    }, TEST_TIMEOUT);

    it('should analyze tree canopy', async () => {
      const payload = {
        analysisType: "Tree Canopy Analysis",
        selectedRoiGeometry: SAMPLE_ROI_GEOMETRY
      };

      const { response, data } = await makeAPIRequest(endpoint, payload);

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data).toHaveProperty('canopyMetrics');
      expect(data).toHaveProperty('canopyDistribution');
      expect(data).toHaveProperty('ecosystemServices');
      expect(data).toHaveProperty('plantingOpportunities');
    }, TEST_TIMEOUT);

    it('should develop heat mitigation plan', async () => {
      const payload = {
        analysisType: "Heat Mitigation Planning",
        heatMitigationStrategy: "Tree Planting",
        selectedRoiGeometry: SAMPLE_ROI_GEOMETRY
      };

      const { response, data } = await makeAPIRequest(endpoint, payload);

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data).toHaveProperty('strategy');
      expect(data).toHaveProperty('implementation');
      expect(data).toHaveProperty('priorityAreas');
      expect(data).toHaveProperty('expectedOutcomes');
    }, TEST_TIMEOUT);

    it('should monitor vegetation health', async () => {
      const payload = {
        analysisType: "Vegetation Health Monitoring",
        vegetationIndex: "EVI",
        seasonalComparison: "Annual Trend",
        selectedRoiGeometry: SAMPLE_ROI_GEOMETRY
      };

      const { response, data } = await makeAPIRequest(endpoint, payload);

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data).toHaveProperty('timeSeriesAnalysis');
      expect(data).toHaveProperty('currentStatus');
      expect(data).toHaveProperty('changeDetection');
      expect(Array.isArray(data.timeSeriesAnalysis)).toBe(true);
    }, TEST_TIMEOUT);
  });

  describe('🚌 Transport Optimization Analysis API', () => {
    const endpoint = 'request-transport-optimization-analysis';

    it('should analyze transit accessibility', async () => {
      const payload = {
        analysisType: "Transit Accessibility Analysis",
        transportModes: ["Bus", "Metro/Subway"],
        accessibilityThreshold: "800m",
        serviceFrequency: "Medium Frequency",
        selectedRoiGeometry: SAMPLE_ROI_GEOMETRY
      };

      const { response, data } = await makeAPIRequest(endpoint, payload);

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.analysisType).toBe("Transit Accessibility Analysis");
      expect(data).toHaveProperty('accessibilityMetrics');
      expect(data).toHaveProperty('accessibilityZones');
      expect(data).toHaveProperty('transitStops');
      
      // Validate accessibility zones
      expect(Array.isArray(data.accessibilityZones)).toBe(true);
      if (data.accessibilityZones.length > 0) {
        const zone = data.accessibilityZones[0];
        expect(zone).toHaveProperty('accessibilityLevel');
        expect(zone).toHaveProperty('characteristics');
        expect(zone).toHaveProperty('population');
      }
    }, TEST_TIMEOUT);

    it('should identify service gaps', async () => {
      const payload = {
        analysisType: "Service Gap Identification",
        transportModes: ["Bus", "Light Rail"],
        selectedRoiGeometry: SAMPLE_ROI_GEOMETRY
      };

      const { response, data } = await makeAPIRequest(endpoint, payload);

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data).toHaveProperty('majorGaps');
      expect(data).toHaveProperty('underservedPopulations');
      expect(data).toHaveProperty('investmentPriorities');
      
      // Check major gaps structure
      expect(Array.isArray(data.majorGaps)).toBe(true);
      if (data.majorGaps.length > 0) {
        const gap = data.majorGaps[0];
        expect(gap).toHaveProperty('gapType');
        expect(gap).toHaveProperty('severity');
        expect(gap).toHaveProperty('recommendedSolution');
      }
    }, TEST_TIMEOUT);

    it('should optimize routes', async () => {
      const payload = {
        analysisType: "Route Optimization",
        selectedRoiGeometry: SAMPLE_ROI_GEOMETRY
      };

      const { response, data } = await makeAPIRequest(endpoint, payload);

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data).toHaveProperty('currentNetwork');
      expect(data).toHaveProperty('optimizationOpportunities');
      expect(data).toHaveProperty('networkRedesign');
      
      // Check optimization opportunities
      expect(Array.isArray(data.optimizationOpportunities)).toBe(true);
    }, TEST_TIMEOUT);

    it('should assess modal connectivity', async () => {
      const payload = {
        analysisType: "Modal Connectivity Assessment",
        transportModes: ["Bus", "Metro/Subway", "Light Rail"],
        selectedRoiGeometry: SAMPLE_ROI_GEOMETRY
      };

      const { response, data } = await makeAPIRequest(endpoint, payload);

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data).toHaveProperty('intermodalHubs');
      expect(data).toHaveProperty('transferPatterns');
      expect(data).toHaveProperty('connectivityGaps');
      
      // Validate intermodal hubs
      expect(Array.isArray(data.intermodalHubs)).toBe(true);
      if (data.intermodalHubs.length > 0) {
        const hub = data.intermodalHubs[0];
        expect(hub).toHaveProperty('modes');
        expect(hub).toHaveProperty('dailyTransfers');
        expect(hub).toHaveProperty('efficiency');
      }
    }, TEST_TIMEOUT);

    it('should model transport demand', async () => {
      const payload = {
        analysisType: "Public Transport Demand Modeling",
        selectedRoiGeometry: SAMPLE_ROI_GEOMETRY
      };

      const { response, data } = await makeAPIRequest(endpoint, payload);

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data).toHaveProperty('currentDemand');
      expect(data).toHaveProperty('demandHotspots');
      expect(data).toHaveProperty('projectedGrowth');
      expect(data).toHaveProperty('capacityAnalysis');
      
      // Check demand profile
      expect(data.currentDemand).toHaveProperty('totalDailyTrips');
      expect(data.currentDemand).toHaveProperty('modeSplit');
      expect(Array.isArray(data.demandHotspots)).toBe(true);
    }, TEST_TIMEOUT);
  });

  describe('⚡ Performance and Error Handling Tests', () => {
    
    it('should handle missing required parameters', async () => {
      const payload = {
        // Missing analysisType and selectedRoiGeometry
        infrastructureType: "Roads and Highways"
      };

      const { response, data } = await makeAPIRequest('request-infrastructure-analysis', payload);

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Invalid input parameters");
      expect(data).toHaveProperty('details');
    }, TEST_TIMEOUT);

    it('should handle invalid geometry format', async () => {
      const payload = {
        analysisType: "Flood Risk Mapping",
        selectedRoiGeometry: {
          type: "InvalidType",
          coordinates: "invalid coordinates"
        }
      };

      const { response, data } = await makeAPIRequest('request-flood-risk-analysis', payload);

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    }, TEST_TIMEOUT);

    it('should return results within acceptable timeframe', async () => {
      const startTime = Date.now();
      
      const payload = {
        analysisType: "Green Space Coverage Assessment",
        vegetationIndex: "NDVI",
        selectedRoiGeometry: SAMPLE_ROI_GEOMETRY
      };

      const { response, data } = await makeAPIRequest('request-green-space-analysis', payload);
      
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(duration).toBeLessThan(15000); // Should complete within 15 seconds
    }, TEST_TIMEOUT);

    it('should include timestamp in all successful responses', async () => {
      const payload = {
        analysisType: "Property Value Trends",
        selectedRoiGeometry: SAMPLE_ROI_GEOMETRY
      };

      const { response, data } = await makeAPIRequest('request-investment-analysis', payload);

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data).toHaveProperty('timestamp');
      expect(new Date(data.timestamp)).toBeInstanceOf(Date);
    }, TEST_TIMEOUT);
  });

  describe('📊 Data Validation Tests', () => {
    
    it('should return consistent data structures across similar analyses', async () => {
      const payload1 = {
        analysisType: "Flyover and Bridge Requirements",
        infrastructureType: "Roads and Highways",
        selectedRoiGeometry: SAMPLE_ROI_GEOMETRY
      };

      const payload2 = {
        analysisType: "Traffic Congestion Hotspots",
        infrastructureType: "Traffic Management Systems",
        selectedRoiGeometry: SAMPLE_ROI_GEOMETRY
      };

      const [result1, result2] = await Promise.all([
        makeAPIRequest('request-infrastructure-analysis', payload1),
        makeAPIRequest('request-infrastructure-analysis', payload2)
      ]);

      // Both should have consistent base structure
      expect(result1.data).toHaveProperty('success');
      expect(result1.data).toHaveProperty('analysisType');
      expect(result1.data).toHaveProperty('timestamp');
      expect(result1.data).toHaveProperty('geometry');

      expect(result2.data).toHaveProperty('success');
      expect(result2.data).toHaveProperty('analysisType');
      expect(result2.data).toHaveProperty('timestamp');
      expect(result2.data).toHaveProperty('geometry');
    }, TEST_TIMEOUT);

    it('should validate location coordinates are within reasonable bounds', async () => {
      const payload = {
        analysisType: "Urban Heat Island Mapping",
        selectedRoiGeometry: SAMPLE_ROI_GEOMETRY
      };

      const { response, data } = await makeAPIRequest('request-green-space-analysis', payload);

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      // Check that heat zones have valid coordinates
      if (data.heatZones && Array.isArray(data.heatZones)) {
        data.heatZones.forEach((zone: any) => {
          if (zone.location && zone.location.center) {
            expect(zone.location.center.lat).toBeGreaterThan(-90);
            expect(zone.location.center.lat).toBeLessThan(90);
            expect(zone.location.center.lng).toBeGreaterThan(-180);
            expect(zone.location.center.lng).toBeLessThan(180);
          }
        });
      }
    }, TEST_TIMEOUT);
  });
});

// Test utility functions
export function generateTestROI(centerLat: number, centerLng: number, sizeKm: number = 1) {
  const offset = sizeKm / 111; // Rough conversion to degrees
  return {
    type: "Polygon",
    coordinates: [[
      [centerLng - offset, centerLat - offset],
      [centerLng + offset, centerLat - offset], 
      [centerLng + offset, centerLat + offset],
      [centerLng - offset, centerLat + offset],
      [centerLng - offset, centerLat - offset]
    ]]
  };
}

export function validateAPIResponse(data: any, requiredFields: string[]) {
  expect(data).toHaveProperty('success');
  expect(data.success).toBe(true);
  
  requiredFields.forEach(field => {
    expect(data).toHaveProperty(field);
  });
  
  expect(data).toHaveProperty('timestamp');
  expect(new Date(data.timestamp)).toBeInstanceOf(Date);
}

export function validateGeographicBounds(coordinates: any) {
  if (Array.isArray(coordinates)) {
    coordinates.forEach(coord => {
      if (Array.isArray(coord) && coord.length >= 2) {
        expect(coord[1]).toBeGreaterThan(-90);  // Latitude
        expect(coord[1]).toBeLessThan(90);
        expect(coord[0]).toBeGreaterThan(-180); // Longitude
        expect(coord[0]).toBeLessThan(180);
      }
    });
  }
}
