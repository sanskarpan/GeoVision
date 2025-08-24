// "use server";
// import { answerQuery } from "@/app/actions/rag-actions";
// import {
//   calculateGeometryArea,
//   checkGeometryAreaIsLessThanThreshold,
// } from "@/features/maps/utils/geometry-utils";
// import { azure } from "@ai-sdk/azure";
// import { convertToCoreMessages, generateText } from "ai";
// import { NextResponse } from "next/server";

// export async function requestGeospatialAnalysis(args: any) {
//   const {
//     functionType,
//     startDate1String,
//     endDate1String,
//     startDate2String,
//     endDate2String,
//     aggregationMethod,
//     layerName,
//     title,
//     cookieStore,
//     selectedRoiGeometryInChat,
//     maxArea,
//     experimental,
//   } = args;

//   const selectedRoiGeometry = selectedRoiGeometryInChat?.geometry;
//   if (!selectedRoiGeometry) {
//     return {
//       error:
//         "It seems you didn't provide a valid region of interest (ROI) for the analysis. you need to provide an ROI through importing a shapefile/geojson file or drawing a shape on the map.",
//     };
//   }

//   if (
//     selectedRoiGeometry.type !== "Polygon" &&
//     selectedRoiGeometry.type !== "MultiPolygon" &&
//     selectedRoiGeometry.type !== "FeatureCollection"
//   ) {
//     return {
//       error:
//         "Selected ROI geometry must be a Polygon, MultiPolygon, or a FeatureCollection of polygons.",
//     };
//   }

//   // If it's a FeatureCollection, ensure every feature's geometry is a Polygon or MultiPolygon.
//   if (selectedRoiGeometry.type === "FeatureCollection") {
//     for (const feature of selectedRoiGeometry.features) {
//       if (
//         !feature.geometry ||
//         (feature.geometry.type !== "Polygon" &&
//           feature.geometry.type !== "MultiPolygon")
//       ) {
//         return {
//           error: "All features in the ROI must be polygons.",
//         };
//       }
//     }
//   }

//   const geometryAreaCheckResult = checkGeometryAreaIsLessThanThreshold(
//     selectedRoiGeometryInChat?.geometry,
//     maxArea
//   );
//   const areaSqKm = calculateGeometryArea(selectedRoiGeometryInChat?.geometry);
//   if (!geometryAreaCheckResult) {
//     return {
//       error: `The area of the selected region of interest (ROI) is ${areaSqKm} sq km, which exceeds the maximum area limit of ${maxArea} sq km. Please select a smaller ROI and try again.`,
//     };
//   }

//   const url = new URL(
//     "/api/gee/request-geospatial-analysis",
//     process.env.BASE_URL
//   );

//   const payload = {
//     functionType,
//     startDate1: startDate1String,
//     endDate1: endDate1String,
//     startDate2: startDate2String,
//     endDate2: endDate2String,
//     aggregationMethod,
//     selectedRoiGeometry,
//     experimental,
//   };

