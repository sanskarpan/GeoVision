/**
 * Urban Planning Analysis Results Visualization Component
 * 
 * This component provides comprehensive visualization for all urban planning
 * analysis results including maps, charts, and detailed reports.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  MapPin, 
  TrendingUp, 
  AlertTriangle, 
  Leaf, 
  Bus, 
  Building, 
  DollarSign, 
  Droplets,
  Thermometer,
  Navigation,
  Download,
  Share2,
  Eye
} from 'lucide-react';

// Type definitions for analysis results
interface AnalysisResult {
  success: boolean;
  analysisType: string;
  timestamp: string;
  geometry: any;
  summary?: any;
  [key: string]: any;
}

interface VisualizationProps {
  results: AnalysisResult;
  onExport?: (format: 'pdf' | 'csv' | 'geojson') => void;
  onShare?: () => void;
  className?: string;
}

// Icon mapping for different analysis types
const ANALYSIS_ICONS = {
  'Flyover and Bridge Requirements': Building,
  'Traffic Congestion Hotspots': Navigation,
  'Public Transport Accessibility': Bus,
  'Road Network Density': Navigation,
  'Infrastructure Gap Analysis': Building,
  'Property Value Trends': TrendingUp,
  'Investment Potential Mapping': DollarSign,
  'Gentrification Risk Assessment': AlertTriangle,
  'Development Opportunity Analysis': Building,
  'Market Saturation Analysis': TrendingUp,
  'Flood Risk Mapping': Droplets,
  'Drainage System Assessment': Droplets,
  'Stormwater Management': Droplets,
  'Vulnerability Assessment': AlertTriangle,
  'Emergency Response Planning': AlertTriangle,
  'Green Space Coverage Assessment': Leaf,
  'Urban Heat Island Mapping': Thermometer,
  'Tree Canopy Analysis': Leaf,
  'Heat Mitigation Planning': Thermometer,
  'Vegetation Health Monitoring': Leaf,
  'Transit Accessibility Analysis': Bus,
  'Service Gap Identification': MapPin,
  'Route Optimization': Navigation,
  'Modal Connectivity Assessment': Bus,
  'Public Transport Demand Modeling': TrendingUp
};

// Color schemes for different analysis categories
const COLOR_SCHEMES = {
  infrastructure: {
    primary: '#3b82f6',
    secondary: '#dbeafe',
    accent: '#1d4ed8'
  },
  investment: {
    primary: '#10b981',
    secondary: '#d1fae5', 
    accent: '#047857'
  },
  flood_risk: {
    primary: '#06b6d4',
    secondary: '#cffafe',
    accent: '#0891b2'
  },
  green_space: {
    primary: '#84cc16',
    secondary: '#ecfccb',
    accent: '#65a30d'
  },
  transport: {
    primary: '#f59e0b',
    secondary: '#fef3c7',
    accent: '#d97706'
  }
};

export default function AnalysisResultsVisualization({ 
  results, 
  onExport, 
  onShare, 
  className = "" 
}: VisualizationProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const analysisCategory = getAnalysisCategory(results.analysisType);
  const colorScheme = COLOR_SCHEMES[analysisCategory as keyof typeof COLOR_SCHEMES];
  const IconComponent = ANALYSIS_ICONS[results.analysisType as keyof typeof ANALYSIS_ICONS] || MapPin;

  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => setIsMapLoaded(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!results.success) {
    return (
      <Card className={`border-red-200 ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">Analysis Failed</span>
          </div>
          <p className="text-red-500 mt-2">{results.error || 'Unknown error occurred'}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Section */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="p-2 rounded-lg"
                style={{ backgroundColor: colorScheme.secondary }}
              >
                <IconComponent 
                  className="h-6 w-6" 
                  style={{ color: colorScheme.primary }}
                />
              </div>
              <div>
                <CardTitle className="text-xl">{results.analysisType}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Analysis completed on {new Date(results.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Completed
              </Badge>
              <div className="flex gap-1">
                {onShare && (
                  <Button variant="outline" size="sm" onClick={onShare}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                )}
                {onExport && (
                  <Button variant="outline" size="sm" onClick={() => onExport('pdf')}>
                    <Download className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Cards */}
      {results.summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(results.summary).map(([key, value]) => (
            <Card key={key}>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground mb-1">
                  {formatLabel(key)}
                </div>
                <div className="text-lg font-semibold">{String(value)}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="map">Map View</TabsTrigger>
          <TabsTrigger value="data">Raw Data</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <OverviewContent results={results} colorScheme={colorScheme} />
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          <DetailedContent results={results} colorScheme={colorScheme} />
        </TabsContent>

        <TabsContent value="map" className="space-y-6">
          <MapContent results={results} isLoaded={isMapLoaded} />
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <RawDataContent results={results} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Overview content component
function OverviewContent({ results, colorScheme }: { results: AnalysisResult, colorScheme: any }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Key Findings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Key Findings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <KeyFindingsComponent results={results} />
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RecommendationsComponent results={results} />
        </CardContent>
      </Card>
    </div>
  );
}

// Detailed content component
function DetailedContent({ results, colorScheme }: { results: AnalysisResult, colorScheme: any }) {
  const analysisCategory = getAnalysisCategory(results.analysisType);
  
  switch (analysisCategory) {
    case 'infrastructure':
      return <InfrastructureDetails results={results} />;
    case 'investment':
      return <InvestmentDetails results={results} />;
    case 'flood_risk':
      return <FloodRiskDetails results={results} />;
    case 'green_space':
      return <GreenSpaceDetails results={results} />;
    case 'transport':
      return <TransportDetails results={results} />;
    default:
      return <GenericDetails results={results} />;
  }
}

// Map content component
function MapContent({ results, isLoaded }: { results: AnalysisResult, isLoaded: boolean }) {
  if (!isLoaded) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-muted-foreground">Loading map visualization...</p>
            <Progress value={66} className="w-48 mx-auto" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Geographic Visualization</CardTitle>
        <p className="text-sm text-muted-foreground">
          Interactive map showing analysis results and geographic features
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-96 bg-slate-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <MapPin className="h-12 w-12 text-slate-400 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-600">Map Integration Placeholder</h3>
            <p className="text-slate-500 text-sm mt-1">
              Connect your preferred mapping library (Leaflet, Mapbox, Google Maps)
            </p>
            <div className="mt-4 p-3 bg-blue-50 rounded border text-sm text-blue-700">
              Geometry: {results.geometry?.type} with {results.geometry?.coordinates?.[0]?.length || 0} points
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Raw data content component
function RawDataContent({ results }: { results: AnalysisResult }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Raw Analysis Data</CardTitle>
        <p className="text-sm text-muted-foreground">
          Complete analysis results in JSON format
        </p>
      </CardHeader>
      <CardContent>
        <pre className="bg-slate-50 p-4 rounded-lg text-xs overflow-auto max-h-96">
          {JSON.stringify(results, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
}

// Key findings component
function KeyFindingsComponent({ results }: { results: AnalysisResult }) {
  const findings = extractKeyFindings(results);
  
  return (
    <div className="space-y-3">
      {findings.map((finding, index) => (
        <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
          <p className="text-sm">{finding}</p>
        </div>
      ))}
    </div>
  );
}

// Recommendations component
function RecommendationsComponent({ results }: { results: AnalysisResult }) {
  const recommendations = extractRecommendations(results);
  
  return (
    <div className="space-y-3">
      {recommendations.map((rec, index) => (
        <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
          <div>
            <p className="text-sm font-medium">{rec.title}</p>
            <p className="text-xs text-muted-foreground mt-1">{rec.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// Analysis-specific detail components
function InfrastructureDetails({ results }: { results: AnalysisResult }) {
  return (
    <div className="space-y-6">
      {results.recommendations && (
        <Card>
          <CardHeader>
            <CardTitle>Infrastructure Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.recommendations.map((rec: any, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{rec.type}</h4>
                    <Badge variant={rec.priority === 'high' ? 'destructive' : 'secondary'}>
                      {rec.priority} priority
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{rec.justification}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Cost:</span> {rec.specifications?.estimatedCost}
                    </div>
                    <div>
                      <span className="font-medium">Impact:</span> {rec.impact?.congestionReduction}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function InvestmentDetails({ results }: { results: AnalysisResult }) {
  return (
    <div className="space-y-6">
      {results.opportunities && (
        <Card>
          <CardHeader>
            <CardTitle>Investment Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.opportunities.map((opp: any, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{opp.name}</h4>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        Score: {opp.investmentScore}/10
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Expected ROI:</span> {opp.financials?.projectedROI}
                    </div>
                    <div>
                      <span className="font-medium">Risk Level:</span> {opp.financials?.entryBarrier}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function FloodRiskDetails({ results }: { results: AnalysisResult }) {
  return (
    <div className="space-y-6">
      {results.floodZones && (
        <Card>
          <CardHeader>
            <CardTitle>Flood Risk Zones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.floodZones.map((zone: any, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">Zone {zone.id}</h4>
                    <Badge variant={
                      zone.riskLevel === 'high' ? 'destructive' : 
                      zone.riskLevel === 'medium' ? 'default' : 'secondary'
                    }>
                      {zone.riskLevel} risk
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Flood Depth:</span> {zone.floodDepth}
                    </div>
                    <div>
                      <span className="font-medium">Population:</span> {zone.population?.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function GreenSpaceDetails({ results }: { results: AnalysisResult }) {
  return (
    <div className="space-y-6">
      {results.overallMetrics && (
        <Card>
          <CardHeader>
            <CardTitle>Green Space Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {results.overallMetrics.totalGreenSpace}
                </div>
                <div className="text-sm text-muted-foreground">Total Green Space Coverage</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {results.overallMetrics.treeCanopyCover}
                </div>
                <div className="text-sm text-muted-foreground">Tree Canopy Cover</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function TransportDetails({ results }: { results: AnalysisResult }) {
  return (
    <div className="space-y-6">
      {results.accessibilityMetrics && (
        <Card>
          <CardHeader>
            <CardTitle>Transit Accessibility</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {results.accessibilityMetrics.overallCoverage}
                </div>
                <div className="text-sm text-muted-foreground">Population Coverage</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {results.accessibilityMetrics.averageWalkTime}
                </div>
                <div className="text-sm text-muted-foreground">Average Walk Time</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function GenericDetails({ results }: { results: AnalysisResult }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Analysis Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(results).map(([key, value]) => {
            if (key === 'success' || key === 'timestamp' || key === 'geometry') return null;
            
            return (
              <div key={key}>
                <h4 className="font-semibold mb-2">{formatLabel(key)}</h4>
                <div className="bg-slate-50 p-3 rounded text-sm">
                  {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Utility functions
function getAnalysisCategory(analysisType: string): string {
  if (analysisType.includes('Infrastructure') || analysisType.includes('Traffic') || analysisType.includes('Road')) {
    return 'infrastructure';
  }
  if (analysisType.includes('Investment') || analysisType.includes('Property') || analysisType.includes('Development')) {
    return 'investment';
  }
  if (analysisType.includes('Flood') || analysisType.includes('Drainage') || analysisType.includes('Vulnerability')) {
    return 'flood_risk';
  }
  if (analysisType.includes('Green') || analysisType.includes('Heat') || analysisType.includes('Tree') || analysisType.includes('Vegetation')) {
    return 'green_space';
  }
  if (analysisType.includes('Transport') || analysisType.includes('Transit') || analysisType.includes('Route')) {
    return 'transport';
  }
  return 'generic';
}

function formatLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

function extractKeyFindings(results: AnalysisResult): string[] {
  const findings: string[] = [];
  
  // Extract based on analysis type
  if (results.summary) {
    Object.entries(results.summary).forEach(([key, value]) => {
      findings.push(`${formatLabel(key)}: ${value}`);
    });
  }
  
  // Add specific findings based on data structure
  if (results.recommendations && Array.isArray(results.recommendations)) {
    findings.push(`${results.recommendations.length} infrastructure recommendations identified`);
  }
  
  if (results.floodZones && Array.isArray(results.floodZones)) {
    const highRiskZones = results.floodZones.filter((zone: any) => zone.riskLevel === 'high');
    findings.push(`${highRiskZones.length} high-risk flood zones identified`);
  }
  
  return findings.slice(0, 5); // Limit to 5 key findings
}

function extractRecommendations(results: AnalysisResult): Array<{title: string, description: string}> {
  const recommendations: Array<{title: string, description: string}> = [];
  
  // Extract recommendations based on analysis type
  if (results.recommendations && Array.isArray(results.recommendations)) {
    results.recommendations.slice(0, 3).forEach((rec: any) => {
      recommendations.push({
        title: rec.type || rec.name || 'Infrastructure Improvement',
        description: rec.justification || rec.description || 'Detailed recommendation available'
      });
    });
  }
  
  if (results.investmentPriorities && Array.isArray(results.investmentPriorities)) {
    results.investmentPriorities.slice(0, 3).forEach((priority: any) => {
      recommendations.push({
        title: priority.project || priority.item,
        description: `${priority.benefit} - ${priority.cost}`
      });
    });
  }
  
  // Add generic recommendations if none found
  if (recommendations.length === 0) {
    recommendations.push({
      title: 'Review Analysis Results',
      description: 'Examine the detailed findings and consider implementing suggested improvements'
    });
  }
  
  return recommendations;
}
