import React from "react";

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No authentication required for local testing
  
  return (
    <div className="relative flex min-h-screen">
      <main className="flex-grow">{children}</main>
    </div>
  );
}