//   try {
//     const response = await fetch(url.toString(), {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         cookie: cookieStore || "",
//       },
//       body: JSON.stringify(payload),
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       console.error(
//         "Error during fetch:",
//         errorData.error || response.statusText
//       );
//       return NextResponse.json(
//         { error: "Failed to run the analysis" },
//         { status: 500 }
//       );
//     }

//     const data = await response.json();

//     // This is not suitable for production, but it's a good way to check if the response is correct
//     if (Object.keys(data.mapStats).length === 0) {
//       return {
//         error: "Something went wrong! Failed to run the analysis.",
//       };
//     }
//     return {
//       ...data,
//       title,
//       layerName,
//       functionType,
//       startDate1: startDate1String,
//       endDate1: endDate1String,
//       startDate2: startDate2String,
//       endDate2: endDate2String,
//       aggregationMethod,
//       selectedRoiGeometry: selectedRoiGeometryInChat,
//     };
//   } catch (error) {
//     console.error("Error during fetch:", error);
//     return NextResponse.json(
//       { error: "Failed to run the analysis" },
//       { status: 500 }
//     );
//   }
// }

// export async function requestLoadingGeospatialData(args: any) {
//   const {
//     geospatialDataType,
//     dataType,
//     selectedRoiGeometryInChat,
//     datasetId,
//     layerName,
//     title,
//     startDate,
//     endDate,
//     divideValue,
//     visParams,
//     labelNames,
//     cookieStore,
//   } = args;

//   const selectedRoiGeometry = selectedRoiGeometryInChat?.geometry;

//   if (!selectedRoiGeometry) {
//     return {
//       error:
//         "It seems you didn't provide a valid region of interest (ROI). You need to provide an ROI through importing a shapefile/geojson file or drawing a shape on the map.",
//     };
//   }

//   if (
//     selectedRoiGeometry.type !== "Polygon" &&
//     selectedRoiGeometry.type !== "MultiPolygon" &&
//     selectedRoiGeometry.type !== "FeatureCollection"
//   ) {
//     return {
//       error:
//         "Selected ROI geometry must be a Polygon, MultiPolygon, or a FeatureCollection of polygons.",
//     };
//   }

//   if (selectedRoiGeometry.type === "FeatureCollection") {
//     for (const feature of selectedRoiGeometry.features) {
//       if (
//         !feature.geometry ||
//         (feature.geometry.type !== "Polygon" &&
//           feature.geometry.type !== "MultiPolygon")
//       ) {
//         return {
//           error: "All features in the ROI must be polygons.",
//         };
//       }
//     }
//   }

//   const url = new URL(
//     "/api/gee/request-loading-geospatial-data",
//     process.env.BASE_URL
//   );

//   const payload = {
//     geospatialDataType,
//     dataType,
//     datasetId,
//     startDate,
//     endDate,
//     divideValue,
//     visParams,
//     labelNames,
//     selectedRoiGeometry,
//   };

//   try {
//     const response = await fetch(url.toString(), {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         cookie: cookieStore || "",
//       },
//       body: JSON.stringify(payload),
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       console.error("Error during fetch:", data.error || response.statusText);
//       return {
//         error:
//           typeof data.error === "string"
//             ? data.error
//             : "Failed to load geospatial data",
//       };
//     }

//     if (!data.urlFormat || Object.keys(data.mapStats).length === 0) {
//       return {
//         error: "Something went wrong! Failed to load geospatial data.",
//       };
//     }

//     return {
//       ...data,
//       layerName,
//       title,
//       datasetId,
//       startDate,
//       endDate,
//       geospatialDataType,
//       selectedRoiGeometry: selectedRoiGeometryInChat,
//     };
//   } catch (error) {
//     console.error("Error during fetch:", error);
//     return {
//       error: "Failed to load geospatial data.",
//     };
//   }
// }

// // Tool to request a RAG query
// export async function requestRagQuery(args: any) {
//   const { query, title } = args; // Extract query parameter from arguments

//   try {
//     const data = await answerQuery(query);

//     return { data, title };
//   } catch (error) {
//     console.error("Error during RAG fetch:", error);
//     return NextResponse.json({ error: "Failed to fetch RAG" }, { status: 500 });
//   }
// }

// // Tool to generate a report based on the conversation history
// export async function draftReport(args: any) {
//   try {
//     const { messages, title, reportFileName } = args;

//     const relevantMessages = messages.filter(
//       (msg: any) =>
//         msg.role === "user" ||
//         (msg.role === "assistant" &&
//           !msg.content.startsWith("You are an AI Assistant"))
//     );

//     // Create a prompt that focuses on synthesizing the existing conversation
//     const reportPrompt = {
//       role: "user",
//       content: `Please draft a comprehensive report based on our previous conversation and analyses. The report should NOT inlcude your own comments. 
//             Format it with the following structure:
//             - Introduction: Brief context and purpose
//             - Analyses Performed: Summary of conducted analyses
//             - Key Findings: Important results, patterns, and trends
//             - Limitations and Caveats: Important constraints
//             - Recommendations & Next Steps: Future suggestions."`,
//     };

//     // Use all relevant conversation history plus the report request
//     const conversationContext = [...relevantMessages, reportPrompt];

//     const reportResponse = await generateText({
//       model: azure("gpt-4o"),
//       messages: convertToCoreMessages(conversationContext),
//       tools: {}, // Empty tools object since we don't need tools for report generation
//     });

//     // For simplicity here, assume it's resolved into a single string once complete.
//     const report = await reportResponse.text;

//     return {
//       report,
//       title,
//       reportFileName,
//     };
//   } catch (error) {
//     console.error("Error generating report:", error);
//     return NextResponse.json(
//       { error: "Failed to draft report" },
//       { status: 500 }
//     );
//   }
// }

// export async function requestWebScraping(args: any) {
//   const { url, title } = args;

//   try {
//     const baseUrl = process.env.BASE_URL;

//     const response = await fetch(
//       new URL(
//         `/api/web-scraper?url=${encodeURIComponent(url)}`,
//         baseUrl
//       ).toString()
//     );
//     const result = await response.json();

//     if (result.success) {
//       return result.data;
//     } else {
//       return { error: "Failed to scrape the webpage" };
//     }
//   } catch (error) {
//     console.error("Error during fetch:", error);
//     return { error: "Failed to scrape the webpage" };
//   }
// }

"use server";
import { answerQuery } from "@/app/actions/rag-actions";
import {
  calculateGeometryArea,
  checkGeometryAreaIsLessThanThreshold,
} from "@/features/maps/utils/geometry-utils";
import { azure } from "@ai-sdk/azure";
import { convertToCoreMessages, generateText } from "ai";
import { NextResponse } from "next/server";

export async function requestGeospatialAnalysis(args: any) {
  const {
    functionType,
    startDate1String,
    endDate1String,
    startDate2String,
    endDate2String,
    aggregationMethod,
    layerName,
    title,
    cookieStore,
    selectedRoiGeometryInChat,
    maxArea,
    experimental,
  } = args;

  // ROI DEBUG: Log what we received
  console.log('🔍 INSIDE requestGeospatialAnalysis - selectedRoiGeometryInChat:', {
    exists: !!selectedRoiGeometryInChat,
    type: typeof selectedRoiGeometryInChat,
    keys: selectedRoiGeometryInChat ? Object.keys(selectedRoiGeometryInChat) : [],
    hasGeometryProperty: !!selectedRoiGeometryInChat?.geometry,
    hasTypeProperty: !!selectedRoiGeometryInChat?.type,
    hasCoordinatesProperty: !!selectedRoiGeometryInChat?.coordinates,
    fullData: JSON.stringify(selectedRoiGeometryInChat, null, 2)
  });

  // BUG FIX: The frontend now sends geometry directly, not wrapped in .geometry
  // OLD (WRONG): const selectedRoiGeometry = selectedRoiGeometryInChat?.geometry;
  // NEW (CORRECT): Use the ROI data directly since it's already just the geometry
  const selectedRoiGeometry = selectedRoiGeometryInChat;

  console.log('🔍 selectedRoiGeometry after extraction:', {
    exists: !!selectedRoiGeometry,
    type: selectedRoiGeometry?.type,
    hasCoordinates: !!selectedRoiGeometry?.coordinates,
    coordinatesLength: selectedRoiGeometry?.coordinates?.length
  });

  if (!selectedRoiGeometry) {
    return {
      error:
        "It seems you didn't provide a valid region of interest (ROI) for the analysis. you need to provide an ROI through importing a shapefile/geojson file or drawing a shape on the map.",
    };
  }

  if (
    selectedRoiGeometry.type !== "Polygon" &&
    selectedRoiGeometry.type !== "MultiPolygon" &&
    selectedRoiGeometry.type !== "FeatureCollection"
  ) {
    return {
      error:
        "Selected ROI geometry must be a Polygon, MultiPolygon, or a FeatureCollection of polygons.",
    };
  }

  // If it's a FeatureCollection, ensure every feature's geometry is a Polygon or MultiPolygon.
  if (selectedRoiGeometry.type === "FeatureCollection") {
    for (const feature of selectedRoiGeometry.features) {
      if (
        !feature.geometry ||
        (feature.geometry.type !== "Polygon" &&
          feature.geometry.type !== "MultiPolygon")
      ) {
        return {
          error: "All features in the ROI must be polygons.",
        };
      }
    }
  }

  // BUG FIX: Use selectedRoiGeometry directly for area calculations
  // OLD (WRONG): selectedRoiGeometryInChat?.geometry
  // NEW (CORRECT): selectedRoiGeometry
  const geometryAreaCheckResult = checkGeometryAreaIsLessThanThreshold(
    selectedRoiGeometry,
    maxArea
  );
  const areaSqKm = calculateGeometryArea(selectedRoiGeometry);
  
  console.log('🔍 Area calculation result:', {
    geometryAreaCheckResult,
    areaSqKm,
    maxArea
  });

  if (!geometryAreaCheckResult) {
    return {
      error: `The area of the selected region of interest (ROI) is ${areaSqKm} sq km, which exceeds the maximum area limit of ${maxArea} sq km. Please select a smaller ROI and try again.`,
    };
  }

  const url = new URL(
    "/api/gee/request-geospatial-analysis",
    process.env.BASE_URL
  );

  const payload = {
    functionType,
    startDate1: startDate1String,
    endDate1: endDate1String,
    startDate2: startDate2String,
    endDate2: endDate2String,
    aggregationMethod,
    selectedRoiGeometry,
    experimental,
  };

  console.log('🔍 Sending payload to GEE API:', JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: cookieStore || "",
      },
      body: JSON.stringify(payload),
    });

    console.log('🔍 GEE API Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error(
        "Error during fetch:",
        errorData.error || response.statusText
      );
      return NextResponse.json(
        { error: "Failed to run the analysis" },
        { status: 500 }
      );
    }

    const data = await response.json();
    console.log('🔍 GEE API Response data keys:', Object.keys(data));
    console.log('🔍 GEE API Response data:', data);

    // This is not suitable for production, but it's a good way to check if the response is correct
    if (Object.keys(data.mapStats).length === 0) {
      return {
        error: "Something went wrong! Failed to run the analysis.",
      };
    }
    return {
      ...data,
      title,
      layerName,
      functionType,
      startDate1: startDate1String,
      endDate1: endDate1String,
      startDate2: startDate2String,
      endDate2: endDate2String,
      aggregationMethod,
      selectedRoiGeometry: selectedRoiGeometryInChat,
    };
  } catch (error) {
    console.error("Error during fetch:", error);
    return NextResponse.json(
      { error: "Failed to run the analysis" },
      { status: 500 }
    );
  }
}

