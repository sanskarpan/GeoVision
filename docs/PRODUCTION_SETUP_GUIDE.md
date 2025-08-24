# Production Setup Guide: Real Data Sources & API Integration

This guide walks you through replacing mock functions with real data sources and obtaining all necessary API keys for production deployment.

## 🌍 1. Google Earth Engine (GEE) Setup

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "New Project" and create a project (e.g., "urban-planning-gee")
3. Note your Project ID

### Step 2: Enable APIs
Enable these APIs in your Google Cloud Console:
```bash
# APIs to enable:
- Earth Engine API
- Cloud Resource Manager API
- Cloud Storage API (optional)
```

### Step 3: Create Service Account
1. Navigate to IAM & Admin > Service Accounts
2. Click "Create Service Account"
3. Name: `gee-urban-planning`
4. Description: `Service account for urban planning GEE analysis`
5. Click "Create and Continue"

### Step 4: Add Roles
Add these roles to your service account:
- `Earth Engine Resource Admin`
- `Earth Engine Resource Viewer`
- `Storage Object Viewer` (if using Cloud Storage)

### Step 5: Generate Private Key
1. Click on your service account
2. Go to "Keys" tab
3. Click "Add Key" > "Create new key"
4. Choose "JSON" format
5. Download and securely store the JSON file

### Step 6: Register for Earth Engine
1. Visit [Google Earth Engine](https://earthengine.google.com/)
2. Click "Get Started"
3. Register your Google account
4. Request access (usually approved within 24-48 hours)

### Environment Variables
```bash
export GEE_SERVICE_ACCOUNT_EMAIL="gee-urban-planning@your-project.iam.gserviceaccount.com"
export GEE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...your-key...\n-----END PRIVATE KEY-----"
export GEE_PROJECT_ID="your-project-id"
```

### Replace Mock GEE Functions
Update your API endpoints to use real GEE functions:

```typescript
// In your API endpoints, replace:
const mockData = await analyzeTrafficCongestion(selectedRoiGeometry, year);

// With:
import { processTrafficCongestionAnalysis } from '@/lib/gee/urban-planning-processors';
const realData = await processTrafficCongestionAnalysis(selectedRoiGeometry, startDate, endDate);
```

---

## 🗺️ 2. Google Maps Platform APIs

### Step 1: Enable APIs
In Google Cloud Console, enable:
- Maps JavaScript API
- Places API
- Directions API
- Distance Matrix API
- Elevation API
- Geocoding API

### Step 2: Create API Key
1. Go to APIs & Services > Credentials
2. Click "Create Credentials" > "API Key"
3. Copy the API key
4. Click "Restrict Key" for security

### Step 3: Set Restrictions
**Application restrictions:**
- HTTP referrers for frontend use
- IP addresses for backend use

**API restrictions:**
Select only the APIs you need:
- Maps JavaScript API
- Places API
- Directions API
- Distance Matrix API
- Elevation API

### Environment Variables
```bash
export GOOGLE_MAPS_API_KEY="AIzaSy..."
export GOOGLE_MAPS_BACKEND_KEY="AIzaSy..." # Separate key for server-side use
```

### Integration Code
```typescript
// lib/data-sources/google-maps.ts
export class GoogleMapsService {
  private apiKey: string;
  
  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY!;
  }
  
  async getPlaces(geometry: any, type: string) {
    const bounds = this.geometryToBounds(geometry);
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
      `location=${bounds.center.lat},${bounds.center.lng}&` +
      `radius=${bounds.radius}&` +
      `type=${type}&` +
      `key=${this.apiKey}`
    );
    return response.json();
  }
  
  async getDirections(origin: string, destination: string) {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/directions/json?` +
      `origin=${origin}&` +
      `destination=${destination}&` +
      `key=${this.apiKey}`
    );
    return response.json();
  }
}
```

---

## 🛰️ 3. Copernicus Data Space Ecosystem (CDSE)

### Step 1: Register Account
1. Go to [Copernicus Data Space](https://dataspace.copernicus.eu/)
2. Click "Register"
3. Fill out registration form
4. Verify email address

### Step 2: Generate API Credentials
1. Login to your account
2. Go to User Profile > API Access
3. Generate OAuth credentials
4. Note your Client ID and Client Secret

### Environment Variables
```bash
export CDSE_CLIENT_ID="your-client-id"
export CDSE_CLIENT_SECRET="your-client-secret"
export CDSE_USERNAME="your-username"
export CDSE_PASSWORD="your-password"
```

### Integration Code
```typescript
// lib/data-sources/copernicus.ts
export class CopernicusService {
  private baseUrl = 'https://catalogue.dataspace.copernicus.eu';
  private accessToken: string | null = null;
  
