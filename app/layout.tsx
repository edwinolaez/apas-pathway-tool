import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "./ConvexClientProvider";
import MultilingualVoiceAssistant from "./components/MultilingualVoiceAssistant";
import Header from "./components/Header";
import Footer from "./components/Footer";
import LayoutShell from "./components/LayoutShell";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pathr",
  description: "AI-powered program recommendations for Alberta students",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.variable} antialiased`}>
          <ConvexClientProvider>
            <Header />
            <LayoutShell footer={<Footer />}>
              {children}
            </LayoutShell>
            <MultilingualVoiceAssistant />
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}