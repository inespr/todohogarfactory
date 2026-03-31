'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';

type ElectroItem = {
  id: string;
  name: string;
  observaciones: string;
  price: number;
  stock: number;
  category: string;
  fotos: string[];
  hasDefect: boolean;
  marca?: string;
  medidas?: string;
  isOferta?: boolean;
};

export default function ElectroDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ElectroItem | null>(null);
  const [selectedImg, setSelectedImg] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const snap = await getDoc(doc(db, 'electrodomesticos', id));
        if (!snap.exists()) {
          setNotFound(true);
        } else {
          const raw = snap.data() as Record<string, unknown>;
          setProduct({
            id: snap.id,
            name: raw.name as string,
            observaciones: raw.observaciones as string || '',
            price: raw.price as number ?? 0,
            stock: raw.stock as number ?? 0,
            category: raw.category as string || '',
            fotos: (raw.fotos as string[]) || [],
            hasDefect: raw.hasDefect as boolean || false,
            marca: raw.marca as string | undefined,
            medidas: raw.medidas as string | undefined,
            isOferta: raw.isOferta as boolean | undefined,
          });
        }
      } catch (e) {
        console.error(e);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-10 opacity-70">Cargando producto…</div>;
  if (notFound || !product) return <div className="max-w-4xl mx-auto px-4 py-10">Producto no encontrado.</div>;

  const mainImg = product.fotos[selectedImg] || null;
  const precioFormateado = product.price > 0
    ? (product.price % 1 === 0
      ? `${product.price} €`
      : product.price.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €')
    : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-2 text-sm text-neutral-500 mb-6">
        <Link href="/" className="hover:underline">Inicio</Link>
        <span>›</span>
        <Link href="/electrodomesticos" className="hover:underline">Electrodomésticos</Link>
        {product.category && (
          <>
            <span>›</span>
            <Link href={`/electrodomesticos?subcategory=${product.category.toLowerCase()}`} className="hover:underline">
              {product.category}
            </Link>
          </>
        )}
        <span>›</span>
        <span className="text-neutral-900 font-medium">{product.name}</span>
      </nav>

      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">

          {/* Columna imágenes */}
          <div className="flex flex-col bg-neutral-100">
            {/* Imagen principal */}
            <div className="relative" style={{ height: '460px', overflow: 'hidden' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mainImg || '/placeholders/electrodomesticos.svg'}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '24px' }}
                onError={(e) => { (e.target as HTMLImageElement).src = '/placeholders/electrodomesticos.svg'; }}
              />
              {product.hasDefect && (
                <div className="absolute top-3 left-3 bg-orange-50 border border-orange-300 text-orange-600 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                  Ocasión
                </div>
              )}
              {product.isOferta && (
                <div className="absolute top-3 right-3 bg-orange-50 border border-orange-300 text-orange-600 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                  Oferta
                </div>
              )}
            </div>

            {/* Miniaturas */}
            {product.fotos.length > 1 && (
              <div className="flex gap-2 p-3 bg-neutral-50 border-t border-neutral-200">
                {product.fotos.map((foto, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImg(i)}
                    className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${selectedImg === i ? 'border-orange-500' : 'border-neutral-200 hover:border-neutral-400'}`}
                  >
                    <Image src={foto} alt={`Foto ${i + 1}`} fill className="object-contain p-1" unoptimized />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Columna info */}
          <div className="p-6 md:p-8 flex flex-col gap-4">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-neutral-100 text-xs font-medium text-neutral-700">
                {product.category}
              </span>
              {product.hasDefect && (
                <span className="px-3 py-1 rounded-full bg-red-50 text-xs font-medium text-red-700">
                  Artículo de ocasión
                </span>
              )}
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${product.stock > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                {product.stock > 0 ? 'Disponible' : 'Agotado'}
              </span>
            </div>

            {/* Nombre y precio */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">{product.name}</h1>
              {precioFormateado && (
                <p className="text-3xl font-bold text-orange-600 mt-2">{precioFormateado}</p>
              )}
            </div>

            {/* Detalles */}
            {(product.marca || product.medidas || product.observaciones) && (
              <div className="rounded-xl bg-neutral-50 border border-neutral-200 p-4 flex flex-col gap-2 text-sm">
                {product.marca && (
                  <div className="flex gap-2">
                    <span className="font-medium text-neutral-600 w-20 shrink-0">Marca</span>
                    <span className="text-neutral-900">{product.marca}</span>
                  </div>
                )}
                {product.medidas && (
                  <div className="flex gap-2">
                    <span className="font-medium text-neutral-600 w-20 shrink-0">Medidas</span>
                    <span className="text-neutral-900">{product.medidas}</span>
                  </div>
                )}
                {product.observaciones && (
                  <div className="flex gap-2">
                    <span className="font-medium text-neutral-600 w-20 shrink-0">Notas</span>
                    <span className="text-neutral-900">{product.observaciones}</span>
                  </div>
                )}
              </div>
            )}

            {/* CTA */}
            <div className="rounded-xl bg-orange-50 border border-orange-100 p-4 mt-auto">
              <h3 className="font-semibold text-orange-800 mb-1">¿Te interesa este producto?</h3>
              <p className="text-sm text-orange-900 mb-3">
                Contáctanos para disponibilidad, precio final y transporte.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href={`https://wa.me/34692211145?text=Hola%2C%20me%20interesa%20el%20producto%3A%20${encodeURIComponent(product.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-colors"
                >
                  Preguntar por WhatsApp
                </a>
                <Link
                  href="/contacto"
                  className="inline-flex items-center px-4 py-2 rounded-lg border border-orange-300 text-orange-800 text-sm font-medium hover:bg-orange-100 transition-colors"
                >
                  Ir a contacto
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
