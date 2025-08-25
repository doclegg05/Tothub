import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from './components/navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TotHub - Daycare Management Platform',
  description: 'Comprehensive daycare management solution with biometric authentication, compliance tracking, and real-time monitoring.',
  keywords: 'daycare management, child care, biometric authentication, compliance tracking',
  authors: [{ name: 'TotHub Team' }],
  openGraph: {
    title: 'TotHub - Daycare Management Platform',
    description: 'Comprehensive daycare management solution with biometric authentication, compliance tracking, and real-time monitoring.',
    url: 'https://tothub.com',
    siteName: 'TotHub',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'TotHub - Daycare Management Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TotHub - Daycare Management Platform',
    description: 'Comprehensive daycare management solution with biometric authentication, compliance tracking, and real-time monitoring.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          {children}
        </div>
      </body>
    </html>
  )
}