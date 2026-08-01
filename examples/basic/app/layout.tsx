import type { PageMetadata } from "@axi/core";
import React from "react";
import "./index.css";

export const metadata: PageMetadata = {
  title: "Axi Sample App",
  description:
    "Fullstack's flow state",
  favicon: "icon.webp",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main className="main">{children}</main>;
}