  async authenticate() {
    const response = await fetch(`${this.baseUrl}/api/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'password',
        username: process.env.CDSE_USERNAME!,
        password: process.env.CDSE_PASSWORD!,
        client_id: process.env.CDSE_CLIENT_ID!,
        client_secret: process.env.CDSE_CLIENT_SECRET!
      })
    });
    
    const data = await response.json();
    this.accessToken = data.access_token;
  }
  
  async searchProducts(geometry: any, startDate: string, endDate: string) {
    if (!this.accessToken) await this.authenticate();
    
    const response = await fetch(`${this.baseUrl}/api/catalogue/products`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        geometry,
        startDate,
        endDate,
        productType: 'S2MSI1C'
      })
    });
    
    return response.json();
  }
}
```

---

## 🗂️ 4. OpenStreetMap Data

### No API Key Required
OpenStreetMap data is free, but you need to respect usage limits.

### Integration via Overpass API
```typescript
// lib/data-sources/openstreetmap.ts
export class OpenStreetMapService {
  private overpassUrl = 'https://overpass-api.de/api/interpreter';
  
  async getFeatures(geometry: any, featureTypes: string[]) {
    const bbox = this.geometryToBBox(geometry);
    
    const queries = featureTypes.map(type => {
      switch (type) {
        case 'roads':
          return `way["highway"](${bbox});`;
        case 'buildings':
          return `way["building"](${bbox});`;
        case 'transport':
          return `node["public_transport"](${bbox});`;
        default:
          return '';
      }
    }).join('');
    
    const overpassQuery = `
      [out:json][timeout:25];
      (
        ${queries}
      );
      out geom;
    `;
    
    const response = await fetch(this.overpassUrl, {
      method: 'POST',
      body: overpassQuery,
      headers: { 'Content-Type': 'text/plain' }
    });
    
    return response.json();
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
}
```

---

## 🚗 5. Traffic Data APIs

### Option 1: HERE Traffic API

**Step 1: Register**
1. Go to [HERE Developer Portal](https://developer.here.com/)
2. Create account and verify email
3. Create new project
4. Generate API key

**Pricing:** Freemium (2,500 requests/month free)

```typescript
// lib/data-sources/here-traffic.ts
export class HereTrafficService {
  private apiKey = process.env.HERE_API_KEY!;
  private baseUrl = 'https://traffic.ls.hereapi.com/traffic/6.3';
  
  async getTrafficFlow(geometry: any) {
    const bbox = this.geometryToBBox(geometry);
    const response = await fetch(
      `${this.baseUrl}/flow.json?` +
      `bbox=${bbox}&` +
      `apikey=${this.apiKey}`
    );
    return response.json();
  }
}
```

### Option 2: TomTom Traffic API

**Step 1: Register**
1. Go to [TomTom Developer Portal](https://developer.tomtom.com/)
2. Create account
3. Get API key from dashboard

**Environment Variables:**
```bash
export HERE_API_KEY="your-here-api-key"
# OR
export TOMTOM_API_KEY="your-tomtom-api-key"
```

---

## 🏠 6. Property Value APIs

### Option 1: Zillow API (US Only)

**Note:** Zillow deprecated public API, but alternatives exist:

### Option 2: RentSpree API
1. Go to [RentSpree API](https://api.rentspree.com/)
2. Request API access
3. Get API key

### Option 3: RealtyMole API
1. Visit [RealtyMole](https://rapidapi.com/realtymole/api/realty-mole-property-api)
2. Subscribe on RapidAPI
3. Get API key

```typescript
// lib/data-sources/property-data.ts
export class PropertyDataService {
  async getPropertyValues(geometry: any) {
    // Example with RealtyMole via RapidAPI
    const response = await fetch(
      'https://realty-mole-property-api.p.rapidapi.com/properties',
      {
        headers: {
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY!,
          'X-RapidAPI-Host': 'realty-mole-property-api.p.rapidapi.com'
        }
      }
    );
    return response.json();
  }
}
```

---

## 📊 7. Demographic Data APIs

### Option 1: US Census Bureau API (Free)

**Step 1: Get API Key**
1. Go to [Census API](https://api.census.gov/data/key_signup.html)
2. Register with email
3. Receive API key via email

```typescript
// lib/data-sources/census-data.ts
export class CensusDataService {
  private apiKey = process.env.CENSUS_API_KEY!;
  
  async getDemographics(state: string, county: string) {
    const response = await fetch(
      `https://api.census.gov/data/2021/acs/acs5?` +
      `get=B01003_001E,B25077_001E&` +
      `for=tract:*&` +
      `in=state:${state}%20county:${county}&` +
      `key=${this.apiKey}`
    );
    return response.json();
  }
}
```

### Option 2: WorldPop API (Global, Free)

**No API key required** - Direct data access:

```typescript
// lib/data-sources/worldpop.ts
export class WorldPopService {
  async getPopulationData(country: string, year: number) {
    const response = await fetch(
      `https://www.worldpop.org/rest/data/pop/wpgp?` +
      `iso3=${country}&year=${year}`
    );
    return response.json();
  }
}
```

---

## 🌤️ 8. Weather & Climate APIs

### Option 1: OpenWeatherMap API

**Step 1: Register**
1. Go to [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for free account
3. Get API key from dashboard

**Pricing:** Free tier (60 calls/minute, 1M calls/month)

### Option 2: NOAA API (US Only, Free)

**No API key required** for basic data.

```typescript
// lib/data-sources/weather.ts
export class WeatherService {
  async getHistoricalWeather(lat: number, lng: number, date: string) {
    const response = await fetch(
      `https://api.openweathermap.org/data/3.0/onecall/timemachine?` +
      `lat=${lat}&lon=${lng}&dt=${date}&` +
      `appid=${process.env.OPENWEATHER_API_KEY}`
    );
    return response.json();
  }
}
```

---

## 💻 Complete Environment Variables Setup

Create a `.env.local` file with all required keys:

```bash
# Google Earth Engine
GEE_SERVICE_ACCOUNT_EMAIL="your-service-account@project.iam.gserviceaccount.com"
GEE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
GEE_PROJECT_ID="your-gee-project-id"

# Google Maps Platform
GOOGLE_MAPS_API_KEY="AIzaSy..."
GOOGLE_MAPS_BACKEND_KEY="AIzaSy..."

# Copernicus Data Space
CDSE_CLIENT_ID="your-client-id"
CDSE_CLIENT_SECRET="your-client-secret"
CDSE_USERNAME="your-username"
CDSE_PASSWORD="your-password"

# Traffic APIs
HERE_API_KEY="your-here-api-key"
TOMTOM_API_KEY="your-tomtom-api-key"

# Property Data
RAPIDAPI_KEY="your-rapidapi-key"
REALTYMOLE_API_KEY="your-realtymole-key"

# Demographics
CENSUS_API_KEY="your-census-api-key"

# Weather
OPENWEATHER_API_KEY="your-openweather-key"

# Database URLs (if using external data storage)
REDIS_URL="redis://localhost:6379"
POSTGRES_URL="postgresql://..."
```

---

## 🔄 Step-by-Step Migration Process

### Step 1: Start with Google Earth Engine
1. Set up GEE service account (most critical)
2. Replace one analysis type at a time
3. Test thoroughly before moving to next

### Step 2: Add OpenStreetMap Integration
1. No API key required - start here
2. Implement road and building data fetching
3. Cache results to avoid repeated requests

### Step 3: Integrate Google Maps APIs
1. Get API keys and set restrictions
2. Add Places API for POI data
3. Add Directions API for accessibility analysis

### Step 4: Add Specialized APIs
1. Traffic data (HERE or TomTom)
2. Property data (RealtyMole)
3. Demographics (Census Bureau)
4. Weather data (OpenWeatherMap)

### Step 5: Implement Caching
```typescript
// lib/cache/redis-cache.ts
import Redis from 'ioredis';

export class CacheService {
  private redis = new Redis(process.env.REDIS_URL);
  
  async get(key: string) {
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }
  
  async set(key: string, data: any, ttl: number = 3600) {
    await this.redis.setex(key, ttl, JSON.stringify(data));
  }
}
```

---

## 📈 Cost Estimation

### Monthly Costs (for moderate usage):

**Free Tier Services:**
- OpenStreetMap: $0
- US Census API: $0
- WorldPop: $0
- NOAA Weather: $0

**Paid Services:**
- Google Earth Engine: $0-50/month (depending on compute)
- Google Maps APIs: $20-200/month (depending on usage)
- HERE Traffic API: $0-99/month (freemium)
- RealtyMole API: $20-100/month
- OpenWeatherMap: $0-40/month

**Total Estimated Cost: $40-500/month** depending on usage volume

---

## 🔒 Security Best Practices

### API Key Security
1. **Never commit API keys to version control**
2. **Use environment variables only**
3. **Rotate keys regularly**
4. **Set up API restrictions and quotas**
5. **Monitor usage for unusual patterns**

### Rate Limiting
```typescript
// lib/utils/rate-limiter.ts
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  async checkLimit(apiKey: string, maxRequests: number, windowMs: number): Promise<boolean> {
    const now = Date.now();
    const requests = this.requests.get(apiKey) || [];
    
    // Remove old requests outside window
    const validRequests = requests.filter(time => now - time < windowMs);
    
    if (validRequests.length >= maxRequests) {
      return false; // Rate limit exceeded
    }
    
    validRequests.push(now);
    this.requests.set(apiKey, validRequests);
    return true;
  }
}
```

---

## 🧪 Testing Real APIs

### Create Test Endpoints
```typescript
// pages/api/test/data-sources.ts
export default async function handler(req: NextRequest) {
  const results = {
    gee: await testGEEConnection(),
    googleMaps: await testGoogleMapsAPI(),
    osm: await testOpenStreetMap(),
    here: await testHERETraffic(),
    census: await testCensusAPI()
  };
  
  return NextResponse.json(results);
}
```

### Monitor API Usage
Set up monitoring to track:
- API response times
- Error rates
- Quota usage
- Cost tracking

This complete setup will give you production-ready urban planning analysis tools with real data sources and comprehensive API integration!
