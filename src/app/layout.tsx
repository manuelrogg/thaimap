import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import "maplibre-gl/dist/maplibre-gl.css"; // global: positions map markers on every map view
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "MuayThaiGuide — Find your Muay Thai gym in Thailand",
    template: "%s · MuayThaiGuide",
  },
  description:
    "A map-first guide to Muay Thai gyms across Thailand. Browse every camp in " +
    "Bangkok, Phuket and Chiang Mai on the map, ranked and reviewed.",
  openGraph: {
    siteName: "MuayThaiGuide",
    type: "website",
    title: "MuayThaiGuide — Find your Muay Thai gym in Thailand",
    description:
      "A map-first guide to Muay Thai gyms across Thailand, ranked and reviewed.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
