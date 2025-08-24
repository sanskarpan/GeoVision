"use client";

import React from "react";
import * as echarts from "echarts/core";
import {
  BarChart,
  LineChart,
  PieChart,
  RadarChart,
  ScatterChart
} from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  RadarComponent
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import ReactECharts from "echarts-for-react";
import { useTheme } from "next-themes";

// Register required components
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  RadarComponent,
  BarChart,
  LineChart,
  PieChart,
  RadarChart,
  ScatterChart,
  CanvasRenderer
]);

interface FlaskInsightsChartProps {
  insights: Array<{
    title: string;
    category: string;
    content: string;
    priority: "high" | "medium" | "low";
    confidence?: number;
  }>;
  chartTitle: string;
  theme?: string;
}

interface UrbanMetricsRadarChartProps {
  urbanMetrics: {
    quality_scores?: {
      infrastructure_score?: number;
      satellite_quality_score?: number;
      environmental_score?: number;
      overall_score?: number;
    };
    infrastructure?: {
      building_density?: number;
      road_network_density?: number;
      amenity_accessibility?: number;
    };
    development?: {
      population_density?: number;
      urbanization_rate?: number;
      satellite_coverage?: number;
    };
    environment?: {
      green_space_ratio?: number;
      natural_features_count?: number;
    };
  };
  chartTitle: string;
  theme?: string;
}

interface DataSourceQualityChartProps {
  dataSources: {
    osm_data?: boolean;
    satellite_data?: boolean;
    demographic_data?: boolean;
    data_completeness?: string;
  };
  chartTitle: string;
  theme?: string;
}

/**
 * Chart for displaying Flask API insights by priority and category
 */
