import localFont from "next/font/local";
import "./styles.css";
import "maplibre-gl/dist/maplibre-gl.css";
import "@blocknote/mantine/style.css";
import { Analytics } from "@vercel/analytics/next";
import ClientWrapper from "@/components/client-wrapper";
import { TooltipProvider } from "@/components/ui/tooltip";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

// Define metadata for the root layout
export const metadata = {
  title: "Chat2Geo",
  description: "AI-powered geospatial analyticse",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // No authentication required - provide minimal user profile for local testing
  const userProfile = {
    email: "local@test.com",
    name: "Local User",
    role: "USER" as const,
    organization: "Local Testing",
    licenseStart: new Date().toISOString().split('T')[0],
    licenseEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from now
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <TooltipProvider>
        <body
          className={`${geistSans.variable} ${geistMono.variable} font-sans`}
        >
          <ClientWrapper userProfile={userProfile}>{children}</ClientWrapper>
          <Analytics />
        </body>
      </TooltipProvider>
    </html>
  );
}