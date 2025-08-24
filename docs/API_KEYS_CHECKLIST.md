# API Keys & Real Data Integration Checklist

## 🎯 Complete Implementation Guide

Follow this checklist to replace mock functions with real data sources and get all necessary API keys.

---

## ✅ Phase 1: Essential APIs (Start Here)

### 🌍 1. Google Earth Engine (CRITICAL - Core satellite data)

**What it provides:** Satellite imagery, vegetation analysis, land surface temperature, elevation data

**Steps to get access:**
1. ✅ Create Google Cloud Project at [console.cloud.google.com](https://console.cloud.google.com)
2. ✅ Enable "Earth Engine API"
3. ✅ Create Service Account with "Earth Engine Resource Admin" role
4. ✅ Download JSON key file
5. ✅ Register at [earthengine.google.com](https://earthengine.google.com) (24-48hr approval)

**Environment Variables:**
```bash
GEE_SERVICE_ACCOUNT_EMAIL="your-service-account@project.iam.gserviceaccount.com"
GEE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
GEE_PROJECT_ID="your-gee-project-id"
```

**Test Command:**
```bash
curl -X POST http://localhost:3000/api/urban-planning/request-green-space-analysis \
  -H "Content-Type: application/json" \
  -d '{"analysisType": "Green Space Coverage Assessment", "vegetationIndex": "NDVI", "selectedRoiGeometry": {"type": "Polygon", "coordinates": [[[-74.0059, 40.7128], [-74.0059, 40.7589], [-73.9441, 40.7589], [-73.9441, 40.7128], [-74.0059, 40.7128]]]}}'
```

---

### 🗺️ 2. OpenStreetMap (FREE - Road networks, buildings, transport)

**What it provides:** Road networks, building footprints, public transport stops, land use data

**Steps to get access:**
- ✅ No API key required! 
- ✅ Uses public Overpass API
- ✅ Respect rate limits (max 10,000 requests/hour)

**Environment Variables:**
```bash
# No API keys needed for OSM
OSM_BASE_URL="https://overpass-api.de/api/interpreter"
```

**Test Command:**
```bash
curl -X POST http://localhost:3000/api/urban-planning/request-infrastructure-analysis \
  -H "Content-Type: application/json" \
  -d '{"analysisType": "Road Network Density", "infrastructureType": "Roads and Highways", "selectedRoiGeometry": {"type": "Polygon", "coordinates": [[[-74.0059, 40.7128], [-74.0059, 40.7589], [-73.9441, 40.7589], [-73.9441, 40.7128], [-74.0059, 40.7128]]]}}'
```

---

## ✅ Phase 2: Enhanced Features

### 🗺️ 3. Google Maps Platform (Places, Directions, Elevation)

**What it provides:** Points of interest, routing, elevation data, geocoding

**Steps to get access:**
1. ✅ Go to [console.cloud.google.com](https://console.cloud.google.com)
2. ✅ Enable these APIs:
   - Places API
   - Directions API  
   - Elevation API
   - Geocoding API
3. ✅ Create API Key
4. ✅ Set restrictions (HTTP referrers for frontend, IP for backend)

**Cost:** $20-200/month depending on usage

**Environment Variables:**
```bash
GOOGLE_MAPS_API_KEY="AIzaSy..."
```

**Test Command:**
```bash
# Test via the Places API integration in transport analysis
curl -X POST http://localhost:3000/api/urban-planning/request-transport-optimization-analysis \
  -H "Content-Type: application/json" \
  -d '{"analysisType": "Transit Accessibility Analysis", "transportModes": ["Bus"], "selectedRoiGeometry": {"type": "Polygon", "coordinates": [[[-74.0059, 40.7128], [-74.0059, 40.7589], [-73.9441, 40.7589], [-73.9441, 40.7128], [-74.0059, 40.7128]]]}}'
```

---

### 🚗 4. Traffic Data APIs

#### Option A: HERE Traffic API (Recommended)
1. ✅ Register at [developer.here.com](https://developer.here.com)
2. ✅ Create project and get API key
3. ✅ **Cost:** Freemium (2,500 requests/month free)

#### Option B: TomTom Traffic API
1. ✅ Register at [developer.tomtom.com](https://developer.tomtom.com)
2. ✅ Get API key from dashboard
3. ✅ **Cost:** Similar to HERE

**Environment Variables:**
```bash
HERE_API_KEY="your-here-api-key"
# OR
TOMTOM_API_KEY="your-tomtom-api-key"
```

---

## ✅ Phase 3: Specialized Data

### 🏠 5. Property Value APIs

#### Option A: RealtyMole API (via RapidAPI)
1. ✅ Go to [rapidapi.com/realtymole](https://rapidapi.com/realtymole/api/realty-mole-property-api)
2. ✅ Subscribe to plan
3. ✅ Get RapidAPI key

**Cost:** $20-100/month

**Environment Variables:**
```bash
RAPIDAPI_KEY="your-rapidapi-key"
```

#### Option B: Local Property Data
- Partner with local real estate databases
- Use MLS data feeds
- Contact regional property assessment offices

---

### 📊 6. Demographics APIs

#### Option A: US Census Bureau (FREE for US)
1. ✅ Register at [api.census.gov/data/key_signup.html](https://api.census.gov/data/key_signup.html)
2. ✅ Get API key via email

#### Option B: WorldPop (FREE - Global population)
- ✅ No API key required
- ✅ Direct data access via HTTP

**Environment Variables:**
```bash
CENSUS_API_KEY="your-census-key"  # For US data
# WorldPop requires no API key
```

---

### 🌤️ 7. Weather Data APIs

#### OpenWeatherMap (Recommended)
1. ✅ Register at [openweathermap.org](https://openweathermap.org/api)
2. ✅ Get free API key (60 calls/min, 1M calls/month)

**Environment Variables:**
```bash
OPENWEATHER_API_KEY="your-openweather-key"
```

---

## 🚀 Implementation Steps

### Step 1: Set Up Core APIs (Start Here)
```bash
# 1. Set up Google Earth Engine (most important)
export GEE_SERVICE_ACCOUNT_EMAIL="..."
export GEE_PRIVATE_KEY="..."
export GEE_PROJECT_ID="..."

# 2. Test GEE integration
npm run test-gee
```

### Step 2: Install Dependencies
```bash
npm install @google/earthengine ioredis
```

### Step 3: Run Migration Script
```bash
npx ts-node scripts/migrate-to-real-apis.ts
```

### Step 4: Test Each API Endpoint
```bash
# Test infrastructure analysis
npm test -- --testNamePattern="Infrastructure Analysis"

# Test green space analysis  
npm test -- --testNamePattern="Green Space Analysis"

# Test all APIs
npm test tests/urban-planning-api.test.ts
```

### Step 5: Monitor and Optimize
```bash
# Set up monitoring
export REDIS_URL="redis://localhost:6379"

# Monitor API usage
npm run monitor-apis
```

---

## 💰 Cost Breakdown (Monthly)

### Free Tier (Good for testing):
- ✅ **OpenStreetMap:** $0
- ✅ **US Census:** $0  
- ✅ **WorldPop:** $0
- ✅ **OpenWeatherMap:** $0 (with limits)
- **Total: $0/month**

### Basic Production (Moderate usage):
- ✅ **Google Earth Engine:** $0-50
- ✅ **Google Maps APIs:** $20-100
- ✅ **HERE Traffic:** $0-50 (freemium)
- ✅ **Property Data:** $20-50
- **Total: $40-250/month**

### Full Production (Heavy usage):
- ✅ **Google Earth Engine:** $50-200
- ✅ **Google Maps APIs:** $100-500
- ✅ **Traffic APIs:** $50-200
- ✅ **Property Data:** $100-300
- ✅ **Weather APIs:** $20-100
- **Total: $320-1,300/month**

---

## 🔧 Quick Start Commands

### 1. Test with Free APIs Only:
```bash
# Set up free APIs
export GEE_PROJECT_ID="your-project"  # (after GEE approval)
export CENSUS_API_KEY="your-census-key"

# Run tests
npm test
```

### 2. Test with Basic Setup:
```bash
# Add Google Maps
export GOOGLE_MAPS_API_KEY="your-maps-key"
export HERE_API_KEY="your-here-key"

# Test enhanced features
curl -X POST http://localhost:3000/api/urban-planning/request-infrastructure-analysis \
  -H "Content-Type: application/json" \
  -d '{"analysisType": "Traffic Congestion Hotspots", "infrastructureType": "Roads and Highways", "selectedRoiGeometry": {"type": "Polygon", "coordinates": [[[-74.0059, 40.7128], [-74.0059, 40.7589], [-73.9441, 40.7589], [-73.9441, 40.7128], [-74.0059, 40.7128]]]}}'
```

### 3. Full Production Setup:
```bash
# Set all environment variables
source .env.production

# Run full test suite
npm test -- --coverage

# Deploy to production
npm run deploy
```

---

## 🎯 Priority Order for Implementation

### Week 1: Core Foundation
1. ✅ **Google Earth Engine** (vegetation, temperature, elevation analysis)
2. ✅ **OpenStreetMap** (road networks, buildings, transport stops)

### Week 2: Enhanced Features  
3. ✅ **Google Maps APIs** (places, directions, elevation)
4. ✅ **Traffic APIs** (congestion analysis, incident data)

### Week 3: Specialized Data
5. ✅ **Demographics APIs** (population, census data)
6. ✅ **Property APIs** (investment analysis)
7. ✅ **Weather APIs** (climate data)

### Week 4: Optimization
8. ✅ **Caching setup** (Redis for performance)
9. ✅ **Monitoring** (API usage, costs, errors)
10. ✅ **Rate limiting** (respect API quotas)

---

## ⚠️ Important Notes

### API Quotas & Limits:
- **Google Earth Engine:** Monitor compute units usage
- **Google Maps:** 40,000 requests/month on free tier
- **HERE Traffic:** 2,500 requests/month free
- **OpenStreetMap:** Respect 10,000 requests/hour limit

### Security:
- ✅ Never commit API keys to git
- ✅ Use environment variables only
- ✅ Set up API restrictions (IP/domain)
- ✅ Rotate keys regularly
- ✅ Monitor for unusual usage

### Fallback Strategy:
- ✅ Keep mock functions as fallback
- ✅ Graceful degradation if APIs fail
- ✅ Cache successful API responses
- ✅ Implement retry logic with exponential backoff

---

## 🆘 Troubleshooting

### Common Issues:

**GEE Authentication Fails:**
```bash
# Check service account permissions
gcloud auth list
gcloud projects get-iam-policy YOUR_PROJECT_ID
```

**API Rate Limits Exceeded:**
```bash
# Implement caching
export REDIS_URL="redis://localhost:6379"
npm install ioredis
```

**High API Costs:**
```bash
# Monitor usage
npm run monitor-api-usage
# Set up budget alerts in Google Cloud Console
```

This checklist will guide you through replacing all mock functions with real, production-ready data sources! Start with Google Earth Engine and OpenStreetMap for immediate results.