export const FlaskInsightsChart: React.FC<FlaskInsightsChartProps> = ({
  insights,
  chartTitle,
  theme
}) => {
  const { theme: currentTheme } = useTheme();
  const isDark = (theme || currentTheme) === "dark";

  // Process insights data for visualization
  const priorityData = insights.reduce((acc, insight) => {
    acc[insight.priority] = (acc[insight.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = insights.reduce((acc, insight) => {
    acc[insight.category] = (acc[insight.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const option = {
    title: {
      text: chartTitle,
      textStyle: {
        color: isDark ? "#e5e7eb" : "#1f2937",
        fontSize: 14,
        fontWeight: "bold"
      }
    },
    tooltip: {
      trigger: "item",
      backgroundColor: isDark ? "#374151" : "#ffffff",
      borderColor: isDark ? "#6b7280" : "#e5e7eb",
      textStyle: {
        color: isDark ? "#f9fafb" : "#111827"
      }
    },
    legend: {
      top: "bottom",
      textStyle: {
        color: isDark ? "#e5e7eb" : "#374151"
      }
    },
    series: [
      {
        name: "By Priority",
        type: "pie",
        radius: ["20%", "40%"],
        center: ["25%", "45%"],
        data: Object.entries(priorityData).map(([priority, count]) => ({
          value: count,
          name: priority,
          itemStyle: {
            color: priority === "high" ? "#ef4444" : 
                   priority === "medium" ? "#f59e0b" : "#10b981"
          }
        })),
        label: {
          fontSize: 12,
          color: isDark ? "#e5e7eb" : "#374151"
        }
      },
      {
        name: "By Category",
        type: "pie", 
        radius: ["50%", "70%"],
        center: ["75%", "45%"],
        data: Object.entries(categoryData).map(([category, count]) => ({
          value: count,
          name: category,
          itemStyle: {
            color: category === "infrastructure" ? "#3b82f6" :
                   category === "environment" ? "#10b981" :
                   category === "monitoring" ? "#8b5cf6" :
                   category === "demographics" ? "#f59e0b" : "#6b7280"
          }
        })),
        label: {
          fontSize: 12,
          color: isDark ? "#e5e7eb" : "#374151"
        }
      }
    ]
  };

  return (
    <div className="w-full h-96">
      <ReactECharts 
        option={option} 
        style={{ height: "100%", width: "100%" }}
        theme={isDark ? "dark" : "light"}
      />
    </div>
  );
};

/**
 * Radar chart for urban metrics visualization
 */
export const UrbanMetricsRadarChart: React.FC<UrbanMetricsRadarChartProps> = ({
  urbanMetrics,
  chartTitle,
  theme
}) => {
  const { theme: currentTheme } = useTheme();
  const isDark = (theme || currentTheme) === "dark";

  // Prepare radar chart data
  const indicators = [
    { name: 'Infrastructure', max: 100 },
    { name: 'Environment', max: 100 },
    { name: 'Development', max: 100 },
    { name: 'Data Quality', max: 100 },
    { name: 'Overall Score', max: 100 }
  ];

  const data = [
    urbanMetrics.quality_scores?.infrastructure_score || 0,
    urbanMetrics.quality_scores?.environmental_score || 0,
    (urbanMetrics.development?.urbanization_rate || 0) * 1.2, // Scale to 0-100
    urbanMetrics.quality_scores?.satellite_quality_score || 0,
    urbanMetrics.quality_scores?.overall_score || 0
  ];

  const option = {
    title: {
      text: chartTitle,
      textStyle: {
        color: isDark ? "#e5e7eb" : "#1f2937",
        fontSize: 14,
        fontWeight: "bold"
      }
    },
    tooltip: {
      backgroundColor: isDark ? "#374151" : "#ffffff",
      borderColor: isDark ? "#6b7280" : "#e5e7eb",
      textStyle: {
        color: isDark ? "#f9fafb" : "#111827"
      }
    },
    radar: {
      indicator: indicators,
      axisName: {
        color: isDark ? "#e5e7eb" : "#374151",
        fontSize: 12
      },
      axisLine: {
        lineStyle: {
          color: isDark ? "#6b7280" : "#d1d5db"
        }
      },
      splitLine: {
        lineStyle: {
          color: isDark ? "#6b7280" : "#d1d5db"
        }
      }
    },
    series: [{
      type: 'radar',
      data: [{
        value: data,
        name: 'Urban Metrics',
        areaStyle: {
          color: isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'
        },
        lineStyle: {
          color: '#3b82f6',
          width: 2
        },
        itemStyle: {
          color: '#3b82f6'
        }
      }]
    }]
  };

  return (
    <div className="w-full h-96">
      <ReactECharts 
        option={option} 
        style={{ height: "100%", width: "100%" }}
        theme={isDark ? "dark" : "light"}
      />
    </div>
  );
};

/**
 * Data source quality visualization
 */
export const DataSourceQualityChart: React.FC<DataSourceQualityChartProps> = ({
  dataSources,
  chartTitle,
  theme
}) => {
  const { theme: currentTheme } = useTheme();
  const isDark = (theme || currentTheme) === "dark";

  const sources = [
    { name: "OpenStreetMap", available: dataSources.osm_data || false },
    { name: "Satellite Data", available: dataSources.satellite_data || false },
    { name: "Demographic Data", available: dataSources.demographic_data || false }
  ];

  const option = {
    title: {
      text: chartTitle,
      textStyle: {
        color: isDark ? "#e5e7eb" : "#1f2937",
        fontSize: 14,
        fontWeight: "bold"
      }
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: isDark ? "#374151" : "#ffffff",
      borderColor: isDark ? "#6b7280" : "#e5e7eb",
      textStyle: {
        color: isDark ? "#f9fafb" : "#111827"
      }
    },
    xAxis: {
      type: "category",
      data: sources.map(s => s.name),
      axisLabel: {
        color: isDark ? "#e5e7eb" : "#374151",
        fontSize: 12
      },
      axisLine: {
        lineStyle: {
          color: isDark ? "#6b7280" : "#d1d5db"
        }
      }
    },
    yAxis: {
      type: "value",
      min: 0,
      max: 1,
      axisLabel: {
        color: isDark ? "#e5e7eb" : "#374151",
        fontSize: 12,
        formatter: (value: number) => value === 1 ? "Available" : "Unavailable"
      },
      axisLine: {
        lineStyle: {
          color: isDark ? "#6b7280" : "#d1d5db"
        }
      },
      splitLine: {
        lineStyle: {
          color: isDark ? "#6b7280" : "#d1d5db"
        }
      }
    },
    series: [{
      type: "bar",
      data: sources.map(s => ({
        value: s.available ? 1 : 0,
        itemStyle: {
          color: s.available ? "#10b981" : "#ef4444"
        }
      })),
      barWidth: "60%"
    }]
  };

  return (
    <div className="w-full h-80">
      <ReactECharts 
        option={option} 
        style={{ height: "100%", width: "100%" }}
        theme={isDark ? "dark" : "light"}
      />
    </div>
  );
};

/**
 * Main Flask API charts container
 */
interface FlaskAPIChartsProps {
  data: {
    insights?: any[];
    urban_metrics?: any;
    summary?: any;
    mapStats?: any;
  };
  chartTitle: string;
  functionType: string;
}

export const FlaskAPICharts: React.FC<FlaskAPIChartsProps> = ({
  data,
  chartTitle,
  functionType
}) => {
  const { theme } = useTheme();

  // Determine which charts to show based on function type and available data
  const showInsights = data.insights && data.insights.length > 0;
  const showUrbanMetrics = data.urban_metrics && data.urban_metrics.quality_scores;
  const showDataQuality = data.urban_metrics && data.urban_metrics.data_availability;

  return (
    <div className="space-y-6">
      {showInsights && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <FlaskInsightsChart
            insights={data.insights}
            chartTitle={`${chartTitle} - Insights Analysis`}
            theme={theme}
          />
        </div>
      )}
      
      {showUrbanMetrics && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <UrbanMetricsRadarChart
            urbanMetrics={data.urban_metrics}
            chartTitle={`${chartTitle} - Urban Metrics`}
            theme={theme}
          />
        </div>
      )}
      
      {showDataQuality && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <DataSourceQualityChart
            dataSources={data.urban_metrics.data_availability}
            chartTitle={`${chartTitle} - Data Source Quality`}
            theme={theme}
          />
        </div>
      )}
      
      {!showInsights && !showUrbanMetrics && !showDataQuality && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border text-center text-gray-500">
          No chart data available for Flask API analysis.
        </div>
      )}
    </div>
  );
};

export default FlaskAPICharts;
