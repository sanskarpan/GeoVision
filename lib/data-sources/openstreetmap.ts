/**
 * OpenStreetMap API Integration
 * Provides real-time geospatial data for urban planning analysis via Overpass API
 */

export interface OSMElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  tags?: { [key: string]: string };
  geometry?: Array<{ lat: number; lon: number }>;
}

export interface OSMFeatureResponse {
  version: number;
  generator: string;
  elements: OSMElement[];
}

export interface RoadNetworkData {
  roads: Array<{
    id: number;
    type: string;
    name: string;
    length: number;
    coordinates: Array<{ lat: number; lng: number }>;
  }>;
  totalLength: number;
  networkDensity: number;
  intersections: Array<{
    id: number;
    location: { lat: number; lng: number };
    roads: number[];
  }>;
}

export class OpenStreetMapService {
  private baseUrl = 'https://overpass-api.de/api/interpreter';
  private timeout = 25; // seconds
  
  constructor() {
    // OpenStreetMap/Overpass API is free and doesn't require an API key
    console.log('🗺️ OpenStreetMap service initialized with Overpass API');
  }
  
  /**
   * Get features from OpenStreetMap for a specific geometry
   */
  async getFeatures(geometry: any, featureTypes: string[]): Promise<OSMFeatureResponse> {
    const bbox = this.geometryToBBox(geometry);
    
    const queries = featureTypes.map(type => {
      switch (type) {
        case 'roads':
          return `way["highway"~"^(motorway|trunk|primary|secondary|tertiary|residential|unclassified)$"](${bbox});`;
        case 'buildings':
          return `way["building"](${bbox});`;
        case 'transport':
          return `
            node["public_transport"="stop_position"](${bbox});
            node["highway"="bus_stop"](${bbox});
            way["public_transport"="platform"](${bbox});
            node["railway"="station"](${bbox});
            node["railway"="subway_entrance"](${bbox});
          `;
        case 'landuse':
          return `way["landuse"](${bbox});`;
        case 'amenities':
          return `node["amenity"](${bbox});`;
        case 'waterways':
          return `way["waterway"](${bbox});`;
        default:
          return '';
      }
    }).join('');
    
    const overpassQuery = `
      [out:json][timeout:${this.timeout}];
      (
        ${queries}
      );
      out geom;
    `;
    
    try {
      console.log(`🔍 Querying OpenStreetMap for: ${featureTypes.join(', ')}`);
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        body: overpassQuery,
        headers: { 
          'Content-Type': 'text/plain',
          'User-Agent': 'GeoVision/1.0 (https://github.com/yourusername/geovision)' // Replace with your actual repo
        }
      });
      
