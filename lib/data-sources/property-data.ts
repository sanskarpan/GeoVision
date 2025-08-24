/**
 * Property Data Integration via RapidAPI
 * Provides real estate and property value data for urban planning analysis
 */

export interface PropertyData {
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  propertyType: string;
  estimatedValue: number;
  bedrooms?: number;
  bathrooms?: number;
  squareFootage?: number;
  yearBuilt?: number;
  lotSize?: number;
  pricePerSquareFoot?: number;
  lastSalePrice?: number;
  lastSaleDate?: string;
  marketTrend: string;
}

export interface MarketAnalysis {
  averagePropertyValue: number;
  medianPropertyValue: number;
  pricePerSquareFoot: {
    average: number;
    median: number;
    range: {
      min: number;
      max: number;
    };
  };
  marketTrend: string;
  appreciation: {
    oneYear: number;
    fiveYear: number;
  };
  inventory: {
    totalListings: number;
    averageDaysOnMarket: number;
  };
}

export class PropertyDataService {
  private apiKey: string;
  private baseUrl = 'https://realty-mole-property-api.p.rapidapi.com';
  
  constructor() {
    this.apiKey = process.env.RAPIDAPI_KEY!;
    if (!this.apiKey) {
      throw new Error('RAPIDAPI_KEY environment variable is required');
    }
  }
  
  /**
   * Get property details for a specific address
   */
  async getPropertyDetails(address: string): Promise<PropertyData | null> {
    try {
      const response = await fetch(`${this.baseUrl}/properties`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': 'realty-mole-property-api.p.rapidapi.com',
          'Content-Type': 'application/json'
        },
        // Note: Actual implementation depends on RealtyMole API structure
      });
      
