import { NextRequest, NextResponse } from "next/server";

/**
 * Debug endpoint to check ROI status
 * This helps debug why the AI might not be recognizing the ROI
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { selectedRoiGeometryInChat } = body;
    
    console.log('🔍 ROI DEBUG ENDPOINT - Full Request Body:', JSON.stringify(body, null, 2));
    
    const roiAnalysis = {
      timestamp: new Date().toISOString(),
      roiStatus: {
        exists: !!selectedRoiGeometryInChat,
        type: typeof selectedRoiGeometryInChat,
        isNull: selectedRoiGeometryInChat === null,
        isUndefined: selectedRoiGeometryInChat === undefined,
        isEmpty: selectedRoiGeometryInChat === '' || (Array.isArray(selectedRoiGeometryInChat) && selectedRoiGeometryInChat.length === 0)
      },
      geometryDetails: selectedRoiGeometryInChat ? {
        hasType: !!selectedRoiGeometryInChat.type,
        type: selectedRoiGeometryInChat.type,
        hasCoordinates: !!selectedRoiGeometryInChat.coordinates,
        coordinatesLength: selectedRoiGeometryInChat.coordinates?.length,
        firstCoordinate: selectedRoiGeometryInChat.coordinates?.[0]?.[0]?.[0],
        keys: Object.keys(selectedRoiGeometryInChat)
      } : null,
      rawData: selectedRoiGeometryInChat,
      validation: {
        isValidGeometry: isValidROIGeometry(selectedRoiGeometryInChat),
        errorMessage: getROIValidationError(selectedRoiGeometryInChat)
      },
      recommendations: generateROIRecommendations(selectedRoiGeometryInChat)
    };
    
    return NextResponse.json({
      success: true,
      debug: roiAnalysis
    });
    
  } catch (error) {
    console.error('❌ ROI Debug endpoint error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      debug: {
        timestamp: new Date().toISOString(),
        errorType: 'debug_endpoint_error'
      }
    }, { status: 500 });
  }
}

function isValidROIGeometry(roi: any): boolean {
  if (!roi) return false;
  if (typeof roi !== 'object') return false;
  if (!roi.type) return false;
  
  const validTypes = ['Polygon', 'MultiPolygon', 'FeatureCollection'];
  if (!validTypes.includes(roi.type)) return false;
  
  if (roi.type === 'FeatureCollection') {
    return roi.features && Array.isArray(roi.features) && roi.features.length > 0;
  }
  
  return roi.coordinates && Array.isArray(roi.coordinates) && roi.coordinates.length > 0;
}

function getROIValidationError(roi: any): string | null {
  if (!roi) return "ROI is null or undefined";
  if (typeof roi !== 'object') return "ROI is not an object";
  if (!roi.type) return "ROI missing 'type' property";
  
  const validTypes = ['Polygon', 'MultiPolygon', 'FeatureCollection'];
  if (!validTypes.includes(roi.type)) {
    return `Invalid ROI type '${roi.type}'. Must be one of: ${validTypes.join(', ')}`;
  }
  
  if (roi.type === 'FeatureCollection') {
    if (!roi.features) return "FeatureCollection missing 'features' property";
    if (!Array.isArray(roi.features)) return "FeatureCollection 'features' is not an array";
    if (roi.features.length === 0) return "FeatureCollection has no features";
    
    for (let i = 0; i < roi.features.length; i++) {
      const feature = roi.features[i];
      if (!feature.geometry) return `Feature ${i} missing geometry`;
      if (!['Polygon', 'MultiPolygon'].includes(feature.geometry.type)) {
        return `Feature ${i} has invalid geometry type '${feature.geometry.type}'`;
      }
    }
  } else {
    if (!roi.coordinates) return "ROI missing 'coordinates' property";
    if (!Array.isArray(roi.coordinates)) return "ROI 'coordinates' is not an array";
    if (roi.coordinates.length === 0) return "ROI coordinates array is empty";
  }
  
  return null; // No error
}

function generateROIRecommendations(roi: any): string[] {
  const recommendations = [];
  
  if (!roi) {
    recommendations.push("Draw a region on the map before requesting analysis");
    recommendations.push("Use the drawing tools to select your area of interest");
    return recommendations;
  }
  
  if (!isValidROIGeometry(roi)) {
    recommendations.push("The ROI geometry appears to be invalid");
    recommendations.push("Try redrawing the region on the map");
    recommendations.push("Ensure you're drawing a polygon or multipolygon");
    return recommendations;
  }
  
  recommendations.push("ROI appears valid - analysis should work");
  recommendations.push("If analysis fails, check console logs for API errors");
  
  return recommendations;
}

// Also create a GET version for simple testing
export async function GET() {
  return NextResponse.json({
    endpoint: "ROI Debug Endpoint",
    usage: "POST with selectedRoiGeometryInChat to debug ROI issues",
    timestamp: new Date().toISOString()
  });
}