export async function requestLoadingGeospatialData(args: any) {
  const {
    geospatialDataType,
    dataType,
    selectedRoiGeometryInChat,
    datasetId,
    layerName,
    title,
    startDate,
    endDate,
    divideValue,
    visParams,
    labelNames,
    cookieStore,
  } = args;

  // ROI DEBUG: Log what we received
  console.log('🔍 INSIDE requestLoadingGeospatialData - selectedRoiGeometryInChat:', {
    exists: !!selectedRoiGeometryInChat,
    type: typeof selectedRoiGeometryInChat,
    keys: selectedRoiGeometryInChat ? Object.keys(selectedRoiGeometryInChat) : [],
    hasGeometryProperty: !!selectedRoiGeometryInChat?.geometry,
    hasTypeProperty: !!selectedRoiGeometryInChat?.type,
    fullData: JSON.stringify(selectedRoiGeometryInChat, null, 2)
  });

  // BUG FIX: Same issue as above - use ROI data directly
  // OLD (WRONG): const selectedRoiGeometry = selectedRoiGeometryInChat?.geometry;
  // NEW (CORRECT): Use the ROI data directly
  const selectedRoiGeometry = selectedRoiGeometryInChat;

  if (!selectedRoiGeometry) {
    return {
      error:
        "It seems you didn't provide a valid region of interest (ROI). You need to provide an ROI through importing a shapefile/geojson file or drawing a shape on the map.",
    };
  }

  if (
    selectedRoiGeometry.type !== "Polygon" &&
    selectedRoiGeometry.type !== "MultiPolygon" &&
    selectedRoiGeometry.type !== "FeatureCollection"
  ) {
    return {
      error:
        "Selected ROI geometry must be a Polygon, MultiPolygon, or a FeatureCollection of polygons.",
    };
  }

  if (selectedRoiGeometry.type === "FeatureCollection") {
    for (const feature of selectedRoiGeometry.features) {
      if (
        !feature.geometry ||
        (feature.geometry.type !== "Polygon" &&
          feature.geometry.type !== "MultiPolygon")
      ) {
        return {
          error: "All features in the ROI must be polygons.",
        };
      }
    }
  }

  const url = new URL(
    "/api/gee/request-loading-geospatial-data",
    process.env.BASE_URL
  );

  const payload = {
    geospatialDataType,
    dataType,
    datasetId,
    startDate,
    endDate,
    divideValue,
    visParams,
    labelNames,
    selectedRoiGeometry,
  };

  try {
    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: cookieStore || "",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Error during fetch:", data.error || response.statusText);
      return {
        error:
          typeof data.error === "string"
            ? data.error
            : "Failed to load geospatial data",
      };
    }

    if (!data.urlFormat || Object.keys(data.mapStats).length === 0) {
      return {
        error: "Something went wrong! Failed to load geospatial data.",
      };
    }

    return {
      ...data,
      layerName,
      title,
      datasetId,
      startDate,
      endDate,
      geospatialDataType,
      selectedRoiGeometry: selectedRoiGeometryInChat,
    };
  } catch (error) {
    console.error("Error during fetch:", error);
    return {
      error: "Failed to load geospatial data.",
    };
  }
}

