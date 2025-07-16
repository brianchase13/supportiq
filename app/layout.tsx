import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AutumnProvider } from "autumn-js/react";
import { UserProvider } from '@/lib/auth/user-context';

// Optimize font loading
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap', // Faster font loading
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: "SupportIQ - Reduce support tickets by 30% with AI-powered insights",
  description: "AI-powered customer support analytics that helps you reduce ticket volume, improve response times, and boost customer satisfaction.",
  keywords: ["support", "ai", "analytics", "saas", "customer-service", "automation"],
  authors: [{ name: "SupportIQ Team" }],
  openGraph: {
    title: "SupportIQ - AI-Powered Support Analytics",
    description: "Reduce support tickets by 30% with AI-powered insights",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "SupportIQ - AI-Powered Support Analytics",
    description: "Reduce support tickets by 30% with AI-powered insights",
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        {/* Preload critical resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS prefetch for external domains */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        
        {/* Preload critical CSS */}
        <link rel="preload" href="/globals.css" as="style" />
        
        {/* Performance optimizations */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="antialiased">
        <UserProvider>
          {process.env.NEXT_PUBLIC_AUTUMN_BACKEND_URL ? (
            <AutumnProvider backendUrl={process.env.NEXT_PUBLIC_AUTUMN_BACKEND_URL}>
              {children}
            </AutumnProvider>
          ) : (
            children
          )}
        </UserProvider>
      </body>
    </html>
  );
}