      if (!response.ok) {
        throw new Error(`Property API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Transform API response to our PropertyData format
      return this.transformPropertyData(data);
    } catch (error) {
      console.error('Error fetching property details:', error);
      return null;
    }
  }
  
  /**
   * Get property values for a geographic region
   */
  async getPropertiesInRegion(geometry: any): Promise<{
    properties: PropertyData[];
    marketAnalysis: MarketAnalysis;
    totalProperties: number;
  }> {
    // For mock implementation with your API keys, we'll simulate property data
    // In real implementation, this would query the actual API with bounding box
    
    const center = this.getGeometryCenter(geometry);
    const bbox = this.geometryToBBox(geometry);
    
    try {
      // Simulate API call - replace with actual RealtyMole API call
      const mockProperties = await this.generateMockPropertiesForRegion(center, 50);
      const marketAnalysis = this.calculateMarketAnalysis(mockProperties);
      
      return {
        properties: mockProperties,
        marketAnalysis,
        totalProperties: mockProperties.length
      };
    } catch (error) {
      console.error('Error fetching regional properties:', error);
      return {
        properties: [],
        marketAnalysis: this.getEmptyMarketAnalysis(),
        totalProperties: 0
      };
    }
  }
  
  /**
   * Analyze property investment potential
   */
  async analyzeInvestmentPotential(geometry: any, investmentType: string = 'residential'): Promise<{
    investmentScore: number;
    riskLevel: string;
    opportunities: Array<{
      location: { lat: number; lng: number };
      propertyType: string;
      estimatedValue: number;
      potentialROI: number;
      reasoning: string;
    }>;
    marketFactors: {
      priceAppreciation: string;
      marketStability: string;
      demandLevel: string;
      supplyLevel: string;
    };
    recommendations: string[];
  }> {
    const regionalData = await this.getPropertiesInRegion(geometry);
    const properties = regionalData.properties;
    const marketAnalysis = regionalData.marketAnalysis;
    
    // Calculate investment score (0-100)
    let investmentScore = 50; // Base score
    
    // Adjust based on market trends
    if (marketAnalysis.marketTrend === 'rising') {
      investmentScore += 20;
    } else if (marketAnalysis.marketTrend === 'stable') {
      investmentScore += 10;
    } else {
      investmentScore -= 15;
    }
    
    // Adjust based on price appreciation
    if (marketAnalysis.appreciation.oneYear > 5) {
      investmentScore += 15;
    } else if (marketAnalysis.appreciation.oneYear > 2) {
      investmentScore += 5;
    }
    
    // Adjust based on inventory levels
    if (marketAnalysis.inventory.averageDaysOnMarket < 30) {
      investmentScore += 10; // Hot market
    } else if (marketAnalysis.inventory.averageDaysOnMarket > 90) {
      investmentScore -= 10; // Slow market
    }
    
    // Determine risk level
    const riskLevel = investmentScore > 75 ? 'Low' : 
                     investmentScore > 50 ? 'Moderate' : 
                     investmentScore > 25 ? 'High' : 'Very High';
    
    // Identify opportunities
    const opportunities = properties
      .filter(p => p.estimatedValue < marketAnalysis.averagePropertyValue * 0.9)
      .slice(0, 5)
      .map(property => ({
        location: property.coordinates,
        propertyType: property.propertyType,
        estimatedValue: property.estimatedValue,
        potentialROI: this.calculatePotentialROI(property, marketAnalysis),
        reasoning: this.generateInvestmentReasoning(property, marketAnalysis)
      }));
    
    // Generate recommendations
    const recommendations = this.generateInvestmentRecommendations(investmentScore, marketAnalysis, investmentType);
    
    return {
      investmentScore: Math.max(0, Math.min(100, investmentScore)),
      riskLevel,
      opportunities,
      marketFactors: {
        priceAppreciation: `${marketAnalysis.appreciation.oneYear.toFixed(1)}% annually`,
        marketStability: marketAnalysis.marketTrend,
        demandLevel: marketAnalysis.inventory.averageDaysOnMarket < 30 ? 'High' : 
                    marketAnalysis.inventory.averageDaysOnMarket < 60 ? 'Moderate' : 'Low',
        supplyLevel: marketAnalysis.inventory.totalListings > properties.length * 0.1 ? 'High' : 'Moderate'
      },
      recommendations
    };
  }
  
  /**
   * Analyze gentrification risk
   */
  async analyzeGentrificationRisk(geometry: any): Promise<{
    riskLevel: string;
    riskScore: number;
    indicators: {
      propertyValueIncrease: number;
      newDevelopment: string;
      demographicShift: string;
      businessChanges: string;
    };
    timeline: string;
    recommendations: string[];
  }> {
    const regionalData = await this.getPropertiesInRegion(geometry);
    const marketAnalysis = regionalData.marketAnalysis;
    
    let riskScore = 0;
    
    // Property value increase indicator
    const valueIncrease = marketAnalysis.appreciation.oneYear;
    if (valueIncrease > 10) {
      riskScore += 30;
    } else if (valueIncrease > 5) {
      riskScore += 20;
    } else if (valueIncrease > 2) {
      riskScore += 10;
    }
    
    // Market activity indicator
    if (marketAnalysis.inventory.averageDaysOnMarket < 20) {
      riskScore += 20; // High demand
    }
    
    // Price disparity indicator
    const priceRange = marketAnalysis.pricePerSquareFoot.range;
    const priceDisparity = (priceRange.max - priceRange.min) / priceRange.min;
    if (priceDisparity > 2) {
      riskScore += 25; // High disparity suggests change
    }
    
    // Determine risk level and timeline
    let riskLevel: string;
    let timeline: string;
    
    if (riskScore > 70) {
      riskLevel = 'High';
      timeline = '1-3 years';
    } else if (riskScore > 40) {
      riskLevel = 'Moderate';
      timeline = '3-7 years';
    } else if (riskScore > 20) {
      riskLevel = 'Low';
      timeline = '7+ years';
    } else {
      riskLevel = 'Minimal';
      timeline = 'No significant risk identified';
    }
    
    const recommendations = this.generateGentrificationRecommendations(riskLevel, riskScore);
    
    return {
      riskLevel,
      riskScore: Math.min(100, riskScore),
      indicators: {
        propertyValueIncrease: valueIncrease,
        newDevelopment: 'Moderate', // Would need additional data sources
        demographicShift: 'Unknown', // Would need census data
        businessChanges: 'Unknown'   // Would need business directory data
      },
      timeline,
      recommendations
    };
  }
  
  private async generateMockPropertiesForRegion(center: {lat: number, lng: number}, count: number): Promise<PropertyData[]> {
    const properties: PropertyData[] = [];
    
    for (let i = 0; i < count; i++) {
      // Generate random coordinates near center
      const lat = center.lat + (Math.random() - 0.5) * 0.01;
      const lng = center.lng + (Math.random() - 0.5) * 0.01;
      
      const propertyTypes = ['Single Family', 'Condo', 'Townhouse', 'Multi-Family'];
      const propertyType = propertyTypes[Math.floor(Math.random() * propertyTypes.length)];
      
      const baseValue = 200000 + Math.random() * 800000;
      const sqft = 800 + Math.random() * 2200;
      
      properties.push({
        address: `${Math.floor(Math.random() * 9999)} Main St`,
        coordinates: { lat, lng },
        propertyType,
        estimatedValue: Math.round(baseValue),
        bedrooms: Math.floor(Math.random() * 5) + 1,
        bathrooms: Math.floor(Math.random() * 3) + 1,
        squareFootage: Math.round(sqft),
        yearBuilt: 1950 + Math.floor(Math.random() * 70),
        lotSize: Math.round(5000 + Math.random() * 10000),
        pricePerSquareFoot: Math.round(baseValue / sqft),
        lastSalePrice: Math.round(baseValue * (0.8 + Math.random() * 0.4)),
        lastSaleDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        marketTrend: Math.random() > 0.6 ? 'rising' : Math.random() > 0.3 ? 'stable' : 'declining'
      });
    }
    
    return properties;
  }
  
  private transformPropertyData(apiData: any): PropertyData {
    // Transform API response to our PropertyData format
    // This would depend on the actual RealtyMole API response structure
    return {
      address: apiData.address || 'Unknown',
      coordinates: {
        lat: apiData.latitude || 0,
        lng: apiData.longitude || 0
      },
      propertyType: apiData.propertyType || 'Unknown',
      estimatedValue: apiData.estimatedValue || 0,
      bedrooms: apiData.bedrooms,
      bathrooms: apiData.bathrooms,
      squareFootage: apiData.squareFootage,
      yearBuilt: apiData.yearBuilt,
      lotSize: apiData.lotSize,
      pricePerSquareFoot: apiData.pricePerSquareFoot,
      lastSalePrice: apiData.lastSalePrice,
      lastSaleDate: apiData.lastSaleDate,
      marketTrend: 'stable'
    };
  }
  
  private calculateMarketAnalysis(properties: PropertyData[]): MarketAnalysis {
    if (properties.length === 0) {
      return this.getEmptyMarketAnalysis();
    }
    
    const values = properties.map(p => p.estimatedValue);
    const pricesPerSqft = properties.map(p => p.pricePerSquareFoot || 0).filter(p => p > 0);
    
    const averageValue = values.reduce((sum, val) => sum + val, 0) / values.length;
    const medianValue = this.calculateMedian(values);
    
    const avgPricePerSqft = pricesPerSqft.reduce((sum, val) => sum + val, 0) / pricesPerSqft.length;
    const medianPricePerSqft = this.calculateMedian(pricesPerSqft);
    
    return {
      averagePropertyValue: Math.round(averageValue),
      medianPropertyValue: Math.round(medianValue),
      pricePerSquareFoot: {
        average: Math.round(avgPricePerSqft),
        median: Math.round(medianPricePerSqft),
        range: {
          min: Math.min(...pricesPerSqft),
          max: Math.max(...pricesPerSqft)
        }
      },
      marketTrend: this.determineMarketTrend(properties),
      appreciation: {
        oneYear: Math.random() * 10, // Would calculate from historical data
        fiveYear: Math.random() * 50
      },
      inventory: {
        totalListings: Math.floor(properties.length * 0.1),
        averageDaysOnMarket: Math.floor(Math.random() * 90 + 10)
      }
    };
  }
  
  private calculateMedian(numbers: number[]): number {
    const sorted = numbers.slice().sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2;
    }
    
    return sorted[middle];
  }
  
  private determineMarketTrend(properties: PropertyData[]): string {
    const trends = properties.map(p => p.marketTrend);
    const risingCount = trends.filter(t => t === 'rising').length;
    const decliningCount = trends.filter(t => t === 'declining').length;
    
    if (risingCount > decliningCount * 1.5) return 'rising';
    if (decliningCount > risingCount * 1.5) return 'declining';
    return 'stable';
  }
  
  private calculatePotentialROI(property: PropertyData, market: MarketAnalysis): number {
    const marketPremium = property.estimatedValue / market.averagePropertyValue;
    const baseROI = market.appreciation.oneYear;
    
    // Adjust ROI based on property value relative to market
    if (marketPremium < 0.8) {
      return baseROI + 3; // Undervalued properties may have higher ROI
    } else if (marketPremium > 1.2) {
      return baseROI - 2; // Overvalued properties may have lower ROI
    }
    
    return baseROI;
  }
  
  private generateInvestmentReasoning(property: PropertyData, market: MarketAnalysis): string {
    const reasons = [];
    
    if (property.estimatedValue < market.averagePropertyValue * 0.9) {
      reasons.push('Below market average price');
    }
    
    if (property.pricePerSquareFoot && property.pricePerSquareFoot < market.pricePerSquareFoot.average) {
      reasons.push('Good price per square foot');
    }
    
    if (market.marketTrend === 'rising') {
      reasons.push('Rising market trend');
    }
    
    return reasons.join(', ') || 'Standard investment opportunity';
  }
  
  private generateInvestmentRecommendations(score: number, market: MarketAnalysis, type: string): string[] {
    const recommendations = [];
    
    if (score > 70) {
      recommendations.push('Strong investment climate - consider increasing investment allocation');
      recommendations.push('Market timing appears favorable for acquisitions');
    } else if (score > 50) {
      recommendations.push('Moderate investment potential - conduct detailed due diligence');
      recommendations.push('Consider long-term investment strategies');
    } else {
      recommendations.push('Caution advised - market conditions are challenging');
      recommendations.push('Consider waiting for better market conditions');
    }
    
    if (market.inventory.averageDaysOnMarket < 30) {
      recommendations.push('Fast-moving market - be prepared to act quickly');
    }
    
    if (type === 'commercial') {
      recommendations.push('Analyze foot traffic and business district growth');
    } else if (type === 'residential') {
      recommendations.push('Consider school districts and neighborhood amenities');
    }
    
    return recommendations;
  }
  
  private generateGentrificationRecommendations(riskLevel: string, score: number): string[] {
    const recommendations = [];
    
    if (riskLevel === 'High') {
      recommendations.push('Implement affordable housing preservation policies');
      recommendations.push('Monitor displacement of long-term residents');
      recommendations.push('Consider community benefit agreements for new developments');
    } else if (riskLevel === 'Moderate') {
      recommendations.push('Track property value trends closely');
      recommendations.push('Engage with community stakeholders early');
      recommendations.push('Plan for potential infrastructure upgrades');
    } else {
      recommendations.push('Continue monitoring market conditions');
      recommendations.push('Support balanced community development');
    }
    
    return recommendations;
  }
  
  private getEmptyMarketAnalysis(): MarketAnalysis {
    return {
      averagePropertyValue: 0,
      medianPropertyValue: 0,
      pricePerSquareFoot: {
        average: 0,
        median: 0,
        range: { min: 0, max: 0 }
      },
      marketTrend: 'unknown',
      appreciation: {
        oneYear: 0,
        fiveYear: 0
      },
      inventory: {
        totalListings: 0,
        averageDaysOnMarket: 0
      }
    };
  }
  
  private getGeometryCenter(geometry: any): { lat: number; lng: number } {
    const coords = geometry.coordinates[0];
    const centerLat = coords.reduce((sum: number, coord: number[]) => sum + coord[1], 0) / coords.length;
    const centerLng = coords.reduce((sum: number, coord: number[]) => sum + coord[0], 0) / coords.length;
    
    return { lat: centerLat, lng: centerLng };
  }
  
  private geometryToBBox(geometry: any): string {
    const coords = geometry.coordinates[0];
    const lats = coords.map((c: number[]) => c[1]);
    const lngs = coords.map((c: number[]) => c[0]);
    
    return [
      Math.min(...lngs),
      Math.min(...lats),
      Math.max(...lngs), 
      Math.max(...lats)
    ].join(',');
  }
}
