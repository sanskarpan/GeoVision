# Urban Planning API Testing Guide

This guide provides comprehensive instructions for testing all urban planning analysis tools.

## Quick Start Testing

### Prerequisites
1. Ensure the development server is running: `npm run dev`
2. Have a valid ROI (Region of Interest) geometry ready
3. Install testing dependencies: `npm install --save-dev jest @types/jest`

### Running Tests

```bash
# Run all urban planning API tests
npm test tests/urban-planning-api.test.ts

# Run specific test suite
npm test -- --testNamePattern="Infrastructure Analysis"

# Run tests with coverage
npm test -- --coverage
```

## Manual Testing Examples

### 1. 🏗️ Infrastructure Analysis

#### Test Flyover Requirements Analysis
```bash
curl -X POST http://localhost:3000/api/urban-planning/request-infrastructure-analysis \
  -H "Content-Type: application/json" \
  -d '{
    "analysisType": "Flyover and Bridge Requirements",
    "infrastructureType": "Roads and Highways",
    "trafficDataYear": "2023",
    "populationDataYear": "2023",
    "selectedRoiGeometry": {
      "type": "Polygon",
      "coordinates": [[
        [-74.0059, 40.7128],
        [-74.0059, 40.7589],
        [-73.9441, 40.7589],
        [-73.9441, 40.7128],
        [-74.0059, 40.7128]
      ]]
    },
    "thresholds": {
      "congestionLevel": 8,
      "populationDensity": 5000,
      "accessibilityRadius": 2
    }
  }'
```

**Expected Response Structure:**
```json
{
  "success": true,
  "analysisType": "Flyover and Bridge Requirements",
  "recommendations": [
    {
      "id": "flyover_001",
      "type": "flyover",
      "location": {"lat": 40.7138, "lng": -74.0050},
      "priority": "high",
      "estimatedCost": "$45-55 million",
      "impact": {
        "congestionReduction": "35-40%",
        "beneficiaryPopulation": 120000
      }
    }
  ],
  "costBenefitAnalysis": {
    "totalInvestment": "$73-90 million",
    "paybackPeriod": "6-7 years"
  }
}
```

#### Test Traffic Congestion Analysis
```bash
curl -X POST http://localhost:3000/api/urban-planning/request-infrastructure-analysis \
  -H "Content-Type: application/json" \
  -d '{
    "analysisType": "Traffic Congestion Hotspots",
    "infrastructureType": "Traffic Management Systems",
    "selectedRoiGeometry": {
      "type": "Polygon",
      "coordinates": [[
        [-74.0059, 40.7128],
        [-74.0059, 40.7589],
        [-73.9441, 40.7589],
        [-73.9441, 40.7128],
        [-74.0059, 40.7128]
      ]]
    }
  }'
```

### 2. 💰 Investment Analysis

#### Test Property Value Trends
```bash
curl -X POST http://localhost:3000/api/urban-planning/request-investment-analysis \
  -H "Content-Type: application/json" \
  -d '{
    "analysisType": "Property Value Trends",
    "investmentCategory": "Residential",
    "timeframe": "Medium-term",
    "budgetRange": "Medium",
    "selectedRoiGeometry": {
      "type": "Polygon",
      "coordinates": [[
        [-74.0059, 40.7128],
        [-74.0059, 40.7589],
        [-73.9441, 40.7589],
        [-73.9441, 40.7128],
        [-74.0059, 40.7128]
      ]]
    },
    "developmentFactors": ["Transport Connectivity", "Population Growth"]
  }'
```

**Expected Response Structure:**
```json
{
  "success": true,
  "analysisType": "Property Value Trends",
  "historicalTrends": [
    {
      "year": 2019,
      "averageValue": 450000,
      "pricePerSqFt": 375,
      "marketVolume": 180
    }
  ],
  "projections": [
    {
      "year": 2025,
      "projectedValue": 520000,
      "confidenceLevel": 0.85,
      "growthRate": "6.2%"
    }
  ],
  "marketIndicators": {
    "averageAppreciation": "6.2% annually",
    "marketHealth": "Strong"
  }
}
```

### 3. 🌊 Flood Risk Analysis

#### Test Flood Risk Mapping
```bash
curl -X POST http://localhost:3000/api/urban-planning/request-flood-risk-analysis \
  -H "Content-Type: application/json" \
  -d '{
    "analysisType": "Flood Risk Mapping",
    "floodType": "Urban Flooding",
    "returnPeriod": "100-year",
    "selectedRoiGeometry": {
      "type": "Polygon",
      "coordinates": [[
        [-74.0059, 40.7128],
        [-74.0059, 40.7589],
        [-73.9441, 40.7589],
        [-73.9441, 40.7128],
        [-74.0059, 40.7128]
      ]]
    },
    "vulnerabilityFactors": ["Population Density", "Critical Infrastructure"]
  }'
```

### 4. 🌳 Green Space Analysis

#### Test Urban Heat Island Mapping
```bash
curl -X POST http://localhost:3000/api/urban-planning/request-green-space-analysis \
  -H "Content-Type: application/json" \
  -d '{
    "analysisType": "Urban Heat Island Mapping",
    "vegetationIndex": "NDVI",
    "seasonalComparison": "Summer vs Winter",
    "selectedRoiGeometry": {
      "type": "Polygon",
      "coordinates": [[
        [-74.0059, 40.7128],
        [-74.0059, 40.7589],
        [-73.9441, 40.7589],
        [-73.9441, 40.7128],
        [-74.0059, 40.7128]
      ]]
    }
  }'
```

### 5. 🚌 Transport Optimization Analysis

