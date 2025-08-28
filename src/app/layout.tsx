import type { Metadata } from "next";
import Image from "next/image";
import { Navbar } from "@/components/Navbar/Navbar";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import 'primereact/resources/themes/lara-light-blue/theme.css'; // Tema (puedes cambiarlo)
import 'primereact/resources/primereact.min.css'; // Estilos base
import 'primeicons/primeicons.css'; // Iconos
import 'primeflex/primeflex.css'; // Utilidades de layout


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Todo Hogar Factory",
  description: "Tienda de electrodomésticos, sofás y artículos para el hogar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navbar />
        <main className="min-h-[70vh]">
          {children}
        </main>
        <footer className="w-full border-t border-black/[.08] dark:border-white/[.145] mt-12">
          <div className="max-w-6xl mx-auto px-4 py-6 text-sm flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>© {new Date().getFullYear()} Todo Hogar Factory</p>
            <p className="opacity-70">Calidad en electrodomésticos, sofás y artículos para el hogar</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
