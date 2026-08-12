import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://pdsviewer.dev"),
  title: "PDS Viewer",
  description:
    "Browse and carefully manage your AT Protocol PDS records in a client-side file browser.",
  openGraph: {
    title: "PDS Viewer",
    description:
      "Browse and carefully manage your AT Protocol PDS records in a client-side file browser.",
    url: "https://pdsviewer.dev",
    siteName: "PDS Viewer",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PDS Viewer",
    description:
      "Browse and carefully manage your AT Protocol PDS records in a client-side file browser.",
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
