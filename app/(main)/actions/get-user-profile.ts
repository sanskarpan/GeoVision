"use server";

export async function getUserProfile() {
  // Return a mock user profile for local testing
  // No authentication required in local mode
  return {
    email: "local@test.com",
    name: "Local User",
    role: "USER" as const,
    organization: "Local Testing",
    licenseStart: new Date().toISOString().split('T')[0],
    licenseEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from now
  };
}