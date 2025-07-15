import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AutumnProvider } from "autumn-js/react";
import { UserProvider } from '@/lib/auth/user-context';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SupportIQ - Reduce support tickets by 30% with AI-powered insights",
  description: "AI-powered customer support analytics that helps you reduce ticket volume, improve response times, and boost customer satisfaction.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
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
