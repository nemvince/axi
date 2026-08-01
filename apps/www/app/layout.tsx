import { Footer } from "@/components/footer";
import { Navigation } from "@/components/navigation";
import type { PageMetadata } from "@axi-js/core";
import { ThemeProvider } from "@axi-js/core/theme";
import React from "react";
import "./index.css";

export const metadata: PageMetadata = {
  title: "Axi - Fullstack's Flow State",
  description:
    "Axi — fullstack's flow state. A full-stack framework built on Bun with file-based routing, SSR, type-safe API routes, and WebSocket support.",
  viewport: "width=device-width, initial-scale=1.0",
  keywords: [
    "bun",
    "framework",
    "react",
    "ssr",
    "websocket",
    "api",
    "fullstack",
  ],
  author: "Tamas Vince",
  favicon: "icon.webp",
  metadataBase: "https://axi.vnce.eu",
  openGraph: {
    siteName: "Axi",
    locale: "en_US",
    image: {
      url: "/axi.png",
      width: 1200,
      height: 630,
      alt: "Axi - A Simple Full-Stack Framework Built on Bun",
    },
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <div className="flex min-h-screen flex-col">
        <Navigation />
        <main className="flex-1 pt-16">{children}</main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}
