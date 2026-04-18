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
import FooterCookieButton from '@/components/cookies/FooterCookieButton';
import AnalyticsLoader from '@/components/AnalyticsLoader';

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

        <footer className="w-full mt-12 bg-gray-50" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="footer-grid">

              {/* Col 1 — Marca */}
              <div className="flex flex-col gap-4">
                <h2 className="text-gray-900 font-bold text-xl tracking-tight m-0">
                  Todo Hogar <span className="text-orange-500">Factory</span>
                </h2>
                <p className="text-sm leading-relaxed text-gray-500 m-0">
                  Tu tienda de confianza en Valverde del Camino. Electrodomésticos, sofás y colchones con la mejor calidad al mejor precio.
                </p>
                <div className="flex gap-3 mt-1">
                  <a href="https://www.facebook.com/TodoHogarFactory/?locale=es_LA" target="_blank" rel="noopener noreferrer"
                    style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#1877f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                    <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                  </a>
                  <a href="https://www.instagram.com/todohogarfactory/" target="_blank" rel="noopener noreferrer"
                    style={{ width: 36, height: 36, borderRadius: '50%', background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/></svg>
                  </a>
                </div>
              </div>

              {/* Col 2 — Enlaces rápidos */}
              <div>
                <h3 className="text-gray-900 font-bold text-base mb-5 m-0">Enlaces Rápidos</h3>
                <ul className="space-y-3 list-none p-0 m-0">
                  {[
                    { href: "/", label: "Inicio" },
                    { href: "/ofertas", label: "Ofertas" },
                    { href: "/contacto", label: "Contacto" },
                    { href: "/servicios", label: "Servicios" },
                    { href: "/condiciones", label: "Condiciones de compra" },
                  ].map(({ href, label }) => (
                    <li key={href}>
                      <a href={href} className="flex items-center gap-2 text-sm text-gray-500 hover:text-orange-500 transition-colors no-underline">
                        <svg className="w-3.5 h-3.5 text-orange-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Col 3 — Productos */}
              <div>
                <h3 className="text-gray-900 font-bold text-base mb-5 m-0">Nuestros Productos</h3>
                <ul className="space-y-3 list-none p-0 m-0">
                  {[
                    { href: "/electrodomesticos", label: "Electrodomésticos" },
                    { href: "/sofas", label: "Sofás y Sillones" },
                    { href: "/descanso", label: "Colchones y Descanso" },
                    { href: "/hogar", label: "Hogar" },
                    { href: "/ofertas", label: "Ofertas Especiales" },
                  ].map(({ href, label }) => (
                    <li key={href}>
                      <a href={href} className="flex items-center gap-2 text-sm text-gray-500 hover:text-orange-500 transition-colors no-underline">
                        <svg className="w-3.5 h-3.5 text-orange-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Col 4 — Contacto */}
              <div>
                <h3 className="text-gray-900 font-bold text-base mb-5 m-0">Contacto</h3>
                <ul className="space-y-4 list-none p-0 m-0">
                  <li className="flex items-center gap-3">
                    <span style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                    </span>
                    <a href="tel:+34692211145" className="text-sm text-gray-600 hover:text-orange-500 transition-colors no-underline font-semibold">+34 692 211 145</a>
                  </li>
                  <li className="flex items-center gap-3">
                    <span style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 32 32"><path d="M16.04 5C10.55 5 6.11 9.44 6.11 14.93c0 2.1.61 4.03 1.78 5.72L6 26.96l6.48-1.87a9.97 9.97 0 0 0 3.56.65h.01c5.49 0 9.93-4.44 9.93-9.93C26 9.44 21.55 5 16.04 5Zm0 17.9h-.01a8 8 0 0 1-3.43-.81l-.25-.12-3.84 1.11 1.03-3.75-.16-.27a7.9 7.9 0 0 1-1.22-4.24c0-4.38 3.57-7.95 7.96-7.95 2.13 0 4.13.83 5.63 2.33a7.9 7.9 0 0 1 2.33 5.63c0 4.39-3.57 7.96-7.94 7.96Z"/></svg>
                    </span>
                    <a href="https://wa.me/34692211145" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 hover:text-orange-500 transition-colors no-underline font-semibold">WhatsApp</a>
                  </li>
                  <li className="flex items-start gap-3">
                    <span style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                      <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    </span>
                    <div className="text-sm text-gray-500 leading-6">
                      <p className="m-0">Lun – Vie: 10:00–14:00 / 17:00–21:00</p>
                      <p className="m-0">Sáb: 10:00 – 14:00</p>
                    </div>
                  </li>
                  <li className="flex items-center gap-3">
                    <span style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#fb923c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    </span>
                    <span className="text-sm text-gray-500">Valverde del Camino, Huelva</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Copyright */}
            <div className="border-t border-gray-200 pt-6 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-400">
              <p className="m-0">© {new Date().getFullYear()} Todo Hogar Factory. Todos los derechos reservados.</p>
              <div className="flex items-center gap-4">
                <FooterCookieButton />
                <p className="m-0 text-orange-400">Calidad garantizada</p>
              </div>
            </div>
          </div>
        </footer>

        <CookieBanner />
      </body>
    </html>
  );
}