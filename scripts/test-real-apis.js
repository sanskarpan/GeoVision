/**
 * Quick Test Script for Real API Integration
 * 
 * This script tests your urban planning APIs with real data integration
 * Usage: node scripts/test-real-apis.js
 */

const testInfrastructureAnalysis = async () => {
  console.log('🚗 Testing Traffic Congestion Analysis with TomTom API...\n');
  
  const testData = {
    analysisType: "Traffic Congestion Hotspots",
    infrastructureType: "Roads and Highways",
    selectedRoiGeometry: {
      type: "Polygon",
      coordinates: [[
        [-74.0059, 40.7128],  // Manhattan, NYC
        [-74.0059, 40.7589], 
        [-73.9441, 40.7589],
        [-73.9441, 40.7128],
        [-74.0059, 40.7128]
      ]]
    }
  };
  
  try {
    const response = await fetch('http://localhost:3000/api/urban-planning/request-infrastructure-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    console.log('✅ Infrastructure Analysis Results:');
    console.log('   API Status:', result.apiStatus);
    console.log('   Data Source:', result.dataSource);
    console.log('   Congestion Score:', result.overallCongestionScore);
    console.log('   Hotspots:', result.congestionHotspots?.length || 0);
    
    if (result.additionalData) {
      console.log('   Average Speed:', result.additionalData.averageSpeed);
      console.log('   Total Incidents:', result.additionalData.totalIncidents);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Infrastructure Analysis Error:', error.message);
    return null;
  }
};

const testGreenSpaceAnalysis = async () => {
  console.log('\n🌳 Testing Green Space Analysis with Weather API...\n');
  
  const testData = {
    analysisType: "Green Space Coverage Assessment",
    vegetationIndex: "NDVI",
    selectedRoiGeometry: {
      type: "Polygon",
      coordinates: [[
        [-118.2437, 34.0522],  // Los Angeles
        [-118.2437, 34.0722],
        [-118.2237, 34.0722], 
        [-118.2237, 34.0522],
        [-118.2437, 34.0522]
      ]]
    }
  };
  
  try {
    const response = await fetch('http://localhost:3000/api/urban-planning/request-green-space-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    console.log('✅ Green Space Analysis Results:');
    console.log('   API Status:', result.apiStatus);
    console.log('   Green Space Coverage:', result.overallMetrics?.totalGreenSpace);
    console.log('   Vegetation Health:', result.overallMetrics?.vegetationHealth);
    
    if (result.weatherIntegration) {
      console.log('   Weather Integration:', result.weatherIntegration.dataSource || result.weatherIntegration.status);
      if (result.weatherIntegration.currentConditions) {
        console.log('   Current Temperature:', result.weatherIntegration.currentConditions.temperature);
        console.log('   Weather Conditions:', result.weatherIntegration.currentConditions.conditions);
      }
    }
    
    return result;
  } catch (error) {
    console.error('❌ Green Space Analysis Error:', error.message);
    return null;
  }
};

const testAPIStatus = () => {
  console.log('🔑 Checking API Key Configuration:\n');
  
  const apis = {
    'TomTom Traffic': process.env.TOMTOM_API_KEY ? '✅ Configured' : '❌ Missing',
    'OpenWeatherMap': process.env.OPENWEATHER_API_KEY ? '✅ Configured' : '❌ Missing',
    'RapidAPI': process.env.RAPIDAPI_KEY ? '✅ Configured' : '❌ Missing',
    'OpenStreetMap': '✅ Free (No key required)'
  };
  
  Object.entries(apis).forEach(([name, status]) => {
    console.log(`   ${name}: ${status}`);
  });
  
  console.log('\n💡 Tips:');
  if (!process.env.TOMTOM_API_KEY) {
    console.log('   - Get TomTom API key: https://developer.tomtom.com/');
  }
  if (!process.env.OPENWEATHER_API_KEY) {
    console.log('   - Get OpenWeatherMap API key: https://openweathermap.org/api');
  }
  if (!process.env.RAPIDAPI_KEY) {
    console.log('   - Get RapidAPI key: https://rapidapi.com/');
  }
};

const main = async () => {
  console.log('🧪 Testing Real API Integration for Urban Planning Tools\n');
  console.log('=' .repeat(60));
  
  // Check API configuration
  testAPIStatus();
  
  console.log('\n' + '=' .repeat(60));
  
  // Test infrastructure analysis (traffic)
  const infraResult = await testInfrastructureAnalysis();
  
  // Test green space analysis (weather)
  const greenResult = await testGreenSpaceAnalysis();
  
  console.log('\n' + '=' .repeat(60));
  console.log('🎯 Test Summary:\n');
  
  if (infraResult) {
    const hasRealTrafficData = infraResult.dataSource?.includes('TomTom') && !infraResult.dataSource?.includes('fallback');
    console.log(`   Traffic Analysis: ${hasRealTrafficData ? '✅ Real Data' : '⚠️  Mock Data'}`);
  }
  
  if (greenResult) {
    const hasRealWeatherData = greenResult.weatherIntegration?.dataSource?.includes('OpenWeatherMap');
    console.log(`   Weather Integration: ${hasRealWeatherData ? '✅ Real Data' : '⚠️  Not Available'}`);
  }
  
  console.log('\n🚀 Next Steps:');
  console.log('   1. Configure missing API keys in your .env file');
  console.log('   2. Test with chat interface by drawing regions on map');
  console.log('   3. Try different analysis types and locations');
  console.log('   4. Monitor API usage and costs');
};

// Run tests if this script is executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testInfrastructureAnalysis, testGreenSpaceAnalysis, testAPIStatus };