// Tool to request a RAG query
export async function requestRagQuery(args: any) {
  const { query, title } = args; // Extract query parameter from arguments

  try {
    const data = await answerQuery(query);

    return { data, title };
  } catch (error) {
    console.error("Error during RAG fetch:", error);
    return NextResponse.json({ error: "Failed to fetch RAG" }, { status: 500 });
  }
}

// Tool to generate a report based on the conversation history
export async function draftReport(args: any) {
  try {
    const { messages, title, reportFileName } = args;

    const relevantMessages = messages.filter(
      (msg: any) =>
        msg.role === "user" ||
        (msg.role === "assistant" &&
          !msg.content.startsWith("You are an AI Assistant"))
    );

    // Create a prompt that focuses on synthesizing the existing conversation
    const reportPrompt = {
      role: "user",
      content: `Please draft a comprehensive report based on our previous conversation and analyses. The report should NOT inlcude your own comments. 
            Format it with the following structure:
            - Introduction: Brief context and purpose
            - Analyses Performed: Summary of conducted analyses
            - Key Findings: Important results, patterns, and trends
            - Limitations and Caveats: Important constraints
            - Recommendations & Next Steps: Future suggestions."`,
    };

    // Use all relevant conversation history plus the report request
    const conversationContext = [...relevantMessages, reportPrompt];

    const reportResponse = await generateText({
      model: azure("gpt-4o"),
      messages: convertToCoreMessages(conversationContext),
      tools: {}, // Empty tools object since we don't need tools for report generation
    });

    // For simplicity here, assume it's resolved into a single string once complete.
    const report = await reportResponse.text;

    return {
      report,
      title,
      reportFileName,
    };
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { error: "Failed to draft report" },
      { status: 500 }
    );
  }
}

export async function requestWebScraping(args: any) {
  const { url, title } = args;

  try {
    const baseUrl = process.env.BASE_URL;

    const response = await fetch(
      new URL(
        `/api/web-scraper?url=${encodeURIComponent(url)}`,
        baseUrl
      ).toString()
    );
    const result = await response.json();

    if (result.success) {
      return result.data;
    } else {
      return { error: "Failed to scrape the webpage" };
    }
  } catch (error) {
    console.error("Error during fetch:", error);
    return { error: "Failed to scrape the webpage" };
  }
}

// Tool to request WorldPop population analysis
// Tool to request Urban Infrastructure Analysis
export async function requestUrbanInfrastructureAnalysis(args: any) {
  const {
    analysisType,
    infrastructureType,
    trafficDataYear,
    populationDataYear,
    layerName,
    title,
    cookieStore,
    selectedRoiGeometryInChat,
    maxArea,
    thresholds = {},
  } = args;

  // ROI DEBUG: Log what we received
  console.log('🏗️ INSIDE requestUrbanInfrastructureAnalysis - selectedRoiGeometryInChat:', {
    exists: !!selectedRoiGeometryInChat,
    type: typeof selectedRoiGeometryInChat,
    keys: selectedRoiGeometryInChat ? Object.keys(selectedRoiGeometryInChat) : [],
    hasGeometryProperty: !!selectedRoiGeometryInChat?.geometry,
    hasTypeProperty: !!selectedRoiGeometryInChat?.type,
    hasCoordinatesProperty: !!selectedRoiGeometryInChat?.coordinates,
    fullData: JSON.stringify(selectedRoiGeometryInChat, null, 2)
  });

  // Use the ROI data directly since it's already just the geometry
  const selectedRoiGeometry = selectedRoiGeometryInChat;

  console.log('🏗️ selectedRoiGeometry after extraction:', {
    exists: !!selectedRoiGeometry,
    type: selectedRoiGeometry?.type,
    hasCoordinates: !!selectedRoiGeometry?.coordinates,
    coordinatesLength: selectedRoiGeometry?.coordinates?.length
  });

  if (!selectedRoiGeometry) {
    return {
      error:
        "It seems you didn't provide a valid region of interest (ROI) for the infrastructure analysis. You need to provide an ROI through importing a shapefile/geojson file or drawing a shape on the map.",
    };
  }

  if (
    selectedRoiGeometry.type !== "Polygon" &&
    selectedRoiGeometry.type !== "MultiPolygon" &&
    selectedRoiGeometry.type !== "FeatureCollection"
  ) {
    return {
      error:
        "Selected ROI geometry must be a Polygon, MultiPolygon, or a FeatureCollection of polygons.",
    };
  }

  // If it's a FeatureCollection, ensure every feature's geometry is a Polygon or MultiPolygon.
  if (selectedRoiGeometry.type === "FeatureCollection") {
    for (const feature of selectedRoiGeometry.features) {
      if (
        !feature.geometry ||
        (feature.geometry.type !== "Polygon" &&
          feature.geometry.type !== "MultiPolygon")
      ) {
        return {
          error: "All features in the ROI must be polygons.",
        };
      }
    }
  }

  // Check area limits if maxArea is provided
  if (maxArea) {
    const geometryAreaCheckResult = checkGeometryAreaIsLessThanThreshold(
      selectedRoiGeometry,
      maxArea
    );
    const areaSqKm = calculateGeometryArea(selectedRoiGeometry);
    
    console.log('🏗️ Area calculation result:', {
      geometryAreaCheckResult,
      areaSqKm,
      maxArea
    });

    if (!geometryAreaCheckResult) {
      return {
        error: `The area of the selected region of interest (ROI) is ${areaSqKm} sq km, which exceeds the maximum area limit of ${maxArea} sq km. Please select a smaller ROI and try again.`,
      };
    }
  }

  // Validate analysis type
  const validAnalysisTypes = [
    'Flyover and Bridge Requirements',
    'Traffic Congestion Hotspots',
    'Public Transport Accessibility',
    'Road Network Density',
    'Infrastructure Gap Analysis'
  ];
  if (!validAnalysisTypes.includes(analysisType)) {
    return {
      error: `Invalid analysis type. Must be one of: ${validAnalysisTypes.join(', ')}`
    };
  }

  // Validate infrastructure type
  const validInfrastructureTypes = [
    'Roads and Highways',
    'Public Transportation',
    'Pedestrian Infrastructure',
    'Parking Facilities',
    'Traffic Management Systems'
  ];
  if (!validInfrastructureTypes.includes(infrastructureType)) {
    return {
      error: `Invalid infrastructure type. Must be one of: ${validInfrastructureTypes.join(', ')}`
    };
  }

  const url = new URL(
    "/api/urban-planning/request-infrastructure-analysis",
    process.env.BASE_URL
  );

  const payload = {
    analysisType,
    infrastructureType,
    trafficDataYear,
    populationDataYear,
    selectedRoiGeometry,
    thresholds,
  };

  console.log('🏗️ Sending payload to Urban Infrastructure API:', JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: cookieStore || "",
      },
      body: JSON.stringify(payload),
    });

    console.log('🏗️ Urban Infrastructure API Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error(
        "Error during fetch:",
        errorData.error || response.statusText
      );
      return {
        error: "Failed to run the infrastructure analysis"
      };
    }

    const data = await response.json();
    console.log('🏗️ Urban Infrastructure API Response data keys:', Object.keys(data));
    console.log('🏗️ Urban Infrastructure API Response data:', data);

    if (!data.success) {
      return {
        error: data.error || "Something went wrong! Failed to run the infrastructure analysis.",
      };
    }

    return {
      ...data,
      title,
      layerName,
      analysisType,
      infrastructureType,
      trafficDataYear,
      populationDataYear,
      selectedRoiGeometry: selectedRoiGeometryInChat,
    };
  } catch (error) {
    console.error("Error during fetch:", error);
    return {
      error: "Failed to run the infrastructure analysis"
    };
  }
}

