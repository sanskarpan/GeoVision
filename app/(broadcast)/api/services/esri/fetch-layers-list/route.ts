import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // No authentication required for local testing
  const accessToken = req.cookies.get("arcgis_access_token")?.value;

  if (!accessToken) {
    return NextResponse.json(
      {
        error: "No access token found. User needs to authenticate with ArcGIS.",
      },
      { status: 401 }
    );
  }

  const portalUrl = `https://www.arcgis.com/sharing/rest/portals/self?f=json&token=${accessToken}`;

  try {
    const portalResponse = await fetch(portalUrl);
    const portalData = await portalResponse.json();

    if (!portalResponse.ok) {
      throw new Error("Failed to fetch organization ID");
    }
    const orgId = portalData.id;
    if (!orgId) {
      throw new Error("Organization ID not found in portalData");
    }

    const searchUrl = `https://www.arcgis.com/sharing/rest/search?q=orgid:${orgId} (type:"Feature Service")&f=json&token=${accessToken}`;
    const servicesResponse = await fetch(searchUrl);

    if (!servicesResponse.ok) {
      throw new Error(
        `Failed to fetch services from ArcGIS: ${servicesResponse.statusText}`
      );
    }

    const servicesData = await servicesResponse.json();

    return NextResponse.json(servicesData);
  } catch (error) {
    console.error("Error fetching layers or feature services:", error);
    return NextResponse.json(
      { error: "Failed to retrieve services or organization information" },
      { status: 500 }
    );
  }
}
