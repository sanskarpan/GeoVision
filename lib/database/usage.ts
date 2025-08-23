"use server";

// Mock usage tracking for local testing

export async function incrementRequestCount(userId: string) {
  // Mock implementation - just log the increment
  console.log(`Mock: Incrementing request count for user ${userId}`);
  return 1; // Return mock count
}

export async function getUsageForUser(userId: string) {
  // Mock implementation - return unlimited usage for local testing
  console.log(`Mock: Getting usage for user ${userId}`);
  return { 
    requests_count: 0, // Always return 0 to allow unlimited requests in local mode
    knowledge_base_docs_count: 0 
  };
}

export async function getUserRoleAndTier(userId: string) {
  // Mock implementation - return admin role for local testing
  console.log(`Mock: Getting role and tier for user ${userId}`);
  return {
    id: userId,
    name: "Local User",
    email: "local@test.com",
    organization: "Local Testing",
    role: "ADMIN", // Admin role for unlimited access
    subscription_tier: "Enterprise", // Enterprise tier for maximum limits
    license_start: new Date().toISOString().split('T')[0],
    license_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    created_at: new Date().toISOString(),
  };
}