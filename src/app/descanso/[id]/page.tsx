'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';

type CategoryItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: boolean;
  category: string;
  urlImg?: string;
  hasDefect?: boolean;
};

export default function DescansoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<CategoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const snap = await getDoc(doc(db, 'descanso', id));
        if (!snap.exists()) {
          setNotFound(true);
        } else {
          const raw = snap.data() as Record<string, unknown>;
          const urlImg = (
            raw.urlImg || raw.imageUrl || raw.imagen || raw.foto || raw.img || raw.url || raw.image
          ) as string | undefined;
          setProduct({ id: snap.id, ...(raw as Omit<CategoryItem, 'id'>), urlImg });
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

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-10 opacity-70">Cargando producto…</div>;
  if (notFound || !product) return <div className="max-w-3xl mx-auto px-4 py-10">Producto no encontrado.</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <nav className="flex flex-wrap items-center gap-2 text-sm text-neutral-600 mb-6">
        <Link href="/" className="hover:underline">Inicio</Link>
        <span aria-hidden="true">›</span>
        <Link href="/descanso" className="hover:underline">Descanso</Link>
        <span aria-hidden="true">›</span>
        <span className="font-medium text-neutral-900">{product.name}</span>
      </nav>

      <div className="rounded-2xl border border-black/[.08] bg-white shadow-sm overflow-hidden">
        <div className="relative h-72 w-full bg-neutral-50">
          <Image
            src={product.urlImg || '/placeholders/descanso.svg'}
            alt={product.name}
            fill
            className="object-contain"
            unoptimized
            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholders/descanso.svg'; }}
          />
          {product.hasDefect && (
            <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
              Ocasión
            </div>
          )}
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full bg-neutral-100 text-xs font-medium text-neutral-700">
              {product.category}
            </span>
            {product.hasDefect && (
              <span className="px-3 py-1 rounded-full bg-red-50 text-xs font-medium text-red-700">
                Artículo de ocasión
              </span>
            )}
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${product.stock ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
              {product.stock ? 'Disponible' : 'No disponible'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold mb-3">{product.name}</h1>
          <p className="opacity-80 mb-4 text-sm sm:text-base">{product.description}</p>

          {product.price != null && (
            <p className="text-2xl font-bold text-neutral-900 mb-6">
              {product.price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
            </p>
          )}

          <div className="rounded-xl bg-orange-50 border border-orange-100 p-4 sm:p-5">
            <h3 className="font-semibold mb-1 text-orange-800">¿Te interesa este producto?</h3>
            <p className="text-sm text-orange-900 mb-3">
              Contáctanos para conocer disponibilidad, precio final y opciones de transporte.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href={`https://wa.me/34692211145?text=Hola%2C%20me%20interesa%20el%20producto%3A%20${encodeURIComponent(product.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium"
              >
                Preguntar por WhatsApp
              </a>
              <Link
                href="/contacto"
                className="inline-flex items-center px-4 py-2 rounded-lg border border-orange-300 text-orange-800 text-sm font-medium hover:bg-orange-100"
              >
                Ir a contacto
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
