"use server";
import ee from "@google/earthengine";
import { GoogleAuth } from "google-auth-library";

export async function geeAuthenticate(): Promise<void> {
  // No user authentication required for local testing - only GEE service account auth
  
  const key = process.env.GCP_SERVICE_ACCOUNT_KEY;

  if (!key) {
    throw new Error("GCP_SERVICE_ACCOUNT_KEY environment variable is not set");
  }

  return new Promise((resolve, reject) => {
    ee.data.authenticateViaPrivateKey(
      JSON.parse(key),
      () =>
        ee.initialize(
          null,
          null,
          () => resolve(),
          (error: any) => reject(new Error(error))
        ),
      (error: any) => reject(new Error(error))
    );
  });
}

export const getIdentityTokenGoogle = async (targetAudience: any) => {
  const auth = new GoogleAuth({
    credentials: JSON.parse(process.env.GCP_SERVICE_ACCOUNT_KEY || ""),
  });

  const client = await auth.getIdTokenClient(targetAudience);

  const headers = await client.getRequestHeaders();

  return headers.Authorization;
};