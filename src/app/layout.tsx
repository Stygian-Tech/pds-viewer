import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://pdsviewer.dev"),
  title: "PDS Viewer",
  description:
    "Browse Your AT Protocol PDS Records Like a File Tree. OAuth-Powered, Read-Only, Client-Side.",
  openGraph: {
    title: "PDS Viewer",
    description:
      "Browse Your AT Protocol PDS Records Like a File Tree. OAuth-Powered, Read-Only, Client-Side.",
    url: "https://pdsviewer.dev",
    siteName: "PDS Viewer",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PDS Viewer",
    description:
      "Browse Your AT Protocol PDS Records Like a File Tree. OAuth-Powered, Read-Only, Client-Side.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
