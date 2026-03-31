'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image';
import Link from 'next/link';

type ProductData = {
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
};

type ProductCategory = 'electrodomesticos' | 'sofas' | 'hogar' | 'descanso';

const COLLECTIONS: ProductCategory[] = ['electrodomesticos', 'sofas', 'hogar', 'descanso'];

const CATEGORY_LABELS: Record<ProductCategory, string> = {
  electrodomesticos: 'Electrodomésticos',
  sofas: 'Sofás',
  hogar: 'Hogar',
  descanso: 'Descanso',
};

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductData & { collectionName: ProductCategory } | null>(null);
  const [selectedImg, setSelectedImg] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        for (const col of COLLECTIONS) {
          const snap = await getDocs(query(collection(db, col), where('__name__', '==', id)));
          if (!snap.empty) {
            const doc = snap.docs[0];
            const raw = doc.data() as Record<string, unknown>;
            setProduct({
              id: doc.id,
              name: raw.name as string,
              observaciones: raw.observaciones as string || '',
              price: raw.price as number ?? 0,
              stock: raw.stock as number ?? 0,
              category: raw.category as string || '',
              fotos: (raw.fotos as string[]) || [],
              hasDefect: raw.hasDefect as boolean || false,
              marca: raw.marca as string | undefined,
              medidas: raw.medidas as string | undefined,
              collectionName: col,
            });
            return;
          }
        }
        setNotFound(true);
      } catch (e) {
        console.error(e);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-10 opacity-70 text-center">Cargando producto…</div>;
  if (notFound || !product) return <div className="max-w-7xl mx-auto px-4 py-10 text-center">Producto no encontrado.</div>;

  const mainImg = product.fotos?.[selectedImg] || null;
  const precioFormateado = product.price > 0
    ? product.price.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-2 text-sm text-neutral-600 mb-6">
        <Link href="/" className="hover:underline">Inicio</Link>
        <span aria-hidden="true">›</span>
        <Link href={`/${product.collectionName}`} className="hover:underline">
          {CATEGORY_LABELS[product.collectionName]}
        </Link>
        {product.category && (
          <>
            <span aria-hidden="true">›</span>
            <Link href={`/${product.collectionName}?subcategory=${encodeURIComponent(product.category.toLowerCase().replace(/\s+/g, '-'))}`} className="hover:underline">
              {product.category}
            </Link>
          </>
        )}
        <span aria-hidden="true">›</span>
        <span className="font-medium text-neutral-900">{product.name}</span>
      </nav>

      {/* Grid 2 columnas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">

        {/* COLUMNA IZQUIERDA: Galería */}
        <div className="flex flex-col gap-3">
          {/* Imagen principal */}
          <div className="relative bg-neutral-50 rounded-2xl border border-neutral-200 overflow-hidden" style={{ height: '500px' }}>
            {mainImg ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={mainImg}
                alt={product.name}
                className="w-full h-full object-contain p-4"
                onError={(e) => { (e.target as HTMLImageElement).src = '/placeholders/electrodomesticos.svg'; }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Image
                  src="/placeholders/electrodomesticos.svg"
                  alt={product.name}
                  width={300}
                  height={300}
                  className="opacity-50"
                />
              </div>
            )}

            {/* Badge Ocasión */}
            {product.hasDefect && (
              <div className="absolute top-3 left-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-white border border-neutral-300 text-xs font-semibold text-neutral-900">
                  Ocasión
                </span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {product.fotos && product.fotos.length > 1 && (
            <div className="flex gap-2">
              {product.fotos.map((foto, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImg(idx)}
                  className={`relative w-16 h-16 rounded-lg border-2 overflow-hidden transition-all ${selectedImg === idx
                    ? 'border-orange-500 ring-2 ring-orange-300'
                    : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={foto}
                    alt={`Vista ${idx + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/placeholders/electrodomesticos.svg'; }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA: Información */}
        <div className="flex flex-col">
          {/* Badges categoría y ocasión */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="inline-flex px-3 py-1 rounded-full bg-neutral-100 text-xs font-medium text-neutral-700">
              {CATEGORY_LABELS[product.collectionName]}
            </span>
            {product.hasDefect && (
              <span className="inline-flex px-3 py-1 rounded-full bg-orange-50 text-xs font-medium text-orange-700">
                Artículo de ocasión
              </span>
            )}
            {product.stock > 0 && (
              <span className="inline-flex px-3 py-1 rounded-full bg-green-50 text-xs font-medium text-green-700">
                Disponible
              </span>
            )}
            {product.stock === 0 && (
              <span className="inline-flex px-3 py-1 rounded-full bg-red-50 text-xs font-medium text-red-700">
                Agotado
              </span>
            )}
          </div>

          {/* Nombre y precio */}
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-neutral-900">{product.name}</h1>
          {precioFormateado && (
            <p className="text-2xl font-bold text-orange-600 mb-6">{precioFormateado}</p>
          )}

          {/* Detalles */}
          <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-4 sm:p-5 mb-6 space-y-3">
            {product.marca && (
              <div className="flex gap-4">
                <span className="text-sm font-medium text-neutral-600 min-w-24">Marca</span>
                <span className="text-sm text-neutral-900 font-medium">{product.marca}</span>
              </div>
            )}
            {product.medidas && (
              <div className="flex gap-4">
                <span className="text-sm font-medium text-neutral-600 min-w-24">Medidas</span>
                <span className="text-sm text-neutral-900">{product.medidas}</span>
              </div>
            )}
            {product.observaciones && (
              <div className="flex gap-4">
                <span className="text-sm font-medium text-neutral-600 min-w-24">Notas</span>
                <span className="text-sm text-neutral-900">{product.observaciones}</span>
              </div>
            )}
          </div>

          {/* CTA Contacto */}
          <div className="rounded-xl border border-neutral-300 bg-white p-5 sm:p-6">
            <h3 className="font-semibold text-neutral-900 mb-1">¿Te interesa este producto?</h3>
            <p className="text-sm text-neutral-700 mb-4">
              Contáctanos para disponibilidad, precio final y transporte.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={`https://wa.me/34692211145?text=Hola,%20me%20interesa%20el%20producto:%20${encodeURIComponent(product.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-colors"
              >
                <span className="pi pi-whatsapp mr-2" aria-hidden="true" />
                WhatsApp
              </a>
              <Link
                href="/contacto"
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-neutral-300 text-neutral-900 text-sm font-medium hover:bg-neutral-50 transition-colors"
              >
                Ir a contacto
              </Link>
            </div>
          </div>

          {/* Volver al listado */}
          <Link
            href={`/${product.collectionName}`}
            className="mt-6 inline-flex items-center text-sm text-neutral-600 hover:text-neutral-900"
          >
            <span className="pi pi-arrow-left mr-2" aria-hidden="true" />
            Volver al listado de {CATEGORY_LABELS[product.collectionName].toLowerCase()}
          </Link>
        </div>
      </div>
    </div>
  );
}

