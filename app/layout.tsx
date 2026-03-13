import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "./ConvexClientProvider";
import MultilingualVoiceAssistant from "./components/MultilingualVoiceAssistant";
import Header from "./components/Header";
import Footer from "./components/Footer";

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
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}>
        <ConvexClientProvider>
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          <MultilingualVoiceAssistant />
        </ConvexClientProvider>
      </body>
    </html>
  );
}