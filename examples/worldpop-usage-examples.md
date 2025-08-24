# WorldPop Integration Usage Examples

This document provides practical examples of how to use the WorldPop population analysis features in GeoVision.

## Example 1: Basic Population Data Request

**User Query:**
```
"Can you analyze the population data for Germany in 2020?"
```

**AI Response:**
I'll analyze the population data for Germany in 2020 using WorldPop datasets. This will give us comprehensive population statistics including total population, density, and area coverage.

**Tool Call:**
```typescript
requestWorldPopPopulationAnalysis({
  analysisType: "Population Data",
  country: "Germany",
  year1String: "2020",
  resolution: "100m",
  format: "json",
  layerName: "Germany Population 2020",
  title: "Analyzing population data for Germany in 2020"
})
```

**Expected Output:**
- Total population count
- Population density (people/km²)
- Geographic area coverage
- Metadata about the data source and resolution

## Example 2: Population Density Analysis

**User Query:**
```
"I need to understand population density patterns in India for urban planning purposes."
```

**AI Response:**
I'll analyze the population density patterns in India to help with your urban planning. This analysis will show how population is distributed across different regions, which is crucial for infrastructure planning.

**Tool Call:**
```typescript
requestWorldPopPopulationAnalysis({
  analysisType: "Population Density",
  country: "India",
  year1String: "2021",
  resolution: "1km",
  format: "json",
  layerName: "India Population Density 2021",
  title: "Analyzing population density patterns in India for urban planning"
})
```

**Expected Output:**
- High-resolution density maps
- Identification of high and low-density areas
- Urban vs rural population distribution
- Insights for service delivery planning

## Example 3: Population Change Analysis

**User Query:**
```
"Show me how Brazil's population has changed from 2010 to 2020 and what this means for urban development."
```

**AI Response:**
I'll analyze Brazil's population changes from 2010 to 2020 to understand urbanization trends and their implications for urban development. This will include growth rates, density changes, and recommendations for planning.

**Tool Call:**
```typescript
requestWorldPopPopulationAnalysis({
  analysisType: "Population Change",
  country: "Brazil",
  year1String: "2010",
  year2String: "2020",
  resolution: "100m",
  format: "json",
  layerName: "Brazil Population Change 2010-2020",
  title: "Analyzing Brazil's population changes from 2010 to 2020 for urban development insights"
})
```

**Expected Output:**
- Population changes between the two periods
- Annual growth rates
- Urbanization level assessment
- Growth trend analysis (increasing/decreasing/stable)
- AI-generated recommendations for urban planning

## Example 4: Combined Analysis with ROI

**User Query:**
```
"I have a specific region of interest in Mexico. Can you analyze population density there and compare it with the national average?"
```

**AI Response:**
I'll analyze the population density in your specific region of interest in Mexico and compare it with national averages. This targeted analysis will provide localized insights for your planning needs.

**Tool Call:**
```typescript
requestWorldPopPopulationAnalysis({
  analysisType: "Population Density",
  country: "Mexico",
  year1String: "2022",
  resolution: "100m",
  format: "json",
  layerName: "Mexico ROI Population Density 2022",
  title: "Analyzing population density in specific ROI in Mexico with national comparison",
  selectedRoiGeometry: "USER_SELECTED_ROI_GEOMETRY"
})
```

**Expected Output:**
- Population density within the ROI
- Comparison with national averages
- Localized population distribution patterns
- Recommendations for the specific region

## Example 5: Multi-Resolution Analysis

**User Query:**
```
"I need both high-resolution and overview population data for urban planning in Japan."
```

**AI Response:**
I'll provide you with both high-resolution (100m) and overview (1km) population data for Japan. This will give you detailed local insights while maintaining broader regional context for comprehensive urban planning.

**Tool Call 1 (High Resolution):**
```typescript
requestWorldPopPopulationAnalysis({
  analysisType: "Population Data",
  country: "Japan",
  year1String: "2023",
  resolution: "100m",
  format: "json",
  layerName: "Japan Population 2023 - High Resolution",
  title: "High-resolution population analysis for Japan in 2023"
})
```

**Tool Call 2 (Overview):**
```typescript
requestWorldPopPopulationAnalysis({
  analysisType: "Population Data",
  country: "Japan",
  year1String: "2023",
  resolution: "1km",
  format: "json",
  layerName: "Japan Population 2023 - Overview",
  title: "Overview population analysis for Japan in 2023"
})
```

## Example 6: Export for Further Analysis

**User Query:**
```
"Can you export the population data for France in CSV format so I can use it in my GIS software?"
```

**AI Response:**
I'll export the population data for France in CSV format, which will be perfect for importing into your GIS software for further spatial analysis and mapping.

**Tool Call:**
```typescript
requestWorldPopPopulationAnalysis({
  analysisType: "Population Data",
  country: "France",
  year1String: "2021",
  resolution: "100m",
  format: "csv",
  layerName: "France Population 2021 - CSV Export",
  title: "Exporting population data for France in CSV format for GIS analysis"
})
```

**Expected Output:**
- CSV file with population data
- Geographic coordinates
- Population statistics
- Ready for GIS import

## Best Practices

### 1. Choose Appropriate Resolution
- **100m**: Use for detailed urban analysis, neighborhood planning
- **1km**: Use for regional planning, overview analysis

### 2. Select Relevant Time Periods
- **Current Data**: Use most recent year for current planning
- **Change Analysis**: Use 5-10 year intervals for meaningful trends
- **Historical Comparison**: Use census years for validation

### 3. Combine with Other Analyses
- **UHI Analysis**: Combine population density with temperature data
- **Land Use**: Correlate population changes with land cover changes
- **Infrastructure**: Use population data for service planning

### 4. Consider Data Limitations
- **Year Range**: Data available from 2000-2023
- **Country Coverage**: Focus on countries with good data quality
- **ROI Size**: Consider area limits for detailed analysis

## Common Use Cases

### Urban Planning
- **Service Location**: Optimize healthcare, education, and emergency services
- **Transportation**: Plan public transport routes and capacity
- **Housing**: Identify areas needing housing development

### Environmental Analysis
- **Green Infrastructure**: Plan parks and green spaces
- **Climate Adaptation**: Design climate-resilient urban areas
- **Resource Management**: Optimize water and energy systems

### Social Development
- **Community Services**: Plan community centers and facilities
- **Economic Development**: Identify areas for business development
- **Public Safety**: Design emergency response systems

## Troubleshooting

### Common Issues
1. **Invalid Country Names**: Use full country names (e.g., "United States" not "USA")
2. **Year Out of Range**: Ensure years are between 2000-2023
3. **ROI Issues**: Ensure valid polygon geometries
4. **API Limits**: Respect rate limits and usage quotas

### Getting Help
- Check the error messages for specific guidance
- Verify parameter formats and values
- Ensure ROI geometry is valid
- Contact support for persistent issues

## Integration Tips

### With Existing Features
- **UHI Analysis**: Use population data to weight heat island effects
- **Land Use Mapping**: Correlate population changes with land cover changes
- **Air Quality**: Combine population density with pollution data

### Data Export
- **GIS Software**: Export as CSV or GeoTIFF for spatial analysis
- **Statistical Analysis**: Use JSON format for data processing
- **Reporting**: Generate charts and visualizations from the data

### Workflow Integration
- **Chat Interface**: Use natural language for complex queries
- **Map Visualization**: Display results as interactive map layers
- **Report Generation**: Include population insights in automated reports