// Tool to request Land Value and Investment Analysis
export async function requestLandValueInvestmentAnalysis(args: any) {
  const {
    analysisType,
    investmentCategory,
    timeframe,
    budgetRange,
    layerName,
    title,
    cookieStore,
    selectedRoiGeometryInChat,
    maxArea,
    developmentFactors = [],
  } = args;

  // ROI DEBUG: Log what we received
  console.log('💰 INSIDE requestLandValueInvestmentAnalysis - selectedRoiGeometryInChat:', {
    exists: !!selectedRoiGeometryInChat,
    type: typeof selectedRoiGeometryInChat,
    keys: selectedRoiGeometryInChat ? Object.keys(selectedRoiGeometryInChat) : [],
    hasGeometryProperty: !!selectedRoiGeometryInChat?.geometry,
    hasTypeProperty: !!selectedRoiGeometryInChat?.type,
    hasCoordinatesProperty: !!selectedRoiGeometryInChat?.coordinates,
    fullData: JSON.stringify(selectedRoiGeometryInChat, null, 2)
  });

  // Use the ROI data directly since it's already just the geometry
  const selectedRoiGeometry = selectedRoiGeometryInChat;

  if (!selectedRoiGeometry) {
    return {
      error:
        "It seems you didn't provide a valid region of interest (ROI) for the investment analysis. You need to provide an ROI through importing a shapefile/geojson file or drawing a shape on the map.",
    };
  }

  if (
    selectedRoiGeometry.type !== "Polygon" &&
    selectedRoiGeometry.type !== "MultiPolygon" &&
    selectedRoiGeometry.type !== "FeatureCollection"
  ) {
    return {
      error:
        "Selected ROI geometry must be a Polygon, MultiPolygon, or a FeatureCollection of polygons.",
    };
  }

  // If it's a FeatureCollection, ensure every feature's geometry is a Polygon or MultiPolygon.
  if (selectedRoiGeometry.type === "FeatureCollection") {
    for (const feature of selectedRoiGeometry.features) {
      if (
        !feature.geometry ||
        (feature.geometry.type !== "Polygon" &&
          feature.geometry.type !== "MultiPolygon")
      ) {
        return {
          error: "All features in the ROI must be polygons.",
        };
      }
    }
  }

  // Check area limits if maxArea is provided
  if (maxArea) {
    const geometryAreaCheckResult = checkGeometryAreaIsLessThanThreshold(
      selectedRoiGeometry,
      maxArea
    );
    const areaSqKm = calculateGeometryArea(selectedRoiGeometry);

    if (!geometryAreaCheckResult) {
      return {
        error: `The area of the selected region of interest (ROI) is ${areaSqKm} sq km, which exceeds the maximum area limit of ${maxArea} sq km. Please select a smaller ROI and try again.`,
      };
    }
  }

  // Validate analysis type
  const validAnalysisTypes = [
    'Property Value Trends',
    'Investment Potential Mapping',
    'Gentrification Risk Assessment',
    'Development Opportunity Analysis',
    'Market Saturation Analysis'
  ];
  if (!validAnalysisTypes.includes(analysisType)) {
    return {
      error: `Invalid analysis type. Must be one of: ${validAnalysisTypes.join(', ')}`
    };
  }

  const url = new URL(
    "/api/urban-planning/request-investment-analysis",
    process.env.BASE_URL
  );

  const payload = {
    analysisType,
    investmentCategory,
    timeframe,
    budgetRange,
    selectedRoiGeometry,
    developmentFactors,
  };

  console.log('💰 Sending payload to Investment Analysis API:', JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: cookieStore || "",
      },
      body: JSON.stringify(payload),
    });

    console.log('💰 Investment Analysis API Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error(
        "Error during fetch:",
        errorData.error || response.statusText
      );
      return {
        error: "Failed to run the investment analysis"
      };
    }

    const data = await response.json();
    console.log('💰 Investment Analysis API Response data keys:', Object.keys(data));
    console.log('💰 Investment Analysis API Response data:', data);

    if (!data.success) {
      return {
        error: data.error || "Something went wrong! Failed to run the investment analysis.",
      };
    }

    return {
      ...data,
      title,
      layerName,
      analysisType,
      investmentCategory,
      timeframe,
      budgetRange,
      selectedRoiGeometry: selectedRoiGeometryInChat,
    };
  } catch (error) {
    console.error("Error during fetch:", error);
    return {
      error: "Failed to run the investment analysis"
    };
  }
}

