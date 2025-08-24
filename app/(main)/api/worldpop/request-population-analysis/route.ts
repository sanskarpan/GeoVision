// import { NextResponse } from "next/server";
// import { NextRequest } from "next/server";
// import { 
//   getWorldPopPopulationData, 
//   getWorldPopPopulationChange,
//   getWorldPopPopulationDensity,
//   WorldPopRequestParams 
// } from "@/lib/geospatial/worldpop/worldpop-api";

// export async function POST(req: NextRequest) {
//   console.log("Processing WorldPop population analysis request");

//   // Parse the request body as JSON
//   let body;
//   try {
//     body = await req.json();
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
//   }

//   const {
//     analysisType,
//     country,
//     year1,
//     year2,
//     selectedRoiGeometry,
//     resolution = '100m',
//     format = 'json'
//   } = body;

//   // Validate required parameters
//   if (!analysisType || !country) {
//     return NextResponse.json(
//       {
//         error: "Analysis type and country are required parameters.",
//       },
//       { status: 400 }
//     );
//   }

//   // Validate the ROI geometry if provided
//   let geometry = selectedRoiGeometry;
//   if (selectedRoiGeometry && typeof selectedRoiGeometry === "string") {
//     try {
//       const geometryString = decodeURIComponent(selectedRoiGeometry);
//       geometry = JSON.parse(geometryString);
//     } catch (err) {
//       return NextResponse.json(
//         { error: "Invalid geometry JSON" },
//         { status: 400 }
//       );
//     }
//   }

//   try {
//     let result;

//     switch (analysisType) {
//       case "Population Data":
//         if (!year1) {
//           return NextResponse.json(
//             { error: "Year is required for population data analysis" },
//             { status: 400 }
//           );
//         }
        
//         result = await getWorldPopPopulationData({
//           country,
//           year: year1,
//           geojson: geometry,
//           format,
//           resolution
//         });
//         break;

//       case "Population Density":
//         if (!year1) {
//           return NextResponse.json(
//             { error: "Year is required for population density analysis" },
//             { status: 400 }
//           );
//         }
        
//         result = await getWorldPopPopulationDensity({
//           country,
//           year: year1,
//           geojson: geometry,
//           format,
//           resolution
//         });
//         break;

//       case "Population Change":
//         if (!year1 || !year2) {
//           return NextResponse.json(
//             { error: "Both year1 and year2 are required for population change analysis" },
//             { status: 400 }
//           );
//         }
        
//         if (year1 >= year2) {
//           return NextResponse.json(
//             { error: "Year1 must be less than Year2" },
//             { status: 400 }
//           );
//         }
        
//         result = await getWorldPopPopulationChange({
//           country,
//           year1,
//           year2,
//           geojson: geometry
//         });
//         break;

//       default:
//         return NextResponse.json(
//           { error: "Invalid analysis type. Must be one of: 'Population Data', 'Population Density', 'Population Change'" },
//           { status: 400 }
//         );
//     }

//     if (!result.success) {
//       return NextResponse.json(
//         { error: result.error || "Analysis failed" },
//         { status: 500 }
//       );
//     }

//     // Format the response to match the existing geospatial analysis structure
//     const formattedResult = {
//       success: true,
//       analysisType,
//       country,
//       year1,
//       year2,
//       selectedRoiGeometry: geometry,
//       resolution,
//       format,
//       data: result.data || result,
//       metadata: {
//         source: "WorldPop",
//         timestamp: new Date().toISOString(),
//         analysisType,
//         country,
//         resolution
//       }
//     };

//     return NextResponse.json(formattedResult, { status: 200 });

//   } catch (error: any) {
//     console.error("WorldPop Population Analysis Error:", error);
//     return NextResponse.json(
//       { 
//         error: error.message || "Failed to perform population analysis",
//         details: error.stack 
//       }, 
//       { status: 500 }
//     );
//   }
// }


import { NextRequest, NextResponse } from "next/server";
import {
  getWorldPopPopulationData,
  getWorldPopAgeGenderData,
  getWorldPopPopulationChange,
  createSampleGeoJSON,
} from "@/lib/geospatial/worldpop/worldpop-api";