      if (!response.ok) {
        throw new Error(`Overpass API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`✅ OpenStreetMap query successful: ${data.elements?.length || 0} elements found`);
      
      return data;
    } catch (error) {
      console.error('OpenStreetMap API error:', error);
      throw error;
    }
  }
  
  /**
   * Get road network data for traffic and infrastructure analysis
   */
  async getRoadNetwork(geometry: any): Promise<RoadNetworkData> {
    try {
      const data = await this.getFeatures(geometry, ['roads']);
      
      const roads = data.elements
        .filter((el: OSMElement) => el.type === 'way' && el.geometry)
        .map((road: OSMElement) => {
          const coordinates = road.geometry?.map(coord => ({
            lat: coord.lat,
            lng: coord.lon
          })) || [];
          
          const length = this.calculateRoadLength(coordinates);
          
          return {
            id: road.id,
            type: road.tags?.highway || 'unknown',
            name: road.tags?.name || `Road ${road.id}`,
            length,
            coordinates
          };
        });
      
      const totalLength = roads.reduce((sum, road) => sum + road.length, 0);
      const area = this.calculatePolygonArea(geometry.coordinates[0]);
      const networkDensity = area > 0 ? (totalLength / area) * 1000000 : 0; // km of roads per km²
      
      // Simple intersection detection (roads that share endpoints)
      const intersections = this.findIntersections(roads);
      
      return {
        roads,
        totalLength: Math.round(totalLength * 100) / 100,
        networkDensity: Math.round(networkDensity * 100) / 100,
        intersections
      };
    } catch (error) {
      console.error('Error getting road network:', error);
      return {
        roads: [],
        totalLength: 0,
        networkDensity: 0,
        intersections: []
      };
    }
  }
  
  /**
   * Get public transport stops and infrastructure
   */
  async getPublicTransport(geometry: any): Promise<{
    stops: Array<{
      id: number;
      name: string;
      type: string;
      location: { lat: number; lng: number };
    }>;
    coverage: {
      totalStops: number;
      stopsPerKm2: number;
      accessibilityScore: number;
    };
  }> {
    try {
      const data = await this.getFeatures(geometry, ['transport']);
      
      const stops = data.elements
        .filter((el: OSMElement) => el.type === 'node' && el.lat && el.lon)
        .map((stop: OSMElement) => ({
          id: stop.id,
          name: stop.tags?.name || `Stop ${stop.id}`,
          type: stop.tags?.public_transport || stop.tags?.highway || stop.tags?.railway || 'unknown',
          location: { lat: stop.lat!, lng: stop.lon! }
        }));
      
      const area = this.calculatePolygonArea(geometry.coordinates[0]);
      const stopsPerKm2 = area > 0 ? (stops.length / area) * 1000000 : 0;
      
      // Simple accessibility score based on stop density
      const accessibilityScore = Math.min(1, stopsPerKm2 / 10); // Normalized to 0-1
      
      return {
        stops,
        coverage: {
          totalStops: stops.length,
          stopsPerKm2: Math.round(stopsPerKm2 * 100) / 100,
          accessibilityScore: Math.round(accessibilityScore * 100) / 100
        }
      };
    } catch (error) {
      console.error('Error getting public transport data:', error);
      return {
        stops: [],
        coverage: {
          totalStops: 0,
          stopsPerKm2: 0,
          accessibilityScore: 0
        }
      };
    }
  }
  
  /**
   * Get building footprints for urban density analysis
   */
  async getBuildings(geometry: any): Promise<{
    buildings: Array<{
      id: number;
      type: string;
      area: number;
      coordinates: Array<{ lat: number; lng: number }>;
    }>;
    density: {
      totalBuildings: number;
      buildingsPerKm2: number;
      totalBuildingArea: number;
      buildingCoverage: number; // percentage of area covered by buildings
    };
  }> {
    try {
      const data = await this.getFeatures(geometry, ['buildings']);
      
      const buildings = data.elements
        .filter((el: OSMElement) => el.type === 'way' && el.geometry)
        .map((building: OSMElement) => {
          const coordinates = building.geometry?.map(coord => ({
            lat: coord.lat,
            lng: coord.lon
          })) || [];
          
          const area = this.calculatePolygonArea(coordinates);
          
          return {
            id: building.id,
            type: building.tags?.building || 'yes',
            area,
            coordinates
          };
        });
      
      const totalBuildingArea = buildings.reduce((sum, building) => sum + building.area, 0);
      const geometryArea = this.calculatePolygonArea(geometry.coordinates[0]);
      const buildingsPerKm2 = geometryArea > 0 ? (buildings.length / geometryArea) * 1000000 : 0;
      const buildingCoverage = geometryArea > 0 ? (totalBuildingArea / geometryArea) * 100 : 0;
      
      return {
        buildings,
        density: {
          totalBuildings: buildings.length,
          buildingsPerKm2: Math.round(buildingsPerKm2),
          totalBuildingArea: Math.round(totalBuildingArea * 100) / 100,
          buildingCoverage: Math.round(buildingCoverage * 100) / 100
        }
      };
    } catch (error) {
      console.error('Error getting building data:', error);
      return {
        buildings: [],
        density: {
          totalBuildings: 0,
          buildingsPerKm2: 0,
          totalBuildingArea: 0,
          buildingCoverage: 0
        }
      };
    }
  }
  
  private geometryToBBox(geometry: any): string {
    const coords = geometry.coordinates[0];
    const lats = coords.map((c: number[]) => c[1]);
    const lngs = coords.map((c: number[]) => c[0]);
    
    return [
      Math.min(...lats),
      Math.min(...lngs), 
      Math.max(...lats),
      Math.max(...lngs)
    ].join(',');
  }
  
  private calculateRoadLength(coordinates: Array<{ lat: number; lng: number }>): number {
    if (coordinates.length < 2) return 0;
    
    let length = 0;
    for (let i = 1; i < coordinates.length; i++) {
      length += this.haversineDistance(
        coordinates[i - 1].lat, coordinates[i - 1].lng,
        coordinates[i].lat, coordinates[i].lng
      );
    }
    return length;
  }
  
  private calculatePolygonArea(coordinates: Array<{ lat: number; lng: number }> | number[][]): number {
    // Convert to [lat, lng] format if needed
    const coords = coordinates.map(coord => {
      if (Array.isArray(coord)) {
        return { lat: coord[1], lng: coord[0] }; // [lng, lat] -> {lat, lng}
      }
      return coord;
    });
    
    if (coords.length < 3) return 0;
    
    // Simple polygon area calculation (approximate for small areas)
    let area = 0;
    for (let i = 0; i < coords.length; i++) {
      const j = (i + 1) % coords.length;
      area += coords[i].lng * coords[j].lat;
      area -= coords[j].lng * coords[i].lat;
    }
    area = Math.abs(area) / 2;
    
    // Convert to square meters (very approximate)
    const earthRadius = 6371000; // meters
    const latRad = (coords[0].lat * Math.PI) / 180;
    const metersPerDegree = earthRadius * Math.cos(latRad) * (Math.PI / 180);
    
    return area * metersPerDegree * metersPerDegree;
  }
  
  private haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  
  private findIntersections(roads: Array<{
    id: number;
    coordinates: Array<{ lat: number; lng: number }>;
  }>): Array<{
    id: number;
    location: { lat: number; lng: number };
    roads: number[];
  }> {
    const intersections: Array<{
      id: number;
      location: { lat: number; lng: number };
      roads: number[];
    }> = [];
    
    // Simple intersection detection based on road endpoints
    const endpoints: { [key: string]: number[] } = {};
    
    roads.forEach(road => {
      if (road.coordinates.length < 2) return;
      
      const start = road.coordinates[0];
      const end = road.coordinates[road.coordinates.length - 1];
      
      [start, end].forEach(point => {
        const key = `${point.lat.toFixed(6)},${point.lng.toFixed(6)}`;
        if (!endpoints[key]) {
          endpoints[key] = [];
        }
        endpoints[key].push(road.id);
      });
    });
    
    let intersectionId = 1;
    Object.entries(endpoints).forEach(([coordStr, roadIds]) => {
      if (roadIds.length > 1) {
        const [lat, lng] = coordStr.split(',').map(Number);
        intersections.push({
          id: intersectionId++,
          location: { lat, lng },
          roads: roadIds
        });
      }
    });
    
    return intersections;
  }
}