export async function requestWorldPopPopulationAnalysis(args: any) {
  const {
    analysisType,
    country,
    year1String,
    year2String,
    resolution = '100m',
    format = 'json',
    layerName,
    title,
    cookieStore,
    selectedRoiGeometryInChat,
    maxArea,
  } = args;

  // ROI DEBUG: Log what we received
  console.log('🌍 INSIDE requestWorldPopPopulationAnalysis - selectedRoiGeometryInChat:', {
    exists: !!selectedRoiGeometryInChat,
    type: typeof selectedRoiGeometryInChat,
    keys: selectedRoiGeometryInChat ? Object.keys(selectedRoiGeometryInChat) : [],
    hasGeometryProperty: !!selectedRoiGeometryInChat?.geometry,
    hasTypeProperty: !!selectedRoiGeometryInChat?.type,
    hasCoordinatesProperty: !!selectedRoiGeometryInChat?.coordinates,
    fullData: JSON.stringify(selectedRoiGeometryInChat, null, 2)
  });

  // BUG FIX: The frontend now sends geometry directly, not wrapped in .geometry
  const selectedRoiGeometry = selectedRoiGeometryInChat;

  console.log('🌍 selectedRoiGeometry after extraction:', {
    exists: !!selectedRoiGeometry,
    type: selectedRoiGeometry?.type,
    hasCoordinates: !!selectedRoiGeometry?.coordinates,
    coordinatesLength: selectedRoiGeometry?.coordinates?.length
  });

  if (!selectedRoiGeometry) {
    return {
      error:
        "It seems you didn't provide a valid region of interest (ROI) for the population analysis. You need to provide an ROI through importing a shapefile/geojson file or drawing a shape on the map.",
    };
  }

  if (
    selectedRoiGeometry.type !== "Polygon" &&
    selectedRoiGeometry.type !== "MultiPolygon" &&
    selectedRoiGeometry.type !== "FeatureCollection"
  ) {
    return {
      error:
        "Selected ROI geometry must be a Polygon, MultiPolygon, or a FeatureCollection of polygons.",
    };
  }

  // If it's a FeatureCollection, ensure every feature's geometry is a Polygon or MultiPolygon.
  if (selectedRoiGeometry.type === "FeatureCollection") {
    for (const feature of selectedRoiGeometry.features) {
      if (
        !feature.geometry ||
        (feature.geometry.type !== "Polygon" &&
          feature.geometry.type !== "MultiPolygon")
      ) {
        return {
          error: "All features in the ROI must be polygons.",
        };
      }
    }
  }

  // Check area limits if maxArea is provided
  if (maxArea) {
    const geometryAreaCheckResult = checkGeometryAreaIsLessThanThreshold(
      selectedRoiGeometry,
      maxArea
    );
    const areaSqKm = calculateGeometryArea(selectedRoiGeometry);
    
    console.log('🌍 Area calculation result:', {
      geometryAreaCheckResult,
      areaSqKm,
      maxArea
    });

    if (!geometryAreaCheckResult) {
      return {
        error: `The area of the selected region of interest (ROI) is ${areaSqKm} sq km, which exceeds the maximum area limit of ${maxArea} sq km. Please select a smaller ROI and try again.`,
      };
    }
  }

  // Validate analysis type
  const validAnalysisTypes = ['Population Data', 'Population Density', 'Population Change'];
  if (!validAnalysisTypes.includes(analysisType)) {
    return {
      error: `Invalid analysis type. Must be one of: ${validAnalysisTypes.join(', ')}`
    };
  }

  // Validate country
  if (!country || typeof country !== 'string') {
    return {
      error: 'Country is required and must be a valid string'
    };
  }

  // Validate years based on analysis type
  if (analysisType === 'Population Change') {
    if (!year1String || !year2String) {
      return {
        error: 'Both start year and end year are required for population change analysis'
      };
    }
    const year1 = parseInt(year1String);
    const year2 = parseInt(year2String);
    if (year1 >= year2) {
      return {
        error: 'Start year must be less than end year'
      };
    }
  } else {
    if (!year1String) {
      return {
        error: 'Year is required for population analysis'
      };
    }
  }

  const url = new URL(
    "/api/worldpop/request-population-analysis",
    process.env.BASE_URL
  );

  const payload = {
    analysisType,
    country,
    year1: year1String,
    year2: year2String,
    selectedRoiGeometry,
    resolution,
    format,
  };

  console.log('🌍 Sending payload to WorldPop API:', JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: cookieStore || "",
      },
      body: JSON.stringify(payload),
    });

    console.log('🌍 WorldPop API Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error(
        "Error during fetch:",
        errorData.error || response.statusText
      );
      return {
        error: "Failed to run the population analysis"
      };
    }

    const data = await response.json();
    console.log('🌍 WorldPop API Response data keys:', Object.keys(data));
    console.log('🌍 WorldPop API Response data:', data);

    if (!data.success) {
      return {
        error: data.error || "Something went wrong! Failed to run the population analysis.",
      };
    }

    return {
      ...data,
      title,
      layerName,
      analysisType,
      country,
      year1: year1String,
      year2: year2String,
      resolution,
      format,
      selectedRoiGeometry: selectedRoiGeometryInChat,
    };
  } catch (error) {
    console.error("Error during fetch:", error);
    return {
      error: "Failed to run the population analysis"
    };
  }
}

