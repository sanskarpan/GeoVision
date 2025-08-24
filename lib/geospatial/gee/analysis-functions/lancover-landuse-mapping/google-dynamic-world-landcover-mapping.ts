"use server";
import ee from "@google/earthengine";
import { evaluate, getMapId } from "@/features/maps/utils/gee-eval-utils";
// Supabase removed for local testing

interface LegendConfig {
  labelNames: string[];
  palette: string[];
}

interface DynamicWorldResult {
  urlFormat: string;
  geojson: any;
  legendConfig: LegendConfig;
  mapStats: Record<string, string>;
  extraDescription: string;
}

export default async function googleDynamicWorldMapping(
  geometry: any,
  startDate: string,
  endDate: string
): Promise<DynamicWorldResult> {
  // No authentication required for local testing

  console.log(`🗺️ [GoogleDynamicWorld] Starting analysis:`, {
    hasGeometry: !!geometry,
    geometryType: geometry?.type,
    coordinatesCount: geometry?.coordinates?.[0]?.length || 0,
    startDate,
    endDate
  });

  // Validate geometry input
  if (!geometry || !geometry.coordinates || geometry.coordinates[0]?.length < 3) {
    console.error(`❌ [GoogleDynamicWorld] Invalid geometry:`, {
      geometry: geometry,
      reason: !geometry ? 'No geometry provided' : 
               !geometry.coordinates ? 'No coordinates' : 
               'Insufficient coordinates (need at least 3)'
    });
    throw new Error('Invalid geometry provided for analysis');
  }

  const dynamicWorld = ee
    .ImageCollection("GOOGLE/DYNAMICWORLD/V1")
    .filterBounds(geometry)
    .filterDate(startDate, endDate)
    .select("label")
    .mode()
    .clip(geometry);

  console.log(`🔍 [GoogleDynamicWorld] Image collection created and filtered`);

  const labelNames: string[] = [
    "Water",
    "Trees",
    "Grass",
    "Flooded Vegetation",
    "Crops",
    "Shrub & Scrub",
    "Built Area",
    "Bare Ground",
    "Snow & Ice",
  ];

  const palette: string[] = [
    "#419BDF", // Water
    "#397D49", // Trees
    "#88B053", // Grass
    "#7A87C6", // Flooded Vegetation
    "#E49635", // Crops
    "#DFC35A", // Shrub & Scrub
    "#C4281B", // Built Area
    "#A59B8F", // Bare Ground
    "#D1DDF9", // Snow & Ice
  ];

  console.log(`📊 [GoogleDynamicWorld] Starting reduceRegion operation...`);

  const classOccurrences = dynamicWorld
    .reduceRegion({
      reducer: ee.Reducer.frequencyHistogram(),
      geometry,
      scale: 30,
      tileScale: 16,
      maxPixels: 1e100,
      bestEffort: true,
    })
    .get("label");

  let mapStats: Record<string, string> = {};

  try {
    console.log(`⏳ [GoogleDynamicWorld] Evaluating class occurrences...`);
    
    await classOccurrences.evaluate((histogram: { [key: string]: number }) => {
      console.log(`📈 [GoogleDynamicWorld] Histogram result:`, {
        hasHistogram: !!histogram,
        histogramType: typeof histogram,
        histogramKeys: histogram ? Object.keys(histogram) : [],
        histogramValues: histogram ? Object.values(histogram) : []
      });

      if (!histogram) {
        console.warn(`⚠️ [GoogleDynamicWorld] No histogram data returned - mapStats will be empty`);
        mapStats = {};
        return;
      }

      const total = Object.values(histogram).reduce(
        (sum, count) => sum + count,
        0
      );

      console.log(`🔢 [GoogleDynamicWorld] Total pixel count: ${total}`);

      if (total === 0) {
        console.warn(`⚠️ [GoogleDynamicWorld] Total pixel count is 0 - mapStats will be empty`);
        mapStats = {};
        return;
      }

      // Convert raw counts to percentages
      mapStats = Object.fromEntries(
        Object.entries(histogram).map(([key, value]) => {
          const labelIndex = parseInt(key, 10);
          const className = labelNames[labelIndex] ?? `Class_${key}`;
          const percentage = ((value / total) * 100).toFixed(2);
          return [className, percentage];
        })
      );

      console.log(`✅ [GoogleDynamicWorld] MapStats generated successfully:`, {
        statsCount: Object.keys(mapStats).length,
        sampleStats: Object.entries(mapStats).slice(0, 3) // Log first 3 entries
      });

    });
  } catch (error) {
    console.error(`❌ [GoogleDynamicWorld] Error during histogram evaluation:`, {
      error: error instanceof Error ? error.message : String(error),
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      stack: error instanceof Error ? error.stack : 'No stack trace available'
    });
    mapStats = {};
  }

  // Log final mapStats state
  console.log(`📊 [GoogleDynamicWorld] Final mapStats state:`, {
    isEmpty: Object.keys(mapStats).length === 0,
    statsCount: Object.keys(mapStats).length,
    hasData: Object.keys(mapStats).length > 0
  });

  const visualization = {
    min: 0,
    max: 8,
    palette,
  };

  console.log(`🖼️ [GoogleDynamicWorld] Generating map visualization...`);

  const { urlFormat } = (await getMapId(dynamicWorld, visualization)) as any;
  const imageGeom = dynamicWorld.geometry();
  const imageGeometryGeojson = await evaluate(imageGeom);

  console.log(`✅ [GoogleDynamicWorld] Analysis completed successfully`);

  return {
    urlFormat,
    geojson: imageGeometryGeojson,
    legendConfig: { labelNames, palette },
    mapStats,
    extraDescription: ``,
  };
}
