import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Navbar } from "@/components/Navbar/Navbar";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://todohogarfactory.es"),

  title: {
    default: "Todo Hogar Factory",
    template: "%s | Todo Hogar Factory",
  },

  description:
    "Todo Hogar Factory es tu tienda de electrodomésticos, sofás y artículos para el hogar. Calidad y diseño al mejor precio.",

  keywords: [
    "todohogarfactory",
    "todo hogar factory",
    "electrodomésticos",
    "sofás",
    "muebles hogar",
    "tienda hogar",
  ],

  openGraph: {
    title: "Todo Hogar Factory",
    description:
      "Electrodomésticos, sofás y artículos para el hogar con calidad y buen precio.",
    url: "https://todohogarfactory.es",
    siteName: "Todo Hogar Factory",
    locale: "es_ES",
    type: "website",
    images: [
      {
        url: "/todo_hogar_redondo.svg",
        width: 1200,
        height: 630,
        alt: "Todo Hogar Factory",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Todo Hogar Factory",
    description:
      "Electrodomésticos, sofás y artículos para el hogar con calidad y buen precio.",
    images: ["/todo_hogar_redondo.svg"],
  },

  icons: {
    icon: "/todo_hogar_redondo.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Todo Hogar Factory",
    url: "https://todohogarfactory.es",
    description:
      "Tienda de electrodomésticos, sofás y artículos para el hogar.",
  };

  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Schema SEO */}
        <Script
          id="schema-org"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <Navbar />

        <main className="min-h-[70vh] pt-16">
          {children}
        </main>

        <footer className="w-full border-t mt-12">
          <div className="max-w-7xl mx-auto px-4 py-6 text-sm flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>© {new Date().getFullYear()} Todo Hogar Factory</p>
            <p className="opacity-70">
              Calidad en electrodomésticos, sofás y artículos para el hogar
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}