// Tool to request Flood Risk and Drainage Analysis
export async function requestFloodRiskDrainageAnalysis(args: any) {
  const {
    analysisType,
    floodType,
    returnPeriod,
    vulnerabilityFactors = [],
    layerName,
    title,
    cookieStore,
    selectedRoiGeometryInChat,
    maxArea,
  } = args;

  console.log('🌊 INSIDE requestFloodRiskDrainageAnalysis - selectedRoiGeometryInChat:', {
    exists: !!selectedRoiGeometryInChat,
    type: typeof selectedRoiGeometryInChat,
    fullData: JSON.stringify(selectedRoiGeometryInChat, null, 2)
  });

  const selectedRoiGeometry = selectedRoiGeometryInChat;

  if (!selectedRoiGeometry) {
    return {
      error:
        "It seems you didn't provide a valid region of interest (ROI) for the flood risk analysis. You need to provide an ROI through importing a shapefile/geojson file or drawing a shape on the map.",
    };
  }

  if (
    selectedRoiGeometry.type !== "Polygon" &&
    selectedRoiGeometry.type !== "MultiPolygon" &&
    selectedRoiGeometry.type !== "FeatureCollection"
  ) {
    return {
      error:
        "Selected ROI geometry must be a Polygon, MultiPolygon, or a FeatureCollection of polygons.",
    };
  }

  if (selectedRoiGeometry.type === "FeatureCollection") {
    for (const feature of selectedRoiGeometry.features) {
      if (
        !feature.geometry ||
        (feature.geometry.type !== "Polygon" &&
          feature.geometry.type !== "MultiPolygon")
      ) {
        return {
          error: "All features in the ROI must be polygons.",
        };
      }
    }
  }

  if (maxArea) {
    const geometryAreaCheckResult = checkGeometryAreaIsLessThanThreshold(
      selectedRoiGeometry,
      maxArea
    );
    const areaSqKm = calculateGeometryArea(selectedRoiGeometry);

    if (!geometryAreaCheckResult) {
      return {
        error: `The area of the selected region of interest (ROI) is ${areaSqKm} sq km, which exceeds the maximum area limit of ${maxArea} sq km. Please select a smaller ROI and try again.`,
      };
    }
  }

  const validAnalysisTypes = [
    'Flood Risk Mapping',
    'Drainage System Assessment',
    'Stormwater Management',
    'Vulnerability Assessment',
    'Emergency Response Planning'
  ];
  if (!validAnalysisTypes.includes(analysisType)) {
    return {
      error: `Invalid analysis type. Must be one of: ${validAnalysisTypes.join(', ')}`
    };
  }

  const url = new URL(
    "/api/urban-planning/request-flood-risk-analysis",
    process.env.BASE_URL
  );

  const payload = {
    analysisType,
    floodType,
    returnPeriod,
    vulnerabilityFactors,
    selectedRoiGeometry,
  };

  console.log('🌊 Sending payload to Flood Risk API:', JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: cookieStore || "",
      },
      body: JSON.stringify(payload),
    });

    console.log('🌊 Flood Risk API Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error(
        "Error during fetch:",
        errorData.error || response.statusText
      );
      return {
        error: "Failed to run the flood risk analysis"
      };
    }

    const data = await response.json();
    console.log('🌊 Flood Risk API Response data:', data);

    if (!data.success) {
      return {
        error: data.error || "Something went wrong! Failed to run the flood risk analysis.",
      };
    }

    return {
      ...data,
      title,
      layerName,
      analysisType,
      floodType,
      returnPeriod,
      selectedRoiGeometry: selectedRoiGeometryInChat,
    };
  } catch (error) {
    console.error("Error during fetch:", error);
    return {
      error: "Failed to run the flood risk analysis"
    };
  }
}

