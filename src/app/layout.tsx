import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import AppLayout from "@/components/AppLayout"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "SpendWise — Personal Finance Tracker",
  description: "Track your income, expenses, and savings with SpendWise.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SpendWise",
  },
}

export const viewport: Viewport = {
  themeColor: "#6e44ff",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-dvh bg-background text-foreground">
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  )
}
