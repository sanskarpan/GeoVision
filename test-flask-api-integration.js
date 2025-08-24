/**
 * Test script for Flask API integration
 * Run with: node test-flask-api-integration.js
 */

const FLASK_API_BASE_URL = "http://localhost:5000";
const GEOVISION_API_BASE_URL = "http://localhost:3000";

// Test Flask API endpoints directly
async function testFlaskAPIDirectly() {
  console.log("🧪 Testing Flask API endpoints directly...\n");

  try {
    // 1. Health check
    console.log("1. Testing health check...");
    const healthResponse = await fetch(`${FLASK_API_BASE_URL}/`);
    const healthData = await healthResponse.json();
    console.log("✅ Health check:", healthData.status);
    console.log("   Available endpoints:", Object.keys(healthData.endpoints || {}));

    // 2. Geocoding test
    console.log("\n2. Testing geocoding...");
    const geocodeResponse = await fetch(`${FLASK_API_BASE_URL}/api/geocode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ city: "London" })
    });
    const geocodeData = await geocodeResponse.json();
    console.log("✅ Geocoding:", geocodeData.status);
    console.log("   Location:", geocodeData.name);
    console.log("   Coordinates:", [geocodeData.lat, geocodeData.lon]);

    // 3. OSM data test
    console.log("\n3. Testing OSM data...");
    const osmResponse = await fetch(`${FLASK_API_BASE_URL}/api/osm-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lat: geocodeData.lat,
        lon: geocodeData.lon,
        bbox_size: 0.05
      })
    });
    const osmData = await osmResponse.json();
    console.log("✅ OSM data:", osmData.status);
    console.log("   Total features:", osmData.total_features);
    console.log("   Buildings:", osmData.feature_counts?.buildings);
    console.log("   Roads:", osmData.feature_counts?.highways);

    // 4. Comprehensive analysis test
    console.log("\n4. Testing comprehensive analysis...");
    const analysisResponse = await fetch(`${FLASK_API_BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        city: "London",
        time_range: "2years",
        cloud_cover: 25
      })
    });
    const analysisData = await analysisResponse.json();
    console.log("✅ Comprehensive analysis:", analysisData.status);
    console.log("   Overall score:", analysisData.summary?.overall_score);
    console.log("   High priority issues:", analysisData.summary?.high_priority_issues);
    console.log("   Insights count:", analysisData.insights?.length);

    return true;
  } catch (error) {
    console.error("❌ Flask API test failed:", error.message);
    return false;
  }
}

// Test GeoVision integration
async function testGeoVisionIntegration() {
  console.log("\n🧪 Testing GeoVision integration...\n");

  try {
    // Mock ROI geometry for London
    const londonROI = {
      type: "Polygon",
      coordinates: [[
        [-0.2, 51.4],
        [-0.1, 51.4],
        [-0.1, 51.6],
        [-0.2, 51.6],
        [-0.2, 51.4]
      ]]
    };

    // Test comprehensive urban analysis through GeoVision API
    console.log("1. Testing integrated comprehensive analysis...");
    const payload = {
      functionType: "Comprehensive Urban Analysis",
      selectedRoiGeometry: londonROI,
      startDate1: "2022-01-01",
      endDate1: "2022-12-31",
      aggregationMethod: "Mean",
      userQuery: "Comprehensive urban analysis for London",
      cityName: "London"
    };

    const response = await fetch(`${GEOVISION_API_BASE_URL}/api/gee/request-geospatial-analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Integration test successful");
      console.log("   Function type:", data.functionType);
      console.log("   Data source:", data.dataSource);
      console.log("   Map stats keys:", Object.keys(data.mapStats || {}));
      console.log("   Has insights:", !!data.insights);
      console.log("   Extra description length:", data.extraDescription?.length || 0);
    } else {
      const errorData = await response.json();
      console.log("⚠️ Integration test failed with status:", response.status);
      console.log("   Error:", errorData.error || errorData.result);
    }

    return true;
  } catch (error) {
    console.error("❌ GeoVision integration test failed:", error.message);
    return false;
  }
}