// Tool to request Green Space and Heat Island Analysis
export async function requestGreenSpaceHeatIslandAnalysis(args: any) {
  const {
    analysisType,
    vegetationIndex,
    seasonalComparison,
    heatMitigationStrategy,
    layerName,
    title,
    cookieStore,
    selectedRoiGeometryInChat,
    maxArea,
  } = args;

  console.log('🌳 INSIDE requestGreenSpaceHeatIslandAnalysis - selectedRoiGeometryInChat:', {
    exists: !!selectedRoiGeometryInChat,
    type: typeof selectedRoiGeometryInChat,
    fullData: JSON.stringify(selectedRoiGeometryInChat, null, 2)
  });

  const selectedRoiGeometry = selectedRoiGeometryInChat;

  if (!selectedRoiGeometry) {
    return {
      error:
        "It seems you didn't provide a valid region of interest (ROI) for the green space analysis. You need to provide an ROI through importing a shapefile/geojson file or drawing a shape on the map.",
    };
  }

  if (
    selectedRoiGeometry.type !== "Polygon" &&
    selectedRoiGeometry.type !== "MultiPolygon" &&
    selectedRoiGeometry.type !== "FeatureCollection"
  ) {
    return {
      error:
        "Selected ROI geometry must be a Polygon, MultiPolygon, or a FeatureCollection of polygons.",
    };
  }

  if (selectedRoiGeometry.type === "FeatureCollection") {
    for (const feature of selectedRoiGeometry.features) {
      if (
        !feature.geometry ||
        (feature.geometry.type !== "Polygon" &&
          feature.geometry.type !== "MultiPolygon")
      ) {
        return {
          error: "All features in the ROI must be polygons.",
        };
      }
    }
  }

  if (maxArea) {
    const geometryAreaCheckResult = checkGeometryAreaIsLessThanThreshold(
      selectedRoiGeometry,
      maxArea
    );
    const areaSqKm = calculateGeometryArea(selectedRoiGeometry);

    if (!geometryAreaCheckResult) {
      return {
        error: `The area of the selected region of interest (ROI) is ${areaSqKm} sq km, which exceeds the maximum area limit of ${maxArea} sq km. Please select a smaller ROI and try again.`,
      };
    }
  }

  const validAnalysisTypes = [
    'Green Space Coverage Assessment',
    'Urban Heat Island Mapping',
    'Tree Canopy Analysis',
    'Heat Mitigation Planning',
    'Vegetation Health Monitoring'
  ];
  if (!validAnalysisTypes.includes(analysisType)) {
    return {
      error: `Invalid analysis type. Must be one of: ${validAnalysisTypes.join(', ')}`
    };
  }

  const url = new URL(
    "/api/urban-planning/request-green-space-analysis",
    process.env.BASE_URL
  );

  const payload = {
    analysisType,
    vegetationIndex,
    seasonalComparison,
    heatMitigationStrategy,
    selectedRoiGeometry,
  };

  console.log('🌳 Sending payload to Green Space API:', JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: cookieStore || "",
      },
      body: JSON.stringify(payload),
    });

    console.log('🌳 Green Space API Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error(
        "Error during fetch:",
        errorData.error || response.statusText
      );
      return {
        error: "Failed to run the green space analysis"
      };
    }

    const data = await response.json();
    console.log('🌳 Green Space API Response data:', data);

    if (!data.success) {
      return {
        error: data.error || "Something went wrong! Failed to run the green space analysis.",
      };
    }

    return {
      ...data,
      title,
      layerName,
      analysisType,
      vegetationIndex,
      seasonalComparison,
      heatMitigationStrategy,
      selectedRoiGeometry: selectedRoiGeometryInChat,
    };
  } catch (error) {
    console.error("Error during fetch:", error);
    return {
      error: "Failed to run the green space analysis"
    };
  }
}

// Tool to request Public Transportation Optimization Analysis
export async function requestPublicTransportOptimizationAnalysis(args: any) {
  const {
    analysisType,
    transportModes = [],
    accessibilityThreshold,
    serviceFrequency,
    layerName,
    title,
    cookieStore,
    selectedRoiGeometryInChat,
    maxArea,
  } = args;

  console.log('🚌 INSIDE requestPublicTransportOptimizationAnalysis - selectedRoiGeometryInChat:', {
    exists: !!selectedRoiGeometryInChat,
    type: typeof selectedRoiGeometryInChat,
    fullData: JSON.stringify(selectedRoiGeometryInChat, null, 2)
  });

  const selectedRoiGeometry = selectedRoiGeometryInChat;

  if (!selectedRoiGeometry) {
    return {
      error:
        "It seems you didn't provide a valid region of interest (ROI) for the transportation analysis. You need to provide an ROI through importing a shapefile/geojson file or drawing a shape on the map.",
    };
  }

  if (
    selectedRoiGeometry.type !== "Polygon" &&
    selectedRoiGeometry.type !== "MultiPolygon" &&
    selectedRoiGeometry.type !== "FeatureCollection"
  ) {
    return {
      error:
        "Selected ROI geometry must be a Polygon, MultiPolygon, or a FeatureCollection of polygons.",
    };
  }

  if (selectedRoiGeometry.type === "FeatureCollection") {
    for (const feature of selectedRoiGeometry.features) {
      if (
        !feature.geometry ||
        (feature.geometry.type !== "Polygon" &&
          feature.geometry.type !== "MultiPolygon")
      ) {
        return {
          error: "All features in the ROI must be polygons.",
        };
      }
    }
  }

  if (maxArea) {
    const geometryAreaCheckResult = checkGeometryAreaIsLessThanThreshold(
      selectedRoiGeometry,
      maxArea
    );
    const areaSqKm = calculateGeometryArea(selectedRoiGeometry);

    if (!geometryAreaCheckResult) {
      return {
        error: `The area of the selected region of interest (ROI) is ${areaSqKm} sq km, which exceeds the maximum area limit of ${maxArea} sq km. Please select a smaller ROI and try again.`,
      };
    }
  }

  const validAnalysisTypes = [
    'Transit Accessibility Analysis',
    'Service Gap Identification',
    'Route Optimization',
    'Modal Connectivity Assessment',
    'Public Transport Demand Modeling'
  ];
  if (!validAnalysisTypes.includes(analysisType)) {
    return {
      error: `Invalid analysis type. Must be one of: ${validAnalysisTypes.join(', ')}`
    };
  }

  const url = new URL(
    "/api/urban-planning/request-transport-optimization-analysis",
    process.env.BASE_URL
  );

  const payload = {
    analysisType,
    transportModes,
    accessibilityThreshold,
    serviceFrequency,
    selectedRoiGeometry,
  };

  console.log('🚌 Sending payload to Transport Optimization API:', JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: cookieStore || "",
      },
      body: JSON.stringify(payload),
    });

    console.log('🚌 Transport Optimization API Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error(
        "Error during fetch:",
        errorData.error || response.statusText
      );
      return {
        error: "Failed to run the transportation optimization analysis"
      };
    }

    const data = await response.json();
    console.log('🚌 Transport Optimization API Response data:', data);

    if (!data.success) {
      return {
        error: data.error || "Something went wrong! Failed to run the transportation optimization analysis.",
      };
    }

    return {
      ...data,
      title,
      layerName,
      analysisType,
      transportModes,
      accessibilityThreshold,
      serviceFrequency,
      selectedRoiGeometry: selectedRoiGeometryInChat,
    };
  } catch (error) {
    console.error("Error during fetch:", error);
    return {
      error: "Failed to run the transportation optimization analysis"
    };
  }
}