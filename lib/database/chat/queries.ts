"use server";

// Simplified mock implementations for local testing without database

// Get all chats by user
export async function getChatsByUser(userId: string) {
  // Return empty array for local testing
  return [];
}

// Save chat by id
export async function saveChat({ id, title }: { id: string; title: string }) {
  // Mock implementation - no actual saving in local mode
  console.log(`Mock: Saving chat ${id} with title: ${title}`);
  return { id, title };
}

// Get chat by id
export async function getChatById(id: string) {
  // Mock implementation - return null to simulate new chat
  console.log(`Mock: Getting chat by id ${id}`);
  return null;
}

// Save messages
export async function saveMessages({ messages }: { messages: any[] }) {
  // Mock implementation - no actual saving in local mode
  console.log(`Mock: Saving ${messages.length} messages`);
  return messages;
}

// Get messages by chat id
export async function getMessagesByChatId(id: string) {
  // Return empty array for local testing
  return [];
}

// Delete chat by id
export async function deleteChatById({
  id,
  userId,
}: {
  id: string;
  userId: string;
}) {
  // Mock implementation
  console.log(`Mock: Deleting chat ${id} for user ${userId}`);
  return { success: true };
}

// Delete chats by user
export async function deleteChatsByUser(userId: string) {
  // Mock implementation
  console.log(`Mock: Deleting all chats for user ${userId}`);
  return { success: true };
}

// Search GEE datasets
export async function searchGeeDatasets(query: string) {
  // Mock implementation - return some sample datasets
  console.log(`Mock: Searching GEE datasets for query: ${query}`);
  
  // Return some mock GEE datasets based on common queries
  const mockDatasets = [
    {
      id: 1,
      dataset_id: "LANDSAT/LC08/C02/T1_L2",
      asset_url: "https://developers.google.com/earth-engine/datasets/catalog/LANDSAT_LC08_C02_T1_L2",
      type: "ImageCollection",
      start_date: "2013-04-11",
      end_date: null,
      title: "USGS Landsat 8 Level 2, Collection 2, Tier 1",
      rank: 1.0
    },
    {
      id: 2,
      dataset_id: "COPERNICUS/S2_SR_HARMONIZED",
      asset_url: "https://developers.google.com/earth-engine/datasets/catalog/COPERNICUS_S2_SR_HARMONIZED",
      type: "ImageCollection", 
      start_date: "2017-03-28",
      end_date: null,
      title: "Harmonized Sentinel-2 MSI: MultiSpectral Instrument, Level-2A",
      rank: 0.9
    },
    {
      id: 3,
      dataset_id: "GOOGLE/DYNAMICWORLD/V1",
      asset_url: "https://developers.google.com/earth-engine/datasets/catalog/GOOGLE_DYNAMICWORLD_V1",
      type: "ImageCollection",
      start_date: "2015-06-27",
      end_date: null,
      title: "Dynamic World V1",
      rank: 0.8
    }
  ];

  // Filter based on query for better matching
  const filtered = mockDatasets.filter(dataset => 
    dataset.title.toLowerCase().includes(query.toLowerCase()) ||
    dataset.dataset_id.toLowerCase().includes(query.toLowerCase())
  );

  return filtered.length > 0 ? filtered : mockDatasets.slice(0, 3);
}