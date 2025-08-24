import React from "react";
import { IconUsers, IconTrendingUp, IconTrendingDown, IconMinus } from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface WorldPopPopulationAnalysisProps {
  analysisType: string;
  country: string;
  year1?: string;
  year2?: string;
  resolution: string;
  format: string;
  data: any;
  metadata: any;
}

const WorldPopPopulationAnalysis: React.FC<WorldPopPopulationAnalysisProps> = ({
  analysisType,
  country,
  year1,
  year2,
  resolution,
  format,
  data,
  metadata,
}) => {
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(2) + 'K';
    }
    return num.toLocaleString();
  };

  const getGrowthIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <IconTrendingUp className="h-4 w-4 text-green-500" />;
      case 'decreasing':
        return <IconTrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <IconMinus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getGrowthColor = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return 'text-green-600';
      case 'decreasing':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const renderPopulationData = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Population
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(data.population)}</div>
          <p className="text-xs text-muted-foreground">people</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Population Density
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(data.populationDensity)}</div>
          <p className="text-xs text-muted-foreground">people/km²</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Area
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(data.area)}</div>
          <p className="text-xs text-muted-foreground">km²</p>
        </CardContent>
      </Card>
    </div>
  );

  const renderPopulationChange = () => {
    if (!data.changes) return null;
    
    const { changes, analysis } = data;
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Period 1 ({data.period1?.year})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">{formatNumber(data.period1?.population || 0)}</div>
              <p className="text-xs text-muted-foreground">
                Density: {formatNumber(data.period1?.populationDensity || 0)} people/km²
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Period 2 ({data.period2?.year})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">{formatNumber(data.period2?.population || 0)}</div>
              <p className="text-xs text-muted-foreground">
                Density: {formatNumber(data.period2?.populationDensity || 0)} people/km²
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Change Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className={`text-lg font-semibold ${getGrowthColor(analysis.growthTrend)}`}>
                  {getGrowthIcon(analysis.growthTrend)}
                  {formatNumber(changes.absoluteChange)}
                </div>
                <p className="text-xs text-muted-foreground">Absolute Change</p>
              </div>
              
              <div className="text-center">
                <div className={`text-lg font-semibold ${getGrowthColor(analysis.growthTrend)}`}>
                  {changes.percentageChange.toFixed(2)}%
                </div>
                <p className="text-xs text-muted-foreground">Percentage Change</p>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-semibold">
                  {changes.annualGrowthRate.toFixed(2)}%
                </div>
                <p className="text-xs text-muted-foreground">Annual Growth Rate</p>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-semibold capitalize">
                  {analysis.urbanizationLevel}
                </div>
                <p className="text-xs text-muted-foreground">Urbanization Level</p>
              </div>
            </div>
            
            {analysis.recommendations && analysis.recommendations.length > 0 && (
              <div className="mt-4">
                <Separator className="my-2" />
                <p className="text-sm font-medium text-muted-foreground mb-2">Recommendations:</p>
                <ul className="space-y-1">
                  {analysis.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderMetadata = () => (
    <Card className="bg-muted/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Analysis Metadata
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium">Source:</span>
            <Badge variant="secondary" className="ml-2">{metadata.source}</Badge>
          </div>
          <div>
            <span className="font-medium">Resolution:</span>
            <Badge variant="secondary" className="ml-2">{resolution}</Badge>
          </div>
          <div>
            <span className="font-medium">Format:</span>
            <Badge variant="secondary" className="ml-2">{format}</Badge>
          </div>
          <div>
            <span className="font-medium">Timestamp:</span>
            <div className="text-xs text-muted-foreground mt-1">
              {new Date(metadata.timestamp).toLocaleString()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col h-full gap-6 justify-center items-center w-full max-w-4xl mx-auto">
      <div className="w-full">
        <div className="flex items-center gap-3 mb-4">
          <IconUsers className="h-6 w-6 text-blue-500" />
          <div>
            <h3 className="text-lg font-semibold">
              {analysisType} - {country}
            </h3>
            <p className="text-sm text-muted-foreground">
              {year1 && `Year: ${year1}`}
              {year2 && ` | Period: ${year1} - ${year2}`}
            </p>
          </div>
        </div>
        
        <Separator className="mb-6" />
        
        {analysisType === 'Population Change' ? renderPopulationChange() : renderPopulationData()}
        
        {renderMetadata()}
      </div>
    </div>
  );
};

export default WorldPopPopulationAnalysis;
