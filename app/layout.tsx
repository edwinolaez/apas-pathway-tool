import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "./ConvexClientProvider";
import MultilingualVoiceAssistant from "./components/MultilingualVoiceAssistant";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "APAS - Alberta Post-Secondary Advisory System",
  description: "AI-powered program recommendations for Alberta students",
  viewport: "width=device-width, initial-scale=1, maximum-scale=5", // ← ADD THIS LINE
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
     <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* We wrap the children here so every page can access the database */}
        <ConvexClientProvider>
          {children}
        <MultilingualVoiceAssistant />  
        </ConvexClientProvider>
      </body>
    </html>
  );
}