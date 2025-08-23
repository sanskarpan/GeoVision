// It's a simple email-based feedback form. The user sends a message, and it gets sent to a recipient email address.

import FormData from "form-data";
import Mailgun from "mailgun.js";
import { NextResponse } from "next/server";

const API_KEY = process.env.MAILGUN_API_KEY || "";
const DOMAIN = process.env.MAILGUN_DOMAIN || "";
const ALLOWED_ORIGIN = process.env.NEXT_PUBLIC_APP_URL!;
const RECIPIENT_EMAIL = process.env.RECIPIENT_EMAIL;
const SENDER_EMAIL = process.env.SENDER_EMAIL;

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function POST(req: Request) {
  // No authentication required for local testing
  const user = { email: "local@test.com" }; // Mock user

  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return new NextResponse(
      JSON.stringify({ error: "Unsupported media type. Please send JSON." }),
      { status: 415 }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch (err) {
    console.error("Error parsing JSON:", err);
    return new NextResponse(
      JSON.stringify({ error: "Invalid JSON payload." }),
      { status: 400 }
    );
  }
  const { message } = body || {};
  if (!message) {
    return new NextResponse(
      JSON.stringify({
        error: "All fields (message) are required.",
      }),
      { status: 400 }
    );
  }

  // If Mailgun is not configured, just log the feedback
  if (!API_KEY || !DOMAIN || !RECIPIENT_EMAIL || !SENDER_EMAIL) {
    console.log(`Feedback from ${user.email}: ${message}`);
    return new NextResponse(JSON.stringify({ submitted: true }), {
      status: 200,
    });
  }

  try {
    const mailgun = new Mailgun(FormData);
    const client = mailgun.client({ username: "api", key: API_KEY });

    const messageData = {
      from: `Chat2Geo ${SENDER_EMAIL}`,
      to: RECIPIENT_EMAIL,
      subject: "New Feedback for Chat2Geo!",
      text: `Hello,
  
      You have a new form entry from: ${user?.email}.
  
      ${message}
      `,
    };
    await client.messages.create(DOMAIN, messageData);
    return new NextResponse(JSON.stringify({ submitted: true }), {
      status: 200,
    });
  } catch (mailErr: any) {
    console.error("Error sending email:", mailErr);
    return new NextResponse(JSON.stringify({ error: "Failed to send email" }), {
      status: 500,
    });
  }
}