export async function POST(req: NextRequest) {
  console.log("Processing WorldPop population analysis request");

  // Parse the request body as JSON
  let body;
  try {
    body = await req.json();
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const {
    analysisType,
    country,
    year1,
    year2,
    selectedRoiGeometry,
    resolution = '100m',
    format = 'json'
  } = body;

  // Validate required parameters
  if (!analysisType || !country) {
    return NextResponse.json(
      {
        error: "Analysis type and country are required parameters.",
      },
      { status: 400 }
    );
  }

  // Validate and process the ROI geometry
  let geometry = selectedRoiGeometry;
  
  if (selectedRoiGeometry && typeof selectedRoiGeometry === "string") {
    try {
      const geometryString = decodeURIComponent(selectedRoiGeometry);
      geometry = JSON.parse(geometryString);
    } catch (err) {
      return NextResponse.json(
        { error: "Invalid geometry JSON" },
        { status: 400 }
      );
    }
  }

  // GeoJSON is required for WorldPop API
  if (!geometry) {
    console.log("No geometry provided, using sample GeoJSON for testing");
    geometry = createSampleGeoJSON();
    
    // In production, you might want to return an error instead:
    // return NextResponse.json(
    //   { error: "GeoJSON geometry is required for WorldPop API requests" },
    //   { status: 400 }
    // );
  }

  // Validate years for WorldPop constraints (2000-2020 for Global Project)
  const validateYear = (year: string | number) => {
    const yearNum = parseInt(year.toString());
    if (yearNum < 2000 || yearNum > 2020) {
      throw new Error(`Year must be between 2000 and 2020. WorldPop Global Project data is only available for this range. Provided: ${year}`);
    }
    return yearNum;
  };

  try {
    let result;

    switch (analysisType) {
      case "Population Data":
        if (!year1) {
          return NextResponse.json(
            { error: "Year is required for population data analysis" },
            { status: 400 }
          );
        }
        
        // Validate year range
        validateYear(year1);
        
        result = await getWorldPopPopulationData(
          country,
          year1.toString(),
          resolution,
          format,
          geometry
        );
        
        // Check if the API call was successful
        if (!result.success) {
          return NextResponse.json(
            { error: result.error || "Failed to fetch population data" },
            { status: 500 }
          );
        }
        break;

      case "Population Density":
        if (!year1) {
          return NextResponse.json(
            { error: "Year is required for population density analysis" },
            { status: 400 }
          );
        }
        
        // Validate year range
        validateYear(year1);
        
        // Population density is calculated as part of population data in the fixed API
        result = await getWorldPopPopulationData(
          country,
          year1.toString(),
          resolution,
          format,
          geometry
        );
        
        if (!result.success) {
          return NextResponse.json(
            { error: result.error || "Failed to fetch population density data" },
            { status: 500 }
          );
        }
        
        // Focus the result on density metrics
        if (result.data) {
          result.data.analysisType = 'Population Density';
          result.data.primaryMetric = result.data.populationDensity;
        }
        break;

      case "Age Gender Data":
        if (!year1) {
          return NextResponse.json(
            { error: "Year is required for age/gender data analysis" },
            { status: 400 }
          );
        }
        
        // Validate year range
        validateYear(year1);
        
        result = await getWorldPopAgeGenderData(
          country,
          year1.toString(),
          resolution,
          format,
          geometry
        );
        
        if (!result.success) {
          return NextResponse.json(
            { error: result.error || "Failed to fetch age/gender data" },
            { status: 500 }
          );
        }
        break;

      case "Population Change":
        if (!year1 || !year2) {
          return NextResponse.json(
            { error: "Both year1 and year2 are required for population change analysis" },
            { status: 400 }
          );
        }
        
        if (parseInt(year1.toString()) >= parseInt(year2.toString())) {
          return NextResponse.json(
            { error: "Year1 must be less than Year2" },
            { status: 400 }
          );
        }
        
        // Validate both years
        validateYear(year1);
        validateYear(year2);
        
        result = await getWorldPopPopulationChange(
          country,
          year1.toString(),
          year2.toString(),
          resolution,
          format,
          geometry
        );
        
        // getWorldPopPopulationChange throws errors instead of returning success/error object
        // So if we reach this point, the result is the actual data
        break;

      default:
        return NextResponse.json(
          { error: "Invalid analysis type. Must be one of: 'Population Data', 'Population Density', 'Age Gender Data', 'Population Change'" },
          { status: 400 }
        );
    }

    // Format the response to match the existing geospatial analysis structure
    const formattedResult = {
      success: true,
      analysisType,
      country,
      year1: year1 ? parseInt(year1.toString()) : null,
      year2: year2 ? parseInt(year2.toString()) : null,
      selectedRoiGeometry: geometry,
      resolution,
      format,
      data: result,
      metadata: {
        source: "WorldPop Global Project",
        timestamp: new Date().toISOString(),
        analysisType,
        country,
        resolution,
        dataAvailability: "2000-2020",
        apiVersion: "v1",
        dataset: analysisType === "Age Gender Data" ? "wpgpas" : "wpgppop",
        note: "WorldPop provides high resolution population data at 100m resolution"
      }
    };

    return NextResponse.json(formattedResult, { status: 200 });

  } catch (error: any) {
    console.error("WorldPop Population Analysis Error:", error);
    
    // Provide more specific error messages based on common WorldPop API issues
    let errorMessage = error.message || "Failed to perform population analysis";
    let statusCode = 500;
    
    if (error.message?.includes("WorldPop API error: 405")) {
      errorMessage = "WorldPop API method not allowed. Please check the API endpoint configuration.";
      statusCode = 502; // Bad Gateway - upstream service issue
    } else if (error.message?.includes("Year must be between 2000 and 2020")) {
      errorMessage = error.message;
      statusCode = 400; // Bad Request
    } else if (error.message?.includes("GeoJSON is required")) {
      errorMessage = "A valid GeoJSON geometry is required for WorldPop API requests";
      statusCode = 400;
    } else if (error.message?.includes("Task") && error.message?.includes("failed")) {
      errorMessage = "WorldPop processing task failed. This may be due to invalid geometry or server issues.";
      statusCode = 502;
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        apiInfo: {
          dataAvailability: "2000-2020",
          requiredParameters: ["country", "year", "geojson"],
          supportedAnalysisTypes: ["Population Data", "Population Density", "Age Gender Data", "Population Change"]
        }
      }, 
      { status: statusCode }
    );
  }
}