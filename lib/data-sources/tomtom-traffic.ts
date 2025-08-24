/**
 * TomTom Traffic API Integration
 * Provides real-time traffic data for urban planning analysis
 */

export interface TrafficFlowData {
  roadName: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  currentSpeed: number;
  freeFlowSpeed: number;
  currentTravelTime: number;
  freeFlowTravelTime: number;
  confidence: number;
  roadType: string;
}

export interface TrafficIncident {
  id: string;
  type: string;
  severity: number;
  description: string;
  location: {
    lat: number;
    lng: number;
  };
  roadName: string;
  startTime: string;
  endTime?: string;
  delay: number;
}

export class TomTomTrafficService {
  private apiKey: string;
  private baseUrl = 'https://api.tomtom.com/traffic';
  
  constructor() {
    this.apiKey = process.env.TOMTOM_API_KEY!;
    console.log('🔑 TomTom API Key check:', this.apiKey ? `Found (${this.apiKey.substring(0, 8)}...)` : 'MISSING');
    if (!this.apiKey) {
      throw new Error('TOMTOM_API_KEY environment variable is required');
    }
  }
  
  /**
   * Get traffic flow data for a specific route
   */
  async getTrafficFlow(startLat: number, startLng: number, endLat: number, endLng: number): Promise<{
    route: any;
    trafficDelay: number;
    summary: {
      lengthInMeters: number;
      travelTimeInSeconds: number;
      trafficDelayInSeconds: number;
      departureTime: string;
      arrivalTime: string;
    };
  }> {
    const response = await fetch(
      `${this.baseUrl}/services/4/calculateRoute/${startLat},${startLng}:${endLat},${endLng}/json?` +
      `key=${this.apiKey}&` +
      `traffic=true&` +
      `travelMode=car&` +
      `routeType=fastest`
    );
    
    if (!response.ok) {
      throw new Error(`TomTom Traffic API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.routes || data.routes.length === 0) {
      throw new Error('No route found');
    }
    
    const route = data.routes[0];
    const summary = route.summary;
    
    return {
      route: route,
      trafficDelay: summary.trafficDelayInSeconds || 0,
      summary: {
        lengthInMeters: summary.lengthInMeters,
        travelTimeInSeconds: summary.travelTimeInSeconds,
        trafficDelayInSeconds: summary.trafficDelayInSeconds || 0,
        departureTime: summary.departureTime,
        arrivalTime: summary.arrivalTime
      }
    };
  }
  
  /**
   * Get traffic incidents in a bounding box
   */
  async getTrafficIncidents(geometry: any): Promise<{
    incidents: TrafficIncident[];
    totalIncidents: number;
    severityBreakdown: {
      minor: number;
      moderate: number;
      major: number;
      critical: number;
    };
  }> {
    const bbox = this.geometryToBBox(geometry);
    
    const response = await fetch(
      `${this.baseUrl}/services/4/incidentDetails/s3/${bbox}/json?` +
      `key=${this.apiKey}&` +
      `language=en&` +
      `categoryFilter=0,1,2,3,4,5,6,7,8,9,10,11`
    );
    
    if (!response.ok) {
      throw new Error(`TomTom Incidents API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    const incidents: TrafficIncident[] = (data.tm?.poi || []).map((incident: any) => ({
      id: incident.id,
      type: this.getIncidentType(incident.icnTyp),
      severity: this.mapSeverity(incident.ty),
      description: incident.d || 'Traffic incident',
      location: {
        lat: incident.p?.y || 0,
        lng: incident.p?.x || 0
      },
      roadName: incident.rd || 'Unknown road',
      startTime: incident.startTime || new Date().toISOString(),
      endTime: incident.endTime,
      delay: incident.dl || 0
    }));
    
    const severityBreakdown = this.calculateSeverityBreakdown(incidents);
    
    return {
      incidents,
      totalIncidents: incidents.length,
      severityBreakdown
    };
  }
  
  /**
   * Analyze traffic congestion for a region
   */
  async analyzeRegionalTraffic(geometry: any): Promise<{
    congestionLevel: string;
    averageSpeed: number;
    congestionHotspots: Array<{
      location: { lat: number; lng: number };
      congestionScore: number;
      description: string;
    }>;
    recommendations: string[];
  }> {
    const center = this.getGeometryCenter(geometry);
    const corners = this.getGeometryCorners(geometry);
    
    // Get traffic data for multiple routes within the region
    const trafficPromises = corners.map(corner => 
      this.getTrafficFlow(center.lat, center.lng, corner.lat, corner.lng)
        .catch(error => {
          console.warn(`Failed to get traffic for route:`, error);
          return null;
        })
    );
    
    const trafficResults = (await Promise.all(trafficPromises)).filter(Boolean);
    
    if (trafficResults.length === 0) {
      return {
        congestionLevel: "Unknown",
        averageSpeed: 0,
        congestionHotspots: [],
        recommendations: ["Traffic data unavailable for this region"]
      };
    }
    
    // Calculate metrics
    const totalDelay = trafficResults.reduce((sum, result) => sum + (result?.trafficDelay || 0), 0);
    const averageDelay = totalDelay / trafficResults.length;
    const totalDistance = trafficResults.reduce((sum, result) => sum + (result?.summary.lengthInMeters || 0), 0);
    const totalTime = trafficResults.reduce((sum, result) => sum + (result?.summary.travelTimeInSeconds || 0), 0);
    const averageSpeed = totalDistance > 0 ? (totalDistance / totalTime) * 3.6 : 0; // km/h
    
    // Determine congestion level
    let congestionLevel: string;
    if (averageDelay > 300) {
      congestionLevel = "Severe";
    } else if (averageDelay > 120) {
      congestionLevel = "Heavy";
    } else if (averageDelay > 60) {
      congestionLevel = "Moderate";
    } else if (averageDelay > 30) {
      congestionLevel = "Light";
    } else {
      congestionLevel = "Minimal";
    }
    
    // Identify congestion hotspots
    const congestionHotspots = trafficResults
      .filter(result => (result?.trafficDelay || 0) > 60)
      .map((result, index) => ({
        location: corners[index],
        congestionScore: Math.round((result?.trafficDelay || 0) / 60 * 10) / 10,
        description: `${Math.round((result?.trafficDelay || 0) / 60)} min delay on this route`
      }));
    
    // Generate recommendations
    const recommendations: string[] = [];
    if (congestionLevel === "Severe" || congestionLevel === "Heavy") {
      recommendations.push("Consider implementing traffic management systems");
      recommendations.push("Evaluate public transportation improvements");
      recommendations.push("Analyze alternative route options");
    }
    if (congestionHotspots.length > 2) {
      recommendations.push("Multiple congestion points identified - comprehensive traffic study recommended");
    }
    if (averageSpeed < 20) {
      recommendations.push("Very low average speeds - consider infrastructure upgrades");
    }
    
    return {
      congestionLevel,
      averageSpeed: Math.round(averageSpeed * 10) / 10,
      congestionHotspots,
      recommendations
    };
  }
  
  /**
   * Get optimal routes between multiple points
   */
  async getOptimalRoutes(points: Array<{lat: number, lng: number}>): Promise<{
    routes: Array<{
      from: {lat: number, lng: number};
      to: {lat: number, lng: number};
      distance: number;
      travelTime: number;
      trafficDelay: number;
    }>;
    totalDistance: number;
    totalTime: number;
    averageSpeed: number;
  }> {
    const routes = [];
    let totalDistance = 0;
    let totalTime = 0;
    
    for (let i = 0; i < points.length - 1; i++) {
      const from = points[i];
      const to = points[i + 1];
      
      try {
        const routeData = await this.getTrafficFlow(from.lat, from.lng, to.lat, to.lng);
        
        const route = {
          from,
          to,
          distance: routeData.summary.lengthInMeters,
          travelTime: routeData.summary.travelTimeInSeconds,
          trafficDelay: routeData.trafficDelay
        };
        
        routes.push(route);
        totalDistance += route.distance;
        totalTime += route.travelTime;
      } catch (error) {
        console.warn(`Failed to get route from ${from.lat},${from.lng} to ${to.lat},${to.lng}:`, error);
      }
    }
    
    const averageSpeed = totalDistance > 0 ? (totalDistance / totalTime) * 3.6 : 0;
    
    return {
      routes,
      totalDistance,
      totalTime,
      averageSpeed: Math.round(averageSpeed * 10) / 10
    };
  }
  
  private geometryToBBox(geometry: any): string {
    const coords = geometry.coordinates[0];
    const lats = coords.map((c: number[]) => c[1]);
    const lngs = coords.map((c: number[]) => c[0]);
    
    const minLat = Math.min(...lats);
    const minLng = Math.min(...lngs);
    const maxLat = Math.max(...lats);
    const maxLng = Math.max(...lngs);
    
    return `${minLat},${minLng},${maxLat},${maxLng}`;
  }
  
  private getGeometryCenter(geometry: any): { lat: number; lng: number } {
    const coords = geometry.coordinates[0];
    const centerLat = coords.reduce((sum: number, coord: number[]) => sum + coord[1], 0) / coords.length;
    const centerLng = coords.reduce((sum: number, coord: number[]) => sum + coord[0], 0) / coords.length;
    
    return { lat: centerLat, lng: centerLng };
  }
  
  private getGeometryCorners(geometry: any): Array<{ lat: number; lng: number }> {
    const coords = geometry.coordinates[0];
    const lats = coords.map((c: number[]) => c[1]);
    const lngs = coords.map((c: number[]) => c[0]);
    
    return [
      { lat: Math.min(...lats), lng: Math.min(...lngs) }, // SW
      { lat: Math.max(...lats), lng: Math.min(...lngs) }, // NW
      { lat: Math.max(...lats), lng: Math.max(...lngs) }, // NE
      { lat: Math.min(...lats), lng: Math.max(...lngs) }  // SE
    ];
  }
  
  private getIncidentType(icnTyp: number): string {
    const types: { [key: number]: string } = {
      0: "Unknown",
      1: "Accident",
      2: "Fog",
      3: "Dangerous Conditions",
      4: "Rain",
      5: "Ice",
      6: "Jam",
      7: "Lane Closed",
      8: "Road Closed",
      9: "Road Works",
      10: "Wind",
      11: "Flooding"
    };
    
    return types[icnTyp] || "Unknown";
  }
  
  private mapSeverity(ty: number): number {
    // Map TomTom severity to 1-4 scale
    if (ty <= 1) return 1; // Minor
    if (ty <= 2) return 2; // Moderate  
    if (ty <= 3) return 3; // Major
    return 4; // Critical
  }
  
  private calculateSeverityBreakdown(incidents: TrafficIncident[]): {
    minor: number;
    moderate: number;
    major: number;
    critical: number;
  } {
    return incidents.reduce((acc, incident) => {
      switch (incident.severity) {
        case 1: acc.minor++; break;
        case 2: acc.moderate++; break;
        case 3: acc.major++; break;
        case 4: acc.critical++; break;
      }
      return acc;
    }, { minor: 0, moderate: 0, major: 0, critical: 0 });
  }
}
