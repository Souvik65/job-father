import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jobfather | Latest Govt Job Updates, Mock Test & TPSC Vacancies 2026",
  description:
    "Jobfather – Your one-stop portal for the latest government job updates in Tripura, TPSC notifications, police, teaching, JRBT, free mock tests and exam alerts.",
  keywords:
    "Tripura government jobs, TPSC, JRBT, Tripura police recruitment, teaching jobs Tripura, latest job updates Tripura 2026, mock test Tripura, jobfather",
  authors: [{ name: "Jobfather" }],
  creator: "Jobfather",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.baseUrl,
    siteName: "Jobfather",
    title: "Jobfather | Latest Govt Job Updates & Mock Test 2026",
    description: "Find the latest TPSC, police, teaching & private job notifications for Tripura.",
    images: [
      {
        url: `${siteConfig.baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Jobfather",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Jobfather | Latest Govt Job Updates 2026",
    description: "Find the latest TPSC, police, teaching & private job notifications for Tripura.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <head>
        <meta name="theme-color" content="#2563eb" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Jobfather" />
        <link rel="canonical" href={siteConfig.baseUrl} />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-full flex flex-col antialiased bg-gray-50">{children}</body>
    </html>
  );
}
