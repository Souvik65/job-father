import type { Metadata } from "next";
import { Lato } from "next/font/google";
import { siteConfig } from "@/config/site";
import "./globals.css";

const lato = Lato({ 
  subsets: ["latin"], 
  weight: ["100", "300", "400", "700", "900"],
  variable: "--font-lato" 
});

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
    <html lang="en" className={`h-full scroll-smooth ${lato.variable}`} data-scroll-behavior="smooth">
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
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0..1,0"
        />
      </head>
      <body className={`min-h-full flex flex-col antialiased bg-slate-50 ${lato.className}`}>{children}</body>
    </html>
  );
}
