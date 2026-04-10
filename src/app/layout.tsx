import type { Metadata, Viewport } from "next";
import { Navbar } from "@/components/Navbar/Navbar";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Estilos de PrimeReact
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

import CookieBanner from '@/components/cookies/CookieBanner';
import AnalyticsLoader from '@/components/AnalyticsLoader';
import { Divider } from "primereact/divider";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// METADATA (Solo permitido en Server Components)
export const metadata: Metadata = {
  metadataBase: new URL("https://todohogarfactory.es"),
  title: {
    default: "Todo Hogar Factory | Electrodomésticos y Sofás al mejor precio",
    template: "%s | Todo Hogar Factory",
  },
  description:
    "Especialistas en electrodomésticos, sofás y descanso en Valverde del Camino. Todo Hogar Factory ofrece calidad y precios de outlet para tu hogar. ¡Visítanos y ahorra!",
  keywords: ["electrodomésticos", "sofás", "muebles", "Todo Hogar Factory", "outlet hogar", "Valverde del Camino"],
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://todohogarfactory.es',
    siteName: 'Todo Hogar Factory',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Todo Hogar Factory' }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f37021",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FurnitureStore",
    "name": "Todo Hogar Factory",
    "alternateName": "TodoHogar Factory",
    "description": "Tienda especializada en electrodomésticos, sofás y colchones con los mejores precios.",
    "url": "https://todohogarfactory.es",
    "logo": "https://todohogarfactory.es/logo.png",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Valverde del Camino",
      "addressCountry": "ES"
    },
    "priceRange": "€€",
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      "opens": "10:00",
      "closes": "21:00"
    },
    "sameAs": [
      "https://www.facebook.com/TodoHogarFactory/?locale=es_LA",
      "https://www.instagram.com/todohogarfactory/"
    ]
  };

  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Datos estructurados para Google */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <AnalyticsLoader gaId="G-Y2NEYF1W0H" />

        <a href="#main-content" className="sr-only focus:not-sr-only p-2 bg-orange-500 text-white absolute z-[200]">
          Saltar al contenido principal
        </a>

        <Navbar />

        <main id="main-content" className="main-content min-h-[70vh]">
          {children}
        </main>

        <footer className="w-full border-t mt-12 bg-gray-50 text-gray-700">
          <div className="max-w-7xl mx-auto px-6 py-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div>
                <h3 className="font-bold text-lg mb-4">Todo Hogar Factory</h3>
                <p className="text-sm opacity-80 leading-relaxed">
                  Tu tienda de confianza para equipar tu casa con electrodomésticos de última generación, colchones y los sofás más cómodos en Valverde del Camino.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-4">Enlaces rápidos</h3>
                <ul className="text-sm space-y-2">
                  <li><a href="/contacto" className="hover:text-orange-600 transition-colors">Contacto</a></li>
                  <li><a href="/politica-cookies" className="hover:text-orange-600 transition-colors">Política de Cookies</a></li>
                  <li><a href="/condiciones" className="hover:text-orange-600 transition-colors">Condiciones de Compra</a></li>
                  <li><a href="/servicios" className="hover:text-orange-600 transition-colors">Servicios</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-4">Contacto</h3>
                <p className="text-sm opacity-80">📍 Encuéntranos en nuestra tienda física</p>
                <p className="text-sm font-bold mt-2">📞 Atendemos tus dudas</p>
              </div>
            </div>

            <Divider />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 text-xs opacity-60 italic">
              <p>© {new Date().getFullYear()} Todo Hogar Factory. Todos los derechos reservados.</p>
              <div className="flex gap-4">
                <span>Calidad garantizada</span>
              </div>
            </div>
          </div>
        </footer>

        <CookieBanner />
      </body>
    </html>
  );
}