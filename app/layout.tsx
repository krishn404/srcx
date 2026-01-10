import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { ConvexProvider } from "@/components/convex"
import { AuthProvider } from "@/components/admin/auth"
import "./globals.css"
import { Instrument_Serif, Share_Tech_Mono } from "next/font/google"

// fonts
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-serif",
  display: "swap",
})

const shareTechMono = Share_Tech_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-sans",
  display: "swap",
})

// site config
const siteUrl = "https://srcx.krixnx.xyz"
const siteName = "srcx"
const siteTitle =
  "srcx - Grab Time-Sensitive Opportunities for Students & Developers real quick"
const siteDescription =
  "Discover active, time-sensitive opportunities for tech students and developers. Find startup programs, grants, funding, hackathons, and application-based opportunities with deadlines - all in one place."

// OG image (RENAMED + CACHE-SAFE)
const ogImageUrl = `${siteUrl}/og-img.jpg`

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: siteTitle,
    template: `%s | ${siteName}`,
  },

  description: siteDescription,

  keywords: [
    "student opportunities",
    "developer programs",
    "startup funding",
    "tech grants",
    "hackathons",
    "accelerators",
    "developer credits",
    "startup programs",
    "tech resources",
  ],

  authors: [{ name: "krixnx", url: "https://krixnx.xyz" }],
  creator: "krixnx",
  publisher: "krixnx",

  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  icons: {
    icon: "/srcx.png",
    apple: "/srcx.png",
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName,
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: "srcx - Discover Time-Sensitive Opportunities for Tech Students & Developers",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: [ogImageUrl],
    creator: "@psyxrix",
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

  alternates: {
    canonical: siteUrl,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${shareTechMono.variable}`}
    >
      <body className="font-sans antialiased">
        <ConvexProvider>
          <AuthProvider>{children}</AuthProvider>
        </ConvexProvider>
        <Analytics />
      </body>
    </html>
  )
}
