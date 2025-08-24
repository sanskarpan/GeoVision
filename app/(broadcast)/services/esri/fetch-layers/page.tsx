import AddArcGisLayerClient from "@/components/services/esri/add-arcgis-layers";

export default async function AddArcGisLayerPage() {
  // No authentication required for local testing
  
  return <AddArcGisLayerClient />;
}