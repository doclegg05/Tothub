import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import Footer from "./components/footer";
import Navigation from "./components/navigation";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

// Get site URL from environment or use default
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  title: "TotHub - Daycare Management Platform",
  description:
    "Comprehensive daycare management solution with biometric authentication, compliance tracking, and real-time monitoring.",
  keywords:
    "daycare management, child care, biometric authentication, compliance tracking",
  authors: [{ name: "TotHub Team" }],
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "TotHub - Daycare Management Platform",
    description:
      "Comprehensive daycare management solution with biometric authentication, compliance tracking, and real-time monitoring.",
    url: siteUrl,
    siteName: "TotHub",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "TotHub - Daycare Management Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TotHub - Daycare Management Platform",
    description:
      "Comprehensive daycare management solution with biometric authentication, compliance tracking, and real-time monitoring.",
    images: ["/twitter-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  ...(process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION && {
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
    },
  }),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${jakarta.variable} font-sans`}>
        <div className="min-h-screen bg-canvas flex flex-col">
          <Navigation />
          <main className="flex-grow">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
