# Flask API Integration Documentation

## Overview

This document describes the integration of the Flask API (http://localhost:5000) with GeoVision's urban planning tools. The integration enhances the existing GEE-based analysis with real-time data from OpenStreetMap, Copernicus Sentinel satellite imagery, and World Bank demographic data.

## Integration Architecture

### 1. Data Flow

```
User Query → Intent Recognition → Flask API Check → Analysis Execution → Chart Visualization
     ↓              ↓                    ↓               ↓                    ↓
Chat Interface → Function Type → API Availability → Data Processing → Custom Charts
```

### 2. Core Components

#### Flask API Analysis Functions (`lib/geospatial/flask-api/flask-analysis-functions.ts`)
- `comprehensiveUrbanAnalysis()` - Complete urban intelligence analysis
- `enhancedUHIAnalysis()` - UHI analysis with infrastructure context
- `enhancedLandCoverAnalysis()` - Land cover with real-time OSM data
- `enhancedLandChangeAnalysis()` - Change analysis with satellite data availability

#### Integration Layer (`lib/geospatial/flask-api/flask-integration.ts`)
- `shouldUseFlaskAPI()` - Intent recognition for Flask API usage
- `integratedAnalysis()` - Main analysis coordination function
- `recognizeFlaskAPIIntent()` - Pattern matching for user queries
- `validateFlaskAPIAvailability()` - Health check functionality

#### Chart Components (`features/charts/components/flask-api-charts.tsx`)
- `FlaskInsightsChart` - Pie charts for insights by priority/category
- `UrbanMetricsRadarChart` - Radar chart for urban metrics
- `DataSourceQualityChart` - Bar chart for data source availability
- `FlaskAPICharts` - Main container component

## Supported Analysis Types

### 1. Traditional GEE Analysis (Enhanced with Flask API)
- **Urban Heat Island (UHI) Analysis** - Enhanced with infrastructure density and demographic context
- **Land Use/Land Cover Maps** - Enhanced with real-time OSM land use data
- **Land Use/Land Cover Change Maps** - Enhanced with satellite data availability metrics

### 2. New Flask API Analysis Types
- **Comprehensive Urban Analysis** - Complete urban intelligence using all data sources
- **Infrastructure Analysis** - Buildings, roads, and amenities analysis from OSM
- **Demographic Analysis** - Population and economic indicators from World Bank
- **Real-time Urban Data** - Current data from multiple sources
- **Urban Planning Intelligence** - Integrated insights for planning decisions

## Intent Recognition

The system recognizes Flask API intents based on keywords in user queries:

### Keywords for Flask API Usage
- `infrastructure`, `buildings`, `roads`, `amenities`
- `demographics`, `population`, `residents`
- `real-time`, `current`, `recent`, `latest`
- `comprehensive`, `complete`, `full analysis`
- `osm`, `openstreetmap`
- `urban planning`, `planning intelligence`

### Example Queries
```
✅ "Show me comprehensive urban analysis for London"
   → Comprehensive Urban Analysis

✅ "I need infrastructure data for buildings and roads"
   → Infrastructure Analysis

✅ "What's the current population density?"
   → Demographic Analysis

✅ "Get real-time data from OpenStreetMap"
   → Real-time Urban Data
```

## Data Structure

### Flask API Response Format
```typescript
interface FlaskAnalysisResult {
  urlFormat?: string;           // Map visualization URL (optional)
  geojson?: any;               // Geometry data
  legendConfig?: any;          // Visualization parameters
  mapStats: Record<string, any>; // Statistical data for charts
  extraDescription?: string;    // Analysis description
  uhiMetrics?: any;            // UHI-specific metrics
  insights?: any[];            // Analysis insights
  summary?: any;               // Summary statistics
  urban_metrics?: any;         // Urban metrics data
  recommendations?: any;       // Actionable recommendations
}
```

### Chart Data Structure
```typescript
// Insights Data
insights: [{
  title: string;
  category: "infrastructure" | "environment" | "monitoring" | "demographics";
  content: string;
  priority: "high" | "medium" | "low";
  confidence?: number;
}]

// Urban Metrics Data
urban_metrics: {
  quality_scores: {
    infrastructure_score: number;
    environmental_score: number;
    satellite_quality_score: number;
    overall_score: number;
  },
  infrastructure: {
    building_density: number;
    road_network_density: number;
    amenity_accessibility: number;
  },
  development: {
    population_density: number;
    urbanization_rate: number;
    satellite_coverage: number;
  },
  environment: {
    green_space_ratio: number;
    natural_features_count: number;
  }
}
```

## Configuration

### 1. API Endpoints
```javascript
const FLASK_API_BASE_URL = "http://localhost:5000";

Endpoints:
- GET  /                    - Health check
- POST /api/geocode         - City geocoding
- POST /api/osm-data        - OpenStreetMap data
- POST /api/satellite-data  - Satellite imagery info
- POST /api/demographic-data - World Bank demographics
- POST /api/analyze         - Comprehensive analysis
```

### 2. Chart Configuration
Chart types are automatically selected based on analysis type:

```typescript
// Flask API Analysis Types use custom charts
"Comprehensive Urban Analysis": {
  statsChart: "flaskAPICharts",
  queryChart: "stackedBarChartStats",
  unit: "score"
}
```

## Testing

### 1. Automated Tests
Run the integration test script:
```bash
node test-flask-api-integration.js
```

Tests:
- ✅ Flask API availability
- ✅ Intent recognition (5/5 patterns)
- ✅ Endpoint functionality
- ✅ Data structure validation

### 2. Manual Testing
1. Start Flask API: `python app.py`
2. Start GeoVision: `npm run dev`
3. Test queries in chat:
   - "Show comprehensive urban analysis for London"
   - "Get infrastructure data for buildings and roads"
   - "What is the current demographic data?"

### 3. Error Handling
The system gracefully falls back to GEE analysis if:
- Flask API is unavailable
- Flask API returns errors
- Network connectivity issues occur

## Integration Points

### 1. Chat Interface (`app/(main)/api/chat/route.ts`)
- Enhanced function type descriptions include Flask API options
- Added `userQuery` and `cityName` parameters for intent recognition
- System instructions updated to recognize Flask API capabilities

### 2. Analysis Route (`app/(main)/api/gee/request-geospatial-analysis/route.ts`)
- Flask API availability check before analysis
- Integrated analysis execution with fallback to GEE
- Enhanced logging for debugging integration issues

### 3. Tool System (`lib/database/chat/tools.ts`)
- Additional parameters passed to analysis functions
- Enhanced payload structure for Flask API integration

### 4. Chart System
- New chart types for Flask API data visualization
- Automatic chart selection based on analysis type
- Custom components for insights, metrics, and data quality

## Fallback Strategy

The integration implements a robust fallback strategy:

1. **Primary**: Flask API analysis (if available and applicable)
2. **Secondary**: Enhanced GEE analysis with Flask API context data
3. **Tertiary**: Standard GEE analysis (existing functionality)

This ensures existing functionality is never broken, even if Flask API is unavailable.

## Performance Considerations

### 1. API Calls
- Flask API calls are made in parallel where possible
- Timeout handling prevents hanging requests
- Caching can be implemented for frequently requested data

### 2. Chart Rendering
- Charts are rendered client-side using ECharts
- Lazy loading for large datasets
- Responsive design for different screen sizes

### 3. Error Recovery
- Automatic fallback to GEE analysis
- Graceful error messages for users
- Detailed logging for developers

## Future Enhancements

### 1. Caching Layer
- Implement Redis caching for Flask API responses
- Cache duration based on data freshness requirements
- Invalidation strategies for real-time data

### 2. Advanced Intent Recognition
- Machine learning-based intent classification
- Multi-language support
- Context-aware suggestions

### 3. Enhanced Visualizations
- Interactive map overlays for Flask API data
- Time-series animations for change detection
- 3D visualizations for urban metrics

### 4. API Extensions
- Additional data sources integration
- Custom analysis algorithms
- User-defined analysis parameters

## Troubleshooting

### Common Issues

1. **Flask API Not Available**
   - Check if Flask API is running on port 5000
   - Verify CORS settings allow requests from GeoVision
   - Check network connectivity

2. **Intent Recognition Not Working**
   - Verify keywords in user queries
   - Check function type mapping in chat route
   - Review intent recognition patterns

3. **Charts Not Displaying**
   - Check chart data structure compatibility
   - Verify ECharts dependencies are loaded
   - Review console for JavaScript errors

### Debug Logs
Enable detailed logging by checking console output for:
- `🔍 [Analysis Request]` - Request processing
- `🌐 [Flask API]` - Flask API calls
- `✅ [Flask API]` - Successful operations
- `❌ [Flask API]` - Error conditions

## Conclusion

The Flask API integration successfully enhances GeoVision's capabilities by adding real-time urban data analysis while maintaining full backward compatibility. The system provides a seamless user experience with automatic fallback mechanisms and comprehensive error handling.

The integration supports both enhanced versions of existing analysis types and entirely new analysis capabilities, positioning GeoVision as a comprehensive urban planning intelligence platform.