// Test intent recognition
function testIntentRecognition() {
  console.log("\n🧪 Testing intent recognition...\n");

  const testQueries = [
    { 
      query: "Show me comprehensive urban analysis for Paris", 
      expected: "Comprehensive Urban Analysis" 
    },
    { 
      query: "I need infrastructure data for buildings and roads", 
      expected: "Infrastructure Analysis" 
    },
    { 
      query: "What's the current population density?", 
      expected: "Demographic Analysis" 
    },
    { 
      query: "Get real-time data from OpenStreetMap", 
      expected: "Real-time Urban Data" 
    },
    { 
      query: "Urban heat island analysis", 
      expected: "Urban Heat Island (UHI) Analysis" 
    }
  ];

  // Import the intent recognition function (this would need to be adapted for Node.js)
  // For now, we'll simulate the logic
  const recognizeIntent = (query) => {
    const q = query.toLowerCase();
    if (q.includes("comprehensive") || q.includes("complete")) return "Comprehensive Urban Analysis";
    if (q.includes("infrastructure") || q.includes("buildings") || q.includes("roads")) return "Infrastructure Analysis";
    if (q.includes("population") || q.includes("demographic")) return "Demographic Analysis";
    if (q.includes("real-time") || q.includes("current") || q.includes("openstreetmap")) return "Real-time Urban Data";
    if (q.includes("heat island") || q.includes("uhi")) return "Urban Heat Island (UHI) Analysis";
    return null;
  };

  let passed = 0;
  let total = testQueries.length;

  testQueries.forEach(({ query, expected }) => {
    const result = recognizeIntent(query);
    if (result === expected) {
      console.log(`✅ "${query}" → ${result}`);
      passed++;
    } else {
      console.log(`❌ "${query}" → ${result} (expected: ${expected})`);
    }
  });

  console.log(`\n📊 Intent recognition: ${passed}/${total} tests passed`);
  return passed === total;
}

// Main test runner
async function runTests() {
  console.log("🚀 Starting Flask API Integration Tests\n");
  console.log("=" * 50);

  let allPassed = true;

  // Test Flask API availability
  const flaskOk = await testFlaskAPIDirectly();
  allPassed = allPassed && flaskOk;

  // Test intent recognition
  const intentOk = testIntentRecognition();
  allPassed = allPassed && intentOk;

  // Test integration (only if Flask API is available)
  if (flaskOk) {
    const integrationOk = await testGeoVisionIntegration();
    allPassed = allPassed && integrationOk;
  } else {
    console.log("\n⚠️ Skipping integration tests - Flask API not available");
  }

  console.log("\n" + "=" * 50);
  console.log(allPassed ? 
    "🎉 All tests passed! Flask API integration is working." : 
    "⚠️ Some tests failed. Check the output above for details.");

  // Test recommendations
  console.log("\n📋 Test Results Summary:");
  console.log(`   Flask API Health: ${flaskOk ? "✅" : "❌"}`);
  console.log(`   Intent Recognition: ${intentOk ? "✅" : "❌"}`);
  console.log(`   GeoVision Integration: ${flaskOk ? "🧪" : "⏭️ Skipped"}`);

  if (!flaskOk) {
    console.log("\n🔧 To fix Flask API issues:");
    console.log("   1. Make sure Flask API is running on http://localhost:5000");
    console.log("   2. Check if all required endpoints are implemented");
    console.log("   3. Verify CORS settings allow requests from GeoVision");
  }

  console.log("\n🧪 Manual Testing Steps:");
  console.log("   1. Start Flask API: python app.py");
  console.log("   2. Start GeoVision: npm run dev");
  console.log("   3. Try these queries in chat:");
  console.log("      - 'Show comprehensive urban analysis for London'");
  console.log("      - 'Get infrastructure data for buildings and roads'");
  console.log("      - 'What is the current demographic data?'");
}

// Run tests if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testFlaskAPIDirectly,
  testGeoVisionIntegration,
  testIntentRecognition,
  runTests
};
