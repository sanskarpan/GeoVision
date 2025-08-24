import { NextResponse } from "next/server";
import { getUsageForUser, getUserRoleAndTier } from "@/lib/database/usage";
import { getPermissionSet } from "@/lib/auth";

export async function GET() {
  // No authentication required for local testing
  const userId = "local-user-id";

  const usage = await getUsageForUser(userId);

  const userRoleRecord = await getUserRoleAndTier(userId);
  if (!userRoleRecord) {
    return NextResponse.json(
      { error: "Role or subscription not found" },
      { status: 404 }
    );
  }

  const { role, subscription_tier } = userRoleRecord;
  const { maxRequests, maxDocs, maxArea } = await getPermissionSet(
    role as "ADMIN" | "USER" | "TRIAL",
    subscription_tier as "Essentials" | "Pro" | "Enterprise"
  );

  return NextResponse.json({
    requests_count: usage.requests_count,
    knowledge_base_docs_count: usage.knowledge_base_docs_count,
    maxRequests,
    maxDocs,
    maxArea,
  });
}