#### Test Transit Accessibility
```bash
curl -X POST http://localhost:3000/api/urban-planning/request-transport-optimization-analysis \
  -H "Content-Type: application/json" \
  -d '{
    "analysisType": "Transit Accessibility Analysis",
    "transportModes": ["Bus", "Metro/Subway"],
    "accessibilityThreshold": "800m",
    "serviceFrequency": "Medium Frequency",
    "selectedRoiGeometry": {
      "type": "Polygon",
      "coordinates": [[
        [-74.0059, 40.7128],
        [-74.0059, 40.7589],
        [-73.9441, 40.7589],
        [-73.9441, 40.7128],
        [-74.0059, 40.7128]
      ]]
    }
  }'
```

## Testing with Frontend Integration

### Using the Chat Interface
1. Start the development server: `npm run dev`
2. Navigate to the chat interface
3. Draw or import an ROI on the map
4. Use natural language to request analysis:

**Example Prompts:**
- "Analyze where we need flyovers in this area"
- "Show me investment opportunities for residential properties"
- "Map flood risks for a 100-year storm event"
- "Find heat island hotspots and recommend tree planting locations"
- "Analyze public transport accessibility gaps"

### Expected Chat Integration Flow
1. User draws ROI or imports shapefile
2. User requests analysis via chat
3. System calls appropriate API endpoint
4. Results are displayed on map with detailed report
5. User can ask follow-up questions or request different analyses

## Performance Testing

### Load Testing Example
```bash
# Test with multiple concurrent requests
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/urban-planning/request-infrastructure-analysis \
    -H "Content-Type: application/json" \
    -d @test_payload.json &
done
wait
```

### Response Time Benchmarks
- **Target Response Time**: < 10 seconds per analysis
- **Maximum Response Time**: < 30 seconds
- **Concurrent Users**: Support 5-10 simultaneous analyses

## Error Testing

### Test Invalid Parameters
```bash
# Missing required fields
curl -X POST http://localhost:3000/api/urban-planning/request-infrastructure-analysis \
  -H "Content-Type: application/json" \
  -d '{
    "infrastructureType": "Roads and Highways"
  }'

# Expected: 400 Bad Request with validation errors
```

### Test Invalid Geometry
```bash
# Invalid geometry format
curl -X POST http://localhost:3000/api/urban-planning/request-flood-risk-analysis \
  -H "Content-Type: application/json" \
  -d '{
    "analysisType": "Flood Risk Mapping",
    "selectedRoiGeometry": {
      "type": "InvalidType",
      "coordinates": "invalid"
    }
  }'

# Expected: 400 Bad Request
```

## Data Validation Checklist

### ✅ Required Response Fields
Every successful API response should include:
- `success: true`
- `analysisType: string`
- `timestamp: ISO string`
- `geometry: object`
- Analysis-specific results

### ✅ Geographic Data Validation
- Latitude values: -90 to 90
- Longitude values: -180 to 180
- Coordinates in [lng, lat] format
- Valid GeoJSON geometry types

### ✅ Numeric Data Validation
- Population counts: positive integers
- Cost estimates: positive numbers with currency formatting
- Percentages: 0-100 range
- Coordinates: valid decimal degrees

## Integration Testing Scenarios

### Scenario 1: Complete Urban Planning Workflow
1. **Infrastructure Analysis**: Identify congestion hotspots
2. **Investment Analysis**: Find properties near planned improvements
3. **Flood Risk Analysis**: Ensure developments avoid flood zones
4. **Green Space Analysis**: Plan environmental mitigation
5. **Transport Analysis**: Optimize public transit connections

### Scenario 2: Climate Resilience Planning
1. **Flood Risk Mapping**: Identify vulnerable areas
2. **Heat Island Analysis**: Map temperature hotspots
3. **Green Space Planning**: Design cooling interventions
4. **Emergency Response**: Plan evacuation routes

### Scenario 3: Economic Development Planning
1. **Investment Mapping**: Identify development opportunities
2. **Infrastructure Assessment**: Plan supporting infrastructure
3. **Transport Optimization**: Ensure connectivity
4. **Environmental Impact**: Assess green space requirements

## Troubleshooting Common Issues

### API Not Responding
1. Check server is running: `npm run dev`
2. Verify endpoint URLs match exactly
3. Check Content-Type header is set correctly
4. Validate JSON payload syntax

### Invalid Geometry Errors
1. Ensure coordinates are in [longitude, latitude] order
2. Check polygon is properly closed (first and last points match)
3. Verify coordinate values are within valid ranges
4. Use proper GeoJSON format

### Analysis Taking Too Long
1. Reduce ROI size if too large
2. Check server console for error messages
3. Verify no infinite loops in processing logic
4. Monitor server resource usage

### Inconsistent Results
1. Check timestamp to ensure fresh analysis
2. Verify identical input parameters
3. Look for randomization in mock data
4. Consider time-based variations

## Monitoring and Logging

### Key Metrics to Track
- **Response Times**: Track API call duration
- **Success Rates**: Monitor analysis completion rates
- **Error Patterns**: Log common failure modes
- **Usage Patterns**: Track most popular analysis types

### Debug Logging
Enable detailed logging by setting environment variables:
```bash
export DEBUG=urban-planning:*
export LOG_LEVEL=debug
```

### Performance Monitoring
```javascript
// Example monitoring code
const startTime = Date.now();
const result = await analyzeInfrastructure(payload);
const duration = Date.now() - startTime;
console.log(`Analysis completed in ${duration}ms`);
```

This testing guide ensures comprehensive validation of all urban planning analysis tools, from individual API endpoints to complete workflow integration.
