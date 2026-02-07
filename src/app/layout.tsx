import React from "react";

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";

import "./globals.css";

const _inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DevShowcase - Community Project Showcase",
  description:
    "Discover and share amazing community projects built by developers around the world.",
};

export const viewport: Viewport = {
  themeColor: "#0d9668",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SiteHeader />
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
