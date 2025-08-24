/**
 * ROI Debug Script
 * This helps debug why the AI isn't recognizing the ROI from the map
 */

console.log('🔍 ROI Issue Debug Script\n');
console.log('=' .repeat(50));

// Test the debug endpoint
const testROIDebug = async () => {
  console.log('\n1. Testing with valid Manhattan ROI...');
  
  const validROI = {
    type: "Polygon",
    coordinates: [[
      [-74.0059, 40.7128],
      [-74.0059, 40.7589], 
      [-73.9441, 40.7589],
      [-73.9441, 40.7128],
      [-74.0059, 40.7128]
    ]]
  };
  
  try {
    const response = await fetch('http://localhost:3000/api/debug/roi-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        selectedRoiGeometryInChat: validROI
      })
    });
    
    const result = await response.json();
    
    console.log('✅ Valid ROI Test Results:');
    console.log('   ROI Exists:', result.debug.roiStatus.exists);
    console.log('   ROI Type:', result.debug.geometryDetails?.type);
    console.log('   Is Valid:', result.debug.validation.isValidGeometry);
    console.log('   Coordinates Length:', result.debug.geometryDetails?.coordinatesLength);
    
    if (result.debug.validation.errorMessage) {
      console.log('   ❌ Error:', result.debug.validation.errorMessage);
    }
    
  } catch (error) {
    console.error('❌ Debug endpoint error:', error.message);
  }
};

// Test with no ROI
const testNoROI = async () => {
  console.log('\n2. Testing with no ROI...');
  
  try {
    const response = await fetch('http://localhost:3000/api/debug/roi-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        selectedRoiGeometryInChat: null
      })
    });
    
    const result = await response.json();
    
    console.log('⚠️  No ROI Test Results:');
    console.log('   ROI Exists:', result.debug.roiStatus.exists);
    console.log('   Recommendations:', result.debug.recommendations);
    
  } catch (error) {
    console.error('❌ Debug endpoint error:', error.message);
  }
};

// Test actual traffic analysis with ROI
const testTrafficAnalysisWithROI = async () => {
  console.log('\n3. Testing actual traffic analysis with ROI...');
  
  const manhattanROI = {
    type: "Polygon",
    coordinates: [[
      [-74.0059, 40.7128],
      [-74.0059, 40.7589], 
      [-73.9441, 40.7589],
      [-73.9441, 40.7128],
      [-74.0059, 40.7128]
    ]]
  };
  
  try {
    const response = await fetch('http://localhost:3000/api/urban-planning/request-infrastructure-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        analysisType: "Traffic Congestion Hotspots",
        infrastructureType: "Roads and Highways",
        selectedRoiGeometry: manhattanROI
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    console.log('🚗 Traffic Analysis Test Results:');
    console.log('   Success:', result.success);
    console.log('   API Status:', result.apiStatus);
    console.log('   Data Source:', result.dataSource);
    
    if (result.error) {
      console.log('   ❌ Error:', result.error);
    } else {
      console.log('   ✅ Analysis completed successfully');
      console.log('   Congestion Score:', result.overallCongestionScore);
      console.log('   Hotspots Found:', result.congestionHotspots?.length || 0);
    }
    
  } catch (error) {
    console.error('❌ Traffic analysis error:', error.message);
  }
};

// Check server logs function
const checkServerSetup = () => {
  console.log('\n4. Server Setup Checklist:');
  console.log('   📋 Things to verify:');
  console.log('   □ Server is running (npm run dev)');
  console.log('   □ No console errors when drawing ROI on map');
  console.log('   □ ROI data is being sent to chat API');
  console.log('   □ System instructions include ROI awareness');
  console.log('   □ AI is not asking for location in responses');
  
  console.log('\n   🔧 To fix the issue:');
  console.log('   1. Check browser console for ROI-related errors');
  console.log('   2. Verify ROI is highlighted/selected on map');
  console.log('   3. Try refreshing and redrawing the ROI');
  console.log('   4. Check server console for ROI debug logs');
  
  console.log('\n   📞 Expected AI Behavior:');
  console.log('   ✅ Should immediately run analysis without asking for location');
  console.log('   ✅ Should show "ROI STATUS: ✅ User has already provided..." in system prompt');
  console.log('   ❌ Should NOT ask "Could you please provide the specific region"');
};

// Main test runner
const runAllTests = async () => {
  try {
    await testROIDebug();
    await testNoROI();
    await testTrafficAnalysisWithROI();
    checkServerSetup();
    
    console.log('\n' + '=' .repeat(50));
    console.log('🎯 Summary:');
    console.log('   If the traffic analysis test worked, your APIs are configured correctly.');
    console.log('   If the AI is still asking for location, the issue is in the chat interface');
    console.log('   sending ROI data to the AI system.');
    console.log('\n   Next step: Check browser console while using the chat interface.');
    
  } catch (error) {
    console.error('❌ Test runner error:', error);
  }
};

// Run if this script is executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = { testROIDebug, testTrafficAnalysisWithROI };
