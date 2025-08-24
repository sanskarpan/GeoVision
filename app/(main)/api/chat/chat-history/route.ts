import { getChatsByUser } from "@/lib/database/chat/queries";
import { NextResponse } from "next/server";

interface Chat {
  id: string;
}

export async function GET() {
  // No authentication required for local testing
  // Return empty chat history for local mode
  const userId = "local-user-id";
  
  const chats = (await getChatsByUser(userId)) as Chat[];

  return NextResponse.json(chats);
}